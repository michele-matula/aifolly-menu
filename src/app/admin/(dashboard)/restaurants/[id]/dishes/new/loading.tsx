// Skeleton form-shaped per la pagina "Nuovo piatto".
// Senza questo file, /dishes/new ereditava lo skeleton di /dishes
// (che è una lista di righe), creando un flash visivo sbagliato.
export default function NewDishLoading() {
  return (
    <div>
      <div className="mb-1 h-6 w-32 animate-pulse rounded bg-stone-100" />
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-stone-100" />

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
