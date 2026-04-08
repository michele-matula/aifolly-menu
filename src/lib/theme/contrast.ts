import type { FullTheme } from '@/lib/validators/theme';

export function getLuminance(hex: string): number {
  const rgb = [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ].map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastLevel(ratio: number): 'fail' | 'aa-large' | 'aa' | 'aaa' {
  if (ratio >= 7) return 'aaa';
  if (ratio >= 4.5) return 'aa';
  if (ratio >= 3) return 'aa-large';
  return 'fail';
}

export function getContrastChecks(theme: FullTheme): Array<{
  label: string;
  textColor: string;
  bgColor: string;
  ratio: number;
  level: string;
}> {
  return [
    {
      label: 'Titolo copertina su sfondo',
      textColor: theme.cover.titleColor,
      bgColor: theme.cover.backgroundColor,
    },
    {
      label: 'Descrizione copertina su sfondo',
      textColor: theme.cover.descriptionColor,
      bgColor: theme.cover.backgroundColor,
    },
    {
      label: 'Nome piatto su card',
      textColor: theme.dish.nameColor,
      bgColor: theme.menu.cardBackgroundColor,
    },
    {
      label: 'Descrizione piatto su card',
      textColor: theme.dish.descriptionColor,
      bgColor: theme.menu.cardBackgroundColor,
    },
    {
      label: 'Header sezione su sfondo menu',
      textColor: theme.menu.sectionHeaderColor,
      bgColor: theme.menu.backgroundColor,
    },
    {
      label: 'Prezzo su card',
      textColor: theme.dish.priceColor,
      bgColor: theme.menu.cardBackgroundColor,
    },
  ].map(check => ({
    ...check,
    ratio: getContrastRatio(check.textColor, check.bgColor),
    level: getContrastLevel(getContrastRatio(check.textColor, check.bgColor)),
  }));
}
