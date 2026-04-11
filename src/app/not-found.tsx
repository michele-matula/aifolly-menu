import Link from 'next/link';

// Root 404 brandizzato per URL non matchati da nessuna route.
// Le pagine pubbliche del menu hanno il loro `not-found.tsx` dedicato
// in `(menu)/[slug]/not-found.tsx` con copy specifica per il caso
// "ristorante non trovato".
export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <div style={{ width: 32, height: 1, background: '#c9b97a' }} />
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            border: '1px solid #c9b97a',
          }}
        />
        <div style={{ width: 32, height: 1, background: '#c9b97a' }} />
      </div>

      <h1 className="mb-3 text-2xl font-light text-[#1c1917]">
        Pagina non trovata
      </h1>
      <p className="mb-8 max-w-sm text-sm text-[#78716c]">
        L&apos;indirizzo che hai inserito non corrisponde a nessuna pagina di
        AiFolly Menu.
      </p>

      <Link
        href="/"
        className="text-xs uppercase tracking-[0.32em] text-[#c9b97a] border border-[#c9b97a] px-9 py-3.5 transition-colors hover:bg-[#c9b97a] hover:text-white"
      >
        Torna alla home
      </Link>
    </div>
  );
}
