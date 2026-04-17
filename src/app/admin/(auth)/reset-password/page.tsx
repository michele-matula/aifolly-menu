import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import ResetPasswordForm from './reset-password-form';

export const metadata: Metadata = {
  title: 'Reimposta password — AiFolly Menu',
};

export default function ResetPasswordPage() {
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: '#1a1a18',
              margin: '0 0 6px',
            }}
          >
            Nuova password
          </h1>
          <p
            style={{
              fontSize: 13,
              color: '#6b6358',
              margin: 0,
            }}
          >
            Scegli una nuova password per il tuo account.
          </p>
        </div>

        <Suspense>
          <ResetPasswordForm />
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
          <Link href="/admin/login" style={{ color: '#c9b97a', textDecoration: 'none' }}>
            Torna al login
          </Link>
        </p>
      </div>
    </div>
  );
}
