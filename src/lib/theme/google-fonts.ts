export type FontCategory = 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';

export type CuratedFont = {
  family: string;
  category: FontCategory;
  weights: string[];
  usage: 'cover' | 'menu' | 'both';
};

export const CURATED_FONTS: readonly CuratedFont[] = [
  // ── Serif eleganti ────────────────────────────────────────
  { family: 'Cormorant Garamond', category: 'serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Playfair Display', category: 'serif', weights: ['400', '500', '600', '700'], usage: 'both' },
  { family: 'EB Garamond', category: 'serif', weights: ['400', '500', '600', '700'], usage: 'both' },
  { family: 'Libre Baskerville', category: 'serif', weights: ['400', '700'], usage: 'both' },
  { family: 'Lora', category: 'serif', weights: ['400', '500', '600', '700'], usage: 'both' },
  { family: 'Crimson Pro', category: 'serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Spectral', category: 'serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Bodoni Moda', category: 'serif', weights: ['400', '500', '600', '700'], usage: 'cover' },
  { family: 'DM Serif Display', category: 'serif', weights: ['400'], usage: 'cover' },
  { family: 'Old Standard TT', category: 'serif', weights: ['400', '700'], usage: 'both' },
  { family: 'Cardo', category: 'serif', weights: ['400', '700'], usage: 'both' },
  { family: 'Merriweather', category: 'serif', weights: ['300', '400', '700'], usage: 'both' },
  { family: 'Source Serif 4', category: 'serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Bitter', category: 'serif', weights: ['300', '400', '500', '600', '700'], usage: 'menu' },

  // ── Sans moderni ──────────────────────────────────────────
  { family: 'Inter', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Outfit', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'DM Sans', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Manrope', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Work Sans', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Poppins', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Figtree', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Montserrat', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Raleway', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Nunito', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Karla', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'menu' },
  { family: 'Source Sans 3', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'menu' },
  { family: 'Josefin Sans', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Rubik', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'menu' },
  { family: 'Barlow', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'menu' },
  { family: 'Sora', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Space Grotesk', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },
  { family: 'Urbanist', category: 'sans-serif', weights: ['300', '400', '500', '600', '700'], usage: 'both' },

  // ── Display (per copertine e titoli) ──────────────────────
  { family: 'Fraunces', category: 'display', weights: ['300', '400', '500', '600', '700'], usage: 'cover' },
  { family: 'Cinzel', category: 'display', weights: ['400', '500', '600', '700'], usage: 'cover' },
  { family: 'Italiana', category: 'display', weights: ['400'], usage: 'cover' },
  { family: 'Prata', category: 'display', weights: ['400'], usage: 'cover' },
  { family: 'Abril Fatface', category: 'display', weights: ['400'], usage: 'cover' },
  { family: 'Playfair Display SC', category: 'display', weights: ['400', '700'], usage: 'cover' },
  { family: 'Cormorant SC', category: 'display', weights: ['300', '400', '500', '600', '700'], usage: 'cover' },
  { family: 'Libre Caslon Display', category: 'display', weights: ['400'], usage: 'cover' },
  { family: 'Marcellus', category: 'display', weights: ['400'], usage: 'cover' },
  { family: 'Vollkorn SC', category: 'display', weights: ['400', '600', '700'], usage: 'cover' },

  // ── Handwriting (accenti discreti) ────────────────────────
  { family: 'Caveat', category: 'handwriting', weights: ['400', '500', '600', '700'], usage: 'cover' },
  { family: 'Dancing Script', category: 'handwriting', weights: ['400', '500', '600', '700'], usage: 'cover' },

  // ── Monospace (per dettagli prezzi, se desiderato) ────────
  { family: 'JetBrains Mono', category: 'monospace', weights: ['300', '400', '500', '600', '700'], usage: 'menu' },
] as const;

/** Whitelist set per validazione server-side dei nomi font (anti CSS injection) */
export const FONT_FAMILY_SET: ReadonlySet<string> = new Set(
  CURATED_FONTS.map(f => f.family)
);

/** Returns fonts usable for a given context, including 'both' */
export function getFontsByUsage(usage: 'cover' | 'menu'): CuratedFont[] {
  return CURATED_FONTS.filter(f => f.usage === usage || f.usage === 'both');
}

/** Returns available weights for a given font family */
export function getFontWeightsForFamily(family: string): string[] {
  const font = CURATED_FONTS.find(f => f.family === family);
  return font?.weights ?? ['400'];
}

/** Builds a Google Fonts URL for loading a subset of fonts at weight 400 only (preview) */
export function buildFontsPreviewUrl(families: string[]): string {
  if (families.length === 0) return '';
  const params = families
    .map(f => `family=${encodeURIComponent(f)}:wght@400`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** Builds a Google Fonts URL for a single font with specific weights */
export function buildFontUrl(family: string, weights: string[]): string {
  const wghts = weights.join(';');
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,${wghts};1,${wghts}&display=swap`;
}
