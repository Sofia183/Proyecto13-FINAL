import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'

export default function CityGate() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(localStorage.getItem('app:city') || 'Barcelona')
  const navigate = useNavigate()

  useEffect(() => {
    // Pedimos /api/health para obtener las ciudades soportadas
    (async () => {
      setLoading(true); setError('')
      const res = await apiRequest('/health')
      if (!res.ok) { setError(res.error || 'Error'); setLoading(false); return }
      setCities(res.data.cities || [])
      setLoading(false)
    })()
  }, [])

  function proceed() {
    // Guardamos la ciudad elegida para usarla en Explore
    localStorage.setItem('app:city', selected)
    navigate('/explore')
  }

  return (
    <section style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
      <h2>Elige tu ciudad</h2>
      <p className="meta">Mostraremos restaurantes peruanos de la ciudad seleccionada.</p>

      {loading && <p>Cargando ciudades…</p>}
      {error && <p style={{ color:'crimson' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginTop:8 }}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button onClick={proceed}>Continuar</button>
        </div>
      )}
    </section>
  )
}
