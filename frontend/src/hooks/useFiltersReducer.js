// frontend/src/hooks/useFiltersReducer.js
import { useReducer, useMemo } from 'react';

// Estado inicial: solo manejamos TAGS (quitamos precios del reducer)
const initial = { tags: new Set() };

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_TAG': {
      const next = new Set(state.tags);
      next.has(action.value) ? next.delete(action.value) : next.add(action.value);
      return { ...state, tags: next };
    }
    case 'RESET':
      return { tags: new Set() };
    default:
      return state;
  }
}

// Extrae nombres de tags desde cada item, aceptando distintos formatos:
function extractTagNames(item) {
  const arr = Array.isArray(item?.tags) ? item.tags : [];
  const names = [];
  for (const t of arr) {
    if (t && typeof t === 'object' && typeof t.name === 'string') {
      names.push(t.name);        // cuando viene poblado: { _id, name }
    } else if (typeof t === 'string') {
      names.push(t);             // cuando viene como string simple
    }
    // si viniera como ObjectId puro, no hay nombre -> no lo usamos
  }
  return names;
}

/**
 * Hook de filtros por TAGS usando useReducer.
 * - state.tags es un Set de strings (nombres de tag seleccionados).
 * - apply(list) devuelve la lista filtrada.
 */
export default function useFiltersReducer() {
  const [state, dispatch] = useReducer(reducer, initial);

  // Función de filtrado memoizada (cambia cuando cambian los tags seleccionados)
  const apply = useMemo(() => {
    return (list) => {
      if (!Array.isArray(list)) return [];
      // Si no hay tags seleccionados, no filtramos nada
      if (!state.tags || state.tags.size === 0) return list;

      return list.filter((item) => {
        const names = extractTagNames(item);
        // Coincide si AL MENOS UNO de los tags del item está seleccionado
        for (const n of names) {
          if (state.tags.has(n)) return true;
        }
        return false;
      });
    };
  }, [state.tags]);

  return { state, dispatch, apply };
}
