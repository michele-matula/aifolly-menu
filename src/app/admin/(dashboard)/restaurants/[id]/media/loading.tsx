export default function MediaLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-stone-100" />
      <div className="h-8 w-full animate-pulse rounded bg-stone-100" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded bg-stone-100" />
        ))}
      </div>
    </div>
  );
}
