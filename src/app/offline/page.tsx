import type { Metadata } from 'next';
import MenuOffline from '@/components/menu/MenuOffline';

// Route statica precached dal service worker all'install.
// Viene servita come fallback di navigazione quando il cliente è offline
// e lo slug richiesto non è nel RUNTIME cache (primo accesso a un menu
// senza rete, o cache svuotata). `noindex` perché non è una pagina reale
// del prodotto, è un fallback tecnico.
export const metadata: Metadata = {
  title: 'Connessione assente',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <MenuOffline />;
}
