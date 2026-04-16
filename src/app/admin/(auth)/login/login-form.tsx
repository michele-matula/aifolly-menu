'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.status === 429) {
      setError('Troppi tentativi. Riprova tra qualche secondo.');
      return;
    }

    if (result?.error) {
      setError('Email o password non corretti.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function handleGoogleSignIn() {
    void signIn('google', { callbackUrl });
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

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        style={{
          width: '100%',
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 500,
          color: '#1a1a18',
          background: '#ffffff',
          border: '1px solid #e0dcd4',
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 16,
        }}
        aria-label="Continua con Google"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
        Continua con Google
      </button>

      <div
        role="separator"
        aria-orientation="horizontal"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '12px 0 20px 0',
          fontSize: 12,
          color: '#a19686',
        }}
      >
        <span style={{ flex: 1, height: 1, background: '#e0dcd4' }} aria-hidden="true" />
        <span>oppure con email</span>
        <span style={{ flex: 1, height: 1, background: '#e0dcd4' }} aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit}>
      {/* Email */}
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="email"
          style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6358', marginBottom: 6 }}
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
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="nome@ristorante.it"
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="password"
          style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6358', marginBottom: 6 }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          aria-required="true"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          placeholder="••••••••"
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          id="login-error"
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

      {/* Submit */}
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
        {loading ? 'Accesso...' : 'Accedi'}
      </button>
    </form>
    </>
  );
}
