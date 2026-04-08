import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s · AiFolly Menu',
    default: 'Admin · AiFolly Menu',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      {children}
    </div>
  );
}
