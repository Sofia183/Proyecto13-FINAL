// frontend/src/hooks/useDebouncedValue.js
import { useEffect, useState } from 'react';

/**
 * Devuelve el mismo valor que entra, pero con un retraso (ms).
 * Útil para buscadores: evita peticiones en cada tecla.
 *
 * @param {any} value  Valor de entrada (string del buscador)
 * @param {number} delayMs  Retraso en milisegundos (p.ej. 300)
 */
export default function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
