'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Last-resort error boundary: cattura errori che escono dal root layout
// (es. crash nei provider, errori di rendering del layout stesso).
// IMPORTANTE: deve includere <html> e <body> perché sostituisce
// completamente il root layout. Mantenere minimale, niente font custom
// né dipendenze dal layout — se il layout fallisce, anche queste
// potrebbero non essere disponibili.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            textAlign: 'center',
            background: '#FAFAF8',
            color: '#1a1a18',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
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

          <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 400 }}>
            Errore imprevisto
          </h1>
          <p
            style={{
              margin: '0 0 32px',
              maxWidth: 320,
              fontSize: 14,
              color: '#6b6358',
              lineHeight: 1.6,
            }}
          >
            Si è verificato un problema. Riprova; se persiste, ricarica la
            pagina.
          </p>

          <button
            onClick={() => reset()}
            style={{
              fontSize: 12,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              padding: '14px 36px',
              background: 'transparent',
              border: '1px solid #c9b97a',
              color: '#c9b97a',
              cursor: 'pointer',
            }}
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  );
}
