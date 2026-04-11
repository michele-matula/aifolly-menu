import type { FullTheme } from '@/lib/validators/theme';

// Raccoglie tutte le family di font dichiarate dal tema (9 slot) dedupando.
// Esposto server-side così il <link> stylesheet finisce nell'<head> prima del
// first paint invece che essere iniettato da ThemeProvider client-side (causa
// FOUT + preload warning).
function collectFamilies(theme: FullTheme): string[] {
  const set = new Set<string>();
  set.add(theme.cover.titleFont.family);
  set.add(theme.cover.descriptionFont.family);
  set.add(theme.cover.ctaFont.family);
  set.add(theme.menu.sectionHeaderFont.family);
  set.add(theme.menu.navFont.family);
  set.add(theme.dish.nameFont.family);
  set.add(theme.dish.descriptionFont.family);
  set.add(theme.dish.priceFont.family);
  set.add(theme.dish.tagFont.family);
  return Array.from(set);
}

function buildGoogleFontsHref(families: string[]): string {
  const params = families
    .map(
      f =>
        `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500`,
    )
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export default function MenuFonts({ theme }: { theme: FullTheme }) {
  const families = collectFamilies(theme);
  if (families.length === 0) return null;

  const href = buildGoogleFontsHref(families);

  // React 19 hoista <link> a <head>; `precedence` triggera dedup + blocco
  // del render fino al load dello stylesheet. Due route diverse con lo stesso
  // set di font riusano lo stesso <link>.
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={href} precedence="default" />
    </>
  );
}
