const { Schema, model, Types } = require('mongoose')

const restaurantSchema = new Schema({
  name:        { type: String, required: true, trim: true },
  district:    { type: Types.ObjectId, ref: 'District', required: true },
  address:     { type: String, default: '' },

  // GeoJSON para búsquedas por cercanía
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lon, lat]
  },

  priceRange:  { type: String, enum: ['€','€€','€€€'], default: '€€' },
  tags:        [{ type: Types.ObjectId, ref: 'Tag' }],

  photoUrl:     { type: String, default: '' },
  website:      { type: String, default: '' },
  phone:        { type: String, default: '' },
  openingHours: { type: String, default: '' },
  featuredDish: { type: String, default: '' },

  // Campos útiles para rating (se llenarán cuando hagamos reseñas)
  ratingAvg:   { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true })

// Índice geoespacial (imprescindible para "cerca de mí")
restaurantSchema.index({ location: '2dsphere' })

module.exports = model('Restaurant', restaurantSchema)
