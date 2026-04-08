export default function ThemeLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-56 animate-pulse rounded bg-stone-100" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-stone-100" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded bg-stone-100" />
          ))}
        </div>
        <div className="h-[500px] w-full animate-pulse rounded bg-stone-100" />
      </div>
    </div>
  );
}
