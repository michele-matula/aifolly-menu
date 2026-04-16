/**
 * Normalizza un nome in formato slug: lowercase, NFD per rimuovere
 * diacritici, solo alfanumerici e trattini, no doppi/trailing trattini.
 */
export function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
