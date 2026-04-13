import { describe, it, expect } from 'vitest';
import { themeToCSSVars } from './theme-to-css';
import { FullThemeSchema } from '@/lib/validators/theme';

const theme = FullThemeSchema.parse({ cover: {}, menu: {}, dish: {} });
const vars = themeToCSSVars(theme);

describe('themeToCSSVars — shape', () => {
  it('every key is a CSS custom property (starts with --)', () => {
    for (const k of Object.keys(vars)) {
      expect(k.startsWith('--')).toBe(true);
    }
  });

  it('every value is a string', () => {
    for (const v of Object.values(vars)) {
      expect(typeof v).toBe('string');
    }
  });
});

describe('themeToCSSVars — cover', () => {
  it('maps backgroundColor → --cover-bg', () => {
    expect(vars['--cover-bg']).toBe(theme.cover.backgroundColor);
  });

  it('serializes numeric opacity as string', () => {
    expect(vars['--cover-overlay-opacity']).toBe(
      String(theme.cover.backgroundOverlayOpacity),
    );
  });

  it('appends px to pixel dimensions', () => {
    expect(vars['--cover-logo-max-height']).toBe(
      `${theme.cover.logoMaxHeight}px`,
    );
    expect(vars['--cover-padding-v']).toBe(
      `${theme.cover.paddingVertical}px`,
    );
  });

  it('expands title font config into --cover-title-* vars', () => {
    expect(vars['--cover-title-font']).toBe(theme.cover.titleFont.family);
    expect(vars['--cover-title-size']).toBe(`${theme.cover.titleFont.size}px`);
    expect(vars['--cover-title-weight']).toBe(theme.cover.titleFont.weight);
    expect(vars['--cover-title-style']).toBe(theme.cover.titleFont.style);
    expect(vars['--cover-title-spacing']).toBe(
      `${theme.cover.titleFont.letterSpacing}px`,
    );
    expect(vars['--cover-title-line-height']).toBe(
      String(theme.cover.titleFont.lineHeight),
    );
    expect(vars['--cover-title-transform']).toBe(
      theme.cover.titleFont.textTransform,
    );
  });
});

describe('themeToCSSVars — menu', () => {
  it('maps card radii and image size with px suffix', () => {
    expect(vars['--card-border-radius']).toBe(
      `${theme.menu.cardBorderRadius}px`,
    );
    expect(vars['--card-image-radius']).toBe(
      `${theme.menu.cardImageRadius}px`,
    );
    expect(vars['--card-image-size']).toBe(`${theme.menu.cardImageSize}px`);
  });

  it('maps grain opacity as stringified number', () => {
    expect(vars['--grain-opacity']).toBe(String(theme.menu.grainOpacity));
  });

  it('maps filter pill colors', () => {
    expect(vars['--filter-pill-color']).toBe(theme.menu.filterPillColor);
    expect(vars['--filter-pill-text']).toBe(theme.menu.filterPillTextColor);
    expect(vars['--filter-pill-active-text']).toBe(
      theme.menu.filterPillActiveTextColor,
    );
  });
});

describe('themeToCSSVars — dish', () => {
  it('maps dish name color', () => {
    expect(vars['--dish-name-color']).toBe(theme.dish.nameColor);
  });

  it('expands dish price font config', () => {
    expect(vars['--dish-price-font']).toBe(theme.dish.priceFont.family);
    expect(vars['--dish-price-size']).toBe(`${theme.dish.priceFont.size}px`);
  });

  it('maps chef choice color', () => {
    expect(vars['--dish-chef-color']).toBe(theme.dish.chefChoiceColor);
  });
});
