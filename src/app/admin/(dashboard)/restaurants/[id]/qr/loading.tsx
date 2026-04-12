export default function QrLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Caricamento QR code in corso…</span>
      <div className="h-7 w-48 animate-pulse rounded bg-stone-100" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="aspect-square max-w-[400px] animate-pulse rounded bg-stone-100" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 w-full animate-pulse rounded bg-stone-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
