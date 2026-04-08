// ════════════════════════════════════════════════════════════════
//  AiFolly Menu — Seed dei temi preset
//  
//  File: prisma/seed-presets.ts
//  Versione: 1.0 — Allineato alla spec v3.3
//  
//  Definisce gli 8 temi preset disponibili nella piattaforma:
//    1. Elegante     — Luxury raffinato (avorio + oro, Cormorant)
//    2. Minimal      — Pulito moderno (bianco + nero, DM Sans)
//    3. Rustico      — Trattoria calda (terra + verde, Playfair)
//    4. Vivace       — Colorato informale (corallo + turchese, Fredoka)
//    5. Classico     — Tradizionale (crema + bordeaux, Libre Baskerville)
//    6. Moderno      — Contemporaneo (grigio scuro + lime, Space Grotesk)
//    7. Bistrot      — Francese intimo (carta + blu notte, EB Garamond)
//    8. Street Food  — Urbano bold (nero + giallo, Anton)
//
//  Strategia di definizione:
//    - ELEGANTE è il template completo di riferimento (dorato)
//    - Gli altri 7 preset usano `mergePreset(BASE_ELEGANTE, overrides)`
//      e sovrascrivono solo le proprietà distintive
//    - Garantisce coerenza strutturale e file leggibile
//
//  Uso:
//    import { ALL_PRESETS } from './seed-presets'
//    for (const preset of ALL_PRESETS) {
//      await prisma.themePreset.create({ data: preset })
//    }
// ════════════════════════════════════════════════════════════════

import type { CoverTheme, MenuTheme, DishTheme } from '../src/lib/validators/theme';

// ─── Helper di merge profondo ───────────────────────────────────
// Permette di definire un preset come override di un altro,
// preservando tutte le proprietà non sovrascritte.

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
  const result = { ...base } as T;
  for (const key in override) {
    const overrideValue = override[key];
    const baseValue = base[key];
    if (
      overrideValue &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue) &&
      baseValue &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(baseValue as object, overrideValue as object) as T[Extract<keyof T, string>];
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue as T[Extract<keyof T, string>];
    }
  }
  return result;
}

interface PresetConfig {
  cover: CoverTheme;
  menu: MenuTheme;
  dish: DishTheme;
}

function mergePreset(
  base: PresetConfig,
  overrides: {
    cover?: DeepPartial<CoverTheme>;
    menu?: DeepPartial<MenuTheme>;
    dish?: DeepPartial<DishTheme>;
  }
): PresetConfig {
  return {
    cover: overrides.cover ? deepMerge(base.cover, overrides.cover) : base.cover,
    menu: overrides.menu ? deepMerge(base.menu, overrides.menu) : base.menu,
    dish: overrides.dish ? deepMerge(base.dish, overrides.dish) : base.dish,
  };
}

// ════════════════════════════════════════════════════════════════
//  PRESET 1 — ELEGANTE (template dorato di riferimento)
//  Estratto direttamente dai prototipi:
//    - menu-luxury-completo.jsx
//    - cover-page-elegante.jsx
// ════════════════════════════════════════════════════════════════

const ELEGANTE: PresetConfig = {
  // ── LIVELLO 1: COPERTINA ─────────────────────────────────────
  cover: {
    // Sfondo
    backgroundColor: '#FAFAF8',
    backgroundImageUrl: undefined,           // Foto opzionale, default nessuna
    backgroundOverlayColor: '#000000',
    backgroundOverlayOpacity: 0.3,

    // Logo
    showLogo: true,
    logoMaxHeight: 80,

    // Titolo (nome ristorante)
    titleFont: {
      family: 'Cormorant Garamond',
      weight: '300',
      style: 'italic',
      size: 44,
      letterSpacing: 0.5,
      lineHeight: 1.05,
      textTransform: 'none',
    },
    titleColor: '#1a1a18',

    // Descrizione/tagline
    descriptionFont: {
      family: 'Outfit',
      weight: '300',
      style: 'normal',
      size: 13,
      letterSpacing: 0.2,
      lineHeight: 1.7,
      textTransform: 'none',
    },
    descriptionColor: '#6b6358',

    // CTA "Scopri il menu"
    ctaText: 'Scopri il menu',
    ctaFont: {
      family: 'Outfit',
      weight: '400',
      style: 'normal',
      size: 12,
      letterSpacing: 3.2,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    ctaColor: '#ffffff',
    ctaBorderColor: '#c9b97a',

    // Decorazioni
    showOrnament: true,
    ornamentColor: '#c9b97a',

    // Layout
    contentAlignment: 'center',
    paddingVertical: 60,
  },

  // ── LIVELLO 2: MENU ──────────────────────────────────────────
  menu: {
    // Sfondo pagina menu
    backgroundColor: '#FAFAF8',

    // Header sezione categoria (es. "Antipasti", "Primi")
    sectionHeaderFont: {
      family: 'Cormorant Garamond',
      weight: '400',
      style: 'italic',
      size: 26,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    sectionHeaderColor: '#1a1a18',
    sectionDividerColor: '#ebe6dc',
    sectionDividerStyle: 'ornament',

    // Navigazione categorie sticky
    navBackgroundColor: '#FAFAF8',
    navTextColor: '#a09882',
    navActiveColor: '#c9b97a',
    navFont: {
      family: 'Outfit',
      weight: '300',
      style: 'normal',
      size: 11,
      letterSpacing: 2.2,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    navIndicatorStyle: 'underline',

    // Card piatto — contenitore
    cardBackgroundColor: '#FFFFFF',
    cardBorderColor: '#f0ece4',
    cardBorderRadius: 0,
    cardStyle: 'flat',
    cardShowImage: true,
    cardImageRadius: 6,
    cardImageSize: 88,

    // Filtri
    filterPillColor: '#c9b97a',
    filterPillTextColor: '#a09882',
    filterPillActiveTextColor: '#a68c4e',

    // Footer
    footerBackgroundColor: '#F4F1EB',
    footerTextColor: '#a09882',
    footerAccentColor: '#c9b97a',

    // Effetti
    showGrainTexture: true,
    grainOpacity: 0.025,
  },

  // ── LIVELLO 3: PIATTI ────────────────────────────────────────
  dish: {
    // Titolo piatto
    nameFont: {
      family: 'Cormorant Garamond',
      weight: '500',
      style: 'normal',
      size: 19,
      letterSpacing: 0,
      lineHeight: 1.25,
      textTransform: 'none',
    },
    nameColor: '#1a1a18',

    // Descrizione piatto
    descriptionFont: {
      family: 'Outfit',
      weight: '300',
      style: 'normal',
      size: 12.5,
      letterSpacing: 0.1,
      lineHeight: 1.6,
      textTransform: 'none',
    },
    descriptionColor: '#6b6358',

    // Prezzo
    priceFont: {
      family: 'Outfit',
      weight: '400',
      style: 'normal',
      size: 14,
      letterSpacing: 0.2,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#c9b97a',

    // Tag e badge
    tagBorderColor: '#e8dfc8',
    tagTextColor: '#a68c4e',
    tagFont: {
      family: 'Outfit',
      weight: '400',
      style: 'normal',
      size: 9,
      letterSpacing: 1.4,
      lineHeight: 1,
      textTransform: 'uppercase',
    },

    // Allergeni
    allergenTextColor: '#6b6358',

    // Separatore tra nome e descrizione
    separatorStyle: 'dashed',
    separatorColor: '#ebe6dc',

    // Chef's choice indicator
    chefChoiceColor: '#c9b97a',
  },
};

// ════════════════════════════════════════════════════════════════
//  PRESET 2 — MINIMAL (pulito, moderno, monocromo)
//  Bianco + nero, sans-serif geometriche, niente ornamenti
// ════════════════════════════════════════════════════════════════

const MINIMAL = mergePreset(ELEGANTE, {
  cover: {
    backgroundColor: '#FFFFFF',
    titleFont: {
      family: 'DM Sans',
      weight: '500',
      style: 'normal',
      size: 42,
      letterSpacing: -1,
      lineHeight: 1.05,
      textTransform: 'none',
    },
    titleColor: '#0a0a0a',
    descriptionFont: {
      family: 'Inter',
      weight: '400',
      style: 'normal',
      size: 14,
      letterSpacing: 0,
      lineHeight: 1.6,
      textTransform: 'none',
    },
    descriptionColor: '#525252',
    ctaText: 'View menu',
    ctaFont: {
      family: 'Inter',
      weight: '500',
      style: 'normal',
      size: 13,
      letterSpacing: 0.5,
      lineHeight: 1,
      textTransform: 'none',
    },
    ctaColor: '#ffffff',
    ctaBorderColor: '#0a0a0a',
    showOrnament: false,
    ornamentColor: '#0a0a0a',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    sectionHeaderFont: {
      family: 'DM Sans',
      weight: '500',
      style: 'normal',
      size: 22,
      letterSpacing: -0.5,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    sectionHeaderColor: '#0a0a0a',
    sectionDividerColor: '#e5e5e5',
    sectionDividerStyle: 'line',
    navBackgroundColor: '#FFFFFF',
    navTextColor: '#737373',
    navActiveColor: '#0a0a0a',
    navFont: {
      family: 'Inter',
      weight: '500',
      style: 'normal',
      size: 12,
      letterSpacing: 0,
      lineHeight: 1,
      textTransform: 'none',
    },
    navIndicatorStyle: 'underline',
    cardBackgroundColor: '#FFFFFF',
    cardBorderColor: '#e5e5e5',
    cardBorderRadius: 0,
    cardStyle: 'flat',
    cardImageRadius: 0,
    filterPillColor: '#0a0a0a',
    filterPillTextColor: '#737373',
    filterPillActiveTextColor: '#0a0a0a',
    footerBackgroundColor: '#fafafa',
    footerTextColor: '#737373',
    footerAccentColor: '#0a0a0a',
    showGrainTexture: false,
    grainOpacity: 0,
  },
  dish: {
    nameFont: {
      family: 'DM Sans',
      weight: '500',
      style: 'normal',
      size: 17,
      letterSpacing: -0.2,
      lineHeight: 1.3,
      textTransform: 'none',
    },
    nameColor: '#0a0a0a',
    descriptionFont: {
      family: 'Inter',
      weight: '400',
      style: 'normal',
      size: 13,
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    descriptionColor: '#525252',
    priceFont: {
      family: 'DM Sans',
      weight: '500',
      style: 'normal',
      size: 15,
      letterSpacing: -0.2,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#0a0a0a',
    tagBorderColor: '#e5e5e5',
    tagTextColor: '#525252',
    tagFont: {
      family: 'Inter',
      weight: '500',
      style: 'normal',
      size: 10,
      letterSpacing: 0.3,
      lineHeight: 1,
      textTransform: 'none',
    },
    allergenTextColor: '#737373',
    separatorStyle: 'none',
    separatorColor: '#e5e5e5',
    chefChoiceColor: '#0a0a0a',
  },
});

// ════════════════════════════════════════════════════════════════
//  PRESET 3 — RUSTICO (trattoria calda, terra + verde oliva)
//  Playfair Display + Lato, atmosfera familiare e accogliente
// ════════════════════════════════════════════════════════════════

const RUSTICO = mergePreset(ELEGANTE, {
  cover: {
    backgroundColor: '#f5ede0',           // Crema caldo
    titleFont: {
      family: 'Playfair Display',
      weight: '700',
      style: 'normal',
      size: 42,
      letterSpacing: -0.5,
      lineHeight: 1.1,
      textTransform: 'none',
    },
    titleColor: '#3d2817',                 // Terra scuro
    descriptionFont: {
      family: 'Lato',
      weight: '400',
      style: 'italic',
      size: 14,
      letterSpacing: 0.1,
      lineHeight: 1.7,
      textTransform: 'none',
    },
    descriptionColor: '#6b4f2c',
    ctaText: 'Vieni a tavola',
    ctaFont: {
      family: 'Lato',
      weight: '700',
      style: 'normal',
      size: 12,
      letterSpacing: 2,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    ctaColor: '#ffffff',
    ctaBorderColor: '#7a8c4f',             // Verde oliva
    ornamentColor: '#7a8c4f',
  },
  menu: {
    backgroundColor: '#f5ede0',
    sectionHeaderFont: {
      family: 'Playfair Display',
      weight: '700',
      style: 'normal',
      size: 28,
      letterSpacing: -0.3,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    sectionHeaderColor: '#3d2817',
    sectionDividerColor: '#d4c4a8',
    sectionDividerStyle: 'line',
    navBackgroundColor: '#f5ede0',
    navTextColor: '#8a6d4a',
    navActiveColor: '#7a8c4f',
    navFont: {
      family: 'Lato',
      weight: '700',
      style: 'normal',
      size: 11,
      letterSpacing: 1.6,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    cardBackgroundColor: '#fff8eb',
    cardBorderColor: '#e8d8b8',
    cardBorderRadius: 8,
    cardStyle: 'bordered',
    cardImageRadius: 4,
    filterPillColor: '#7a8c4f',
    filterPillTextColor: '#6b4f2c',
    filterPillActiveTextColor: '#3d2817',
    footerBackgroundColor: '#ebe0c4',
    footerTextColor: '#6b4f2c',
    footerAccentColor: '#7a8c4f',
    showGrainTexture: true,
    grainOpacity: 0.04,                    // Texture più marcata per feel rustico
  },
  dish: {
    nameFont: {
      family: 'Playfair Display',
      weight: '700',
      style: 'normal',
      size: 19,
      letterSpacing: -0.2,
      lineHeight: 1.3,
      textTransform: 'none',
    },
    nameColor: '#3d2817',
    descriptionFont: {
      family: 'Lato',
      weight: '400',
      style: 'italic',
      size: 13,
      letterSpacing: 0.05,
      lineHeight: 1.6,
      textTransform: 'none',
    },
    descriptionColor: '#6b4f2c',
    priceFont: {
      family: 'Lato',
      weight: '900',
      style: 'normal',
      size: 16,
      letterSpacing: 0,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#7a8c4f',
    tagBorderColor: '#a8c47a',
    tagTextColor: '#5a6a3a',
    separatorStyle: 'dotted',
    separatorColor: '#d4c4a8',
    chefChoiceColor: '#c4622d',            // Arancione rustico
  },
});

// ════════════════════════════════════════════════════════════════
//  PRESET 4 — VIVACE (colorato, informale, energico)
//  Fredoka + Nunito, palette corallo + turchese
// ════════════════════════════════════════════════════════════════

const VIVACE = mergePreset(ELEGANTE, {
  cover: {
    backgroundColor: '#fff5f0',
    titleFont: {
      family: 'Fredoka',
      weight: '600',
      style: 'normal',
      size: 46,
      letterSpacing: -0.5,
      lineHeight: 1.05,
      textTransform: 'none',
    },
    titleColor: '#e85a4f',                 // Corallo
    descriptionFont: {
      family: 'Nunito',
      weight: '400',
      style: 'normal',
      size: 14,
      letterSpacing: 0.1,
      lineHeight: 1.6,
      textTransform: 'none',
    },
    descriptionColor: '#5a5a5a',
    ctaText: '🍽 Esplora il menu',
    ctaFont: {
      family: 'Nunito',
      weight: '700',
      style: 'normal',
      size: 13,
      letterSpacing: 1,
      lineHeight: 1,
      textTransform: 'none',
    },
    ctaColor: '#ffffff',
    ctaBorderColor: '#3aafa9',             // Turchese
    showOrnament: false,
    ornamentColor: '#3aafa9',
  },
  menu: {
    backgroundColor: '#fff5f0',
    sectionHeaderFont: {
      family: 'Fredoka',
      weight: '600',
      style: 'normal',
      size: 26,
      letterSpacing: -0.3,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    sectionHeaderColor: '#e85a4f',
    sectionDividerColor: '#3aafa9',
    sectionDividerStyle: 'line',
    navBackgroundColor: '#fff5f0',
    navTextColor: '#8a8a8a',
    navActiveColor: '#3aafa9',
    navFont: {
      family: 'Nunito',
      weight: '700',
      style: 'normal',
      size: 12,
      letterSpacing: 0.5,
      lineHeight: 1,
      textTransform: 'none',
    },
    navIndicatorStyle: 'pill',
    cardBackgroundColor: '#FFFFFF',
    cardBorderColor: '#ffe0d4',
    cardBorderRadius: 16,
    cardStyle: 'elevated',
    cardImageRadius: 12,
    filterPillColor: '#3aafa9',
    filterPillTextColor: '#5a5a5a',
    filterPillActiveTextColor: '#ffffff',
    footerBackgroundColor: '#ffe8de',
    footerTextColor: '#5a5a5a',
    footerAccentColor: '#e85a4f',
    showGrainTexture: false,
    grainOpacity: 0,
  },
  dish: {
    nameFont: {
      family: 'Fredoka',
      weight: '500',
      style: 'normal',
      size: 18,
      letterSpacing: -0.2,
      lineHeight: 1.3,
      textTransform: 'none',
    },
    nameColor: '#2a2a2a',
    descriptionFont: {
      family: 'Nunito',
      weight: '400',
      style: 'normal',
      size: 13,
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    descriptionColor: '#6a6a6a',
    priceFont: {
      family: 'Fredoka',
      weight: '600',
      style: 'normal',
      size: 16,
      letterSpacing: 0,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#e85a4f',
    tagBorderColor: '#3aafa9',
    tagTextColor: '#2a8a85',
    tagFont: {
      family: 'Nunito',
      weight: '700',
      style: 'normal',
      size: 10,
      letterSpacing: 0.3,
      lineHeight: 1,
      textTransform: 'none',
    },
    separatorStyle: 'none',
    separatorColor: '#ffe0d4',
    chefChoiceColor: '#ffb627',
  },
});

// ════════════════════════════════════════════════════════════════
//  PRESET 5 — CLASSICO (tradizionale italiano, crema + bordeaux)
//  Libre Baskerville + Source Sans 3, sobrio e formale
// ════════════════════════════════════════════════════════════════

const CLASSICO = mergePreset(ELEGANTE, {
  cover: {
    backgroundColor: '#f8f3e8',            // Crema
    titleFont: {
      family: 'Libre Baskerville',
      weight: '700',
      style: 'normal',
      size: 38,
      letterSpacing: 0,
      lineHeight: 1.15,
      textTransform: 'none',
    },
    titleColor: '#7a1f25',                 // Bordeaux
    descriptionFont: {
      family: 'Source Sans 3',
      weight: '400',
      style: 'italic',
      size: 14,
      letterSpacing: 0.1,
      lineHeight: 1.7,
      textTransform: 'none',
    },
    descriptionColor: '#4a3a2a',
    ctaText: 'Consulta il menu',
    ctaFont: {
      family: 'Source Sans 3',
      weight: '600',
      style: 'normal',
      size: 12,
      letterSpacing: 2,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    ctaColor: '#ffffff',
    ctaBorderColor: '#7a1f25',
    ornamentColor: '#7a1f25',
  },
  menu: {
    backgroundColor: '#f8f3e8',
    sectionHeaderFont: {
      family: 'Libre Baskerville',
      weight: '700',
      style: 'normal',
      size: 24,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    sectionHeaderColor: '#7a1f25',
    sectionDividerColor: '#d4c8a8',
    sectionDividerStyle: 'line',
    navBackgroundColor: '#f8f3e8',
    navTextColor: '#8a7458',
    navActiveColor: '#7a1f25',
    navFont: {
      family: 'Source Sans 3',
      weight: '600',
      style: 'normal',
      size: 11,
      letterSpacing: 1.5,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    cardBackgroundColor: '#fffaf0',
    cardBorderColor: '#e8dcb8',
    cardBorderRadius: 2,
    cardStyle: 'bordered',
    cardImageRadius: 2,
    filterPillColor: '#7a1f25',
    filterPillTextColor: '#6a5438',
    filterPillActiveTextColor: '#7a1f25',
    footerBackgroundColor: '#ede4cc',
    footerTextColor: '#6a5438',
    footerAccentColor: '#7a1f25',
    showGrainTexture: true,
    grainOpacity: 0.03,
  },
  dish: {
    nameFont: {
      family: 'Libre Baskerville',
      weight: '700',
      style: 'normal',
      size: 17,
      letterSpacing: 0,
      lineHeight: 1.3,
      textTransform: 'none',
    },
    nameColor: '#3a2a1a',
    descriptionFont: {
      family: 'Source Sans 3',
      weight: '400',
      style: 'italic',
      size: 13,
      letterSpacing: 0.05,
      lineHeight: 1.6,
      textTransform: 'none',
    },
    descriptionColor: '#5a4838',
    priceFont: {
      family: 'Source Sans 3',
      weight: '600',
      style: 'normal',
      size: 15,
      letterSpacing: 0,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#7a1f25',
    tagBorderColor: '#c9a878',
    tagTextColor: '#7a1f25',
    separatorStyle: 'solid',
    separatorColor: '#d4c8a8',
    chefChoiceColor: '#7a1f25',
  },
});

// ════════════════════════════════════════════════════════════════
//  PRESET 6 — MODERNO (contemporaneo, grigio scuro + lime)
//  Space Grotesk + Geist (o Inter), urban sophistication
// ════════════════════════════════════════════════════════════════

const MODERNO = mergePreset(ELEGANTE, {
  cover: {
    backgroundColor: '#1a1a1a',            // Quasi nero
    titleFont: {
      family: 'Space Grotesk',
      weight: '500',
      style: 'normal',
      size: 44,
      letterSpacing: -1.5,
      lineHeight: 1.05,
      textTransform: 'none',
    },
    titleColor: '#fafafa',
    descriptionFont: {
      family: 'Inter',
      weight: '400',
      style: 'normal',
      size: 14,
      letterSpacing: 0,
      lineHeight: 1.6,
      textTransform: 'none',
    },
    descriptionColor: '#a0a0a0',
    ctaText: 'View menu →',
    ctaFont: {
      family: 'Space Grotesk',
      weight: '500',
      style: 'normal',
      size: 13,
      letterSpacing: 0.5,
      lineHeight: 1,
      textTransform: 'none',
    },
    ctaColor: '#1a1a1a',
    ctaBorderColor: '#c5e64f',             // Lime
    showOrnament: false,
    ornamentColor: '#c5e64f',
  },
  menu: {
    backgroundColor: '#1a1a1a',
    sectionHeaderFont: {
      family: 'Space Grotesk',
      weight: '500',
      style: 'normal',
      size: 24,
      letterSpacing: -0.8,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    sectionHeaderColor: '#fafafa',
    sectionDividerColor: '#3a3a3a',
    sectionDividerStyle: 'line',
    navBackgroundColor: '#1a1a1a',
    navTextColor: '#707070',
    navActiveColor: '#c5e64f',
    navFont: {
      family: 'Space Grotesk',
      weight: '500',
      style: 'normal',
      size: 12,
      letterSpacing: 0,
      lineHeight: 1,
      textTransform: 'none',
    },
    cardBackgroundColor: '#262626',
    cardBorderColor: '#3a3a3a',
    cardBorderRadius: 4,
    cardStyle: 'flat',
    cardImageRadius: 4,
    filterPillColor: '#c5e64f',
    filterPillTextColor: '#a0a0a0',
    filterPillActiveTextColor: '#1a1a1a',
    footerBackgroundColor: '#0f0f0f',
    footerTextColor: '#707070',
    footerAccentColor: '#c5e64f',
    showGrainTexture: false,
    grainOpacity: 0,
  },
  dish: {
    nameFont: {
      family: 'Space Grotesk',
      weight: '500',
      style: 'normal',
      size: 18,
      letterSpacing: -0.4,
      lineHeight: 1.3,
      textTransform: 'none',
    },
    nameColor: '#fafafa',
    descriptionFont: {
      family: 'Inter',
      weight: '400',
      style: 'normal',
      size: 13,
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    descriptionColor: '#a0a0a0',
    priceFont: {
      family: 'Space Grotesk',
      weight: '600',
      style: 'normal',
      size: 16,
      letterSpacing: -0.3,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#c5e64f',
    tagBorderColor: '#3a3a3a',
    tagTextColor: '#a0a0a0',
    separatorStyle: 'none',
    separatorColor: '#3a3a3a',
    chefChoiceColor: '#c5e64f',
  },
});

// ════════════════════════════════════════════════════════════════
//  PRESET 7 — BISTROT (francese intimo, carta + blu notte)
//  EB Garamond + Jost, atmosfera parigina
// ════════════════════════════════════════════════════════════════

const BISTROT = mergePreset(ELEGANTE, {
  cover: {
    backgroundColor: '#f5f0e8',            // Carta antica
    titleFont: {
      family: 'EB Garamond',
      weight: '500',
      style: 'italic',
      size: 46,
      letterSpacing: -0.3,
      lineHeight: 1.05,
      textTransform: 'none',
    },
    titleColor: '#1e2a47',                 // Blu notte
    descriptionFont: {
      family: 'Jost',
      weight: '300',
      style: 'normal',
      size: 13,
      letterSpacing: 0.5,
      lineHeight: 1.7,
      textTransform: 'none',
    },
    descriptionColor: '#3e4a67',
    ctaText: 'À table',
    ctaFont: {
      family: 'Jost',
      weight: '400',
      style: 'normal',
      size: 12,
      letterSpacing: 2.5,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    ctaColor: '#ffffff',
    ctaBorderColor: '#1e2a47',
    ornamentColor: '#1e2a47',
  },
  menu: {
    backgroundColor: '#f5f0e8',
    sectionHeaderFont: {
      family: 'EB Garamond',
      weight: '500',
      style: 'italic',
      size: 28,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    sectionHeaderColor: '#1e2a47',
    sectionDividerColor: '#d4c8b0',
    sectionDividerStyle: 'ornament',
    navBackgroundColor: '#f5f0e8',
    navTextColor: '#7a7058',
    navActiveColor: '#1e2a47',
    navFont: {
      family: 'Jost',
      weight: '400',
      style: 'normal',
      size: 11,
      letterSpacing: 1.8,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    cardBackgroundColor: '#fcf8f0',
    cardBorderColor: '#e5dcc4',
    cardBorderRadius: 0,
    cardStyle: 'flat',
    cardImageRadius: 0,
    filterPillColor: '#1e2a47',
    filterPillTextColor: '#5a5240',
    filterPillActiveTextColor: '#1e2a47',
    footerBackgroundColor: '#ebe4d0',
    footerTextColor: '#5a5240',
    footerAccentColor: '#1e2a47',
    showGrainTexture: true,
    grainOpacity: 0.035,
  },
  dish: {
    nameFont: {
      family: 'EB Garamond',
      weight: '600',
      style: 'normal',
      size: 19,
      letterSpacing: 0,
      lineHeight: 1.3,
      textTransform: 'none',
    },
    nameColor: '#1e2a47',
    descriptionFont: {
      family: 'Jost',
      weight: '300',
      style: 'italic',
      size: 13,
      letterSpacing: 0.1,
      lineHeight: 1.6,
      textTransform: 'none',
    },
    descriptionColor: '#4e5670',
    priceFont: {
      family: 'EB Garamond',
      weight: '600',
      style: 'normal',
      size: 16,
      letterSpacing: 0,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#1e2a47',
    tagBorderColor: '#c4b890',
    tagTextColor: '#1e2a47',
    separatorStyle: 'dashed',
    separatorColor: '#d4c8b0',
    chefChoiceColor: '#a87a3a',
  },
});

// ════════════════════════════════════════════════════════════════
//  PRESET 8 — STREET FOOD (urbano, bold, nero + giallo)
//  Anton + Work Sans, energia da street market
// ════════════════════════════════════════════════════════════════

const STREET_FOOD = mergePreset(ELEGANTE, {
  cover: {
    backgroundColor: '#ffeb3b',            // Giallo brillante
    titleFont: {
      family: 'Anton',
      weight: '400',
      style: 'normal',
      size: 56,
      letterSpacing: -0.5,
      lineHeight: 0.95,
      textTransform: 'uppercase',
    },
    titleColor: '#0a0a0a',
    descriptionFont: {
      family: 'Work Sans',
      weight: '500',
      style: 'normal',
      size: 14,
      letterSpacing: 0.3,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    descriptionColor: '#0a0a0a',
    ctaText: 'Ordina ora',
    ctaFont: {
      family: 'Work Sans',
      weight: '700',
      style: 'normal',
      size: 14,
      letterSpacing: 1.5,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    ctaColor: '#ffeb3b',
    ctaBorderColor: '#0a0a0a',
    showOrnament: false,
    ornamentColor: '#0a0a0a',
  },
  menu: {
    backgroundColor: '#0a0a0a',
    sectionHeaderFont: {
      family: 'Anton',
      weight: '400',
      style: 'normal',
      size: 32,
      letterSpacing: -0.5,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    sectionHeaderColor: '#ffeb3b',
    sectionDividerColor: '#ffeb3b',
    sectionDividerStyle: 'line',
    navBackgroundColor: '#0a0a0a',
    navTextColor: '#888888',
    navActiveColor: '#ffeb3b',
    navFont: {
      family: 'Work Sans',
      weight: '700',
      style: 'normal',
      size: 12,
      letterSpacing: 1,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    navIndicatorStyle: 'pill',
    cardBackgroundColor: '#1a1a1a',
    cardBorderColor: '#2a2a2a',
    cardBorderRadius: 4,
    cardStyle: 'flat',
    cardImageRadius: 4,
    filterPillColor: '#ffeb3b',
    filterPillTextColor: '#888888',
    filterPillActiveTextColor: '#0a0a0a',
    footerBackgroundColor: '#000000',
    footerTextColor: '#888888',
    footerAccentColor: '#ffeb3b',
    showGrainTexture: false,
    grainOpacity: 0,
  },
  dish: {
    nameFont: {
      family: 'Anton',
      weight: '400',
      style: 'normal',
      size: 22,
      letterSpacing: -0.3,
      lineHeight: 1.1,
      textTransform: 'uppercase',
    },
    nameColor: '#ffffff',
    descriptionFont: {
      family: 'Work Sans',
      weight: '400',
      style: 'normal',
      size: 13,
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    descriptionColor: '#a0a0a0',
    priceFont: {
      family: 'Anton',
      weight: '400',
      style: 'normal',
      size: 20,
      letterSpacing: -0.5,
      lineHeight: 1,
      textTransform: 'none',
    },
    priceColor: '#ffeb3b',
    tagBorderColor: '#ffeb3b',
    tagTextColor: '#ffeb3b',
    tagFont: {
      family: 'Work Sans',
      weight: '700',
      style: 'normal',
      size: 10,
      letterSpacing: 0.5,
      lineHeight: 1,
      textTransform: 'uppercase',
    },
    separatorStyle: 'none',
    separatorColor: '#2a2a2a',
    chefChoiceColor: '#ff5722',            // Arancione fuoco
  },
});

// ════════════════════════════════════════════════════════════════
//  EXPORT — Lista completa dei preset per il seed
// ════════════════════════════════════════════════════════════════

interface PresetSeed {
  slug: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  thumbnailUrl: string;
  coverConfig: CoverTheme;
  menuConfig: MenuTheme;
  dishConfig: DishTheme;
}

export const ALL_PRESETS: PresetSeed[] = [
  {
    slug: 'elegante',
    name: 'Elegante',
    description: 'Raffinato e luxury, perfetto per ristoranti fine dining e cucina ricercata.',
    category: 'fine-dining',
    sortOrder: 0,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/elegante.png',
    coverConfig: ELEGANTE.cover,
    menuConfig: ELEGANTE.menu,
    dishConfig: ELEGANTE.dish,
  },
  {
    slug: 'minimal',
    name: 'Minimal',
    description: 'Pulito e moderno, focus sui contenuti senza distrazioni.',
    category: 'all',
    sortOrder: 1,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/minimal.png',
    coverConfig: MINIMAL.cover,
    menuConfig: MINIMAL.menu,
    dishConfig: MINIMAL.dish,
  },
  {
    slug: 'rustico',
    name: 'Rustico',
    description: 'Trattoria calda e accogliente, atmosfera familiare e tradizionale.',
    category: 'casual',
    sortOrder: 2,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/rustico.png',
    coverConfig: RUSTICO.cover,
    menuConfig: RUSTICO.menu,
    dishConfig: RUSTICO.dish,
  },
  {
    slug: 'vivace',
    name: 'Vivace',
    description: 'Colorato e informale, ideale per locali giovani e dinamici.',
    category: 'casual',
    sortOrder: 3,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/vivace.png',
    coverConfig: VIVACE.cover,
    menuConfig: VIVACE.menu,
    dishConfig: VIVACE.dish,
  },
  {
    slug: 'classico',
    name: 'Classico',
    description: 'Tradizionale italiano, sobrio e formale per ristoranti storici.',
    category: 'fine-dining',
    sortOrder: 4,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/classico.png',
    coverConfig: CLASSICO.cover,
    menuConfig: CLASSICO.menu,
    dishConfig: CLASSICO.dish,
  },
  {
    slug: 'moderno',
    name: 'Moderno',
    description: 'Contemporaneo e urban, dark mode con accenti lime per ristoranti di tendenza.',
    category: 'fine-dining',
    sortOrder: 5,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/moderno.png',
    coverConfig: MODERNO.cover,
    menuConfig: MODERNO.menu,
    dishConfig: MODERNO.dish,
  },
  {
    slug: 'bistrot',
    name: 'Bistrot',
    description: 'Atmosfera francese intima, perfetta per bistrot e wine bar.',
    category: 'fine-dining',
    sortOrder: 6,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/bistrot.png',
    coverConfig: BISTROT.cover,
    menuConfig: BISTROT.menu,
    dishConfig: BISTROT.dish,
  },
  {
    slug: 'street-food',
    name: 'Street Food',
    description: 'Bold ed energico, ideale per street food, food truck e locali rapidi.',
    category: 'street-food',
    sortOrder: 7,
    isActive: true,
    thumbnailUrl: '/preset-thumbnails/street-food.png',
    coverConfig: STREET_FOOD.cover,
    menuConfig: STREET_FOOD.menu,
    dishConfig: STREET_FOOD.dish,
  },
];

// ════════════════════════════════════════════════════════════════
//  Funzione di seeding
//  Da chiamare in prisma/seed.ts:
//    import { seedPresets } from './seed-presets'
//    await seedPresets(prisma)
// ════════════════════════════════════════════════════════════════

export async function seedPresets(prisma: any) {
  console.log('🎨 Seeding theme presets...');
  for (const preset of ALL_PRESETS) {
    await prisma.themePreset.upsert({
      where: { slug: preset.slug },
      update: {
        name: preset.name,
        description: preset.description,
        category: preset.category,
        sortOrder: preset.sortOrder,
        isActive: preset.isActive,
        thumbnailUrl: preset.thumbnailUrl,
        coverConfig: preset.coverConfig as any,
        menuConfig: preset.menuConfig as any,
        dishConfig: preset.dishConfig as any,
      },
      create: {
        slug: preset.slug,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        sortOrder: preset.sortOrder,
        isActive: preset.isActive,
        thumbnailUrl: preset.thumbnailUrl,
        coverConfig: preset.coverConfig as any,
        menuConfig: preset.menuConfig as any,
        dishConfig: preset.dishConfig as any,
      },
    });
    console.log(`  ✓ ${preset.name} (${preset.slug})`);
  }
  console.log(`✨ ${ALL_PRESETS.length} theme presets seeded successfully\n`);
}
