// frontend/src/pages/Explore.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useFiltersReducer from '../hooks/useFiltersReducer';
import FiltersPanel from '../components/FiltersPanel';
import { apiRequest } from '../api';
import RestaurantCard from '../components/RestaurantCard';
import { fetchFavoriteIds, addFavorite, removeFavorite } from '../favorites';
import { isAuth } from '../auth';

export default function Explore() {
  // 🔎 buscador (debounce)
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);

  // 📄 datos + paginación (del backend)
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Tags globales (todas las páginas)
  const [allTags, setAllTags] = useState([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ❤️ favoritos (para mostrar corazón en lista)
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const navigate = useNavigate();

  const CITY = 'Barcelona'; // dataset actual

  // --- helpers de paginación (coherentes con el backend: limit=20) ---
  const PAGE_SIZE = 20; // el backend usa 20 por defecto
  const startIdx = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, total);

  function goTo(n) {
    const safe = Math.max(1, Math.min(pages, n));
    setPage(safe);
  }

  function getPageWindow(current, totalPages, radius = 2) {
    const from = Math.max(1, current - radius);
    const to = Math.min(totalPages, current + radius);
    const out = [];
    for (let i = from; i <= to; i++) out.push(i);
    return out;
  }
  const pageWindow = getPageWindow(page, pages, 2);

  // === Filtros con useReducer (solo tags) ===
  const { state: filters, dispatch } = useFiltersReducer();

  // Clave estable para dependencias cuando cambian los tags (Set no es estable)
  const tagsKey = useMemo(
    () => Array.from(filters.tags).sort().join('|'),
    [filters.tags]
  );

  // Cargar lista (usa filtros en el servidor)
  async function load() {
    setLoading(true);
    setError('');

    // Armamos la URL con ciudad, búsqueda, página y TAGS (si hay)
    const base =
      `/restaurants?city=${encodeURIComponent(CITY)}&q=${encodeURIComponent(debouncedTerm)}&page=${page}`;
    const url = tagsKey
      ? `${base}&tags=${encodeURIComponent(tagsKey)}`
      : base;

    const res = await apiRequest(url);

    if (!res.ok) {
      setError(res.error || 'No se pudo cargar la lista');
      setItems([]);
      setTotal(0);
      setPages(1);
      setLoading(false);
      return;
    }

    setItems(res.data.items || []);
    setTotal(res.data.total || 0);
    setPages(res.data.pages || 1);
    setLoading(false);
  }

  // Cargar al cambiar término (debounced), tags o página
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm, tagsKey, page]);

  // Si cambia término o tags, volvemos a página 1
  useEffect(() => {
    setPage(1);
  }, [debouncedTerm, tagsKey]);

  // Cargar TAGS GLOBALES una sola vez (o si cambia CITY)
  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await apiRequest(`/tags?city=${encodeURIComponent(CITY)}`);
      if (cancel) return;

      if (!r.ok) {
        console.warn('[tags] error:', r.error);
        setAllTags([]);
        return;
      }

      const data = r.data;
      let names = [];

      if (Array.isArray(data)) {
        names = data.map(t => t?.name).filter(Boolean);
      } else if (data && Array.isArray(data.items)) {
        names = data.items.map(x => (typeof x === 'string' ? x : x?.name)).filter(Boolean);
      } else {
        names = [];
      }

      const uniqueSorted = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
      setAllTags(uniqueSorted);
    })();
    return () => { cancel = true; };
  }, [CITY]);

  // Cargar favoritos al entrar
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!isAuth()) { setFavoriteIds(new Set()); return; }
      const ids = await fetchFavoriteIds(); // Set
      if (!cancel) setFavoriteIds(ids);
    })();
    return () => { cancel = true; };
  }, []);

  // Handler corazón
  async function handleToggleFav(id, isFav) {
    if (!isAuth()) { navigate('/login'); return; }
    if (isFav) {
      const r = await removeFavorite(id);
      if (!r.ok) return alert(r.error || 'No se pudo quitar de favoritos');
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      const r = await addFavorite(id);
      if (!r.ok) return alert(r.error || 'No se pudo añadir a favoritos');
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  }

  return (
    <section>
      <h2>Restaurantes peruanos en {CITY}</h2>
      <p className="meta">Busca tu barrio más cercano y encuentra tu próximo restaurante peruano favorito ❤️ </p>

      {/* Buscador + paginación */}
      <div style={{ display: 'grid', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por nombre o dirección…"
            style={{
              flex: '1 1 280px',
              padding: '8px 10px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              outline: 'none'
            }}
          />

          {/* Texto de estado */}
          <span className="meta">
            Página {page} de {pages} · mostrando {startIdx}–{endIdx} de {total}
          </span>
        </div>

        {/* Controles de paginación */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => goTo(1)} disabled={page <= 1}>« Primera</button>
          <button onClick={() => goTo(page - 1)} disabled={page <= 1}>‹ Anterior</button>

          <div style={{ display: 'flex', gap: 4 }}>
            {pageWindow[0] > 1 && <span className="meta">…</span>}
            {pageWindow.map(n => (
              <button
                key={n}
                onClick={() => goTo(n)}
                disabled={n === page}
                style={n === page ? { fontWeight: 700, borderColor: 'var(--color-primary)' } : undefined}
              >
                {n}
              </button>
            ))}
            {pageWindow[pageWindow.length - 1] < pages && <span className="meta">…</span>}
          </div>

          <button onClick={() => goTo(page + 1)} disabled={page >= pages}>Siguiente ›</button>
          <button onClick={() => goTo(pages)} disabled={page >= pages}>Última »</button>
        </div>
      </div>

      {/* Filtros (solo tags) — SIEMPRE los mismos en todas las páginas */}
      <div style={{ marginTop: 12 }}>
        <FiltersPanel
          tags={allTags}
          selectedTags={filters.tags}
          onToggleTag={(v) => dispatch({ type: 'TOGGLE_TAG', value: v })}
          onReset={() => dispatch({ type: 'RESET' })}
        />
      </div>

      {/* Estados */}
      {loading && <p style={{ marginTop: 12 }}>Cargando…</p>}
      {error && (
        <p style={{ marginTop: 12, color: 'crimson' }}>
          Error: {error}
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p style={{ marginTop: 12 }}>Sin resultados.</p>
      )}

      {/* Grid (usa la lista del servidor ya filtrada por tags) */}
      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16
        }}
      >
        {items.map((r) => (
          <RestaurantCard
            key={r._id}
            r={r}
            isFav={favoriteIds.has(r._id)}
            onToggleFav={handleToggleFav}
          />
        ))}
      </div>
    </section>
  );
}
