const mongoose = require('mongoose')

async function connectDB(uri) {
  if (!uri) throw new Error('Falta MONGODB_URI en .env')
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { dbName: 'proyecto13' })
  console.log('✅ MongoDB conectado')
}

module.exports = { connectDB }
