// Skeleton content-shaped per la pagina menu pubblica.
// Stesso pattern d'animazione del cover loading (`[slug]/loading.tsx`)
// per coerenza visiva durante la navigazione cover → menu.
export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        background: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .skeleton {
          background: #ebe6dc;
          border-radius: 4px;
          animation: skeletonPulse 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Header — hero compatto del menu */}
      <div
        style={{
          padding: '48px 32px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div className="skeleton" style={{ width: 70, height: 8 }} />
        <div className="skeleton" style={{ width: 200, height: 22, borderRadius: 2, animationDelay: '0.1s' }} />
        <div className="skeleton" style={{ width: 140, height: 8, animationDelay: '0.2s' }} />
        <div className="skeleton" style={{ width: 80, height: 1, animationDelay: '0.3s', marginTop: 8 }} />
      </div>

      {/* Sticky category nav placeholder */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: '14px 32px',
          borderBottom: '1px solid #ebe6dc',
          overflow: 'hidden',
        }}
      >
        {[64, 80, 56, 72, 60].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: w, height: 10, flexShrink: 0, animationDelay: `${0.1 * i}s` }}
          />
        ))}
      </div>

      {/* Section header placeholder */}
      <div
        style={{
          padding: '32px 32px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 2 }} />
        <div className="skeleton" style={{ width: 60, height: 1, animationDelay: '0.1s' }} />
      </div>

      {/* Dish card placeholders */}
      <div style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 14,
              padding: 12,
              background: '#FFFFFF',
              border: '1px solid #f0ece4',
            }}
          >
            {/* Dish thumbnail */}
            <div
              className="skeleton"
              style={{
                width: 88,
                height: 88,
                borderRadius: 6,
                flexShrink: 0,
                animationDelay: `${0.1 * i}s`,
              }}
            />

            {/* Dish text column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
              <div
                className="skeleton"
                style={{ width: '70%', height: 14, borderRadius: 2, animationDelay: `${0.1 * i + 0.05}s` }}
              />
              <div
                className="skeleton"
                style={{ width: '95%', height: 8, animationDelay: `${0.1 * i + 0.1}s` }}
              />
              <div
                className="skeleton"
                style={{ width: '60%', height: 8, animationDelay: `${0.1 * i + 0.15}s` }}
              />
              <div
                className="skeleton"
                style={{ width: 48, height: 12, marginTop: 4, animationDelay: `${0.1 * i + 0.2}s` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer placeholder */}
      <div
        style={{
          marginTop: 'auto',
          padding: '24px 32px 32px',
          background: '#F4F1EB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div className="skeleton" style={{ width: 120, height: 8 }} />
        <div className="skeleton" style={{ width: 180, height: 8, animationDelay: '0.1s' }} />
        <div className="skeleton" style={{ width: 90, height: 8, animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}
