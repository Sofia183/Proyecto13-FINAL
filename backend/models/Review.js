// backend/models/Review.js
const { Schema, model } = require('mongoose')

const reviewSchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    user:       { type: Schema.Types.ObjectId, ref: 'User',       required: true, index: true },
    rating:     { type: Number, min: 1, max: 5, required: true },
    comment:    { type: String, trim: true, default: '' }
  },
  { timestamps: true }
)

// Un usuario no puede tener más de una review por restaurante
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true })

module.exports = model('Review', reviewSchema)
