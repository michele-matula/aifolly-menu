export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-6 w-48 animate-pulse rounded bg-stone-100" />
        <div className="h-4 w-64 animate-pulse rounded bg-stone-100" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg bg-stone-100" />
        <div className="h-40 animate-pulse rounded-lg bg-stone-100" />
      </div>
    </div>
  );
}
