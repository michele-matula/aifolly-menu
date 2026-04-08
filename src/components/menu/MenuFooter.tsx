interface MenuFooterProps {
  coverCharge: number | null;
  allergenNote: string | null;
  restaurantName: string;
  city: string | null;
}

export default function MenuFooter({
  coverCharge,
  allergenNote,
  restaurantName,
  city,
}: MenuFooterProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '28px 32px 48px',
        borderTop: '1px solid var(--menu-divider-color)',
        background: 'var(--footer-bg)',
      }}
    >
      {/* Ornament */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ width: 24, height: 1, background: 'var(--footer-accent)', opacity: 0.5 }} />
        <span style={{ fontSize: 8, color: 'var(--footer-accent)' }}>✦</span>
        <div style={{ width: 24, height: 1, background: 'var(--footer-accent)', opacity: 0.5 }} />
      </div>

      {/* Cover charge + service */}
      {coverCharge != null && (
        <p
          style={{
            fontFamily: 'var(--dish-desc-font)',
            fontSize: 11,
            color: 'var(--footer-text)',
            margin: '0 0 4px',
            fontWeight: 300,
            letterSpacing: '0.04em',
            lineHeight: 1.7,
          }}
        >
          Coperto €{coverCharge.toFixed(2)} · Servizio non incluso
        </p>
      )}

      {/* Allergen note */}
      {allergenNote && (
        <p
          style={{
            fontFamily: 'var(--dish-desc-font)',
            fontSize: 10.5,
            color: 'var(--footer-text)',
            margin: '0 0 16px',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
          }}
        >
          {allergenNote}
        </p>
      )}

      {/* Buon appetito */}
      <div
        style={{
          fontFamily: 'var(--menu-section-font)',
          fontSize: 18,
          fontStyle: 'italic',
          color: 'var(--footer-accent)',
          fontWeight: 400,
          letterSpacing: '0.02em',
        }}
      >
        Buon appetito
      </div>

      {/* Restaurant name */}
      <div
        style={{
          marginTop: 20,
          fontSize: 9,
          fontFamily: 'var(--dish-desc-font)',
          fontWeight: 300,
          color: 'var(--footer-text)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        {restaurantName}{city ? ` · ${city}` : ''}
      </div>
    </div>
  );
}
