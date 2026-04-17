'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#fdf2f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 28,
          }}
          aria-hidden="true"
        >
          &#10007;
        </div>
        <p style={{ fontSize: 14, color: '#6b6358', margin: '0 0 16px' }}>
          Link non valido. Richiedi un nuovo reset della password.
        </p>
        <Link
          href="/admin/forgot-password"
          style={{
            color: '#c9b97a',
            textDecoration: 'none',
            fontSize: 13,
          }}
        >
          Richiedi nuovo link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La password deve avere almeno 8 caratteri.');
      return;
    }

    if (password !== confirm) {
      setError('Le password non coincidono.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante il reset.');
        setLoading(false);
        return;
      }

      setEmail(data.email || '');
      setSuccess(true);
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

  if (success) {
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
          &#10003;
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1a1a18', margin: '0 0 8px' }}>
          Password aggiornata
        </h2>
        <p style={{ fontSize: 14, color: '#6b6358', margin: '0 0 24px', lineHeight: 1.5 }}>
          La tua password è stata reimpostata con successo. Ora puoi accedere con la nuova password.
        </p>
        <Link
          href={email ? `/admin/login?email=${encodeURIComponent(email)}` : '/admin/login'}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: '#ffffff',
            background: '#c9b97a',
            border: 'none',
            borderRadius: 4,
            textDecoration: 'none',
          }}
        >
          Accedi al pannello
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="password"
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: '#6b6358',
            marginBottom: 6,
          }}
        >
          Nuova password
        </label>
        <input
          id="password"
          type="password"
          required
          aria-required="true"
          autoFocus
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          placeholder="Almeno 8 caratteri"
          aria-describedby={error ? 'reset-error' : undefined}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="confirm"
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: '#6b6358',
            marginBottom: 6,
          }}
        >
          Conferma password
        </label>
        <input
          id="confirm"
          type="password"
          required
          aria-required="true"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={inputStyle}
          placeholder="Ripeti la password"
          aria-describedby={error ? 'reset-error' : undefined}
        />
      </div>

      {error && (
        <div
          id="reset-error"
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
        {loading ? 'Salvataggio...' : 'Reimposta password'}
      </button>
    </form>
  );
}
