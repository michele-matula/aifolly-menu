import { z } from 'zod';

// ── Shared schemas ──────────────────────────────────────────

export const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colore HEX non valido');

export const FontConfigSchema = z.object({
  family: z.string().min(1).max(100),
  weight: z.enum(['100', '200', '300', '400', '500', '600', '700', '800', '900']).default('400'),
  style: z.enum(['normal', 'italic']).default('normal'),
  size: z.number().min(10).max(120),
  letterSpacing: z.number().min(-5).max(20).default(0),
  lineHeight: z.number().min(0.8).max(3).default(1.3),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
});

// ── Level 1 — Cover ─────────────────────────────────────────

export const CoverThemeSchema = z.object({
  // Background
  backgroundColor: HexColorSchema.default('#FAFAF8'),
  backgroundImageUrl: z.string().url().optional(),
  backgroundOverlayColor: HexColorSchema.default('#000000'),
  backgroundOverlayOpacity: z.number().min(0).max(1).default(0.3),

  // Logo
  showLogo: z.boolean().default(true),
  logoMaxHeight: z.number().min(40).max(200).default(80),

  // Title (restaurant name)
  titleFont: FontConfigSchema.default({
    family: 'Cormorant Garamond',
    weight: '400',
    style: 'italic',
    size: 40,
    letterSpacing: 1,
    lineHeight: 1.2,
    textTransform: 'none',
  }),
  titleColor: HexColorSchema.default('#1a1a18'),

  // Description/tagline
  descriptionFont: FontConfigSchema.default({
    family: 'Outfit',
    weight: '300',
    style: 'normal',
    size: 14,
    letterSpacing: 2,
    lineHeight: 1.5,
    textTransform: 'uppercase',
  }),
  descriptionColor: HexColorSchema.default('#6b6358'),

  // CTA button
  ctaText: z.string().max(30).default('Scopri il menu'),
  ctaFont: FontConfigSchema.default({
    family: 'Outfit',
    weight: '400',
    style: 'normal',
    size: 13,
    letterSpacing: 3,
    lineHeight: 1,
    textTransform: 'uppercase',
  }),
  ctaColor: HexColorSchema.default('#c9b97a'),
  ctaBorderColor: HexColorSchema.default('#c9b97a'),

  // Decorations
  showOrnament: z.boolean().default(true),
  ornamentColor: HexColorSchema.default('#c9b97a'),

  // Layout
  contentAlignment: z.enum(['center', 'left', 'right']).default('center'),
  paddingVertical: z.number().min(20).max(120).default(60),
}).strict();

// ── Level 2 — Menu ──────────────────────────────────────────

export const MenuThemeSchema = z.object({
  // Page background
  backgroundColor: HexColorSchema.default('#FAFAF8'),

  // Section header
  sectionHeaderFont: FontConfigSchema.default({
    family: 'Cormorant Garamond',
    weight: '300',
    style: 'italic',
    size: 26,
    letterSpacing: 0,
    lineHeight: 1.2,
    textTransform: 'none',
  }),
  sectionHeaderColor: HexColorSchema.default('#1a1a18'),
  sectionDividerColor: HexColorSchema.default('#c9b97a'),
  sectionDividerStyle: z.enum(['line', 'dotted', 'ornament', 'none']).default('ornament'),

  // Category navigation (sticky nav)
  navBackgroundColor: HexColorSchema.default('#FAFAF8'),
  navTextColor: HexColorSchema.default('#6b6358'),
  navActiveColor: HexColorSchema.default('#c9b97a'),
  navFont: FontConfigSchema.default({
    family: 'Outfit',
    weight: '400',
    style: 'normal',
    size: 12,
    letterSpacing: 1,
    lineHeight: 1,
    textTransform: 'uppercase',
  }),
  navIndicatorStyle: z.enum(['underline', 'pill', 'dot', 'none']).default('underline'),

  // Dish card — container
  cardBackgroundColor: HexColorSchema.default('#FFFFFF'),
  cardBorderColor: HexColorSchema.default('#f0ece4'),
  cardBorderRadius: z.number().min(0).max(24).default(0),
  cardStyle: z.enum(['elevated', 'flat', 'bordered', 'minimal']).default('elevated'),
  cardShowImage: z.boolean().default(true),
  cardImageRadius: z.number().min(0).max(24).default(6),
  cardImageSize: z.number().min(60).max(120).default(88),

  // Filters
  filterPillColor: HexColorSchema.default('#c9b97a'),
  filterPillTextColor: HexColorSchema.default('#6b6358'),
  filterPillActiveTextColor: HexColorSchema.default('#FFFFFF'),

  // Footer
  footerBackgroundColor: HexColorSchema.default('#F4F1EB'),
  footerTextColor: HexColorSchema.default('#6b6358'),
  footerAccentColor: HexColorSchema.default('#c9b97a'),

  // Effects
  showGrainTexture: z.boolean().default(true),
  grainOpacity: z.number().min(0).max(0.1).default(0.025),
}).strict();

// ── Level 3 — Dish ──────────────────────────────────────────

export const DishThemeSchema = z.object({
  // Dish name
  nameFont: FontConfigSchema.default({
    family: 'Cormorant Garamond',
    weight: '500',
    style: 'normal',
    size: 19,
    letterSpacing: 0,
    lineHeight: 1.2,
    textTransform: 'none',
  }),
  nameColor: HexColorSchema.default('#1a1a18'),

  // Dish description
  descriptionFont: FontConfigSchema.default({
    family: 'Outfit',
    weight: '300',
    style: 'normal',
    size: 12.5,
    letterSpacing: 0,
    lineHeight: 1.5,
    textTransform: 'none',
  }),
  descriptionColor: HexColorSchema.default('#6b6358'),

  // Price
  priceFont: FontConfigSchema.default({
    family: 'Outfit',
    weight: '400',
    style: 'normal',
    size: 16,
    letterSpacing: 0,
    lineHeight: 1,
    textTransform: 'none',
  }),
  priceColor: HexColorSchema.default('#c9b97a'),

  // Tags and badges
  tagBorderColor: HexColorSchema.default('#c9b97a'),
  tagTextColor: HexColorSchema.default('#a68c4e'),
  tagFont: FontConfigSchema.default({
    family: 'Outfit',
    weight: '400',
    style: 'normal',
    size: 10,
    letterSpacing: 0.5,
    lineHeight: 1,
    textTransform: 'uppercase',
  }),

  // Allergens
  allergenTextColor: HexColorSchema.default('#a09882'),

  // Separator
  separatorStyle: z.enum(['dashed', 'solid', 'dotted', 'none']).default('dashed'),
  separatorColor: HexColorSchema.default('#ebe6dc'),

  // Chef's choice indicator
  chefChoiceColor: HexColorSchema.default('#c9b97a'),
}).strict();

// ── Full theme (composite) ──────────────────────────────────

export const FullThemeSchema = z.object({
  cover: CoverThemeSchema,
  menu: MenuThemeSchema,
  dish: DishThemeSchema,
});

// ── Inferred types ──────────────────────────────────────────

export type FontConfig = z.infer<typeof FontConfigSchema>;
export type CoverTheme = z.infer<typeof CoverThemeSchema>;
export type MenuTheme = z.infer<typeof MenuThemeSchema>;
export type DishTheme = z.infer<typeof DishThemeSchema>;
export type FullTheme = z.infer<typeof FullThemeSchema>;
