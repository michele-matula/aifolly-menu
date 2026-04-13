import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s · AiFolly Menu',
    default: 'Admin · AiFolly Menu',
  },
  // Il pannello admin è dietro auth ma aggiungiamo `noindex` come difesa
  // in profondità: se robots.txt viene ignorato (alcuni crawler lo fanno)
  // i meta robots nelle pagine servono come secondo livello.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      {children}
    </div>
  );
}
