'use client';

import { useEffect } from 'react';

// Registra il service worker /sw.js con scope '/'. Il SW filtra
// internamente admin/api (vedi public/sw.js) — lo scope ampio è
// necessario solo per catturare le navigazioni tra cover e menu
// senza dover registrare scope annidati.
//
// Disabilitato in dev: Turbopack produce bundle con hash diversi ad
// ogni reload e lo SW rischia di servire asset stantii. In produzione
// il problema non esiste perché gli hash sono stabili per build.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Registriamo dopo il load: evita di competere per la banda con
    // le risorse critiche del first paint.
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Silenzioso: il SW è un'ottimizzazione, non deve mai bloccare
        // l'esperienza del cliente. Sentry catturerà errori gravi lato
        // runtime se il SW stesso esplode.
      });
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return null;
}
