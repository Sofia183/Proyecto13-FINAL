// backend/routes/tags.js
const router = require('express').Router()
const { listTags } = require('../controllers/tagController')

// Tags globales por ciudad
router.get('/tags', listTags)

module.exports = router
