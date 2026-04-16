'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setError('');
    setResent(false);

    try {
      const res = await fetch('/api/signup/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError('Troppi tentativi. Riprova tra qualche minuto.');
      } else {
        setResent(true);
      }
    } catch {
      setError('Errore di rete. Riprova.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#f0eeea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}
        aria-hidden="true"
      >
        &#9993;
      </div>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: '#1a1a18',
          margin: '0 0 8px',
        }}
      >
        Controlla la tua email
      </h1>
      <p style={{ fontSize: 14, color: '#6b6358', margin: '0 0 8px', lineHeight: 1.5 }}>
        Ti abbiamo inviato un link di verifica
        {email && (
          <>
            {' '}a <strong>{email}</strong>
          </>
        )}
        . Clicca il link per attivare il tuo account.
      </p>
      <p style={{ fontSize: 12, color: '#a19686', margin: '0 0 24px' }}>
        Il link è valido per 24 ore. Controlla anche la cartella spam.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            fontSize: 13,
            color: '#a04438',
            background: '#fdf2f0',
            border: '1px solid #f5e1de',
            borderRadius: 4,
            padding: '10px 12px',
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {resent && (
        <div
          role="status"
          style={{
            fontSize: 13,
            color: '#3a7d44',
            background: '#f0f9f1',
            border: '1px solid #d4edda',
            borderRadius: 4,
            padding: '10px 12px',
            marginBottom: 16,
          }}
        >
          Email reinviata con successo.
        </div>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        style={{
          padding: '10px 24px',
          fontSize: 13,
          fontWeight: 500,
          color: '#6b6358',
          background: 'transparent',
          border: '1px solid #e0dcd4',
          borderRadius: 4,
          cursor: resending ? 'not-allowed' : 'pointer',
          opacity: resending ? 0.7 : 1,
        }}
      >
        {resending ? 'Invio in corso...' : 'Reinvia email'}
      </button>

      <p
        style={{
          fontSize: 12,
          color: '#a19686',
          marginTop: 24,
          marginBottom: 0,
        }}
      >
        <a href="/admin/login" style={{ color: '#c9b97a', textDecoration: 'none' }}>
          Torna al login
        </a>
      </p>
    </div>
  );
}
