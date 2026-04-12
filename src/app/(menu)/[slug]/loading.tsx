export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        background: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        Caricamento in corso…
      </span>
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

      {/* Upper block — branding placeholder */}
      <div
        style={{
          flex: '0 0 55vh',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 32px 24px',
          gap: 16,
        }}
      >
        {/* Ornament line */}
        <div className="skeleton" style={{ width: 90, height: 1 }} />

        {/* City placeholder */}
        <div className="skeleton" style={{ width: 80, height: 8, animationDelay: '0.1s' }} />

        {/* Title placeholder */}
        <div className="skeleton" style={{ width: 240, height: 28, borderRadius: 2, animationDelay: '0.2s' }} />

        {/* Tagline placeholder */}
        <div className="skeleton" style={{ width: 120, height: 8, animationDelay: '0.3s' }} />

        {/* Ornament */}
        <div className="skeleton" style={{ width: 130, height: 1, animationDelay: '0.4s' }} />

        {/* Description lines */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div className="skeleton" style={{ width: 280, height: 8, animationDelay: '0.5s' }} />
          <div className="skeleton" style={{ width: 240, height: 8, animationDelay: '0.6s' }} />
          <div className="skeleton" style={{ width: 200, height: 8, animationDelay: '0.7s' }} />
        </div>
      </div>

      {/* Lower block — photo placeholder */}
      <div
        className="skeleton"
        style={{
          flex: '1 1 45vh',
          minHeight: 320,
          borderRadius: 0,
          animationDelay: '0.3s',
        }}
      />
    </div>
  );
}
