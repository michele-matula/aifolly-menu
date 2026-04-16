'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleButton from '@/app/signup/google-button';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const prefillEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <GoogleButton callbackUrl={callbackUrl} />

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
