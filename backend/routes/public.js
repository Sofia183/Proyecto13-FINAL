const express = require('express')
const {
  listDistricts,
  listTags,
  getRestaurants,
  getRestaurantById,
  getRestaurantsNear
} = require('../controllers/publicController')

const router = express.Router()

router.get('/districts', listDistricts)
router.get('/tags', listTags)
router.get('/restaurants', getRestaurants)
router.get('/restaurants/near', getRestaurantsNear)
router.get('/restaurants/:id', getRestaurantById)

module.exports = router
