'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CoverTheme } from '@/lib/validators/theme';
import { track, detectSource, markCoverVisited } from '@/lib/analytics';

interface CoverPageProps {
  restaurant: {
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    phone: string | null;
    city: string | null;
  };
  theme: CoverTheme;
}

export default function CoverPage({ restaurant, theme }: CoverPageProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const coverOpenedAt = useRef<number>(0);

  // Tracking: copertina aperta. `detectSource()` legge ?source=qr,
  // referrer, ecc. `markCoverVisited()` persiste in sessionStorage per
  // far capire al menu se arriva dalla cover (navigazione interna) o
  // direttamente (es. QR che linka al menu).
  useEffect(() => {
    coverOpenedAt.current = Date.now();
    track('cover_viewed', { source: detectSource() });
    markCoverVisited(restaurant.slug);
  }, [restaurant.slug]);

  return (
    <div
      style={{
        minHeight: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        position: 'relative',
        background: 'var(--cover-bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes swipeHint {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }

        .cover-fade-1 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.1s both; }
        .cover-fade-2 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.25s both; }
        .cover-fade-3 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.4s both; }
        .cover-fade-4 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.55s both; }
        .cover-fade-5 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.7s both; }
        .cover-fade-6 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.85s both; }
        .cover-swipe-hint { animation: swipeHint 1.8s ease-in-out infinite; }
        .cover-cta:hover { background: rgba(255,255,255,0.06) !important; }
        .cover-cta:active { transform: scale(0.98); }
        .cover-social-link { transition: color 0.25s ease, transform 0.25s ease; }
        .cover-social-link:hover { color: var(--cover-ornament-color) !important; transform: translateY(-1px); }
      `}</style>

      {/* Grain texture */}
      {theme.showOrnament && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            opacity: 0.025,
            pointerEvents: 'none',
            zIndex: 999,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* ═══ UPPER BLOCK — Branding (~55%) ═══ */}
      <div
        style={{
          flex: '0 0 55vh',
          minHeight: 380,
          background: 'var(--cover-bg)',
          padding: `var(--cover-padding-v) 32px 24px`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: theme.contentAlignment,
          justifyContent: 'center',
          textAlign: theme.contentAlignment === 'center' ? 'center' : 'left',
        }}
      >
        {/* Top ornament */}
        {theme.showOrnament && (
          <div
            className="cover-fade-1"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              marginBottom: 22,
            }}
          >
            <div style={{ width: 38, height: 1, background: 'var(--cover-ornament-color)' }} />
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                border: '1px solid var(--cover-ornament-color)',
              }}
            />
            <div style={{ width: 38, height: 1, background: 'var(--cover-ornament-color)' }} />
          </div>
        )}

        {/* City / Province */}
        {restaurant.city && (
          <div
            className="cover-fade-2"
            style={{
              fontSize: 10,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              fontFamily: 'var(--cover-desc-font)',
              fontWeight: 300,
              color: 'var(--cover-ornament-color)',
              marginBottom: 16,
            }}
          >
            {restaurant.city}
          </div>
        )}

        {/* Logo */}
        {theme.showLogo && restaurant.logoUrl && (
          <div className="cover-fade-2" style={{ marginBottom: 18 }}>
            {/* width/height sono solo hint per aspect ratio; CSS constraints
                + auto gestiscono le dimensioni reali a runtime (il logo e'
                caricato dall'owner, aspect ratio sconosciuto). */}
            <Image
              src={restaurant.logoUrl}
              alt={restaurant.name}
              width={200}
              height={200}
              style={{
                width: 'auto',
                height: 'auto',
                maxHeight: 'var(--cover-logo-max-height)',
                maxWidth: 200,
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Restaurant name */}
        <h1
          className="cover-fade-3"
          style={{
            fontFamily: 'var(--cover-title-font)',
            fontSize: 'var(--cover-title-size)',
            fontWeight: 'var(--cover-title-weight)',
            fontStyle: 'var(--cover-title-style)',
            color: 'var(--cover-title-color)',
            letterSpacing: 'var(--cover-title-spacing)',
            lineHeight: 'var(--cover-title-line-height)',
            textTransform: 'var(--cover-title-transform)' as React.CSSProperties['textTransform'],
            margin: '0 0 8px',
          }}
        >
          {restaurant.name}
        </h1>

        {/* Tagline */}
        {restaurant.tagline && (
          <div
            className="cover-fade-4"
            style={{
              fontFamily: 'var(--cover-desc-font)',
              fontSize: 13,
              color: 'var(--cover-ornament-color)',
              fontWeight: 300,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            {restaurant.tagline}
          </div>
        )}

        {/* Bottom ornament */}
        {theme.showOrnament && (
          <div
            className="cover-fade-4"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 60,
                height: 1,
                background: `linear-gradient(90deg, transparent, var(--cover-ornament-color))`,
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--cover-ornament-color)' }}>✦</span>
            <div
              style={{
                width: 60,
                height: 1,
                background: `linear-gradient(90deg, var(--cover-ornament-color), transparent)`,
              }}
            />
          </div>
        )}

        {/* Description */}
        {restaurant.description && (
          <p
            className="cover-fade-5"
            style={{
              fontFamily: 'var(--cover-desc-font)',
              fontSize: 'var(--cover-desc-size)',
              fontWeight: 'var(--cover-desc-weight)',
              fontStyle: 'var(--cover-desc-style)',
              color: 'var(--cover-desc-color)',
              letterSpacing: 'var(--cover-desc-spacing)',
              lineHeight: 'var(--cover-desc-line-height)',
              margin: 0,
              maxWidth: 320,
            }}
          >
            {restaurant.description}
          </p>
        )}
      </div>

      {/* ═══ LOWER BLOCK — Photo (~45%) ═══ */}
      <div
        style={{
          flex: '1 1 45vh',
          minHeight: 320,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cover photo — LCP della pagina pubblica, priority per evitare
            lazy loading e preload via <link rel="preload"> dal <head>. */}
        {restaurant.coverUrl && (
          <Image
            src={restaurant.coverUrl}
            alt={`${restaurant.name} — interno del locale`}
            fill
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            onLoad={() => setImgLoaded(true)}
            style={{
              objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 1.2s ease',
              filter: 'saturate(0.9) contrast(1.05)',
            }}
          />
        )}

        {/* Gradient transition from upper block */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            background: `linear-gradient(180deg, var(--cover-bg) 0%, transparent 100%)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Dark overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(0,0,0,${theme.backgroundOverlayOpacity * 0.5}) 0%, rgba(0,0,0,${theme.backgroundOverlayOpacity * 1.5}) 100%)`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

        {/* Content over photo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 32px 24px',
            zIndex: 4,
          }}
        >
          <div style={{ flex: 1 }} />

          {/* CTA Button */}
          <Link
            href={`/${restaurant.slug}/menu`}
            onClick={() => {
              const timeOnCover = coverOpenedAt.current
                ? Math.round((Date.now() - coverOpenedAt.current) / 1000)
                : 0;
              track('cover_cta_clicked', { timeOnCover });
            }}
            className="cover-cta cover-fade-5"
            style={{
              fontFamily: 'var(--cover-cta-font)',
              fontSize: 'var(--cover-cta-size)',
              fontWeight: 'var(--cover-cta-weight)',
              fontStyle: 'var(--cover-cta-style)',
              color: 'var(--cover-cta-color)',
              letterSpacing: 'var(--cover-cta-spacing)',
              textTransform: 'var(--cover-cta-transform)' as React.CSSProperties['textTransform'],
              padding: '16px 38px',
              background: 'transparent',
              border: '1px solid var(--cover-cta-border-color)',
              borderRadius: 0,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {theme.ctaText}
          </Link>

          {/* Swipe hint */}
          <div
            className="cover-fade-6 cover-swipe-hint"
            style={{
              marginTop: 18,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--cover-cta-font)',
                fontSize: 9,
                color: '#ffffff',
                opacity: 0.7,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              o scorri
            </span>
            <span style={{ fontSize: 16, color: 'var(--cover-ornament-color)', lineHeight: 1 }}>
              ↓
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Footer: phone */}
          {restaurant.phone && (
            <div
              className="cover-fade-6"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <a
                href={`tel:${restaurant.phone.replace(/\s/g, '')}`}
                className="cover-social-link"
                style={{
                  fontFamily: 'var(--cover-desc-font)',
                  fontSize: 11,
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>☎</span>
                {restaurant.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
