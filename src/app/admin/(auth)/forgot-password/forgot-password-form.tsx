'use client';

import { useState } from 'react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.status === 429) {
        setError('Troppi tentativi. Riprova tra qualche minuto.');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #e0dcd4',
    borderRadius: 4,
    outline: 'none',
    color: '#1a1a18',
    background: '#fafaf8',
    boxSizing: 'border-box',
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#f0f9f1',
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
        <p
          style={{
            fontSize: 14,
            color: '#6b6358',
            margin: '0 0 8px',
            lineHeight: 1.5,
          }}
        >
          Se l&apos;indirizzo <strong style={{ color: '#1a1a18' }}>{email}</strong> è associato
          a un account, riceverai un&apos;email con le istruzioni per reimpostare la password.
        </p>
        <p
          style={{
            fontSize: 13,
            color: '#a19686',
            margin: '16px 0 0',
          }}
        >
          Controlla anche la cartella spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="email"
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: '#6b6358',
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          aria-required="true"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="nome@ristorante.it"
          aria-describedby={error ? 'forgot-error' : undefined}
        />
      </div>

      {error && (
        <div
          id="forgot-error"
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

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        style={{
          width: '100%',
          padding: '12px 24px',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: '#ffffff',
          background: '#c9b97a',
          border: 'none',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        {loading ? 'Invio in corso...' : 'Invia link di reset'}
      </button>
    </form>
  );
}
