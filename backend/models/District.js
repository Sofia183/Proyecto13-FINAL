const { Schema, model } = require('mongoose')

const districtSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true })

module.exports = model('District', districtSchema)
