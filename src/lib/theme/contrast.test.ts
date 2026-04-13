import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  getContrastRatio,
  getContrastLevel,
  getContrastChecks,
} from './contrast';
import { FullThemeSchema } from '@/lib/validators/theme';

describe('getLuminance', () => {
  it('returns 0 for pure black', () => {
    expect(getLuminance('#000000')).toBe(0);
  });

  it('returns 1 for pure white', () => {
    expect(getLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('is order-independent on hex digit casing', () => {
    expect(getLuminance('#AABBCC')).toBeCloseTo(getLuminance('#aabbcc'), 10);
  });

  it('uses the sRGB gamma curve (linear branch for low channels)', () => {
    // #0a0a0a: channel 10/255 ≈ 0.0392 > 0.03928 threshold → non-linear branch per-channel,
    // ma il valore atteso rimane piccolissimo e deterministico
    const lum = getLuminance('#0a0a0a');
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(0.01);
  });
});

describe('getContrastRatio', () => {
  it('returns 21 for black/white (maximum contrast)', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('returns 1 for identical colors (no contrast)', () => {
    expect(getContrastRatio('#888888', '#888888')).toBeCloseTo(1, 5);
  });

  it('is symmetric (order of arguments does not matter)', () => {
    const a = getContrastRatio('#123456', '#fedcba');
    const b = getContrastRatio('#fedcba', '#123456');
    expect(a).toBeCloseTo(b, 10);
  });
});

describe('getContrastLevel', () => {
  it('classifies AAA for ratios >= 7', () => {
    expect(getContrastLevel(7)).toBe('aaa');
    expect(getContrastLevel(21)).toBe('aaa');
  });

  it('classifies AA for ratios in [4.5, 7)', () => {
    expect(getContrastLevel(4.5)).toBe('aa');
    expect(getContrastLevel(6.99)).toBe('aa');
  });

  it('classifies AA-large for ratios in [3, 4.5)', () => {
    expect(getContrastLevel(3)).toBe('aa-large');
    expect(getContrastLevel(4.49)).toBe('aa-large');
  });

  it('classifies fail below 3', () => {
    expect(getContrastLevel(2.99)).toBe('fail');
    expect(getContrastLevel(1)).toBe('fail');
  });
});

describe('getContrastChecks', () => {
  const theme = FullThemeSchema.parse({ cover: {}, menu: {}, dish: {} });

  it('returns exactly 6 checks', () => {
    expect(getContrastChecks(theme)).toHaveLength(6);
  });

  it('each entry exposes label, colors, ratio, level', () => {
    const checks = getContrastChecks(theme);
    for (const c of checks) {
      expect(typeof c.label).toBe('string');
      expect(c.textColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.bgColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.ratio).toBeGreaterThanOrEqual(1);
      expect(c.ratio).toBeLessThanOrEqual(21);
      expect(['fail', 'aa-large', 'aa', 'aaa']).toContain(c.level);
    }
  });

  it('level is coherent with ratio for every entry', () => {
    for (const c of getContrastChecks(theme)) {
      expect(c.level).toBe(getContrastLevel(c.ratio));
    }
  });
});
