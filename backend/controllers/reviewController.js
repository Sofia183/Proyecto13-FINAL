// backend/controllers/reviewController.js
const mongoose = require('mongoose')
const Review = require('../models/Review')
const Restaurant = require('../models/Restaurant')

// Recalcular ratingAvg y ratingCount de un restaurante
async function updateRestaurantRating(restaurantId) {
  const stats = await Review.aggregate([
    { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
    { $group: { _id: '$restaurant', count: { $sum: 1 }, avg: { $avg: '$rating' } } }
  ])

  const count = stats[0]?.count || 0
  const avg = stats[0]?.avg || 0
  const rounded = count ? Math.round(avg * 10) / 10 : 0

  await Restaurant.findByIdAndUpdate(restaurantId, {
    ratingCount: count,
    ratingAvg: rounded
  })
}

// GET /api/restaurants/:id/reviews
async function listByRestaurant(req, res) {
  const { id } = req.params
  const items = await Review.find({ restaurant: id })
    .sort({ createdAt: -1 })
    .populate('user', 'name_id')
  res.json({ items })
}

// POST /api/restaurants/:id/reviews { rating, comment }
async function upsertMyReview(req, res) {
  const { id } = req.params
  const { rating, comment = '' } = req.body || {}

  if (!(Number.isFinite(rating) && rating >= 1 && rating <= 5)) {
    return res.status(400).json({ message: 'rating debe ser 1..5' })
  }

  // ¿ya existe mi reseña?
  const existing = await Review.findOne({ restaurant: id, user: req.user._id })

  if (existing) {
    // si ya fue editada antes (updatedAt != createdAt) -> no permitir 2ª edición
    const alreadyEdited = existing.updatedAt.getTime() !== existing.createdAt.getTime()
    if (alreadyEdited) {
      return res.status(400).json({ message: 'Solo puedes editar tu reseña una vez' })
    }
    existing.rating = rating
    existing.comment = comment
    await existing.save()
    await updateRestaurantRating(id)
    return res.status(201).json({ message: 'OK', review: existing })
  }

  // si no existe, la creamos
  const review = await Review.create({
    restaurant: id,
    user: req.user._id,
    rating, comment
  })

  await updateRestaurantRating(id)
  res.status(201).json({ message: 'OK', review })
}

// DELETE /api/reviews/:id
async function deleteMyReview(req, res) {
  const { id } = req.params
  const review = await Review.findById(id)
  if (!review) return res.status(404).json({ message: 'Review no encontrada' })

  const isOwner = String(review.user) === String(req.user._id)
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'No autorizado' })
  }

  const restId = review.restaurant
  await review.deleteOne()
  await updateRestaurantRating(restId)
  res.json({ message: 'Eliminada' })
}

module.exports = { listByRestaurant, upsertMyReview, deleteMyReview }
