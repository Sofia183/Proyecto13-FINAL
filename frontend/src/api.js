import { getToken, clearAuth } from './auth'

// 🔗 Dónde está el backend en desarrollo
export const API_ORIGIN = 'https://proyecto13-final.onrender.com'
export const API_BASE = `${API_ORIGIN}/api`

// Única función de fetch reutilizable
export async function apiRequest(path, { method='GET', headers={}, body=null } = {}) {
  const opts = { method, headers: { ...headers } }

  // Si hay token, añadimos Authorization
  const token = getToken()
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`
  }

  if (body && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  } else if (body instanceof FormData) {
    opts.body = body // el navegador pone boundary
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, opts)
    const data = await res.json().catch(() => null)

    if (res.status === 401) {
      // Token inválido → limpiamos sesión para evitar bucles
      clearAuth()
    }

    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: err.message || 'Fallo de red' }
  }
}
