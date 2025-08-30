// frontend/src/components/FiltersPanel.jsx
export default function FiltersPanel({
  tags,
  selectedTags,
  onToggleTag,
  onReset
}) {
  return (
    <aside style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 12, background: '#fff' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Filtros</strong>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <div className="meta" style={{ marginBottom: 4 }}>Tags</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {tags.map((name) => (
                <label
                  key={name}
                  style={{ display: 'inline-flex', gap: 6, alignItems: 'center', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: 8 }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.has(name)}
                    onChange={() => onToggleTag(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <button onClick={onReset}>Limpiar filtros</button>
        </div>
      </div>
    </aside>
  );
}
