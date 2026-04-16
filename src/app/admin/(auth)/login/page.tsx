import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Accedi — AiFolly Menu',
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f3',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#ffffff',
          borderRadius: 8,
          padding: '40px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: '#1a1a18',
              margin: '0 0 6px',
            }}
          >
            AiFolly Menu
          </h1>
          <p
            style={{
              fontSize: 13,
              color: '#6b6358',
              margin: 0,
            }}
          >
            Accedi al pannello di gestione
          </p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>

        <p
          style={{
            fontSize: 12,
            color: '#a19686',
            textAlign: 'center',
            marginTop: 24,
            marginBottom: 0,
          }}
        >
          Non hai un account?{' '}
          <a href="/signup" style={{ color: '#c9b97a', textDecoration: 'none' }}>
            Registrati
          </a>
        </p>
      </div>
    </div>
  );
}
