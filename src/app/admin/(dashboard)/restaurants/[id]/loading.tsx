export default function RestaurantLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Caricamento in corso…</span>
      <div className="h-7 w-64 animate-pulse rounded bg-stone-100" />
      <div className="h-10 w-full animate-pulse rounded bg-stone-100" />
      <div className="h-64 w-full animate-pulse rounded bg-stone-100" />
    </div>
  );
}
