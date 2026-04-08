import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: 8,
          padding: '40px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#1a1a18', margin: '0 0 8px' }}>
          Benvenuto, {session.user.name ?? session.user.email}
        </h1>
        <p style={{ fontSize: 13, color: '#6b6358', margin: '0 0 24px' }}>
          Pannello admin — in costruzione
        </p>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/admin/login' });
          }}
        >
          <button
            type="submit"
            style={{
              padding: '10px 28px',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: '#c9b97a',
              background: 'transparent',
              border: '1px solid #c9b97a',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Esci
          </button>
        </form>
      </div>
    </div>
  );
}
