const TOKEN_KEY = 'app:token'
const USER_KEY = 'app:user'

export function setAuth({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

export function isAuth() {
  return !!getToken()
}
