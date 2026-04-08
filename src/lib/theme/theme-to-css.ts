import type { FontConfig, FullTheme } from '@/lib/validators/theme';

function fontVars(prefix: string, font: FontConfig): Record<string, string> {
  return {
    [`${prefix}-font`]: font.family,
    [`${prefix}-size`]: `${font.size}px`,
    [`${prefix}-weight`]: font.weight,
    [`${prefix}-style`]: font.style,
    [`${prefix}-spacing`]: `${font.letterSpacing}px`,
    [`${prefix}-line-height`]: String(font.lineHeight),
    [`${prefix}-transform`]: font.textTransform,
  };
}

export function themeToCSSVars(theme: FullTheme): Record<string, string> {
  return {
    // ── Cover ─────────────────────────────────────────
    '--cover-bg': theme.cover.backgroundColor,
    '--cover-overlay-color': theme.cover.backgroundOverlayColor,
    '--cover-overlay-opacity': String(theme.cover.backgroundOverlayOpacity),
    '--cover-logo-max-height': `${theme.cover.logoMaxHeight}px`,
    '--cover-title-color': theme.cover.titleColor,
    ...fontVars('--cover-title', theme.cover.titleFont),
    '--cover-desc-color': theme.cover.descriptionColor,
    ...fontVars('--cover-desc', theme.cover.descriptionFont),
    '--cover-cta-color': theme.cover.ctaColor,
    '--cover-cta-border-color': theme.cover.ctaBorderColor,
    ...fontVars('--cover-cta', theme.cover.ctaFont),
    '--cover-ornament-color': theme.cover.ornamentColor,
    '--cover-padding-v': `${theme.cover.paddingVertical}px`,

    // ── Menu ──────────────────────────────────────────
    '--menu-bg': theme.menu.backgroundColor,
    '--menu-section-color': theme.menu.sectionHeaderColor,
    ...fontVars('--menu-section', theme.menu.sectionHeaderFont),
    '--menu-divider-color': theme.menu.sectionDividerColor,
    '--menu-nav-bg': theme.menu.navBackgroundColor,
    '--menu-nav-color': theme.menu.navTextColor,
    '--menu-nav-active': theme.menu.navActiveColor,
    ...fontVars('--menu-nav', theme.menu.navFont),
    '--card-bg': theme.menu.cardBackgroundColor,
    '--card-border-color': theme.menu.cardBorderColor,
    '--card-border-radius': `${theme.menu.cardBorderRadius}px`,
    '--card-image-radius': `${theme.menu.cardImageRadius}px`,
    '--card-image-size': `${theme.menu.cardImageSize}px`,
    '--filter-pill-color': theme.menu.filterPillColor,
    '--filter-pill-text': theme.menu.filterPillTextColor,
    '--filter-pill-active-text': theme.menu.filterPillActiveTextColor,
    '--footer-bg': theme.menu.footerBackgroundColor,
    '--footer-text': theme.menu.footerTextColor,
    '--footer-accent': theme.menu.footerAccentColor,
    '--grain-opacity': String(theme.menu.grainOpacity),

    // ── Dish ──────────────────────────────────────────
    '--dish-name-color': theme.dish.nameColor,
    ...fontVars('--dish-name', theme.dish.nameFont),
    '--dish-desc-color': theme.dish.descriptionColor,
    ...fontVars('--dish-desc', theme.dish.descriptionFont),
    '--dish-price-color': theme.dish.priceColor,
    ...fontVars('--dish-price', theme.dish.priceFont),
    '--dish-tag-border': theme.dish.tagBorderColor,
    '--dish-tag-text': theme.dish.tagTextColor,
    ...fontVars('--dish-tag', theme.dish.tagFont),
    '--dish-allergen-text': theme.dish.allergenTextColor,
    '--dish-separator-color': theme.dish.separatorColor,
    '--dish-chef-color': theme.dish.chefChoiceColor,
  };
}
