import React from 'react'

export default function Stars({ value = 0, onChange = () => {}, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5]
  const rounded = Math.round(Number(value) || 0)
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {stars.map(n => (
        <button
          key={n}
          type="button"
          onClick={() => !readOnly && onChange(n)}
          disabled={readOnly}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: readOnly ? 'default' : 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
            color: n <= rounded ? '#f59e0b' : '#cbd5e1'
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}
