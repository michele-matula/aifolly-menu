'use client';

const FILTERS = [
  { id: 'VEGETARIANO', label: 'Vegetariano' },
  { id: 'VEGANO', label: 'Vegano' },
  { id: 'SENZA_GLUTINE', label: 'Senza Glutine' },
];

interface FilterBarProps {
  activeFilters: string[];
  onToggleFilter: (filterId: string) => void;
}

export default function FilterBar({ activeFilters, onToggleFilter }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        padding: '6px 20px 14px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {FILTERS.map(f => {
        const isActive = activeFilters.includes(f.id);
        return (
          <button
            key={f.id}
            className="menu-filter-btn"
            onClick={() => onToggleFilter(f.id)}
            style={{
              border: `1px solid ${isActive ? 'var(--filter-pill-color)' : 'var(--menu-divider-color)'}`,
              background: isActive ? 'color-mix(in srgb, var(--filter-pill-color) 8%, transparent)' : 'transparent',
              color: isActive ? 'var(--filter-pill-active-text)' : 'var(--filter-pill-text)',
              fontFamily: 'var(--menu-nav-font)',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: isActive ? 500 : 300,
              padding: '6px 14px',
              borderRadius: 20,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {isActive ? '✓ ' : ''}{f.label}
          </button>
        );
      })}
    </div>
  );
}
