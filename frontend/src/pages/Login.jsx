import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'
import { setAuth } from '../auth'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
    const body = mode === 'login'
      ? { email, password }
      : { name, email, password }

    const res = await apiRequest(endpoint, { method:'POST', body })
    setLoading(false)

    if (!res.ok) {
      setError(res.error || 'No se pudo autenticar')
      return
    }

    // Guardar token + usuario y llevar a Explorar
    const { token, user } = res.data
    setAuth({ token, user })
    navigate('/explore')
  }

  return (
    <section style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16, maxWidth:480, margin:'0 auto' }}>
      <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</h2>
      <p className="meta">
        {mode === 'login'
          ? 'Accede con tu email y contraseña.'
          : 'Crea tu cuenta para poder guardar favoritos y dejar reseñas.'}
      </p>

      <div style={{ display:'flex', gap:8, margin:'8px 0 16px 0' }}>
        <button
          onClick={() => setMode('login')}
          disabled={mode === 'login'}
        >
          Entrar
        </button>
        <button
          onClick={() => setMode('register')}
          disabled={mode === 'register'}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display:'grid', gap:10 }}>
        {mode === 'register' && (
          <div>
            <label className="meta">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={mode === 'register'}
              style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
            />
          </div>
        )}

        <div>
          <label className="meta">Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
          />
        </div>

        <div>
          <label className="meta">Contraseña</label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
          />
        </div>

        {error && <p style={{ color:'crimson', margin:0 }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Procesando…' : (mode === 'login' ? 'Entrar' : 'Crear cuenta')}
        </button>
      </form>
    </section>
  )
}
