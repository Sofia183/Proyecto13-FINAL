import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'
import { isAuth, getUser } from '../auth'
import { fetchFavoriteIds, addFavorite, removeFavorite } from '../favorites'
import Stars from '../components/Stars'

export default function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFav, setIsFav] = useState(false)

  // Reseñas
  const [reviews, setReviews] = useState([])
  const [rLoading, setRLoading] = useState(true)
  const [rError, setRError] = useState('')

  // Mi reseña (si existe)
  const me = isAuth() ? getUser() : null
  const meId = me?._id || null
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [myReviewId, setMyReviewId] = useState(null)
  const [myEdited, setMyEdited] = useState(false) // ⬅️ ya editada una vez
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Cargar restaurante
  useEffect(() => {
    let cancel = false
    ;(async () => {
      setLoading(true); setError(''); setItem(null)
      const res = await apiRequest(`/restaurants/${id}`)
      if (!cancel) {
        if (!res.ok) setError(res.error || 'No se pudo cargar el restaurante')
        else setItem(res.data)
        setLoading(false)
      }
    })()
    return () => { cancel = true }
  }, [id])

  // Saber si es favorito
  useEffect(() => {
    let cancel = false
    ;(async () => {
      if (!isAuth()) { setIsFav(false); return }
      const ids = await fetchFavoriteIds()
      if (!cancel) setIsFav(ids.has(id))
    })()
    return () => { cancel = true }
  }, [id])

  // Cargar reseñas
  async function loadReviews() {
    setRLoading(true); setRError('')
    const r = await apiRequest(`/restaurants/${id}/reviews`)
    if (!r.ok) {
      setRError(r.error || 'Error')
      setReviews([])
      setMyReviewId(null); setMyRating(0); setMyComment(''); setMyEdited(false)
    } else {
      const list = r.data.items || []
      setReviews(list)

      if (meId) {
        const mine = list.find(rv => String(rv.user?._id || rv.user) === String(meId))
        if (mine) {
          setMyReviewId(mine._id)
          setMyRating(mine.rating || 0)
          setMyComment(mine.comment || '')
          const edited = new Date(mine.updatedAt).getTime() !== new Date(mine.createdAt).getTime()
          setMyEdited(edited)
        } else {
          setMyReviewId(null); setMyRating(0); setMyComment(''); setMyEdited(false)
        }
      }
    }
    setRLoading(false)
  }

  useEffect(() => {
    let cancel = false
    ;(async () => { if (!cancel) await loadReviews() })()
    return () => { cancel = true }
  }, [id, meId])

  if (loading) return <p>Cargando…</p>
  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>
  if (!item) return <p>No encontrado.</p>

  const lat = item?.location?.coordinates?.[1]
  const lon = item?.location?.coordinates?.[0]
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon)
  const pad = 0.01
  const iframeSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(lon - pad)}%2C${(lat - pad)}%2C${(lon + pad)}%2C${(lat + pad)}&layer=mapnik&marker=${lat}%2C${lon}`
    : null

  async function toggleFav() {
    if (!isAuth()) { navigate('/login'); return }
    if (isFav) {
      const r = await removeFavorite(id)
      if (!r.ok) return alert(r.error || 'No se pudo quitar de favoritos')
      setIsFav(false)
    } else {
      const r = await addFavorite(id)
      if (!r.ok) return alert(r.error || 'No se pudo añadir a favoritos')
      setIsFav(true)
    }
  }

  // Enviar mi reseña (crea o actualiza, máx. 1 edición)
  async function submitReview(e) {
    e.preventDefault()
    if (!isAuth()) { navigate('/login'); return }
    if (!(myRating >= 1 && myRating <= 5)) {
      alert('Selecciona una puntuación (1 a 5)')
      return
    }
    if (myReviewId && myEdited) {
      alert('Solo puedes editar tu reseña una vez')
      return
    }
    setSubmitting(true)
    const r = await apiRequest(`/restaurants/${id}/reviews`, {
      method: 'POST',
      body: { rating: myRating, comment: myComment }
    })
    setSubmitting(false)
    if (!r.ok) {
      alert(r.error || 'No se pudo enviar la reseña')
      return
    }
    await loadReviews()
    const resItem = await apiRequest(`/restaurants/${id}`)
    if (resItem.ok) setItem(resItem.data)
  }

  // Eliminar mi reseña
  async function deleteMyReview() {
    if (!myReviewId) return
    if (!confirm('¿Eliminar tu reseña?')) return
    setDeleting(true)
    const r = await apiRequest(`/reviews/${myReviewId}`, { method: 'DELETE' })
    setDeleting(false)
    if (!r.ok) {
      alert(r.error || 'No se pudo eliminar la reseña')
      return
    }
    setMyReviewId(null); setMyRating(0); setMyComment(''); setMyEdited(false)
    await loadReviews()
    const resItem = await apiRequest(`/restaurants/${id}`)
    if (resItem.ok) setItem(resItem.data)
  }

  const tagNames = Array.isArray(item.tags) ? item.tags.map(t => t.name) : []

  return (
    <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow:'hidden' }}>
      <div style={{ padding: 12, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <button onClick={() => navigate(-1)}>← Volver</button>
        <h2 style={{ margin: '4px 0 8px 0' }}>{item.name}</h2>

        <button
          onClick={toggleFav}
          style={{
            marginLeft:'auto',
            border:'1px solid #e5e7eb',
            background: isFav ? '#fee2e2' : '#f7f7f7',
            color: isFav ? '#b91c1c' : '#111',
            borderRadius: 999,
            padding: '6px 10px',
            cursor: 'pointer'
          }}
          title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          {isFav ? '♥ Favorito' : '♡ Favorito'}
        </button>
      </div>

      {hasCoords && (
        <iframe
          src={iframeSrc}
          title={`Mapa de ${item.name}`}
          style={{ width: '100%', height: 320, border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}

      <div style={{ padding: 12, display:'grid', gap:12 }}>
        {/* Media de rating */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Stars value={item.ratingAvg || 0} readOnly />
          <span className="meta">
            {item.ratingAvg?.toFixed ? item.ratingAvg.toFixed(1) : (item.ratingAvg || 0)} · {item.ratingCount || 0} reseña(s)
          </span>
        </div>

        <p className="meta" style={{ margin: 0 }}>
          {item.district?.name || '—'} · {item.priceRange || '€€'}
        </p>
        <p className="meta" style={{ margin: '6px 0 0 0' }}>{item.address || 'Dirección no disponible'}</p>

        {item.featuredDish && <p><strong>Plato destacado:</strong> {item.featuredDish}</p>}
        {item.openingHours && <p><strong>Horario:</strong> {item.openingHours}</p>}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {item.website && <a href={item.website} target="_blank" rel="noreferrer" className="meta">🌐 Web</a>}
          {item.phone && <a href={`tel:${item.phone}`} className="meta">📞 {item.phone}</a>}
        </div>

        {tagNames.length > 0 && (
          <div>
            <span className="meta">Tags:</span>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
              {tagNames.map(t => (
                <span key={t} style={{ border:'1px solid #e5e7eb', padding:'4px 8px', borderRadius:8 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* === Reseñas === */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ margin: '8px 0' }}>Reseñas</h3>

          {/* Formulario para mi reseña */}
          {isAuth() ? (
            <form onSubmit={submitReview} style={{ display:'grid', gap:8, border:'1px solid #e5e7eb', padding:12, borderRadius:12 }}>
              <label className="meta">
                {myReviewId ? 'Tu puntuación (puedes editarla una única vez):' : 'Tu puntuación:'}
              </label>
              <Stars value={myRating} onChange={setMyRating} />
              <textarea
                placeholder="Escribe un comentario (opcional)"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
              />
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <button type="submit" disabled={submitting || (myReviewId && myEdited)}>
                  {submitting ? 'Enviando…' : (myReviewId ? (myEdited ? 'Edición agotada' : 'Actualizar reseña') : 'Enviar reseña')}
                </button>
                {myReviewId && (
                  <button
                    type="button"
                    onClick={deleteMyReview}
                    disabled={deleting}
                    style={{ borderColor:'#fca5a5', background:'#fee2e2' }}
                  >
                    {deleting ? 'Eliminando…' : 'Eliminar mi reseña'}
                  </button>
                )}
              </div>
            </form>
          ) : (
            <p className="meta">Inicia sesión para dejar tu reseña.</p>
          )}

          {/* Lista de reseñas */}
          {rLoading && <p style={{ marginTop: 8 }}>Cargando reseñas…</p>}
          {rError && <p style={{ marginTop: 8, color:'crimson' }}>Error: {rError}</p>}
          {!rLoading && !rError && reviews.length === 0 && <p className="meta" style={{ marginTop: 8 }}>Aún no hay reseñas.</p>}

          <ul style={{ listStyle:'none', padding:0, marginTop: 8, display:'grid', gap:8 }}>
            {reviews.map(rv => {
              const edited = new Date(rv.updatedAt).getTime() !== new Date(rv.createdAt).getTime()
              return (
                <li key={rv._id} style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <strong>{rv.user?.name || 'Usuario'}</strong>
                    <Stars value={rv.rating} readOnly />
                    <span className="meta" style={{ marginLeft:'auto' }}>
                      {new Date(rv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {edited && <p className="meta" style={{ fontStyle:'italic', margin:'4px 0 0 0' }}>Reseña editada</p>}
                  {rv.comment && <p style={{ margin:'6px 0 0 0' }}>{rv.comment}</p>}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
