'use client';

export default function PreviewBanner() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#ffffff',
        textAlign: 'center',
        padding: '6px 16px',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.04em',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      Anteprima — Le modifiche non sono ancora visibili ai clienti
    </div>
  );
}
