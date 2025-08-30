import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'
import { isAuth } from '../auth'
import RestaurantCard from '../components/RestaurantCard'
import { addFavorite, removeFavorite } from '../favorites'

export default function Favorites() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuth()) {
      navigate('/login')
      return
    }
    let cancel = false
    ;(async () => {
      setLoading(true); setError('')
      const res = await apiRequest('/favorites')
      if (!cancel) {
        if (!res.ok) setError(res.error || 'No se pudieron cargar los favoritos')
        else setItems(res.data.items || [])
        setLoading(false)
      }
    })()
    return () => { cancel = true }
  }, [navigate])

  async function handleToggleFav(id, isFav) {
    if (!isAuth()) { navigate('/login'); return }
    if (isFav) {
      const r = await removeFavorite(id)
      if (!r.ok) return alert(r.error || 'No se pudo quitar de favoritos')
      setItems(prev => prev.filter(it => it._id !== id))
    } else {
      const r = await addFavorite(id)
      if (!r.ok) return alert(r.error || 'No se pudo añadir a favoritos')
      // Si quisieras, podrías volver a pedir /favorites o insertar localmente
    }
  }

  return (
    <section style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'var(--space)' }}>
      <h2>Mis favoritos</h2>
      <p className="meta">Restaurantes que marcaste con ♥</p>

      {loading && <p style={{ marginTop: 12 }}>Cargando…</p>}
      {error && <p style={{ marginTop: 12, color:'crimson' }}>Error: {error}</p>}
      {!loading && !error && items.length === 0 && <p style={{ marginTop: 12 }}>Aún no tienes favoritos.</p>}

      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}
      >
        {items.map(r => (
          <RestaurantCard
            key={r._id}
            r={r}
            isFav={true}
            onToggleFav={handleToggleFav}
          />
        ))}
      </div>
    </section>
  )
}
