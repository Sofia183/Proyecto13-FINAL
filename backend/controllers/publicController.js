const District = require('../models/District')
const Tag = require('../models/Tag')
const Restaurant = require('../models/Restaurant')

// GET /api/districts
// Devuelve todos los distritos ordenados por nombre
async function listDistricts(req, res) {
  const items = await District.find().sort({ name: 1 })
  res.json(items)
}

// GET /api/tags
// Devuelve todos los tags ordenados por nombre
async function listTags(req, res) {
  const items = await Tag.find().sort({ name: 1 })
  res.json(items)
}

// GET /api/restaurants
// Filtros opcionales: ?q=texto&district=Nombre&tags=a|b|c&price=€|€€|€€€&page=1&limit=20&sort=rating|name
async function getRestaurants(req, res) {
  try {
    const {
      q = '',
      district = '',
      tags = '',
      price = '',
      page = '1',
      limit = '20',
      sort = 'name'
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 20))
    const skip = (pageNum - 1) * limitNum

    const filter = {}

    // Búsqueda por texto en nombre o dirección (insensible a mayúsculas)
    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), 'i')
      filter.$or = [{ name: rx }, { address: rx }]
    }

    // Filtrar por distrito usando el nombre (lo convertimos a _id)
    if (district && district.trim()) {
      const d = await District.findOne({ name: district.trim() })
      if (!d) {
        return res.json({ items: [], total: 0, page: pageNum, pages: 0 })
      }
      filter.district = d._id
    }

    // Filtrar por TAGS (por nombre) → match ANY usando $in (no $all)
    if (tags && tags.trim()) {
      const parts = tags
        .split(/[|,]/)
        .map(s => s.trim())
        .filter(Boolean)

      if (parts.length) {
        const tagDocs = await Tag.find({ name: { $in: parts } }).select('_id')
        const tagIds = tagDocs.map(t => t._id)
        // $in: si el restaurante tiene al menos uno de estos tags, entra
        // si no hay coincidencias, forzamos a 0 resultados
        filter.tags = tagIds.length ? { $in: tagIds } : { $in: [] }
      }
    }

    // Rango de precio exacto (si lo sigues usando)
    if (price && price.trim()) {
      filter.priceRange = price.trim()
    }

    // Orden
    let sortBy = { name: 1 }
    if (sort === 'rating') {
      sortBy = { ratingAvg: -1, name: 1 }
    }

    const [items, total] = await Promise.all([
      Restaurant.find(filter)
        .populate('district', 'name')
        .populate('tags', 'name')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum),
      Restaurant.countDocuments(filter)
    ])

    const pages = Math.max(1, Math.ceil(total / limitNum))
    res.json({ items, total, page: pageNum, pages })
  } catch (err) {
    console.error('[GET /restaurants] error', err)
    res.status(500).json({ message: 'Error al listar restaurantes' })
  }
}

// GET /api/restaurants/:id
async function getRestaurantById(req, res) {
  const { id } = req.params
  const doc = await Restaurant.findById(id)
    .populate('district', 'name')
    .populate('tags', 'name')
  if (!doc) return res.status(404).json({ message: 'Restaurante no encontrado' })
  res.json(doc)
}

// GET /api/restaurants/near?lat=&lon=&radiusKm=3
// Ordena por cercanía (usa índice 2dsphere). No devolvemos distancia (MVP).
async function getRestaurantsNear(req, res) {
  const lat = Number(req.query.lat)
  const lon = Number(req.query.lon)
  const radiusKm = Number(req.query.radiusKm) || 3

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ message: 'lat/lon inválidos' })
  }

  const radiusMeters = Math.max(100, radiusKm * 1000)

  const items = await Restaurant.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lon, lat] },
        $maxDistance: radiusMeters
      }
    }
  })
    .limit(50)
    .populate('district', 'name')
    .populate('tags', 'name')

  res.json({ items, radiusKm })
}

module.exports = {
  listDistricts,
  listTags,
  getRestaurants,
  getRestaurantById,
  getRestaurantsNear
}
