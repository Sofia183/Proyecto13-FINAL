// backend/routes/reviews.js
const express = require('express')
const { authRequired } = require('../middlewares/auth')
const { listByRestaurant, upsertMyReview, deleteMyReview } = require('../controllers/reviewController')

const router = express.Router()

router.get('/restaurants/:id/reviews', listByRestaurant)
router.post('/restaurants/:id/reviews', authRequired, upsertMyReview)
router.delete('/reviews/:id', authRequired, deleteMyReview)

module.exports = router
