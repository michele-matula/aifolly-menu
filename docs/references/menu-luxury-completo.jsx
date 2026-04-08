import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════════
//  AiFolly Menu — Prototipo Preset "Elegante"
//  Riferimento visuale per la spec v3.3
//  
//  Allineato al data model Prisma:
//  - 14 allergeni EU (Reg. 1169/2011)
//  - Enum DishTag completo (vegetariano, vegano, senzaGlutine, 
//    piccante, biologico, kmZero, surgelato)
//  - Campo isChefChoice booleano separato dai tag
//  - Strutture priceLabel e variants[] supportate
// ════════════════════════════════════════════════════════════════

// ─── Data ───────────────────────────────────────────────────────

const RESTAURANT = {
  name: "Osteria del Porto",
  tagline: "Cucina di mare",
  est: "Est. 1987",
  location: "Brindisi · Puglia",
};

const CATEGORIES = [
  { id: "antipasti", label: "Antipasti" },
  { id: "primi", label: "Primi" },
  { id: "secondi", label: "Secondi" },
  { id: "contorni", label: "Contorni" },
  { id: "dolci", label: "Dolci" },
  { id: "bevande", label: "Bevande" },
];

// ─── 14 allergeni EU (Reg. 1169/2011) ───────────────────────────
// Allineati all'enum Allergen del modello Prisma

const ALLERGEN_MAP = {
  glutine:           { icon: "🌾", label: "Glutine" },
  crostacei:         { icon: "🦀", label: "Crostacei" },
  uova:              { icon: "🥚", label: "Uova" },
  pesce:             { icon: "🐟", label: "Pesce" },
  arachidi:          { icon: "🥜", label: "Arachidi" },
  soia:              { icon: "🫘", label: "Soia" },
  latte:             { icon: "🥛", label: "Latte" },
  fruttaGuscio:      { icon: "🌰", label: "Frutta a guscio" },
  sedano:            { icon: "🌿", label: "Sedano" },
  senape:            { icon: "🟡", label: "Senape" },
  sesamo:            { icon: "⚪", label: "Sesamo" },
  anidrideSolforosa: { icon: "🍷", label: "Anidride solforosa" },
  lupini:            { icon: "🫛", label: "Lupini" },
  molluschi:         { icon: "🐚", label: "Molluschi" },
};

// ─── Filtri rapidi (sottoinsieme dei DishTag più utili al cliente) ──

const FILTERS = [
  { id: "vegetariano", label: "Vegetariano" },
  { id: "vegano",      label: "Vegano" },
  { id: "senzaGlutine", label: "Senza Glutine" },
];

// ─── Tag display config ─────────────────────────────────────────
// Mappatura DishTag → label visualizzata + colore badge

const TAG_CONFIG = {
  vegetariano:  { label: "Vegetariano",  color: "gold" },
  vegano:       { label: "Vegano",       color: "gold" },
  senzaGlutine: { label: "Senza Glutine", color: "gold" },
  piccante:     { label: "Piccante",     color: "red"  },
  biologico:    { label: "Biologico",    color: "gold" },
  kmZero:       { label: "Km 0",         color: "gold" },
  surgelato:    { label: "Surgelato",    color: "muted" },
};

// ─── Menu data ──────────────────────────────────────────────────
// Ogni piatto allineato al modello Dish:
// {
//   name, description, price | priceLabel | variants[],
//   tags: DishTag[], allergens: Allergen[],
//   isChefChoice: boolean,
//   imageUrl
// }

const MENU = {
  antipasti: [
    {
      name: "Crudo di Mare",
      description: "Tartare di tonno rosso, gambero viola di Gallipoli, ricci e ostrica su letto di agrumi",
      price: 18,
      tags: ["kmZero"],
      allergens: ["pesce", "crostacei", "molluschi"],
      isChefChoice: true,
      imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80",
    },
    {
      name: "Polpo alla Brace",
      description: "Polpo verace su crema di patate al limone e capperi di Pantelleria",
      price: 14,
      tags: ["kmZero"],
      allergens: ["molluschi"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80",
    },
    {
      name: "Burrata Pugliese",
      description: "Burrata di Andria con pomodorini Fiaschetto, pesto di basilico e crumble di taralli",
      price: 12,
      tags: ["vegetariano", "kmZero"],
      allergens: ["latte", "glutine", "fruttaGuscio"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&q=80",
    },
    {
      name: "Insalata di Mare Tiepida",
      description: "Moscardini, calamari e cozze con sedano croccante e vinaigrette agli agrumi",
      price: 15,
      tags: ["senzaGlutine"],
      allergens: ["pesce", "crostacei", "molluschi", "sedano"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&q=80",
    },
    {
      name: "Caprese di Bufala",
      description: "Mozzarella di bufala campana, cuore di bue e riduzione di aceto balsamico di Modena",
      price: 11,
      tags: ["vegetariano", "senzaGlutine", "biologico"],
      allergens: ["latte"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80",
    },
  ],

  primi: [
    {
      name: "Orecchiette ai Ricci",
      description: "Pasta fatta a mano con ricci di mare, aglio dolce e prezzemolo croccante",
      price: 16,
      tags: ["kmZero"],
      allergens: ["glutine", "pesce", "uova"],
      isChefChoice: true,
      imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80",
    },
    {
      name: "Spaghettone allo Scoglio",
      description: "Spaghettone di Gragnano con cozze, vongole, gamberi e pomodorino del Piennolo",
      price: 18,
      tags: [],
      allergens: ["glutine", "pesce", "crostacei", "molluschi"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80",
    },
    {
      name: "Risotto al Nero di Seppia",
      description: "Carnaroli mantecato al nero, seppioline croccanti e polvere di lime",
      price: 17,
      tags: ["senzaGlutine"],
      allergens: ["pesce", "molluschi", "latte"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&q=80",
    },
    {
      name: "Ravioli di Cernia",
      description: "Ravioli ripieni di cernia su bisque di crostacei, basilico fritto e olio al peperoncino",
      price: 19,
      tags: ["piccante"],
      allergens: ["glutine", "pesce", "crostacei", "uova"],
      isChefChoice: true,
      imageUrl: "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=500&q=80",
    },
    {
      name: "Linguine Cacio e Pepe di Mare",
      description: "Linguine al pecorino romano con tartare di gambero rosso di Mazara",
      price: 17,
      tags: [],
      allergens: ["glutine", "latte", "crostacei"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80",
    },
  ],

  secondi: [
    {
      name: "Orata in Crosta di Sale",
      description: "Orata del nostro mare cotta in crosta con erbette selvatiche del Salento",
      price: 22,
      tags: ["senzaGlutine", "kmZero"],
      allergens: ["pesce"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500&q=80",
    },
    {
      name: "Grigliata Mista",
      description: "Gamberi, calamari, spada e tonno alla griglia con salmoriglio e verdure",
      price: 25,
      tags: ["senzaGlutine", "kmZero"],
      allergens: ["pesce", "crostacei", "molluschi"],
      isChefChoice: true,
      imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80",
    },
    {
      name: "Baccalà in Umido",
      description: "Baccalà con pomodorini, olive Cellina e capperi su polenta cremosa",
      price: 20,
      tags: [],
      allergens: ["pesce"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80",
    },
    {
      name: "Tagliata di Tonno",
      description: "Tonno rosso in crosta di sesamo, misticanza e riduzione di soia e miele",
      price: 24,
      tags: ["senzaGlutine"],
      allergens: ["pesce", "soia", "sesamo"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80",
    },
  ],

  contorni: [
    {
      name: "Patate al Forno",
      description: "Con rosmarino selvatico e aglio",
      price: 5,
      tags: ["vegano", "senzaGlutine", "biologico"],
      allergens: [],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80",
    },
    {
      name: "Verdure Grigliate",
      description: "Selezione di stagione con olio EVO del Salento",
      price: 6,
      tags: ["vegano", "senzaGlutine", "biologico", "kmZero"],
      allergens: [],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500&q=80",
    },
    {
      name: "Cicoria Ripassata",
      description: "Cicoria pugliese con aglio e peperoncino",
      price: 5,
      tags: ["vegano", "senzaGlutine", "kmZero", "piccante"],
      allergens: [],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=500&q=80",
    },
    {
      name: "Puré di Fave",
      description: "Fave secche con cicoria selvatica e crostini dorati",
      price: 7,
      tags: ["vegetariano", "kmZero"],
      allergens: ["glutine", "lupini"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1543339308-d595c4f5f5ab?w=500&q=80",
    },
  ],

  dolci: [
    {
      name: "Pasticciotto Leccese",
      description: "Pasta frolla ripiena di crema pasticcera, servito tiepido con polvere di cannella",
      price: 7,
      tags: ["vegetariano", "kmZero"],
      allergens: ["glutine", "latte", "uova"],
      isChefChoice: true,
      imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80",
    },
    {
      name: "Semifreddo alle Mandorle",
      description: "Con coulis di fichi e miele del Salento",
      price: 8,
      tags: ["vegetariano", "senzaGlutine"],
      allergens: ["fruttaGuscio", "latte", "uova"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80",
    },
    {
      name: "Sorbetto al Limone",
      description: "Limoni di Femminello, servito nel limone scavato",
      price: 6,
      tags: ["vegano", "senzaGlutine", "biologico"],
      allergens: [],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=500&q=80",
    },
    {
      name: "Tortino al Cioccolato",
      description: "Cuore fondente 70% con gelato alla vaniglia di Madagascar",
      price: 9,
      tags: ["vegetariano"],
      allergens: ["glutine", "latte", "uova", "soia"],
      isChefChoice: false,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
    },
  ],

  bevande: [
    {
      name: "Acqua Minerale",
      description: "Naturale o frizzante · 75cl",
      price: 3,
      tags: ["vegano", "senzaGlutine"],
      allergens: [],
      isChefChoice: false,
      imageUrl: null,
    },
    {
      // Esempio di piatto con varianti prezzo (modello PriceVariant)
      name: "Primitivo di Manduria DOC",
      description: "Rosso strutturato, note di frutta scura",
      price: null,
      priceLabel: null,
      variants: [
        { label: "Calice", price: 7 },
        { label: "Bottiglia", price: 25 },
      ],
      tags: ["vegano", "senzaGlutine", "kmZero", "biologico"],
      allergens: ["anidrideSolforosa"],
      isChefChoice: false,
      imageUrl: null,
    },
    {
      name: "Negroamaro del Salento IGT",
      description: "Rosso morbido, sentori di spezie",
      price: null,
      variants: [
        { label: "Calice", price: 6 },
        { label: "Bottiglia", price: 22 },
      ],
      tags: ["vegano", "senzaGlutine", "kmZero"],
      allergens: ["anidrideSolforosa"],
      isChefChoice: false,
      imageUrl: null,
    },
    {
      name: "Verdeca Valle d'Itria",
      description: "Bianco fresco, note floreali",
      price: null,
      variants: [
        { label: "Calice", price: 6 },
        { label: "Bottiglia", price: 20 },
      ],
      tags: ["vegano", "senzaGlutine", "kmZero"],
      allergens: ["anidrideSolforosa"],
      isChefChoice: false,
      imageUrl: null,
    },
    {
      name: "Birra Artigianale Pugliese",
      description: "33cl — Bionda o Ambrata",
      price: 5,
      tags: ["vegano", "kmZero"],
      allergens: ["glutine"],
      isChefChoice: false,
      imageUrl: null,
    },
    {
      // Esempio di piatto con priceLabel testuale (alternativa a variants)
      name: "Limoncello della Casa",
      description: "Fatto in casa con limoni del Salento",
      price: 4,
      priceLabel: null,
      tags: ["vegano", "senzaGlutine", "kmZero"],
      allergens: [],
      isChefChoice: false,
      imageUrl: null,
    },
    {
      name: "Caffè Espresso",
      description: "Miscela napoletana, tostatura media",
      price: 1.5,
      tags: ["vegano", "senzaGlutine"],
      allergens: [],
      isChefChoice: false,
      imageUrl: null,
    },
  ],
};

// ─── Fonts & Palette ────────────────────────────────────────────

const F = {
  display: "'Cormorant Garamond', 'Georgia', serif",
  body: "'Outfit', -apple-system, sans-serif",
};

const C = {
  bg: "#FAFAF8",
  bgAlt: "#F4F1EB",
  card: "#FFFFFF",
  text: "#1a1a18",
  textSoft: "#6b6358",
  textMuted: "#a09882",
  gold: "#c9b97a",
  goldDark: "#a68c4e",
  goldLight: "#e8dfc8",
  border: "#ebe6dc",
  borderLight: "#f0ece4",
  // Aggiunti per tag non-gold
  red: "#a04438",
  redLight: "#f5e1de",
};

// ─── Helpers ────────────────────────────────────────────────────

// Formatta il prezzo a partire dal piatto, gestendo:
//  1. variants[] (priorità più alta)
//  2. priceLabel (override testuale)
//  3. price numerico
function formatPrice(dish) {
  if (dish.variants && dish.variants.length > 0) {
    return dish.variants.map(v => `€${v.price}`).join(" / ");
  }
  if (dish.priceLabel) {
    return `€${dish.priceLabel}`;
  }
  if (dish.price !== null && dish.price !== undefined) {
    return `€${dish.price}`;
  }
  return "";
}

// ─── Components ─────────────────────────────────────────────────

function TagBadge({ tag }) {
  const config = TAG_CONFIG[tag];
  if (!config) return null;

  const styles = {
    gold: {
      color: C.goldDark,
      borderColor: C.goldLight,
      background: "transparent",
    },
    red: {
      color: C.red,
      borderColor: C.redLight,
      background: "transparent",
    },
    muted: {
      color: C.textMuted,
      borderColor: C.border,
      background: "transparent",
    },
  };

  const style = styles[config.color] || styles.gold;

  return (
    <span style={{
      fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
      fontFamily: F.body, fontWeight: 400,
      padding: "3px 9px",
      border: `1px solid ${style.borderColor}`,
      color: style.color,
      background: style.background,
      borderRadius: 3,
    }}>
      {config.label}
    </span>
  );
}

function DishCard({ dish, index, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasImg = !!dish.imageUrl;
  const isChef = dish.isChefChoice === true;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="dish-card"
      style={{
        display: "flex", gap: 16, padding: "20px 0",
        borderBottom: isLast ? "none" : `1px solid ${C.borderLight}`,
        cursor: "pointer",
        animationDelay: `${index * 0.07}s`,
        position: "relative",
      }}
    >
      {/* Image */}
      {hasImg && (
        <div style={{
          width: 88, height: 88, borderRadius: 6, overflow: "hidden",
          flexShrink: 0, position: "relative",
          background: C.bgAlt,
        }}>
          <img
            src={dish.imageUrl}
            alt={dish.name}
            onLoad={() => setImgLoaded(true)}
            className="dish-img"
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              filter: "saturate(0.85) contrast(1.05)",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(.16,1,.3,1)",
            }}
          />
          {isChef && (
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: 0, height: 0,
              borderLeft: `24px solid ${C.gold}`,
              borderBottom: "24px solid transparent",
            }}>
              <span style={{
                position: "absolute", top: 3, left: -20,
                fontSize: 8, color: "#fff",
              }}>✦</span>
            </div>
          )}
        </div>
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Name + Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h3 style={{
            fontFamily: F.display, fontSize: 19, fontWeight: 500,
            color: C.text, margin: 0, lineHeight: 1.25, flex: 1,
            fontStyle: isChef ? "italic" : "normal",
          }}>
            {dish.name}
          </h3>
          <div style={{
            fontFamily: F.body, fontSize: 14, fontWeight: 400,
            color: C.gold, whiteSpace: "nowrap", letterSpacing: "0.02em",
          }}>
            {formatPrice(dish)}
          </div>
        </div>

        {/* Dotted separator */}
        <div style={{
          height: 1, margin: "8px 0 7px",
          backgroundImage: `repeating-linear-gradient(90deg, ${C.border} 0px, ${C.border} 3px, transparent 3px, transparent 8px)`,
          backgroundSize: "8px 1px",
          opacity: 0.7,
        }} />

        {/* Description */}
        <p style={{
          fontFamily: F.body, fontSize: 12.5, color: C.textSoft,
          margin: 0, lineHeight: 1.6, fontWeight: 300,
          letterSpacing: "0.01em",
        }}>
          {dish.description}
        </p>

        {/* Tags (escluso isChefChoice che è già visualizzato come triangolino) */}
        {dish.tags?.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {dish.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}

        {/* Expanded: Allergens */}
        {expanded && dish.allergens?.length > 0 && (
          <div className="allergen-reveal" style={{
            marginTop: 12, paddingTop: 12,
            borderTop: `1px solid ${C.borderLight}`,
          }}>
            <div style={{
              fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
              fontFamily: F.body, fontWeight: 500, color: C.textMuted,
              marginBottom: 8,
            }}>
              Allergeni
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {dish.allergens.map(a => (
                <span key={a} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontFamily: F.body, fontWeight: 300,
                  color: C.textSoft, background: C.bgAlt,
                  padding: "4px 10px", borderRadius: 20,
                  border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 12 }}>{ALLERGEN_MAP[a]?.icon}</span>
                  {ALLERGEN_MAP[a]?.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded: Variants details (per piatti con varianti prezzo) */}
        {expanded && dish.variants && dish.variants.length > 0 && (
          <div className="allergen-reveal" style={{
            marginTop: 12, paddingTop: 12,
            borderTop: `1px solid ${C.borderLight}`,
          }}>
            <div style={{
              fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
              fontFamily: F.body, fontWeight: 500, color: C.textMuted,
              marginBottom: 8,
            }}>
              Formati
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {dish.variants.map(v => (
                <div key={v.label} style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: F.body, fontSize: 12, fontWeight: 300,
                  color: C.textSoft,
                }}>
                  <span>{v.label}</span>
                  <span style={{ color: C.gold, fontWeight: 400 }}>€{v.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────

export default function LuxuryMenu() {
  const [activeCategory, setActiveCategory] = useState("antipasti");
  const [activeFilters, setActiveFilters] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const sectionRefs = useRef({});
  const navRef = useRef(null);
  const catBtnRefs = useRef({});

  useEffect(() => { setTimeout(() => setLoaded(true), 50); }, []);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.cat);
          }
        });
      },
      { threshold: 0.15, rootMargin: "-100px 0px -65% 0px" }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 180);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll nav to active category
  useEffect(() => {
    const btn = catBtnRefs.current[activeCategory];
    const nav = navRef.current;
    if (btn && nav) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const offset = btnRect.left - navRect.left - navRect.width / 2 + btnRect.width / 2;
      nav.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, [activeCategory]);

  const scrollTo = useCallback((catId) => {
    setActiveCategory(catId);
    sectionRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleFilter = (id) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Filtri AND: il piatto deve avere TUTTI i tag selezionati
  const filterDishes = (dishes) => {
    if (!activeFilters.length) return dishes;
    return dishes.filter(d => activeFilters.every(f => d.tags?.includes(f)));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Outfit:wght@200;300;400;500;600&display=swap');
        
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: ${C.bg}; }
        ::-webkit-scrollbar { display: none; }

        .dish-card {
          animation: fadeUp 0.5s cubic-bezier(.16,1,.3,1) both;
        }
        .dish-card:hover .dish-img { transform: scale(1.06); }
        
        .allergen-reveal {
          animation: revealDown 0.3s cubic-bezier(.16,1,.3,1) both;
        }

        .cat-btn {
          transition: all 0.3s ease;
          position: relative;
        }
        .cat-btn::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 1.5px;
          background: ${C.gold};
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .cat-btn.active::after {
          width: 100%;
        }

        .filter-btn {
          transition: all 0.25s ease;
        }
        .filter-btn:hover {
          border-color: ${C.gold} !important;
          color: ${C.goldDark} !important;
        }

        .hero-enter {
          opacity: ${loaded ? 1 : 0};
          transform: translateY(${loaded ? 0 : -16}px);
          transition: all 0.9s cubic-bezier(.16,1,.3,1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 300px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* ── Grain texture ── */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none", zIndex: 999,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ══════════════════════════════════════════════════════════
           HERO HEADER
           NB: nella spec v3+ questa sezione è rimpiazzata da una
           pagina copertina separata. Qui resta come header del menu
           per il prototipo del livello "Menu" del tema.
         ══════════════════════════════════════════════════════════ */}
      <div className="hero-enter" style={{
        textAlign: "center",
        padding: "52px 32px 36px",
        position: "relative",
      }}>
        {/* Top ornament */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 14, marginBottom: 20,
        }}>
          <div style={{ width: 32, height: 1, background: C.gold }} />
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            border: `1px solid ${C.gold}`,
          }} />
          <div style={{ width: 32, height: 1, background: C.gold }} />
        </div>

        <div style={{
          fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase",
          fontFamily: F.body, fontWeight: 300, color: C.gold,
          marginBottom: 14,
        }}>
          {RESTAURANT.est} · {RESTAURANT.location}
        </div>

        <h1 style={{
          fontFamily: F.display, fontSize: 40, fontWeight: 300,
          color: C.text, margin: "0 0 6px",
          fontStyle: "italic", lineHeight: 1.1, letterSpacing: "0.01em",
        }}>
          {RESTAURANT.name}
        </h1>

        <div style={{
          fontFamily: F.body, fontSize: 12.5, color: C.textMuted,
          fontWeight: 300, letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          {RESTAURANT.tagline}
        </div>

        {/* Bottom ornament */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 14, marginTop: 24,
        }}>
          <div style={{
            width: 60, height: 1,
            background: `linear-gradient(90deg, transparent, ${C.gold})`,
          }} />
          <span style={{ fontSize: 10, color: C.gold }}>✦</span>
          <div style={{
            width: 60, height: 1,
            background: `linear-gradient(90deg, ${C.gold}, transparent)`,
          }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
           STICKY NAV
         ══════════════════════════════════════════════════════════ */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(250,250,248,0.95)" : C.bg,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
        transition: "all 0.3s ease",
      }}>
        {/* Categories */}
        <div
          ref={navRef}
          style={{
            display: "flex", gap: 0,
            overflowX: "auto", scrollbarWidth: "none",
            padding: "0 8px",
          }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              ref={el => catBtnRefs.current[cat.id] = el}
              className={`cat-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => scrollTo(cat.id)}
              style={{
                border: "none", background: "transparent",
                fontFamily: F.body, fontSize: 11,
                letterSpacing: "0.2em", textTransform: "uppercase",
                fontWeight: activeCategory === cat.id ? 500 : 300,
                color: activeCategory === cat.id ? C.text : C.textMuted,
                padding: "14px 16px", cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: "flex", gap: 6, padding: "6px 20px 14px",
          overflowX: "auto", scrollbarWidth: "none",
        }}>
          {FILTERS.map(f => {
            const isActive = activeFilters.includes(f.id);
            return (
              <button
                key={f.id}
                className="filter-btn"
                onClick={() => toggleFilter(f.id)}
                style={{
                  border: `1px solid ${isActive ? C.gold : C.border}`,
                  background: isActive ? `${C.gold}12` : "transparent",
                  color: isActive ? C.goldDark : C.textMuted,
                  fontFamily: F.body, fontSize: 10,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  fontWeight: isActive ? 500 : 300,
                  padding: "6px 14px", borderRadius: 20,
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {isActive ? "✓ " : ""}{f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
           MENU SECTIONS
         ══════════════════════════════════════════════════════════ */}
      <div style={{ padding: "8px 24px 80px" }}>
        {CATEGORIES.map(cat => {
          const dishes = filterDishes(MENU[cat.id] || []);

          return (
            <section
              key={cat.id}
              ref={el => sectionRefs.current[cat.id] = el}
              data-cat={cat.id}
              style={{ marginBottom: 20, scrollMarginTop: 110 }}
            >
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "28px 0 4px",
              }}>
                <h2 style={{
                  fontFamily: F.display, fontSize: 26, fontWeight: 400,
                  color: C.text, margin: 0, fontStyle: "italic",
                  whiteSpace: "nowrap",
                }}>
                  {cat.label}
                </h2>
                <div style={{
                  flex: 1, height: 1,
                  background: `linear-gradient(90deg, ${C.border}, transparent)`,
                }} />
              </div>

              {/* Dishes */}
              {dishes.length > 0 ? (
                dishes.map((dish, i) => (
                  <DishCard
                    key={dish.name}
                    dish={dish}
                    index={i}
                    isLast={i === dishes.length - 1}
                  />
                ))
              ) : (
                <p style={{
                  fontFamily: F.body, fontSize: 12, color: C.textMuted,
                  textAlign: "center", padding: "28px 0",
                  fontStyle: "italic", fontWeight: 300,
                  letterSpacing: "0.04em",
                }}>
                  Nessun piatto con i filtri selezionati
                </p>
              )}
            </section>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════
           FOOTER
         ══════════════════════════════════════════════════════════ */}
      <div style={{
        textAlign: "center", padding: "28px 32px 48px",
        borderTop: `1px solid ${C.border}`,
        background: C.bgAlt,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 12, marginBottom: 16,
        }}>
          <div style={{ width: 24, height: 1, background: C.gold, opacity: 0.5 }} />
          <span style={{ fontSize: 8, color: C.gold }}>✦</span>
          <div style={{ width: 24, height: 1, background: C.gold, opacity: 0.5 }} />
        </div>

        <p style={{
          fontFamily: F.body, fontSize: 11, color: C.textMuted,
          margin: "0 0 4px", fontWeight: 300, letterSpacing: "0.04em",
          lineHeight: 1.7,
        }}>
          Coperto €2,50 · Servizio non incluso
        </p>
        <p style={{
          fontFamily: F.body, fontSize: 10.5, color: C.textMuted,
          margin: "0 0 16px", fontWeight: 300, fontStyle: "italic",
          letterSpacing: "0.02em",
        }}>
          Si prega di informare il personale di eventuali allergie o intolleranze
        </p>

        <div style={{
          fontFamily: F.display, fontSize: 18, fontStyle: "italic",
          color: C.gold, fontWeight: 400, letterSpacing: "0.02em",
        }}>
          Buon appetito
        </div>

        <div style={{
          marginTop: 20, fontSize: 9,
          fontFamily: F.body, fontWeight: 300,
          color: C.textMuted, letterSpacing: "0.2em",
          textTransform: "uppercase", opacity: 0.6,
        }}>
          {RESTAURANT.name} · {RESTAURANT.location}
        </div>
      </div>
    </div>
  );
}
