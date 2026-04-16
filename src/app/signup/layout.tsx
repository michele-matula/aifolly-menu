import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrati — AiFolly Menu',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
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
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 8,
          padding: '40px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
