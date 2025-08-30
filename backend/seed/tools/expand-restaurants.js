// backend/seed/tools/expand-restaurants.js
// Duplica restaurants.csv hasta ~120 filas con pequeñas variaciones

const fs = require('fs')
const path = require('path')

const INPUT = path.join(__dirname, '..', 'data', 'restaurants.csv')
const TARGET_COUNT = 120 // objetivo

function parseCSVLine(line) {
  // NOTA: nuestro CSV no usa comillas ni comas internas en campos (tags es 1 tag).
  // Por eso un split(',') simple funciona para este dataset.
  return line.split(',')
}

function toCSVLine(cols) {
  return cols.join(',')
}

function jitterNum(n, delta = 0.003) {
  const d = (Math.random() * 2 - 1) * delta
  return (n + d).toFixed(6)
}

function main() {
  const raw = fs.readFileSync(INPUT, 'utf8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) {
    console.error('restaurants.csv no tiene filas suficientes')
    process.exit(1)
  }

  const header = lines[0] // name,district_name,address,priceRange,lat,lon,tags,website,phone,openingHours,featuredDish,city,photoUrl
  const rows = lines.slice(1)

  const originals = rows.map(parseCSVLine)
  let out = [...originals]

  let suffix = 2 // para "Sucursal 2", "Sucursal 3", ...
  while (out.length < TARGET_COUNT) {
    for (const base of originals) {
      if (out.length >= TARGET_COUNT) break

      const cols = [...base]

      // name (index 0)
      cols[0] = `${base[0]} Sucursal ${suffix}`

      // address (index 2) — le añadimos "bis X"
      cols[2] = `${base[2]} bis ${suffix}`

      // lat, lon (index 4,5)
      const lat = parseFloat(base[4])
      const lon = parseFloat(base[5])
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        cols[4] = String(jitterNum(lat, 0.004))
        cols[5] = String(jitterNum(lon, 0.004))
      }

      out.push(cols)
    }
    suffix++
  }

  const final = [header, ...out.map(toCSVLine)].join('\n')
  fs.writeFileSync(INPUT, final, 'utf8')
  console.log(`✅ Generado restaurants.csv con ${out.length} filas`)
}

main()
