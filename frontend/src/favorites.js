import { apiRequest } from './api'
import { isAuth } from './auth'

// Devuelve Set con los _id de restaurantes favoritos del usuario
export async function fetchFavoriteIds() {
  if (!isAuth()) return new Set()
  const res = await apiRequest('/favorites')
  if (!res.ok) return new Set()
  const ids = (res.data?.items || []).map(r => r._id)
  return new Set(ids)
}

export async function addFavorite(id) {
  return apiRequest(`/favorites/${id}`, { method: 'POST' })
}

export async function removeFavorite(id) {
  return apiRequest(`/favorites/${id}`, { method: 'DELETE' })
}
