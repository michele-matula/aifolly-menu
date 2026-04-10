import { updateTag } from 'next/cache';

// Tag-builder centralizzato per la cache del menu pubblico.
// Tutte le mutation che cambiano dati visibili nel menu pubblico devono
// invalidare via questo helper, NON costruendo a mano la stringa del tag —
// così evitiamo bug silenziosi da typo (es. `restaurants:` plurale) che
// lascerebbero la cache stale solo in alcuni call site.
export const RESTAURANT_TAG = (slug: string): string => `restaurant:${slug}`;

// In Next 16 `updateTag` è il sostituto di `revalidateTag` per le server
// actions: oltre a invalidare il tag dà semantica di read-your-own-writes,
// così la prossima lettura nella stessa request vede il dato fresco.
// Va chiamato SOLO da server actions (lo enforce Next a runtime).
export function invalidateRestaurantPublic(slug: string): void {
  updateTag(RESTAURANT_TAG(slug));
}
