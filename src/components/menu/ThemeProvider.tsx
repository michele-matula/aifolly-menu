import type { FullTheme } from '@/lib/validators/theme';
import { themeToCSSVars } from '@/lib/theme/theme-to-css';

// Server component: emette le CSS vars del tema su un wrapper div che scopa
// i consumer (cover, menu, dish). Il caricamento dei font è stato estratto
// in <MenuFonts/> per iniettarli server-side nell'<head>.
export default function ThemeProvider({
  theme,
  children,
}: {
  theme: FullTheme;
  children: React.ReactNode;
}) {
  const cssVars = themeToCSSVars(theme);
  return <div style={cssVars as React.CSSProperties}>{children}</div>;
}
