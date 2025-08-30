const express = require('express')
const { authRequired } = require('../middlewares/auth')
const { getMyFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController')

const router = express.Router()

router.get('/', authRequired, getMyFavorites)
router.post('/:id', authRequired, addFavorite)
router.delete('/:id', authRequired, removeFavorite)

module.exports = router
