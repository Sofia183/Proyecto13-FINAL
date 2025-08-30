require('dotenv').config()
require('express-async-errors')


const publicRoutes = require('./routes/public')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { connectDB } = require('./config/db')
const authRoutes = require('./routes/auth')
const favoriteRoutes = require('./routes/favorites')
const reviewRoutes = require('./routes/reviews')



const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use('/api', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api', reviewRoutes)
app.use('/api', require('./routes/tags'));




const ALLOWED_CITIES = ['Barcelona', 'Madrid', 'Copenhagen', 'Berlin', 'London', 'New York']

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API alive', cities: ALLOWED_CITIES })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

const PORT = process.env.PORT || 5050
const URI  = process.env.MONGODB_URI

;(async () => {
  try {
    await connectDB(URI)
    app.listen(PORT, () => {
      console.log(`🚀 API en http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message)
    process.exit(1)
  }
})()
