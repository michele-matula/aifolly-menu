'use client';

import { useEffect } from 'react';
import type { FullTheme } from '@/lib/validators/theme';
import { themeToCSSVars } from '@/lib/theme/theme-to-css';

function collectFonts(theme: FullTheme): string[] {
  const fonts = new Set<string>();
  fonts.add(theme.cover.titleFont.family);
  fonts.add(theme.cover.descriptionFont.family);
  fonts.add(theme.cover.ctaFont.family);
  fonts.add(theme.menu.sectionHeaderFont.family);
  fonts.add(theme.menu.navFont.family);
  fonts.add(theme.dish.nameFont.family);
  fonts.add(theme.dish.descriptionFont.family);
  fonts.add(theme.dish.priceFont.family);
  fonts.add(theme.dish.tagFont.family);
  return Array.from(fonts);
}

export default function ThemeProvider({
  theme,
  children,
}: {
  theme: FullTheme;
  children: React.ReactNode;
}) {
  const cssVars = themeToCSSVars(theme);

  useEffect(() => {
    const fonts = collectFonts(theme);
    const familyParams = fonts
      .map(f => `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500`)
      .join('&');

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [theme]);

  return (
    <div style={cssVars as React.CSSProperties}>
      {children}
    </div>
  );
}
