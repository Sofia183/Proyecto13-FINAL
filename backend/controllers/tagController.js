// backend/controllers/tagController.js
const Restaurant = require('../models/Restaurant')

/**
 * GET /api/tags?city=Barcelona
 * Devuelve la lista de tags disponibles para la ciudad (globales, no por página).
 */
async function listTags(req, res) {
  try {
    const city = (req.query.city && req.query.city.trim()) || 'Barcelona'
    // Traemos solo el campo tags y populamos su nombre
    const docs = await Restaurant.find({ city }).select('tags').populate('tags', 'name')

    const set = new Set()
    for (const d of docs) {
      for (const t of d.tags || []) {
        if (t?.name) set.add(t.name)
      }
    }

    const items = Array.from(set).sort((a, b) => a.localeCompare(b))
    res.json({ items })
  } catch (e) {
    console.error('[TAGS] error:', e)
    res.status(500).json({ message: 'Error al obtener tags' })
  }
}

module.exports = { listTags }
