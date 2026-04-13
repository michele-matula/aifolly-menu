import { describe, it, expect } from 'vitest';
import {
  HexColorSchema,
  FontFamilySchema,
  FontConfigSchema,
  CoverThemeSchema,
  MenuThemeSchema,
  DishThemeSchema,
  FullThemeSchema,
} from './theme';

describe('HexColorSchema', () => {
  it('accepts valid 6-digit HEX colors (lower/upper case)', () => {
    expect(HexColorSchema.safeParse('#000000').success).toBe(true);
    expect(HexColorSchema.safeParse('#FFFFFF').success).toBe(true);
    expect(HexColorSchema.safeParse('#A1b2C3').success).toBe(true);
  });

  it('rejects 3-digit shorthand, missing #, wrong length, non-hex chars', () => {
    expect(HexColorSchema.safeParse('#abc').success).toBe(false);
    expect(HexColorSchema.safeParse('000000').success).toBe(false);
    expect(HexColorSchema.safeParse('#1234567').success).toBe(false);
    expect(HexColorSchema.safeParse('#zzzzzz').success).toBe(false);
    expect(HexColorSchema.safeParse('rgb(0,0,0)').success).toBe(false);
  });
});

describe('FontFamilySchema', () => {
  it('accepts a curated font family', () => {
    expect(FontFamilySchema.safeParse('Inter').success).toBe(true);
    expect(FontFamilySchema.safeParse('Cormorant Garamond').success).toBe(true);
  });

  it('rejects a font not in the curated whitelist (anti CSS injection)', () => {
    expect(FontFamilySchema.safeParse('Arial').success).toBe(false);
    expect(FontFamilySchema.safeParse('').success).toBe(false);
    // Classico payload di injection: chiusura + url() esterna
    expect(
      FontFamilySchema.safeParse('Inter; background: url(evil)').success,
    ).toBe(false);
  });
});

describe('FontConfigSchema', () => {
  const valid = {
    family: 'Inter',
    weight: '400' as const,
    style: 'normal' as const,
    size: 14,
    letterSpacing: 0,
    lineHeight: 1.4,
    textTransform: 'none' as const,
  };

  it('accepts a valid config', () => {
    expect(FontConfigSchema.safeParse(valid).success).toBe(true);
  });

  it('applies defaults to optional fields', () => {
    const parsed = FontConfigSchema.parse({ family: 'Inter', size: 14 });
    expect(parsed.weight).toBe('400');
    expect(parsed.style).toBe('normal');
    expect(parsed.letterSpacing).toBe(0);
    expect(parsed.lineHeight).toBe(1.3);
    expect(parsed.textTransform).toBe('none');
  });

  it('rejects size out of [10, 120]', () => {
    expect(FontConfigSchema.safeParse({ ...valid, size: 9 }).success).toBe(false);
    expect(FontConfigSchema.safeParse({ ...valid, size: 121 }).success).toBe(false);
  });

  it('rejects invalid weight / style / textTransform values', () => {
    expect(FontConfigSchema.safeParse({ ...valid, weight: '150' }).success).toBe(false);
    expect(FontConfigSchema.safeParse({ ...valid, style: 'oblique' }).success).toBe(false);
    expect(FontConfigSchema.safeParse({ ...valid, textTransform: 'weird' }).success).toBe(false);
  });

  it('rejects letterSpacing and lineHeight out of range', () => {
    expect(FontConfigSchema.safeParse({ ...valid, letterSpacing: 21 }).success).toBe(false);
    expect(FontConfigSchema.safeParse({ ...valid, lineHeight: 0.5 }).success).toBe(false);
    expect(FontConfigSchema.safeParse({ ...valid, lineHeight: 3.1 }).success).toBe(false);
  });
});

describe('CoverThemeSchema', () => {
  it('parses an empty object applying all defaults', () => {
    const parsed = CoverThemeSchema.parse({});
    expect(parsed.backgroundColor).toBe('#FAFAF8');
    expect(parsed.ctaText).toBe('Scopri il menu');
    expect(parsed.contentAlignment).toBe('center');
  });

  it('rejects unknown keys (strict schema)', () => {
    expect(CoverThemeSchema.safeParse({ malicious: true }).success).toBe(false);
  });

  it('rejects out-of-range overlay opacity', () => {
    expect(CoverThemeSchema.safeParse({ backgroundOverlayOpacity: 1.1 }).success).toBe(false);
    expect(CoverThemeSchema.safeParse({ backgroundOverlayOpacity: -0.1 }).success).toBe(false);
  });
});

describe('MenuThemeSchema', () => {
  it('parses an empty object applying defaults', () => {
    const parsed = MenuThemeSchema.parse({});
    expect(parsed.cardStyle).toBe('elevated');
    expect(parsed.navIndicatorStyle).toBe('underline');
  });

  it('clamps cardBorderRadius to [0, 24]', () => {
    expect(MenuThemeSchema.safeParse({ cardBorderRadius: -1 }).success).toBe(false);
    expect(MenuThemeSchema.safeParse({ cardBorderRadius: 25 }).success).toBe(false);
    expect(MenuThemeSchema.safeParse({ cardBorderRadius: 12 }).success).toBe(true);
  });

  it('rejects grainOpacity > 0.1', () => {
    expect(MenuThemeSchema.safeParse({ grainOpacity: 0.2 }).success).toBe(false);
  });
});

describe('DishThemeSchema', () => {
  it('parses an empty object applying defaults', () => {
    const parsed = DishThemeSchema.parse({});
    expect(parsed.separatorStyle).toBe('dashed');
  });

  it('rejects unknown keys (strict schema)', () => {
    expect(DishThemeSchema.safeParse({ foo: 1 }).success).toBe(false);
  });
});

describe('FullThemeSchema', () => {
  it('parses nested empty objects applying every default', () => {
    const parsed = FullThemeSchema.parse({ cover: {}, menu: {}, dish: {} });
    expect(parsed.cover).toBeDefined();
    expect(parsed.menu).toBeDefined();
    expect(parsed.dish).toBeDefined();
  });

  it('rejects when a top-level key is missing', () => {
    expect(FullThemeSchema.safeParse({ cover: {}, menu: {} }).success).toBe(false);
  });
});
