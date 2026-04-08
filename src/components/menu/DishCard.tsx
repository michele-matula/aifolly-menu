'use client';

import { useState, useEffect, useRef } from 'react';
import AllergenBadge from './AllergenBadge';

const TAG_CONFIG: Record<string, { label: string; color: 'gold' | 'red' | 'muted' }> = {
  VEGETARIANO:   { label: 'Vegetariano',   color: 'gold' },
  VEGANO:        { label: 'Vegano',        color: 'gold' },
  SENZA_GLUTINE: { label: 'Senza Glutine', color: 'gold' },
  PICCANTE:      { label: 'Piccante',      color: 'red' },
  BIOLOGICO:     { label: 'Biologico',     color: 'gold' },
  KM_ZERO:       { label: 'Km 0',          color: 'gold' },
  SURGELATO:     { label: 'Surgelato',     color: 'muted' },
};

interface Variant {
  id: string;
  label: string;
  price: number;
}

export interface DishData {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  priceLabel: string | null;
  variants: Variant[];
  tags: string[];
  allergens: string[];
  isChefChoice: boolean;
  isAvailable: boolean;
}

function formatPrice(dish: DishData): string {
  if (dish.variants.length > 0) {
    return dish.variants.map(v => `€${v.price}`).join(' / ');
  }
  if (dish.priceLabel) return dish.priceLabel;
  if (dish.price != null) return `€${dish.price}`;
  return '';
}

function TagBadge({ tag }: { tag: string }) {
  const config = TAG_CONFIG[tag];
  if (!config) return null;

  const colorMap = {
    gold:  { color: 'var(--dish-tag-text)', borderColor: 'var(--dish-tag-border)' },
    red:   { color: '#a04438', borderColor: '#f5e1de' },
    muted: { color: 'var(--menu-nav-color)', borderColor: 'var(--menu-divider-color)' },
  };
  const style = colorMap[config.color];

  return (
    <span
      style={{
        fontSize: 'var(--dish-tag-size)',
        letterSpacing: 'var(--dish-tag-spacing)',
        textTransform: 'var(--dish-tag-transform)' as React.CSSProperties['textTransform'],
        fontFamily: 'var(--dish-tag-font)',
        fontWeight: 'var(--dish-tag-weight)',
        padding: '3px 9px',
        border: `1px solid ${style.borderColor}`,
        color: style.color,
        background: 'transparent',
        borderRadius: 3,
      }}
    >
      {config.label}
    </span>
  );
}

export default function DishCard({
  dish,
  index,
  isLast,
}: {
  dish: DishData;
  index: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const hasImg = !!dish.imageUrl && !imgError;
  const isChef = dish.isChefChoice;

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="menu-dish-card"
      style={{
        display: 'flex',
        gap: 16,
        padding: '20px 0',
        borderBottom: isLast ? 'none' : `1px solid var(--card-border-color)`,
        cursor: 'pointer',
        animationDelay: `${index * 0.07}s`,
        position: 'relative',
      }}
    >
      {/* Image */}
      {hasImg && (
        <div
          style={{
            width: 'var(--card-image-size)',
            height: 'var(--card-image-size)',
            borderRadius: 'var(--card-image-radius)',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'relative',
            background: 'var(--footer-bg)',
          }}
        >
          <img
            ref={imgRef}
            src={dish.imageUrl!}
            alt={dish.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className="menu-dish-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'saturate(0.85) contrast(1.05)',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(.16,1,.3,1)',
            }}
          />
          {isChef && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                borderLeft: '24px solid var(--dish-chef-color)',
                borderBottom: '24px solid transparent',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: -20,
                  fontSize: 8,
                  color: '#fff',
                }}
              >
                ✦
              </span>
            </div>
          )}
        </div>
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Name + Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h3
            style={{
              fontFamily: 'var(--dish-name-font)',
              fontSize: 'var(--dish-name-size)',
              fontWeight: 'var(--dish-name-weight)',
              color: 'var(--dish-name-color)',
              lineHeight: 'var(--dish-name-line-height)',
              margin: 0,
              flex: 1,
              fontStyle: isChef ? 'italic' : 'normal',
            }}
          >
            {dish.name}
          </h3>
          <div
            style={{
              fontFamily: 'var(--dish-price-font)',
              fontSize: 'var(--dish-price-size)',
              fontWeight: 'var(--dish-price-weight)',
              color: 'var(--dish-price-color)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
          >
            {formatPrice(dish)}
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            height: 1,
            margin: '8px 0 7px',
            backgroundImage: `repeating-linear-gradient(90deg, var(--dish-separator-color) 0px, var(--dish-separator-color) 3px, transparent 3px, transparent 8px)`,
            backgroundSize: '8px 1px',
            opacity: 0.7,
          }}
        />

        {/* Description */}
        {dish.description && (
          <p
            style={{
              fontFamily: 'var(--dish-desc-font)',
              fontSize: 'var(--dish-desc-size)',
              fontWeight: 'var(--dish-desc-weight)',
              color: 'var(--dish-desc-color)',
              lineHeight: 'var(--dish-desc-line-height)',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {dish.description}
          </p>
        )}

        {/* Tags */}
        {dish.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {dish.tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Expanded: Allergens */}
        {expanded && dish.allergens.length > 0 && (
          <div
            className="menu-allergen-reveal"
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid var(--card-border-color)`,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontFamily: 'var(--dish-desc-font)',
                fontWeight: 500,
                color: 'var(--menu-nav-color)',
                marginBottom: 8,
              }}
            >
              Allergeni
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dish.allergens.map(a => (
                <AllergenBadge key={a} allergen={a} />
              ))}
            </div>
          </div>
        )}

        {/* Expanded: Variants detail */}
        {expanded && dish.variants.length > 0 && (
          <div
            className="menu-allergen-reveal"
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid var(--card-border-color)`,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontFamily: 'var(--dish-desc-font)',
                fontWeight: 500,
                color: 'var(--menu-nav-color)',
                marginBottom: 8,
              }}
            >
              Formati
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {dish.variants.map(v => (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--dish-desc-font)',
                    fontSize: 12,
                    fontWeight: 300,
                    color: 'var(--dish-desc-color)',
                  }}
                >
                  <span>{v.label}</span>
                  <span style={{ color: 'var(--dish-price-color)', fontWeight: 400 }}>
                    €{v.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
