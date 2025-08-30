// frontend/src/components/RestaurantCard.jsx
import React from 'react';
import Stars from './Stars';
import { Link } from 'react-router-dom';

function RestaurantCard({ r, isFav = false, onToggleFav }) {
  const lat = r?.location?.coordinates?.[1];
  const lon = r?.location?.coordinates?.[0];
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  const pad = 0.01;
  const iframeSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(lon - pad)}%2C${(lat - pad)}%2C${(lon + pad)}%2C${(lat + pad)}&layer=mapnik&marker=${lat}%2C${lon}`
    : null;

  const photoUrl = r?.photoUrl || '';
  const tagNames = Array.isArray(r.tags) ? r.tags.map(t => t.name).join(', ') : '';

  const avg = Number(r.ratingAvg) || 0;
  const count = Number(r.ratingCount) || 0;

  return (
    <article
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        background: '#fff',
        overflow: 'hidden'
      }}
    >
      {/* Banner clicable al detalle + botón corazón superpuesto */}
      <div style={{ position: 'relative' }}>
        <Link to={`/restaurants/${r._id}`} style={{ display:'block' }}>
          {hasCoords ? (
            <iframe
              src={iframeSrc}
              title={`Mapa de ${r.name}`}
              style={{ width: '100%', height: 180, border: 0, display: 'block', pointerEvents: 'none' }}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            photoUrl && (
              <img
                src={photoUrl}
                alt={r.name}
                style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            )
          )}
        </Link>

        {/* ♥ */}
        {typeof onToggleFav === 'function' && (
          <button
            aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(r._id, isFav); }}
            style={{
              position:'absolute', top:8, right:8,
              border:'1px solid #e5e7eb',
              background: isFav ? '#fee2e2' : 'rgba(255,255,255,0.95)',
              color: isFav ? '#b91c1c' : '#111',
              borderRadius: 999,
              padding: '6px 10px',
              cursor: 'pointer'
            }}
            title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            {isFav ? '♥' : '♡'}
          </button>
        )}
      </div>

      <div style={{ padding: 12 }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>
          <Link to={`/restaurants/${r._id}`} style={{ textDecoration: 'none' }}>
            {r.name}
          </Link>
        </h3>
        <p className="meta" style={{ margin: 0 }}>
          {r.district?.name || '—'} · {r.priceRange || '€€'}
        </p>
        <p className="meta" style={{ margin: '6px 0 0 0' }}>
          {r.address || 'Dirección no disponible'}
        </p>

        {tagNames && (
          <p className="meta" style={{ margin: '6px 0 0 0' }}>{tagNames}</p>
        )}

        {/* ⭐ Estrellas + texto (clicable al detalle) */}
        <Link
          to={`/restaurants/${r._id}`}
          aria-label={`Ver reseñas de ${r.name}`}
          style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, textDecoration:'none' }}
        >
          <div style={{ pointerEvents: 'none' }}>
            <Stars value={avg} readOnly />
          </div>
          <span className="meta" style={{ textDecoration: 'underline' }}>
            {(avg ? avg.toFixed(1) : '0.0')} · {count} reseña(s)
          </span>
        </Link>
      </div>
    </article>
  );
}

export default React.memo(RestaurantCard);
