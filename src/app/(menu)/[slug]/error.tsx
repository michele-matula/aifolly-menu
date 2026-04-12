'use client';

import { useEffect, useRef } from 'react';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { containerRef.current?.focus(); }, []);

  return (
    <div
      ref={containerRef}
      role="alert"
      tabIndex={-1}
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
        outline: 'none',
      }}
    >
      {/* Ornament */}
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

      {/* Title */}
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
        Menu temporaneamente non disponibile
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: 13,
          fontWeight: 300,
          color: '#6b6358',
          margin: '0 0 32px',
          lineHeight: 1.7,
          letterSpacing: '0.01em',
          maxWidth: 300,
        }}
      >
        C&apos;è stato un problema nel caricamento del menu. Riprova tra qualche istante.
      </p>

      {/* Retry button */}
      <button
        onClick={() => reset()}
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: 12,
          fontWeight: 400,
          color: '#c9b97a',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          padding: '14px 36px',
          background: 'transparent',
          border: '1px solid #c9b97a',
          borderRadius: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        Riprova
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
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
