// Service worker per il menu pubblico AiFolly Menu.
// Obiettivo: offline graceful quando il cliente scansiona il QR al tavolo
// e si trova su WiFi instabile. NON viene registrato in dev e NON
// intercetta admin/api (vedi guard nel fetch handler + registrazione
// dal (menu)/layout con scope '/'). Vanilla JS, servito a /sw.js.

const VERSION = 'v1';
const PRECACHE = `aifolly-precache-${VERSION}`;
const RUNTIME = `aifolly-runtime-${VERSION}`;
const OFFLINE_URL = '/offline';

// Precarichiamo solo /offline: è il fallback universale per qualsiasi
// slug mai visitato prima. I menu già visti finiscono nel RUNTIME cache
// alla prima visita online e vengono serviti dalla cache se la rete cade.
const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  // Attiviamo subito la nuova versione senza aspettare la chiusura dei tab.
  // Sicuro qui perché la strategia è network-first: una SW nuova non serve
  // HTML stantio, serve fresco se online.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== PRECACHE && k !== RUNTIME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Messaggio dall'app per forzare skipWaiting (usato da ServiceWorkerRegister
// se in futuro vogliamo prompt "ricarica per aggiornare").
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isStaticAsset(url) {
  if (url.pathname.startsWith('/_next/static/')) return true;
  return /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|webp|avif|ico)$/.test(
    url.pathname,
  );
}

function shouldBypass(url) {
  // Admin, API e Next data/image endpoints: sempre rete, mai cache.
  // L'auth non deve scadere in cache, le API devono essere fresche,
  // /_next/data alimenta il router client-side.
  return (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/data') ||
    url.pathname.startsWith('/_next/image')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin: PostHog, Sentry, Google Fonts, Supabase Storage.
  // Lasciamo fare al browser — la loro cache è gestita altrove.
  if (url.origin !== self.location.origin) return;

  if (shouldBypass(url)) return;

  // Navigazione HTML (menu pubblico): network-first con fallback cache,
  // poi fallback /offline se anche la cache è vuota per quello slug.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachiamo solo risposte 2xx per evitare di memorizzare 404/500.
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline || Response.error();
        }),
    );
    return;
  }

  // Asset statici: stale-while-revalidate. Hash nell'URL = immutabili,
  // quindi la cache non serve mai versioni sbagliate.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(RUNTIME)
                .then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
