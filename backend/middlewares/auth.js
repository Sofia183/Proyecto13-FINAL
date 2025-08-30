const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function authRequired(req, res, next) {
  try {
    const h = req.header('Authorization') || ''
    const [, token] = h.split(' ')
    if (!token) return res.status(401).json({ message: 'Token requerido' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id).select('-passwordHash')
    if (!user) return res.status(401).json({ message: 'Usuario inválido' })

    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol admin' })
  }
  next()
}

module.exports = { authRequired, adminOnly }
