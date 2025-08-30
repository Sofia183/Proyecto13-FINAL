const Restaurant = require('../models/Restaurant')
const User = require('../models/User')

// GET /api/favorites  (lista del usuario logueado)
async function getMyFavorites(req, res) {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    populate: [
      { path: 'district', select: 'name' },
      { path: 'tags', select: 'name' }
    ]
  })
  res.json({ items: user.favorites || [] })
}

// POST /api/favorites/:id  (agregar)
async function addFavorite(req, res) {
  const restId = req.params.id
  const exists = await Restaurant.exists({ _id: restId })
  if (!exists) return res.status(404).json({ message: 'Restaurante no encontrado' })

  const user = await User.findById(req.user._id)
  const already = user.favorites?.some(id => String(id) === String(restId))
  if (already) return res.status(200).json({ message: 'Ya era favorito' })

  user.favorites.push(restId)
  await user.save()
  return res.status(201).json({ message: 'Añadido a favoritos' })
}

// DELETE /api/favorites/:id  (quitar)
async function removeFavorite(req, res) {
  const restId = req.params.id
  const user = await User.findById(req.user._id)
  user.favorites = (user.favorites || []).filter(id => String(id) !== String(restId))
  await user.save()
  return res.json({ message: 'Eliminado de favoritos' })
}

module.exports = { getMyFavorites, addFavorite, removeFavorite }
