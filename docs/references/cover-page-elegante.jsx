import { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════════
//  AiFolly Menu — Prototipo Pagina Copertina
//  Preset "Elegante" — Riferimento visuale per la spec v3.3
//  
//  Allineato a:
//  - Schema CoverThemeSchema (sezione 5.1 della spec)
//  - Layout split: avorio in alto + foto in basso
//  - CTA pulsante + indicazione swipe
//  - Social e contatti opzionali
//
//  In produzione:
//  - URL: /{slug} (es. /osteria-del-porto)
//  - Tap sul CTA o swipe verso l'alto naviga a /{slug}/menu
//  - Tutto lo styling viene da CSS variables iniettate dal tema
// ════════════════════════════════════════════════════════════════

// ─── Data ───────────────────────────────────────────────────────

const RESTAURANT = {
  name: "Osteria del Porto",
  tagline: "Cucina di mare",
  description: "Pesce fresco ogni giorno dal porto di Brindisi, ricette tradizionali del Salento e ingredienti del territorio dal 1987.",
  est: "Est. 1987",
  city: "Brindisi",
  region: "Puglia",
  // Foto del locale (sostituibile dal ristoratore via upload)
  coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  // Logo del ristorante (opzionale)
  logoUrl: null, // null = non mostrato (in alternativa, URL Cloudinary)
  // Contatti
  phone: "+39 0831 123 456",
  // Social (mostrati solo se presenti)
  social: {
    instagram: "osteria_del_porto",
    facebook: "osteriadelporto",
    // tripadvisor: "osteria-del-porto",
  },
};

// ─── Fonts & Palette ────────────────────────────────────────────
// Identici al menu per coerenza con il preset Elegante

const F = {
  display: "'Cormorant Garamond', 'Georgia', serif",
  body: "'Outfit', -apple-system, sans-serif",
};

const C = {
  bg: "#FAFAF8",
  bgAlt: "#F4F1EB",
  text: "#1a1a18",
  textSoft: "#6b6358",
  textMuted: "#a09882",
  gold: "#c9b97a",
  goldDark: "#a68c4e",
  goldLight: "#e8dfc8",
  border: "#ebe6dc",
  white: "#ffffff",
};

// ─── Component ──────────────────────────────────────────────────

export default function CoverPage() {
  const [loaded, setLoaded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  // Simula la navigazione al menu
  const enterMenu = () => {
    console.log("Navigate to /osteria-del-porto/menu");
    // In produzione: router.push(`/${slug}/menu`)
  };

  // Conta quanti social sono presenti per layout dinamico
  const socialEntries = Object.entries(RESTAURANT.social || {}).filter(([_, v]) => v);

  return (
    <div style={{
      minHeight: "100vh",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      background: C.bg,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Outfit:wght@200;300;400;500;600&display=swap');

        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: ${C.bg}; }
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
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .fade-1 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.1s both; }
        .fade-2 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.25s both; }
        .fade-3 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.4s both; }
        .fade-4 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.55s both; }
        .fade-5 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.7s both; }
        .fade-6 { animation: fadeUp 0.9s cubic-bezier(.16,1,.3,1) 0.85s both; }
        .swipe-hint { animation: swipeHint 1.8s ease-in-out infinite; }
        .cta-btn:hover { background: ${C.gold}15 !important; }
        .cta-btn:active { transform: scale(0.98); }
        .social-link { transition: color 0.25s ease, transform 0.25s ease; }
        .social-link:hover { color: ${C.gold} !important; transform: translateY(-1px); }
      `}</style>

      {/* ── Grain texture (uniforme su tutta la pagina) ── */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none", zIndex: 999,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ══════════════════════════════════════════════════════════
           BLOCCO SUPERIORE — Branding su sfondo avorio (~55%)
         ══════════════════════════════════════════════════════════ */}
      <div style={{
        flex: "0 0 55vh",
        minHeight: 380,
        background: C.bg,
        padding: "44px 32px 24px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}>
        {/* Top ornament */}
        <div className="fade-1" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 14, marginBottom: 22,
        }}>
          <div style={{ width: 38, height: 1, background: C.gold }} />
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            border: `1px solid ${C.gold}`,
          }} />
          <div style={{ width: 38, height: 1, background: C.gold }} />
        </div>

        {/* Est. + city */}
        <div className="fade-2" style={{
          fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase",
          fontFamily: F.body, fontWeight: 300, color: C.gold,
          marginBottom: 16,
        }}>
          {RESTAURANT.est} · {RESTAURANT.city} · {RESTAURANT.region}
        </div>

        {/* Logo (se presente) */}
        {RESTAURANT.logoUrl && (
          <div className="fade-2" style={{ marginBottom: 18 }}>
            <img
              src={RESTAURANT.logoUrl}
              alt={RESTAURANT.name}
              style={{ maxHeight: 80, maxWidth: 200, objectFit: "contain" }}
            />
          </div>
        )}

        {/* Nome ristorante */}
        <h1 className="fade-3" style={{
          fontFamily: F.display, fontSize: 44, fontWeight: 300,
          color: C.text, margin: "0 0 8px",
          fontStyle: "italic", lineHeight: 1.05, letterSpacing: "0.01em",
        }}>
          {RESTAURANT.name}
        </h1>

        {/* Tagline */}
        <div className="fade-4" style={{
          fontFamily: F.body, fontSize: 13, color: C.textMuted,
          fontWeight: 300, letterSpacing: "0.22em", textTransform: "uppercase",
          marginBottom: 18,
        }}>
          {RESTAURANT.tagline}
        </div>

        {/* Bottom ornament */}
        <div className="fade-4" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 14, marginBottom: 18,
        }}>
          <div style={{
            width: 60, height: 1,
            background: `linear-gradient(90deg, transparent, ${C.gold})`,
          }} />
          <span style={{ fontSize: 11, color: C.gold }}>✦</span>
          <div style={{
            width: 60, height: 1,
            background: `linear-gradient(90deg, ${C.gold}, transparent)`,
          }} />
        </div>

        {/* Descrizione */}
        <p className="fade-5" style={{
          fontFamily: F.body, fontSize: 13, color: C.textSoft,
          fontWeight: 300, lineHeight: 1.7, letterSpacing: "0.01em",
          margin: 0, maxWidth: 320,
        }}>
          {RESTAURANT.description}
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
           BLOCCO INFERIORE — Foto del locale (~45%)
         ══════════════════════════════════════════════════════════ */}
      <div style={{
        flex: "1 1 45vh",
        minHeight: 320,
        position: "relative",
        background: C.bgAlt,
        overflow: "hidden",
      }}>
        {/* Foto sfondo */}
        {RESTAURANT.coverImageUrl && (
          <img
            src={RESTAURANT.coverImageUrl}
            alt={`${RESTAURANT.name} — interno del locale`}
            onLoad={() => setImgLoaded(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 1.2s ease",
              filter: "saturate(0.9) contrast(1.05)",
            }}
          />
        )}

        {/* Gradient di transizione dall'avorio alla foto (in alto) */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 80,
          background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg}00 100%)`,
          pointerEvents: "none",
          zIndex: 2,
        }} />

        {/* Overlay scuro per leggibilità del CTA */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }} />

        {/* Contenuto sopra la foto */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 32px 24px",
          zIndex: 4,
        }}>
          {/* Spacer per push verso il basso */}
          <div style={{ flex: 1 }} />

          {/* CTA Button */}
          <button
            className="cta-btn fade-5"
            onClick={enterMenu}
            style={{
              fontFamily: F.body,
              fontSize: 12,
              fontWeight: 400,
              color: C.white,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              padding: "16px 38px",
              background: "transparent",
              border: `1px solid ${C.gold}`,
              borderRadius: 0,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            Scopri il menu
          </button>

          {/* Indicazione swipe */}
          <div className="fade-6 swipe-hint" style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{
              fontFamily: F.body,
              fontSize: 9,
              color: C.white,
              opacity: 0.7,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>
              o scorri
            </span>
            <span style={{
              fontSize: 16,
              color: C.gold,
              lineHeight: 1,
            }}>
              ↓
            </span>
          </div>

          {/* Spacer flessibile */}
          <div style={{ flex: 1 }} />

          {/* Footer: contatti e social */}
          <div className="fade-6" style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTop: `1px solid rgba(255,255,255,0.15)`,
          }}>
            {/* Phone */}
            {RESTAURANT.phone && (
              <a
                href={`tel:${RESTAURANT.phone.replace(/\s/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="social-link"
                style={{
                  fontFamily: F.body,
                  fontSize: 11,
                  color: C.white,
                  textDecoration: "none",
                  fontWeight: 300,
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>☎</span>
                {RESTAURANT.phone}
              </a>
            )}

            {/* Social icons */}
            {socialEntries.length > 0 && (
              <div style={{ display: "flex", gap: 14 }}>
                {RESTAURANT.social.instagram && (
                  <a
                    href={`https://instagram.com/${RESTAURANT.social.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="social-link"
                    style={{
                      color: C.white,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 18,
                    }}
                    aria-label="Instagram"
                  >
                    {/* Instagram SVG icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                )}
                {RESTAURANT.social.facebook && (
                  <a
                    href={`https://facebook.com/${RESTAURANT.social.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="social-link"
                    style={{
                      color: C.white,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 18,
                    }}
                    aria-label="Facebook"
                  >
                    {/* Facebook SVG icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
