const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

async function register(req, res) {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email y password son requeridos' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' })
  }

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return res.status(409).json({ message: 'Email ya registrado' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash })

  const token = signToken(user._id)
  const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role }
  return res.status(201).json({ user: safeUser, token })
}

async function login(req, res) {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'email y password son requeridos' })
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' })

  const token = signToken(user._id)
  const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role }
  return res.json({ user: safeUser, token })
}

async function me(req, res) {
  // req.user viene del middleware authRequired
  return res.json(req.user)
}

module.exports = { register, login, me }
