const ALLERGEN_MAP: Record<string, { icon: string; label: string }> = {
  GLUTINE:            { icon: '🌾', label: 'Glutine' },
  CROSTACEI:          { icon: '🦀', label: 'Crostacei' },
  UOVA:               { icon: '🥚', label: 'Uova' },
  PESCE:              { icon: '🐟', label: 'Pesce' },
  ARACHIDI:           { icon: '🥜', label: 'Arachidi' },
  SOIA:               { icon: '🫘', label: 'Soia' },
  LATTE:              { icon: '🥛', label: 'Latte' },
  FRUTTA_A_GUSCIO:    { icon: '🌰', label: 'Frutta a guscio' },
  SEDANO:             { icon: '🌿', label: 'Sedano' },
  SENAPE:             { icon: '🟡', label: 'Senape' },
  SESAMO:             { icon: '⚪', label: 'Sesamo' },
  ANIDRIDE_SOLFOROSA: { icon: '🍷', label: 'Anidride solforosa' },
  LUPINI:             { icon: '🫛', label: 'Lupini' },
  MOLLUSCHI:          { icon: '🐚', label: 'Molluschi' },
};

export default function AllergenBadge({ allergen }: { allergen: string }) {
  const info = ALLERGEN_MAP[allergen];
  if (!info) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontFamily: 'var(--dish-desc-font)',
        fontWeight: 300,
        color: 'var(--dish-allergen-text)',
        background: 'var(--footer-bg)',
        padding: '4px 10px',
        borderRadius: 20,
        border: '1px solid var(--menu-divider-color)',
      }}
    >
      <span style={{ fontSize: 12 }}>{info.icon}</span>
      {info.label}
    </span>
  );
}
