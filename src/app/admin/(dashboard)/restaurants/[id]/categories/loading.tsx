export default function CategoriesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 animate-pulse rounded bg-stone-100" />
        <div className="h-9 w-32 animate-pulse rounded bg-stone-100" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded bg-stone-100" />
        ))}
      </div>
    </div>
  );
}
