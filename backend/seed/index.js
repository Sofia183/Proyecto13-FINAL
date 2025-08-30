require('dotenv').config()

const fs = require('fs/promises')
const path = require('path')
const { parse } = require('csv-parse/sync')

const { connectDB } = require('../config/db')
const District = require('../models/District')
const Tag = require('../models/Tag')
const Restaurant = require('../models/Restaurant')

const DATA_DIR = path.join(__dirname, 'data')

// Lee un CSV y devuelve un array de objetos (por columnas)
async function readCsv(fileName) {
  const filePath = path.join(DATA_DIR, fileName)
  const buf = await fs.readFile(filePath)
  return parse(buf, {
    columns: true,          // usa la primera fila como encabezados
    skip_empty_lines: true,
    trim: true
  })
}

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en .env')

  await connectDB(uri)

  console.log('🧹 Limpiando colecciones…')
  await Promise.all([
    District.deleteMany({}),
    Tag.deleteMany({}),
    Restaurant.deleteMany({})
  ])

  // 1) Districts
  console.log('📥 Cargando districts.csv …')
  const districtsRows = await readCsv('districts.csv')
  if (!districtsRows.length) throw new Error('districts.csv está vacío')

  const districtsDocs = await District.insertMany(
    districtsRows.map(r => ({ name: r.name }))
  )
  const districtByName = new Map(districtsDocs.map(d => [d.name, d._id]))

  // 2) Tags
  console.log('📥 Cargando tags.csv …')
  const tagRows = await readCsv('tags.csv')
  if (!tagRows.length) throw new Error('tags.csv está vacío')

  const tagsDocs = await Tag.insertMany(
    tagRows.map(r => ({ name: r.name }))
  )
  const tagByName = new Map(tagsDocs.map(t => [t.name, t._id]))

  // 3) Restaurants
  console.log('📥 Cargando restaurants.csv …')
  const restaurantRows = await readCsv('restaurants.csv')
  if (!restaurantRows.length) throw new Error('restaurants.csv está vacío')

  const ALLOWED_PRICE = new Set(['€','€€','€€€'])

  const restaurantsToInsert = restaurantRows.map((r, idx) => {
    const districtId = districtByName.get(r.district_name)
    if (!districtId) {
      throw new Error(`Fila ${idx+2}: district_name "${r.district_name}" no existe en districts.csv`)
    }

    const lat = Number(r.lat)
    const lon = Number(r.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error(`Fila ${idx+2}: lat/lon inválidos`)
    }

    const price = r.price_range || '€€'
    if (!ALLOWED_PRICE.has(price)) {
      throw new Error(`Fila ${idx+2}: price_range inválido: "${r.price_range}" (usa €, €€, €€€)`)
    }

    const tagNames = (r.tags || '').split('|').map(s => s.trim()).filter(Boolean)
    const tagIds = tagNames.map(name => {
      const id = tagByName.get(name)
      if (!id) {
        throw new Error(`Fila ${idx+2}: tag "${name}" no existe en tags.csv`)
      }
      return id
    })

    return {
      name: r.name,
      district: districtId,
      address: r.address || '',
      location: { type: 'Point', coordinates: [lon, lat] },
      priceRange: price,
      tags: tagIds,
      photoUrl: r.photo_url || '',
      website: r.website || '',
      phone: r.phone || '',
      openingHours: r.opening_hours || '',
      featuredDish: r.featured_dish || ''
    }
  })

  await Restaurant.insertMany(restaurantsToInsert)
  console.log(`✅ Insertados: ${districtsDocs.length} distritos, ${tagsDocs.length} tags, ${restaurantsToInsert.length} restaurantes.`)
}

seed()
  .then(() => { console.log('🌱 Seed OK'); process.exit(0) })
  .catch(err => { console.error('❌ Seed ERROR:', err.message); process.exit(1) })
