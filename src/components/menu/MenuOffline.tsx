'use client';

// Componente visuale mostrato quando il cliente è offline e il service
// worker non ha in cache lo slug richiesto. Stili inline, nessuna fetch
// dinamica, nessuna dipendenza dal tema del ristorante (non possiamo
// caricarlo se siamo offline e non l'abbiamo mai visto). È la pagina
// cui punta il precache del SW (/offline).

export default function MenuOffline() {
  return (
    <div
      style={{
        minHeight: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        background: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <div style={{ width: 32, height: 1, background: '#c9b97a' }} />
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            border: '1px solid #c9b97a',
          }}
        />
        <div style={{ width: 32, height: 1, background: '#c9b97a' }} />
      </div>

      <h1
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 28,
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#1a1a18',
          margin: '0 0 12px',
          lineHeight: 1.2,
        }}
      >
        Connessione assente
      </h1>

      <p
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: 13,
          fontWeight: 300,
          color: '#6b6358',
          margin: '0 0 28px',
          lineHeight: 1.7,
          letterSpacing: '0.01em',
          maxWidth: 300,
        }}
      >
        Il menu non è disponibile offline. Controlla la connessione e riprova.
      </p>

      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') window.location.reload();
        }}
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#c9b97a',
          background: 'transparent',
          border: '1px solid #c9b97a',
          padding: '14px 36px',
          cursor: 'pointer',
        }}
      >
        Riprova
      </button>

      <div style={{ flex: 1 }} />

      <div
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: 9,
          fontWeight: 300,
          color: '#a09882',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        AiFolly Menu
      </div>
    </div>
  );
}
