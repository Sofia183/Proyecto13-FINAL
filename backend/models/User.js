const { Schema, model } = require('mongoose')

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // 👇 NUEVO: array de ObjectId de Restaurant
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Restaurant', default: [] }]
  },
  { timestamps: true }
)

module.exports = model('User', userSchema)

