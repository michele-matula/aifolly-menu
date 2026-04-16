import { Suspense } from 'react';
import SignupForm from './signup-form';

export default function SignupPage() {
  return (
    <>
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
        <p style={{ fontSize: 13, color: '#6b6358', margin: 0 }}>
          Crea il tuo account e inizia il periodo di prova gratuito
        </p>
      </div>

      <Suspense>
        <SignupForm />
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
        Hai già un account?{' '}
        <a href="/admin/login" style={{ color: '#c9b97a', textDecoration: 'none' }}>
          Accedi
        </a>
      </p>
    </>
  );
}
