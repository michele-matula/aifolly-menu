// Skeleton form-shaped per la pagina "Modifica piatto".
// Duplicato consapevole di dishes/new/loading.tsx — i 2 form hanno
// la stessa shape e fattorizzare un componente condiviso a 2 call site
// è scope creep prematuro.
export default function EditDishLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Caricamento modulo in corso…</span>
      <div className="mb-1 h-6 w-40 animate-pulse rounded bg-stone-100" />
      <div className="mb-6 h-4 w-56 animate-pulse rounded bg-stone-100" />

      <div className="space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-stone-100" />
            <div className="h-10 w-full animate-pulse rounded bg-stone-100" />
          </div>
        ))}

        <div className="pt-4 flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded bg-stone-100" />
          <div className="h-10 w-24 animate-pulse rounded bg-stone-100" />
        </div>
      </div>
    </div>
  );
}
