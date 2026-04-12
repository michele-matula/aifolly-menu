'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function RestaurantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { containerRef.current?.focus(); }, []);

  const message = error.message?.slice(0, 200) || 'Errore sconosciuto';

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div ref={containerRef} role="alert" tabIndex={-1} className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm outline-none">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-[#c9b97a]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.56 20h18.88a1 1 0 00.87-1.28l-8.6-14.86a1 1 0 00-1.72 0z"
          />
        </svg>
        <h2 className="mb-2 text-lg font-semibold text-[#1c1917]">
          Qualcosa è andato storto
        </h2>
        <p className="mb-6 text-sm text-[#78716c]">{message}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-[#c9b97a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b8a96a]"
          >
            Riprova
          </button>
          <Link
            href="/admin"
            className="text-sm text-[#a8a29e] transition-colors hover:text-[#78716c]"
          >
            Torna alla dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
