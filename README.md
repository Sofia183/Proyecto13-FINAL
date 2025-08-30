## PROYECTO13_FINAL — Guía de Restaurantes Peruanos (FullStack)

Aplicación FullStack (Node.js + React) para explorar restaurantes peruanos en Barcelona:
búsqueda, filtros por tags, paginación, favoritos (♥), reseñas con estrellas (⭐) y mapa.
Backend: Node.js + Express + MongoDB (Mongoose) + JWT
Frontend: React (Vite), React Router, hooks avanzados (useReducer, custom hooks)
BBDD: generada desde CSV (mín. 100 filas) con seed en Node.js
UX/UI: responsive, componentes reutilizables y estados claros

## Arranque local

## 1) Backend

Variables de entorno (archivo backend/.env):
PORT=5050
MONGODB_URI=mongodb+srv://sromucho:oZmROcCJzMUKDq1G@cluster0.xafxvrh.mongodb.net/project10db?retryWrites=true&w=majority
JWT_SECRET=68a103241892e0c52c04867c

Instalar dependencias y sembrar datos:
cd backend
npm install
npm run seed    # carga CSV en MongoDB (insertará ~100+ restaurantes)

Levantar API:
npm run dev
API en http://localhost:5050

Salud:
GET http://localhost:5050/api/health → { ok: true, ... }


## 2) Frontend

Instalar y arrancar:
cd ../frontend
npm install
npm run dev
Abre la URL que muestre Vite (ej. http://localhost:5173)
El frontend está configurado para apuntar al backend local (frontend/src/api.js → API_ORIGIN = 'http://localhost:5050').

## Seed desde CSV (BD)

Los CSV están en backend/seed/data/:
districts.csv:
name
Eixample
Gràcia
Sants-Montjuïc
Sarrià-Sant Gervasi
Ciutat Vella

tags.csv:
name
ceviche
nikkei
anticuchos
chifa
criolla
veg-friendly
parrilla
menu-del-dia
picante
postres

restaurants.csv (campos principales):
name,district_name,address,lat,lon,priceRange,tags,photoUrl,website,phone,openingHours,featuredDish
Cevichería Lima,Eixample,Carrer de Provença 123,41.391,2.161,ceviche,https://picsum.photos/seed/ceviche/800/600,https://ejemplo.com,+34 600 000 000,"L-D 12:00–23:00",Ceviche clásico...

Notas:
district_name debe existir previamente en districts.csv.
tags admite múltiples separados por coma (ceviche,nikkei).
lat/lon crean location (GeoJSON) para búsquedas cercanas.
Ejecuta el seed con: npm run seed.

## API (principales)

Autenticación (JWT)
POST /api/auth/register { name, email, password }
POST /api/auth/login { email, password } → { token, user }
GET /api/auth/me (Bearer token)
Explorar (público)
GET /api/tags?city=Barcelona → lista de tags (el city es opcional; actualmente se ignora lado servidor).
GET /api/restaurants → lista con filtros y paginación.

Query params:
q (texto: nombre/dirección)
tags (nombres separados por | o ,, ej: ceviche|nikkei)
district (por nombre)
page (por defecto 1)
limit (por defecto 20)
sort (name | rating)

Respuesta: { items, total, page, pages }
GET /api/restaurants/:id → detalle (incluye district, tags).
GET /api/restaurants/near?lat=..&lon=..&radiusKm=3 → cercanos (usa índice 2dsphere).
Favoritos (protegido)
GET /api/favorites
POST /api/favorites/:id
DELETE /api/favorites/:id

Reseñas (protegido)
GET /api/restaurants/:id/reviews
POST /api/restaurants/:id/reviews { rating: 1..5, comment }
DELETE /api/reviews/:id

## Frontend (rutas y flujo)
/city — puerta de entrada (selección de ciudad; dataset actual: Barcelona).
/explore — lista con:
buscador con debounce (300ms),
tags globales (siempre visibles),
paginación real (Página X de Y · mostrando A–B de TOTAL),
tarjetas con mapa/imagen, tags, rating medio y Favoritos ♥.
/restaurant/:id — detalle: mapa, info, tags, rating medio y reseñas (listar / crear / eliminar).
/favorites — restaurantes marcados con ♥ (requiere login).
/login — registro/login (JWT).

## Hooks y optimización
useReducer: useFiltersReducer para manejar un Set de tags seleccionados.
Custom hook: useDebouncedValue para el buscador (evita pedir en cada tecla).
useMemo + React.memo: evita renders innecesarios (tarjetas, listas).
Filtrado por tags en servidor: la URL incluye &tags=... → resultados y paginación coherentes.


## Estilos (CSS)
Variables en frontend/src/index.css:
colores (--color-bg, --color-text, --color-border, --color-primary…),
--space-*, --radius-*.
Layout responsive (grids fluidas; cabecera con marca a la izquierda y usuario a la derecha).
Componentización sin duplicación de estilos.


## Despliegue

## Backend en Render

Crear Web Service desde el repo → Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: node server.js
Environment Variables:
MONGODB_URI = mongodb+srv://sromucho:oZmROcCJzMUKDq1G@cluster0.xafxvrh.mongodb.net/project10db?retryWrites=true&w=majority
JWT_SECRET = 68a103241892e0c52c04867c

Deploy → prueba:
https://TU-SERVICIO.onrender.com/api/health → debe decir ok: true
Frontend en Vercel
Importar el repo → Root Directory: frontend
Framework Preset: Other
Build Command: (vacío)
Output Directory: .
Deploy.
Muy importante: en frontend/src/api.js reemplaza SOLO: export const API_ORIGIN = 'http://localhost:5050'por export const API_ORIGIN = 'https://TU-SERVICIO.onrender.com'
(Dejar export const API_BASE = \${API_ORIGIN}/api`` como está).

## Notas generales
Ciudad actual: Barcelona (la UI está lista para más ciudades).
Seguridad: JWT en rutas protegidas; CORS y Helmet en el servidor.

## Scripts útiles
# Backend
cd backend
npm run dev     # nodemon
npm run seed    # carga CSV

# Frontend
cd ../frontend
npm run dev     # Vite
