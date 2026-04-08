# AiFolly Menu — Specifica Tecnica del Progetto

> **Documento di riferimento per lo sviluppo con Claude Code**
> Versione: 3.3 · Data: 8 Aprile 2026

---

## 1. Panoramica

**AiFolly Menu** è una piattaforma SaaS per la creazione e gestione di menu digitali per ristoranti e bar. Il cliente finale inquadra un QR code dal tavolo e visualizza il menu del locale sul proprio smartphone, senza scaricare app.

### 1.1 Obiettivi principali

- Menu digitale responsive, ottimizzato per mobile (accesso via QR code)
- **Customizzazione avanzata**: il ristoratore personalizza completamente l'aspetto del menu su 3 livelli (copertina, menu, piatti) tramite un theme builder visuale con anteprima live
- Pannello di amministrazione per i ristoratori (gestione piatti, categorie, prezzi, foto, tema)
- Architettura multi-tenant: un'unica piattaforma serve N ristoranti, ciascuno con il proprio menu personalizzato
- Performance: il menu deve caricarsi in < 2 secondi da scansione QR
- Temi preset come punto di partenza per ristoratori senza competenze di design

### 1.2 Utenti target

| Utente | Descrizione |
|--------|-------------|
| **Cliente finale** | Persona al tavolo che scansiona il QR code e consulta il menu |
| **Ristoratore** | Proprietario/gestore del locale che gestisce il menu dal pannello admin |
| **Super Admin** | Amministratore della piattaforma AiFolly (gestione tenant, piani, fatturazione) |

### 1.3 Flusso utente — Cliente finale

Il cliente scansiona il QR code e atterra sulla **pagina copertina** del ristorante. Qui vede logo, nome e descrizione del locale, con lo stile visivo personalizzato dal ristoratore. Tocca per entrare e viene portato alla **pagina menu** dove naviga categorie e piatti, anch'essi con lo stile personalizzato. La copertina è una pagina separata (non una sezione hero in cima al menu).

---

## 2. Tech Stack

### 2.1 Frontend — Menu pubblico

| Tecnologia | Motivazione |
|-----------|-------------|
| **Next.js 14+** (App Router) | SSR/SSG per performance, routing dinamico per multi-tenant |
| **Tailwind CSS** | Styling utility-first, facilmente personalizzabile per tema |
| **TypeScript** | Type safety su tutto il progetto |
| **Google Fonts API** | Caricamento dinamico di qualsiasi font dal catalogo completo (~1500 font) |

### 2.2 Frontend — Pannello Admin

| Tecnologia | Motivazione |
|-----------|-------------|
| **Next.js 14+** (stessa app, route group separata) | Condivisione codice e deploy unico |
| **shadcn/ui** | Componenti UI accessibili e personalizzabili per il pannello |
| **React Hook Form + Zod** | Gestione form e validazione |
| **TanStack Query** | Gestione stato server-side e caching |
| **react-colorful** | Color picker leggero e accessibile (3KB) |
| **@fontsource** oppure **Google Fonts CSS API** | Preview font nel theme builder |

### 2.3 Backend

| Tecnologia | Motivazione |
|-----------|-------------|
| **Next.js API Routes** (Route Handlers) | Tutto nello stesso progetto, deploy semplificato |
| **Prisma ORM** | Type-safe database access, migrazioni |
| **PostgreSQL** | Database relazionale robusto e scalabile |
| **NextAuth.js v5** | Autenticazione per il pannello admin |
| **Cloudinary** oppure **AWS S3 + CloudFront** | Storage e CDN per le foto dei piatti |
| **Zod** | Validazione input API |
| **argon2** | Hashing password (preferito a bcrypt per resistenza a GPU) |

### 2.4 Infrastruttura

| Servizio | Uso |
|----------|-----|
| **Vercel** | Hosting e deploy (ottimizzato per Next.js) |
| **Vercel Postgres** oppure **Supabase** oppure **Railway** | Database PostgreSQL managed |
| **Cloudinary** | Image hosting, resize automatico, WebP conversion |
| **PostHog** oppure **Plausible** | Analytics con eventi personalizzati |
| **Sentry** | Error tracking e monitoring |
| **Upstash Redis** | Rate limiting e caching API (opzionale) |

---

## 3. Sistema di Customizzazione — Architettura

Questo è l'elemento differenziante di AiFolly Menu. Il ristoratore personalizza l'aspetto del menu su **3 livelli indipendenti**, ciascuno con le proprie proprietà visive. Un tema completo è la composizione dei 3 livelli.

### 3.1 I tre livelli di personalizzazione

```
┌─────────────────────────────────────────────────┐
│  LIVELLO 1 — COPERTINA                          │
│  Pagina separata: logo, nome, descrizione       │
│  Personalizza: sfondo, font titolo/descrizione,  │
│  colori testo, immagine di sfondo, layout        │
├─────────────────────────────────────────────────┤
│  LIVELLO 2 — MENU                               │
│  Pagina principale con categorie e piatti       │
│  Personalizza: sfondo, font header sezioni,     │
│  colore navigazione, stile card                 │
├─────────────────────────────────────────────────┤
│  LIVELLO 3 — PIATTI                             │
│  Stile uniforme per tutte le DishCard           │
│  Personalizza: font/colore/peso titolo piatto,  │
│  font/colore/peso descrizione, stile prezzo     │
└─────────────────────────────────────────────────┘
```

### 3.2 Temi preset

Il ristoratore parte da un tema preset e lo personalizza. I preset sono definiti come configurazioni complete dei 3 livelli. Ne servono almeno 6-8 per coprire i gusti più comuni:

| Preset | Mood | Font titoli | Font body | Palette |
|--------|------|-------------|-----------|---------|
| **Elegante** | Luxury, raffinato | Cormorant Garamond | Outfit | Avorio + oro |
| **Rustico** | Trattoria, calore | Playfair Display | Lato | Terra + verde oliva |
| **Minimal** | Pulito, moderno | DM Sans | Inter | Bianco + nero |
| **Vivace** | Colorato, informale | Fredoka | Nunito | Corallo + turchese |
| **Classico** | Tradizionale | Libre Baskerville | Source Sans 3 | Crema + bordeaux |
| **Moderno** | Contemporaneo | Space Grotesk | Geist | Grigio scuro + lime |
| **Bistrot** | Francese, intimo | EB Garamond | Jost | Carta + blu notte |
| **Street Food** | Urbano, bold | Anton | Work Sans | Nero + giallo |

Ogni preset include la configurazione completa per tutti e 3 i livelli. Il ristoratore può selezionare un preset e poi modificare singole proprietà.

### 3.3 Selezione font — Google Fonts completo

Il ristoratore ha accesso all'intero catalogo Google Fonts (~1500 font). Per rendere l'esperienza gestibile:

**UI di selezione font:**
- Input di ricerca con autocomplete che filtra per nome
- Categorie rapide: Serif, Sans-Serif, Display, Handwriting, Monospace
- Preview in tempo reale: ogni font nell'elenco mostra il suo nome renderizzato nel font stesso
- Font "popolari" in cima alla lista (i 20 più usati su AiFolly)
- Selezione pesi disponibili (regular, bold, italic, ecc.) dopo la scelta del font
- Font recenti dell'utente per accesso rapido

**Caricamento dinamico nel menu pubblico:**
- Il menu carica solo i font effettivamente usati dal tema del ristorante
- Utilizzo dell'API Google Fonts CSS (`fonts.googleapis.com/css2?family=...`) con parametro `display=swap` per evitare FOIT
- Preload del font principale (titolo copertina) per performance
- Fallback stack per ogni font personalizzato (serif → `Georgia, 'Times New Roman', serif`; sans-serif → `system-ui, -apple-system, sans-serif`)

**Caricamento nel theme builder (admin):**
- Fetch della lista font via Google Fonts Developer API (cachata lato server per 24h)
- Font caricati on-demand quando selezionati nel picker
- Preview live del font scelto nel pannello anteprima

### 3.4 Selezione colori — Palette suggerite + picker libero

Ogni proprietà colore offre due modalità di selezione:

**Palette suggerite:**
- 8-10 palette armonizzate predefinite (coerenti con i temi preset)
- Ogni palette include 5 colori: background, testo primario, testo secondario, accento, bordi
- Click su una palette applica tutti i colori di quel livello contemporaneamente
- Le palette sono curate per garantire contrasto WCAG AA

**Color picker libero:**
- Input HEX diretto (con validazione formato `#RRGGBB`)
- Color picker visuale (hue wheel + saturation/brightness)
- Libreria: `react-colorful` (3KB, accessibile, nessuna dipendenza)
- Supporto copia/incolla codici HEX

### 3.5 Controllo contrasto accessibilità (WCAG)

Ogni volta che il ristoratore modifica un colore testo o sfondo, il sistema calcola in tempo reale il rapporto di contrasto WCAG e mostra un indicatore visivo:

```
Rapporto contrasto: 4.8:1
✅ AA — Testo normale    (minimo 4.5:1)
✅ AA — Testo grande     (minimo 3:1)
⚠️ AAA — Non superato   (richiede 7:1)
```

**Comportamento:**
- Se il contrasto è sotto 4.5:1, mostra un **warning arancione** con suggerimento: "Il testo potrebbe essere difficile da leggere. Prova un colore più scuro."
- Se il contrasto è sotto 3:1, mostra un **errore rosso**: "Contrasto insufficiente. I clienti non riusciranno a leggere il menu."
- Il sistema **non blocca** la pubblicazione con contrasto basso (il ristoratore decide), ma il warning è ben visibile
- Il check avviene per tutte le coppie testo/sfondo rilevanti: titolo su sfondo copertina, nome piatto su sfondo card, descrizione su sfondo card, header sezione su sfondo menu

**Implementazione:** funzione pura `getContrastRatio(color1: string, color2: string): number` che calcola il rapporto secondo la formula WCAG 2.1 (luminanza relativa). Nessuna libreria esterna necessaria — sono ~20 righe di codice.

---

## 4. Data Model (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Autenticazione ──────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String                          // argon2id hash
  emailVerified Boolean   @default(false)
  
  restaurants   UserRestaurant[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model UserRestaurant {
  id            String    @id @default(cuid())
  userId        String
  restaurantId  String
  role          UserRole  @default(OWNER)
  
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime   @default(now())
  
  @@unique([userId, restaurantId])
  @@index([restaurantId])
}

enum UserRole {
  SUPER_ADMIN
  OWNER
  MANAGER
}

// ── Ristorante ──────────────────────────────────────────────

model Restaurant {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  tagline     String?
  description String?
  logoUrl     String?
  coverUrl    String?
  
  // Indirizzo
  address     String?
  city        String?
  province    String?
  country     String     @default("IT")
  
  // Contatti
  phone       String?
  email       String?
  website     String?
  
  // ── TEMA PERSONALIZZATO (3 livelli) ──
  // Ogni livello è un JSON validato da Zod (vedi sezione 5)
  themeCover    Json     @default("{}")    // CoverThemeSchema
  themeMenu     Json     @default("{}")    // MenuThemeSchema
  themeDish     Json     @default("{}")    // DishThemeSchema
  themePreset   String?                    // ID del preset di partenza (es. "elegante", "rustico")
  
  // Tema bozza (modifiche non ancora pubblicate)
  themeCoverDraft  Json?                   // Bozza copertina (null = nessuna modifica pending)
  themeMenuDraft   Json?                   // Bozza menu
  themeDishDraft   Json?                   // Bozza piatti
  
  // Info servizio
  coverCharge    Decimal?  @db.Decimal(4,2)
  serviceNote    String?
  allergenNote   String?
  
  // Stato
  isActive    Boolean    @default(true)
  isPublished Boolean    @default(false)
  isSuspended Boolean    @default(false)          // Sospeso da Super Admin (non accessibile)
  suspendedAt DateTime?
  suspendedReason String?                          // Motivo sospensione (visibile solo Super Admin)
  
  // Piano e fatturazione
  planId      String?
  plan        Plan?      @relation(fields: [planId], references: [id])
  
  // Stripe (popolato dal webhook dopo subscription)
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  stripeSubscriptionStatus String?                // "active", "trialing", "past_due", "canceled"
  subscriptionCurrentPeriodEnd DateTime?
  
  // Relazioni
  users         UserRestaurant[]
  categories    Category[]
  invitations   Invitation[]
  previewTokens PreviewToken[]
  auditLogs     AuditLog[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([slug])
}

// ── Piani e Subscription ────────────────────────────────────

model Plan {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  maxDishes       Int       @default(20)
  maxCategories   Int       @default(5)
  maxImages       Int       @default(10)
  customTheme     Boolean   @default(false)      // Personalizzazione oltre i preset
  googleFonts     Boolean   @default(false)      // Accesso Google Fonts completo (altrimenti solo font dei preset)
  removeBranding  Boolean   @default(false)
  analytics       Boolean   @default(false)
  priceMonthly    Decimal   @db.Decimal(6,2)
  priceYearly     Decimal?  @db.Decimal(6,2)
  isActive        Boolean   @default(true)
  
  restaurants     Restaurant[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ── Temi Preset ─────────────────────────────────────────────

model ThemePreset {
  id            String   @id @default(cuid())
  slug          String   @unique               // "elegante", "rustico", "minimal"
  name          String                          // "Elegante", "Rustico", "Minimal"
  description   String?                         // "Raffinato e luxury, perfetto per ristoranti fine dining"
  thumbnailUrl  String?                         // Anteprima miniatura del preset
  category      String   @default("all")       // "fine-dining", "casual", "street-food", "all"
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  
  // Configurazioni complete dei 3 livelli (validati da Zod)
  coverConfig   Json                            // CoverThemeSchema
  menuConfig    Json                            // MenuThemeSchema
  dishConfig    Json                            // DishThemeSchema
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ── Inviti ───────────────────────────────────────────────────

model Invitation {
  id            String    @id @default(cuid())
  email         String
  role          UserRole  @default(MANAGER)
  token         String    @unique @default(cuid())
  expiresAt     DateTime
  acceptedAt    DateTime?
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime   @default(now())
  
  @@index([token])
  @@index([email])
}

// ── Token Preview Mobile ────────────────────────────────────
// Token temporaneo per visualizzare la bozza del tema sul dispositivo mobile
// del ristoratore scansionando un QR code dal theme builder.

model PreviewToken {
  id            String    @id @default(cuid())
  token         String    @unique @default(cuid())   // Token opaco nell'URL
  expiresAt     DateTime                              // Scadenza: 1 ora dalla creazione
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  // User che ha generato il token (per audit)
  createdByUserId String
  
  createdAt     DateTime   @default(now())
  
  @@index([token])
  @@index([restaurantId])
  @@index([expiresAt])   // Per cleanup job dei token scaduti
}

// ── Audit Log ───────────────────────────────────────────────
// Registra azioni critiche per compliance GDPR, debug e sicurezza.
// Sia Super Admin che OWNER possono generare entry di audit log.

model AuditLog {
  id            String    @id @default(cuid())
  
  // Chi ha fatto l'azione
  actorUserId   String                              // ID dell'utente che ha eseguito
  actorEmail    String                              // Snapshot email (l'utente può essere eliminato)
  actorRole     UserRole                            // Ruolo al momento dell'azione
  
  // Cosa è stato fatto
  action        AuditAction                         // Enum azioni
  entityType    String                              // "restaurant", "plan", "theme", "user"
  entityId      String?                             // ID dell'entità impattata (se applicabile)
  
  // Contesto
  restaurantId  String?                             // Ristorante impattato (se applicabile)
  restaurant    Restaurant? @relation(fields: [restaurantId], references: [id], onDelete: SetNull)
  
  // Dati aggiuntivi
  metadata      Json      @default("{}")            // Snapshot dati prima/dopo, IP, user-agent
  ipAddress     String?
  userAgent     String?
  
  createdAt     DateTime  @default(now())
  
  @@index([actorUserId])
  @@index([restaurantId])
  @@index([action])
  @@index([createdAt])
}

enum AuditAction {
  // Tenant management (Super Admin)
  TENANT_SUSPENDED
  TENANT_REACTIVATED
  TENANT_DELETED
  TENANT_PLAN_CHANGED
  TENANT_IMPERSONATED
  
  // Plan management (Super Admin)
  PLAN_CREATED
  PLAN_UPDATED
  PLAN_DEACTIVATED
  
  // Preset management (Super Admin)
  PRESET_CREATED
  PRESET_UPDATED
  PRESET_DELETED
  
  // Restaurant actions (OWNER)
  RESTAURANT_CREATED
  RESTAURANT_UPDATED
  RESTAURANT_DELETED
  THEME_PUBLISHED
  
  // User actions
  USER_INVITED
  USER_REMOVED
  USER_ROLE_CHANGED
  
  // Auth
  LOGIN_SUCCESS
  LOGIN_FAILED
  PASSWORD_CHANGED
}

// ── Impersonazione Super Admin ──────────────────────────────
// Sessione attiva di impersonazione di un OWNER da parte di un Super Admin.
// Permette debug senza compromettere la sicurezza.

model SuperAdminImpersonation {
  id                String    @id @default(cuid())
  superAdminUserId  String
  targetUserId      String
  targetRestaurantId String
  startedAt         DateTime  @default(now())
  endedAt           DateTime?
  reason            String                          // Motivo dell'impersonazione (obbligatorio)
  
  @@index([superAdminUserId])
  @@index([targetUserId])
  @@index([endedAt])
}

// ── Categorie ───────────────────────────────────────────────

model Category {
  id           String     @id @default(cuid())
  name         String
  slug         String
  description  String?
  icon         String?
  sortOrder    Int        @default(0)
  isVisible    Boolean    @default(true)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  dishes       Dish[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([restaurantId, slug])
  @@index([restaurantId, sortOrder])
}

// ── Piatti ───────────────────────────────────────────────────

model Dish {
  id           String     @id @default(cuid())
  name         String
  description  String?
  imageUrl     String?
  
  price        Decimal?   @db.Decimal(6,2)
  priceLabel   String?
  variants     PriceVariant[]
  
  tags         DishTag[]  @default([])
  allergens    Allergen[] @default([])
  isChefChoice Boolean    @default(false)
  
  sortOrder    Int        @default(0)
  isAvailable  Boolean    @default(true)
  isVisible    Boolean    @default(true)
  
  categoryId   String
  category     Category   @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([categoryId, sortOrder])
}

// ── Varianti Prezzo ─────────────────────────────────────────

model PriceVariant {
  id        String   @id @default(cuid())
  label     String
  price     Decimal  @db.Decimal(6,2)
  sortOrder Int      @default(0)
  
  dishId    String
  dish      Dish     @relation(fields: [dishId], references: [id], onDelete: Cascade)
  
  @@index([dishId, sortOrder])
}

// ── Predisposizione Multilingua (v2) ────────────────────────

model DishTranslation {
  id          String   @id @default(cuid())
  dishId      String
  dish        Dish     @relation(fields: [dishId], references: [id], onDelete: Cascade)
  locale      String
  name        String
  description String?
  
  @@unique([dishId, locale])
}

// ── Enums ───────────────────────────────────────────────────

enum DishTag {
  VEGETARIANO
  VEGANO
  SENZA_GLUTINE
  PICCANTE
  BIOLOGICO
  KM_ZERO
  SURGELATO
}

enum Allergen {
  GLUTINE
  CROSTACEI
  UOVA
  PESCE
  ARACHIDI
  SOIA
  LATTE
  FRUTTA_A_GUSCIO
  SEDANO
  SENAPE
  SESAMO
  ANIDRIDE_SOLFOROSA
  LUPINI
  MOLLUSCHI
}
```

---

## 5. Validazione e Type Safety — Temi

Il cuore del sistema di customizzazione. Ogni livello ha uno schema Zod dedicato che definisce tutte le proprietà personalizzabili, i valori di default, e i vincoli.

### 5.1 Schema Livello 1 — Copertina (CoverThemeSchema)

```typescript
// src/lib/validators/theme.ts

const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colore HEX non valido');

const FontConfigSchema = z.object({
  family: z.string().min(1).max(100),           // Nome Google Font: "Cormorant Garamond"
  weight: z.enum(['100','200','300','400','500','600','700','800','900']).default('400'),
  style: z.enum(['normal', 'italic']).default('normal'),
  size: z.number().min(10).max(120),             // px
  letterSpacing: z.number().min(-5).max(20).default(0),  // px
  lineHeight: z.number().min(0.8).max(3).default(1.3),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
});

export const CoverThemeSchema = z.object({
  // Sfondo
  backgroundColor: HexColorSchema.default('#FAFAF8'),
  backgroundImageUrl: z.string().url().optional(),    // Foto del locale come sfondo
  backgroundOverlayColor: HexColorSchema.default('#000000'),
  backgroundOverlayOpacity: z.number().min(0).max(1).default(0.3), // Overlay scuro su immagine
  
  // Logo
  showLogo: z.boolean().default(true),
  logoMaxHeight: z.number().min(40).max(200).default(80),  // px
  
  // Titolo (nome ristorante)
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
  
  // Descrizione/tagline
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
  
  // CTA "Entra nel menu"
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
  
  // Decorazioni
  showOrnament: z.boolean().default(true),           // Ornamento geometrico sopra/sotto titolo
  ornamentColor: HexColorSchema.default('#c9b97a'),
  
  // Layout
  contentAlignment: z.enum(['center', 'left', 'right']).default('center'),
  paddingVertical: z.number().min(20).max(120).default(60),   // px
}).strict();

export type CoverTheme = z.infer<typeof CoverThemeSchema>;
```

### 5.2 Schema Livello 2 — Menu (MenuThemeSchema)

```typescript
export const MenuThemeSchema = z.object({
  // Sfondo pagina menu
  backgroundColor: HexColorSchema.default('#FAFAF8'),
  
  // Header sezione categoria (es. "Antipasti", "Primi")
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
  
  // Navigazione categorie (sticky nav)
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
  
  // Card piatto — contenitore
  cardBackgroundColor: HexColorSchema.default('#FFFFFF'),
  cardBorderColor: HexColorSchema.default('#f0ece4'),
  cardBorderRadius: z.number().min(0).max(24).default(0),    // px
  cardStyle: z.enum(['elevated', 'flat', 'bordered', 'minimal']).default('elevated'),
  cardShowImage: z.boolean().default(true),
  cardImageRadius: z.number().min(0).max(24).default(6),     // px
  cardImageSize: z.number().min(60).max(120).default(88),    // px
  
  // Filtri
  filterPillColor: HexColorSchema.default('#c9b97a'),
  filterPillTextColor: HexColorSchema.default('#6b6358'),
  filterPillActiveTextColor: HexColorSchema.default('#FFFFFF'),
  
  // Footer
  footerBackgroundColor: HexColorSchema.default('#F4F1EB'),
  footerTextColor: HexColorSchema.default('#6b6358'),
  footerAccentColor: HexColorSchema.default('#c9b97a'),
  
  // Effetti
  showGrainTexture: z.boolean().default(true),
  grainOpacity: z.number().min(0).max(0.1).default(0.025),
}).strict();

export type MenuTheme = z.infer<typeof MenuThemeSchema>;
```

### 5.3 Schema Livello 3 — Piatti (DishThemeSchema)

```typescript
export const DishThemeSchema = z.object({
  // Titolo piatto (es. "Crudo di Mare")
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
  
  // Descrizione piatto
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
  
  // Prezzo
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
  
  // Tag e badge (Vegetariano, ecc.)
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
  
  // Allergeni
  allergenTextColor: HexColorSchema.default('#a09882'),
  
  // Separatore tra nome e descrizione
  separatorStyle: z.enum(['dashed', 'solid', 'dotted', 'none']).default('dashed'),
  separatorColor: HexColorSchema.default('#ebe6dc'),
  
  // Chef's choice indicator
  chefChoiceColor: HexColorSchema.default('#c9b97a'),
}).strict();

export type DishTheme = z.infer<typeof DishThemeSchema>;
```

### 5.4 Schema completo e helper

```typescript
// Schema composito per l'intero tema
export const FullThemeSchema = z.object({
  cover: CoverThemeSchema,
  menu: MenuThemeSchema,
  dish: DishThemeSchema,
});

export type FullTheme = z.infer<typeof FullThemeSchema>;

// ── Helper: contrasto WCAG ─────────────────────────────────

function getLuminance(hex: string): number {
  const rgb = [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ].map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastLevel(ratio: number): 'fail' | 'aa-large' | 'aa' | 'aaa' {
  if (ratio >= 7) return 'aaa';
  if (ratio >= 4.5) return 'aa';
  if (ratio >= 3) return 'aa-large';
  return 'fail';
}

// ── Coppie testo/sfondo da verificare ──────────────────────

export function getContrastChecks(theme: FullTheme): Array<{
  label: string;
  textColor: string;
  bgColor: string;
  ratio: number;
  level: string;
}> {
  return [
    {
      label: 'Titolo copertina su sfondo',
      textColor: theme.cover.titleColor,
      bgColor: theme.cover.backgroundColor,
    },
    {
      label: 'Descrizione copertina su sfondo',
      textColor: theme.cover.descriptionColor,
      bgColor: theme.cover.backgroundColor,
    },
    {
      label: 'Nome piatto su card',
      textColor: theme.dish.nameColor,
      bgColor: theme.menu.cardBackgroundColor,
    },
    {
      label: 'Descrizione piatto su card',
      textColor: theme.dish.descriptionColor,
      bgColor: theme.menu.cardBackgroundColor,
    },
    {
      label: 'Header sezione su sfondo menu',
      textColor: theme.menu.sectionHeaderColor,
      bgColor: theme.menu.backgroundColor,
    },
    {
      label: 'Prezzo su card',
      textColor: theme.dish.priceColor,
      bgColor: theme.menu.cardBackgroundColor,
    },
  ].map(check => ({
    ...check,
    ratio: getContrastRatio(check.textColor, check.bgColor),
    level: getContrastLevel(getContrastRatio(check.textColor, check.bgColor)),
  }));
}
```

### 5.5 Altri validators (invariati dalla v2)

```typescript
// ── Dish Validators ─────────────────────────────────────────

export const CreateDishSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  price: z.number().positive().max(9999.99).optional(),
  priceLabel: z.string().max(30).optional(),
  categoryId: z.string().cuid(),
  tags: z.array(z.nativeEnum(DishTag)).default([]),
  allergens: z.array(z.nativeEnum(Allergen)).default([]),
  isChefChoice: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  variants: z.array(z.object({
    label: z.string().min(1).max(30),
    price: z.number().positive().max(9999.99),
  })).max(5).default([]),
});

export const UpdateDishSchema = CreateDishSchema.partial();

// ── Category Validators ─────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  description: z.string().max(200).trim().optional(),
  icon: z.string().max(10).optional(),
  isVisible: z.boolean().default(true),
  restaurantId: z.string().cuid(),
});

// ── Restaurant Settings ─────────────────────────────────────

export const UpdateRestaurantSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  tagline: z.string().max(100).trim().optional(),
  slug: z.string()
    .min(3).max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini')
    .optional(),
  coverCharge: z.number().min(0).max(99.99).optional(),
  serviceNote: z.string().max(200).optional(),
  allergenNote: z.string().max(500).optional(),
});

// ── Upload Validators ───────────────────────────────────────

export const UploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 5 * 1024 * 1024, 'Massimo 5MB')
    .refine(
      f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Solo JPEG, PNG o WebP'
    ),
});
```

---

## 6. Struttura del Progetto

```
aifolly-menu/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                    # Dati di esempio per sviluppo
│   └── seed-presets.ts            # Seed dei temi preset
├── public/
│   ├── fonts/
│   ├── robots.txt
│   └── preset-thumbnails/         # Miniature dei temi preset
├── src/
│   ├── app/
│   │   ├── (menu)/                # Route group: menu pubblico
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx       # COPERTINA — pagina iniziale
│   │   │   │   ├── menu/
│   │   │   │   │   └── page.tsx   # MENU — pagina con categorie e piatti
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── not-found.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   └── opengraph-image.tsx
│   │   │   ├── preview/
│   │   │   │   └── [token]/       # ★ NUOVO: preview bozza via token temporaneo
│   │   │   │       ├── page.tsx   # Copertina bozza (con pulsante "Aggiorna")
│   │   │   │       └── menu/
│   │   │   │           └── page.tsx  # Menu bozza
│   │   │   └── layout.tsx
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── menu/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [dishId]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── theme/                     # ★ Theme Builder
│   │   │   │   ├── page.tsx
│   │   │   │   ├── cover/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── menu-style/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── dish-style/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── qrcode/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (super-admin)/                 # ★ NUOVO: Pannello Super Admin
│   │   │   ├── super/                     # URL: /super/*
│   │   │   │   ├── page.tsx               # Dashboard Super Admin (metriche piattaforma)
│   │   │   │   ├── tenants/
│   │   │   │   │   ├── page.tsx           # Lista ristoranti con filtri
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx       # Dettaglio ristorante + azioni
│   │   │   │   ├── plans/
│   │   │   │   │   ├── page.tsx           # Lista piani
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx       # Crea nuovo piano
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx       # Edit piano
│   │   │   │   ├── presets/
│   │   │   │   │   ├── page.tsx           # Lista temi preset
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx       # Crea nuovo preset
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx       # Edit preset (theme builder adattato)
│   │   │   │   ├── billing/
│   │   │   │   │   └── page.tsx           # Stato fatturazione e subscription
│   │   │   │   ├── audit-log/
│   │   │   │   │   └── page.tsx           # Registro azioni critiche
│   │   │   │   └── layout.tsx             # Layout Super Admin con sidebar dedicata
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── onboarding/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── restaurants/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   ├── dishes/
│   │   │   │   └── route.ts
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   ├── theme/                     # ★ Theme APIs
│   │   │   │   ├── route.ts
│   │   │   │   ├── draft/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── publish/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── presets/
│   │   │   │   │   └── route.ts
│   │   │   │   └── preview-token/
│   │   │   │       └── route.ts
│   │   │   ├── preview/
│   │   │   │   └── [token]/
│   │   │   │       └── route.ts
│   │   │   ├── fonts/
│   │   │   │   └── route.ts
│   │   │   ├── super/                     # ★ NUOVO: API Super Admin
│   │   │   │   ├── tenants/
│   │   │   │   │   ├── route.ts           # GET lista, POST crea
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── route.ts       # GET, PATCH, DELETE
│   │   │   │   │       ├── suspend/
│   │   │   │   │       │   └── route.ts   # POST sospendi, DELETE riattiva
│   │   │   │   │       ├── plan/
│   │   │   │   │       │   └── route.ts   # PATCH cambia piano
│   │   │   │   │       └── impersonate/
│   │   │   │   │           └── route.ts   # POST inizia, DELETE termina
│   │   │   │   ├── plans/
│   │   │   │   │   ├── route.ts           # GET, POST
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts       # GET, PATCH, DELETE
│   │   │   │   ├── presets/
│   │   │   │   │   ├── route.ts           # GET, POST (CRUD completo per Super Admin)
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts       # GET, PATCH, DELETE
│   │   │   │   ├── billing/
│   │   │   │   │   └── route.ts           # GET lista subscription aggregate
│   │   │   │   ├── audit-log/
│   │   │   │   │   └── route.ts           # GET con filtri
│   │   │   │   └── metrics/
│   │   │   │       └── route.ts           # GET metriche piattaforma
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts           # ★ NUOVO: webhook Stripe
│   │   │   ├── cron/
│   │   │   │   └── cleanup-preview-tokens/
│   │   │   │       └── route.ts           # ★ NUOVO: cleanup giornaliero
│   │   │   ├── revalidate/
│   │   │   │   └── route.ts
│   │   │   ├── invitations/
│   │   │   │   └── route.ts
│   │   │   └── sitemap/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── menu/                          # Componenti menu pubblico
│   │   │   ├── CoverPage.tsx              # ★ NUOVO: copertina full-screen
│   │   │   ├── MenuHeader.tsx
│   │   │   ├── CategoryNav.tsx
│   │   │   ├── DishCard.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── AllergenBadge.tsx
│   │   │   ├── MenuFooter.tsx
│   │   │   ├── MenuOffline.tsx
│   │   │   └── ThemeProvider.tsx           # ★ NUOVO: inietta CSS vars dal tema
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DishForm.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── QRGenerator.tsx
│   │   │   ├── OnboardingWizard.tsx
│   │   │   └── theme/                     # ★ NUOVO: componenti theme builder
│   │   │       ├── ThemeBuilderLayout.tsx  # Split panel (editor + mockup)
│   │   │       ├── CoverEditor.tsx        # Controlli livello copertina
│   │   │       ├── MenuStyleEditor.tsx    # Controlli livello menu
│   │   │       ├── DishStyleEditor.tsx    # Controlli livello piatti
│   │   │       ├── FontPicker.tsx         # Selettore Google Fonts
│   │   │       ├── ColorPicker.tsx        # Palette suggerite + picker libero
|   │   │       ├── PaletteSuggestions.tsx  # Palette armonizzate predefinite
│   │   │       ├── ContrastChecker.tsx    # Indicatore WCAG
│   │   │       ├── PresetGallery.tsx      # Galleria temi preset
│   │   │       ├── IPhoneMockup.tsx       # ★ Cornice iPhone 14 Pro (SVG)
│   │   │       ├── LivePreview.tsx        # Preview menu dentro il mockup
│   │   │       ├── MobilePreviewQR.tsx    # ★ QR code con token + rigenera
│   │   │       └── PublishBar.tsx         # Barra "Pubblica" / "Scarta bozza"
│   │   ├── super-admin/                    # ★ NUOVO: componenti Super Admin
│   │   │   ├── SuperAdminSidebar.tsx       # Sidebar dedicata (diversa dall'admin)
│   │   │   ├── TenantList.tsx              # Tabella ristoranti con filtri e paginazione
│   │   │   ├── TenantDetail.tsx            # Dettaglio ristorante + azioni
│   │   │   ├── TenantActions.tsx           # Modal sospendi/cambia piano/impersona
│   │   │   ├── PlanForm.tsx                # Form creazione/modifica piano
│   │   │   ├── PresetForm.tsx              # Form creazione/modifica preset (riusa theme builder)
│   │   │   ├── BillingTable.tsx            # Tabella subscription Stripe aggregate
│   │   │   ├── AuditLogTable.tsx           # Tabella audit log con filtri
│   │   │   ├── MetricsDashboard.tsx        # Dashboard metriche piattaforma (grafici)
│   │   │   ├── ImpersonationBanner.tsx     # Banner visibile quando Super Admin impersona
│   │   │   └── ConfirmDestructiveAction.tsx # Modal con conferma testuale per azioni irreversibili
│   │   └── ui/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── utils.ts
│   │   ├── validators/
│   │   │   ├── theme.ts                   # ★ Schema Zod temi + contrast checker
│   │   │   ├── dish.ts
│   │   │   ├── category.ts
│   │   │   ├── restaurant.ts
│   │   │   └── upload.ts
│   │   ├── theme-presets.ts               # ★ Definizione preset (JSON)
│   │   ├── google-fonts.ts                # ★ Client API Google Fonts
│   │   ├── theme-to-css.ts                # ★ Converte FullTheme → CSS variables
│   │   ├── rate-limit.ts
│   │   └── analytics.ts
│   ├── hooks/
│   │   ├── useThemeEditor.ts              # ★ State management editor tema
│   │   └── useFontLoader.ts              # ★ Caricamento dinamico font
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── __tests__/
│   ├── components/
│   ├── api/
│   ├── lib/
│   │   └── contrast-checker.test.ts       # ★ Test WCAG
│   └── e2e/
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 7. API Endpoints

Tutte le API sono sotto `/api/`. Le rotte admin richiedono autenticazione via NextAuth session.

### 7.1 Menu pubblico (no auth)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/menu/[slug]` | Ritorna il menu completo: info ristorante + tema live (3 livelli) + categorie + piatti |

**Response `GET /api/menu/osteria-del-porto`:**

```json
{
  "restaurant": {
    "name": "Osteria del Porto",
    "slug": "osteria-del-porto",
    "tagline": "Cucina di mare dal 1987",
    "description": "Pesce fresco ogni giorno dal porto di Brindisi",
    "logoUrl": "https://...",
    "coverCharge": 2.50,
    "allergenNote": "Informare il personale per eventuali allergie o intolleranze."
  },
  "theme": {
    "cover": {
      "backgroundColor": "#FAFAF8",
      "titleFont": { "family": "Cormorant Garamond", "weight": "400", "style": "italic", "size": 40, "..." : "..." },
      "titleColor": "#1a1a18",
      "descriptionFont": { "..." : "..." },
      "descriptionColor": "#6b6358",
      "ctaText": "Scopri il menu",
      "showOrnament": true,
      "ornamentColor": "#c9b97a"
    },
    "menu": {
      "backgroundColor": "#FAFAF8",
      "sectionHeaderFont": { "..." : "..." },
      "cardBackgroundColor": "#FFFFFF",
      "navActiveColor": "#c9b97a"
    },
    "dish": {
      "nameFont": { "..." : "..." },
      "nameColor": "#1a1a18",
      "descriptionFont": { "..." : "..." },
      "descriptionColor": "#6b6358",
      "priceColor": "#c9b97a"
    }
  },
  "categories": [
    {
      "id": "...",
      "name": "Antipasti",
      "slug": "antipasti",
      "sortOrder": 0,
      "dishes": [ "..." ]
    }
  ]
}
```

### 7.2 Admin — Tema (★ NUOVO)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/theme` | Tema live corrente (3 livelli) |
| `GET` | `/api/theme/draft` | Bozza tema (null se nessuna modifica pending) |
| `PATCH` | `/api/theme/draft` | Salva bozza tema (parziale: solo livelli modificati) |
| `DELETE` | `/api/theme/draft` | Scarta bozza (ripristina tema live) |
| `POST` | `/api/theme/publish` | Pubblica bozza → diventa tema live |
| `GET` | `/api/theme/presets` | Lista preset disponibili con thumbnail |
| `POST` | `/api/theme/presets/apply` | Applica un preset come bozza |
| `POST` | `/api/theme/preview-token` | Genera nuovo token preview mobile (1h scadenza) |
| `GET` | `/api/theme/preview-token/current` | Recupera token corrente valido, o null se scaduto |
| `GET` | `/api/preview/[token]` | **Pubblico con token**: ritorna bozza tema + menu per la preview mobile |

**Flusso pubblicazione:**
1. Il ristoratore modifica il tema nell'editor → le modifiche vengono salvate come bozza (`themeCoverDraft`, `themeMenuDraft`, `themeDishDraft`)
2. La preview live mostra la bozza, il menu pubblico continua a mostrare il tema live
3. Click su "Pubblica" → `POST /api/theme/publish` → copia i campi draft nei campi live, svuota i draft, chiama `revalidatePath`
4. Click su "Scarta modifiche" → `DELETE /api/theme/draft` → elimina i draft

**Flusso preview mobile via QR:**
1. All'apertura del theme builder, il client chiama `POST /api/theme/preview-token` → genera nuovo `PreviewToken` con scadenza a 1 ora e lo restituisce
2. Il QR code viene generato client-side con URL `https://menu.aifolly.com/preview/{token}`
3. Il ristoratore inquadra il QR dal suo telefono → atterra sulla pagina preview
4. La pagina preview chiama `GET /api/preview/{token}` → verifica token valido + non scaduto → ritorna la bozza corrente (o il tema live se la bozza è vuota) insieme ai dati del menu
5. Sul telefono è presente un pulsante **"Aggiorna"** che rifà la chiamata per visualizzare le ultime modifiche salvate come bozza
6. Se il token scade mentre il ristoratore sta ancora lavorando, nel theme builder appare un banner **"QR scaduto"** con pulsante **"Rigenera"** che chiama di nuovo `POST /api/theme/preview-token` e aggiorna il QR visualizzato
7. I token scaduti vengono rimossi da un cleanup job giornaliero (cron su Vercel)

### 7.3 Admin — Font (★ NUOVO)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/fonts?search=cormorant&category=serif` | Lista Google Fonts filtrata (cachata 24h lato server) |

La risposta include per ogni font: nome, categorie, pesi disponibili, e URL preview.

### 7.4 Admin — Ristorante

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/restaurants/[id]` | Dettaglio ristorante |
| `PATCH` | `/api/restaurants/[id]` | Aggiorna info ristorante (senza tema — il tema ha le sue API) |

### 7.5 Admin — Categorie

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/categories?restaurantId=xxx` | Lista categorie |
| `POST` | `/api/categories` | Crea categoria |
| `PATCH` | `/api/categories/[id]` | Aggiorna categoria |
| `DELETE` | `/api/categories/[id]` | Elimina categoria |
| `PATCH` | `/api/categories/reorder` | Riordina categorie (drag & drop) |

### 7.6 Admin — Piatti

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/dishes?categoryId=xxx` | Lista piatti per categoria |
| `POST` | `/api/dishes` | Crea piatto |
| `PATCH` | `/api/dishes/[id]` | Aggiorna piatto |
| `DELETE` | `/api/dishes/[id]` | Elimina piatto |
| `PATCH` | `/api/dishes/[id]/availability` | Toggle disponibilità |
| `PATCH` | `/api/dishes/reorder` | Riordina piatti |

### 7.7 Admin — Upload

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload immagine → Cloudinary (max 5MB, JPEG/PNG/WebP) |

### 7.8 Admin — Inviti

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/invitations` | Invita collaboratore |
| `GET` | `/api/invitations/accept?token=xxx` | Accetta invito |
| `DELETE` | `/api/invitations/[id]` | Revoca invito |

### 7.9 Cache, Auth, SEO

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/revalidate` | On-demand ISR dopo pubblicazione tema o modifica menu |
| `POST` | `/api/auth/[...nextauth]` | NextAuth handlers |
| `POST` | `/api/auth/register` | Registrazione |
| `POST` | `/api/auth/forgot-password` | Reset password |
| `GET` | `/api/sitemap` | Sitemap XML dinamica |

---

## 8. Frontend — Menu Pubblico

### 8.1 Copertina (pagina separata)

La copertina è la prima pagina che il cliente vede dopo la scansione del QR code. URL: `/{slug}`. È una pagina full-screen (100vh) con un solo CTA per entrare nel menu.

**Componente `CoverPage.tsx`:**
- Sfondo: colore solido oppure immagine con overlay semitrasparente (configurabile)
- Logo centrato (dimensione configurabile, max 200px altezza)
- Nome ristorante nel font e colore personalizzati
- Descrizione/tagline nel font e colore personalizzati
- Ornamento decorativo opzionale (colore configurabile)
- Pulsante CTA "Scopri il menu" (testo, font e colore configurabili) → naviga a `/{slug}/menu`
- Animazione di ingresso: fade-in sequenziale (logo → nome → tagline → CTA)
- Allineamento contenuto configurabile (center/left/right)

**Applicazione tema:**
Il componente `ThemeProvider` legge il tema dal JSON API e inietta CSS variables nel DOM. Ogni proprietà del tema diventa una variabile CSS:

```typescript
// src/lib/theme-to-css.ts
export function themeToCSSVars(theme: FullTheme): Record<string, string> {
  return {
    // Copertina
    '--cover-bg': theme.cover.backgroundColor,
    '--cover-title-font': theme.cover.titleFont.family,
    '--cover-title-size': `${theme.cover.titleFont.size}px`,
    '--cover-title-weight': theme.cover.titleFont.weight,
    '--cover-title-style': theme.cover.titleFont.style,
    '--cover-title-color': theme.cover.titleColor,
    '--cover-title-spacing': `${theme.cover.titleFont.letterSpacing}px`,
    '--cover-title-transform': theme.cover.titleFont.textTransform,
    // ... tutte le altre proprietà
  };
}
```

### 8.2 Menu (pagina piatti)

URL: `/{slug}/menu`. Il cliente arriva qui dopo il tap sulla copertina.

**Design System — valori di default** (sovrascrivibili dal tema personalizzato):

```
Background principale:  var(--menu-bg, #FAFAF8)
Card background:        var(--card-bg, #FFFFFF)
Testo principale:       var(--dish-name-color, #1a1a18)
Testo soft:             var(--dish-desc-color, #6b6358)
Accento:                var(--menu-nav-active, #c9b97a)

Max width menu:    480px (centrato)
Padding laterale:  24px
```

**Componenti principali** (tutti leggono lo stile dalle CSS variables iniettate dal tema):

**MenuHeader** — Header con nome e tagline (styling da `themeMenu.sectionHeaderFont`)

**CategoryNav** — Navigazione categorie sticky:
- Font, colore testo e colore attivo dal tema
- Stile indicatore configurabile (underline/pill/dot/none)
- Sfondo nav dal tema
- Scroll spy con IntersectionObserver

**FilterBar** — Filtri rapidi:
- Colori pill dal tema (`filterPillColor`, `filterPillActiveTextColor`)
- Toggle multipli (AND logic)

**DishCard** — Card piatto (stile uniforme per tutti i piatti, dal livello 3 del tema):
- Font/colore/peso nome piatto → da `themeDish.nameFont` e `nameColor`
- Font/colore/peso descrizione → da `themeDish.descriptionFont` e `descriptionColor`
- Font/colore prezzo → da `themeDish.priceFont` e `priceColor`
- Layout card → da `themeMenu.cardStyle`, `cardBorderRadius`, `cardImageSize`
- Separatore → da `themeDish.separatorStyle` e `separatorColor`
- Badge tag → da `themeDish.tagBorderColor` e `tagTextColor`
- Chef's choice → da `themeDish.chefChoiceColor`
- Supporto varianti prezzo
- Click per espandere allergeni

**MenuFooter** — Footer con info servizio:
- Colori dal tema (`footerBackgroundColor`, `footerTextColor`, `footerAccentColor`)
- "Powered by AiFolly" (rimovibile con piano Pro)

### 8.3 Caricamento font dinamico

Il menu pubblico carica solo i font usati dal tema del ristorante. Il componente `ThemeProvider` gestisce il caricamento:

```typescript
// src/hooks/useFontLoader.ts
export function useFontLoader(theme: FullTheme) {
  useEffect(() => {
    // Colleziona tutti i font family unici dai 3 livelli
    const fonts = new Set<string>();
    fonts.add(theme.cover.titleFont.family);
    fonts.add(theme.cover.descriptionFont.family);
    fonts.add(theme.cover.ctaFont.family);
    fonts.add(theme.menu.sectionHeaderFont.family);
    fonts.add(theme.menu.navFont.family);
    fonts.add(theme.dish.nameFont.family);
    fonts.add(theme.dish.descriptionFont.family);
    fonts.add(theme.dish.priceFont.family);
    // ... altri

    // Costruisci URL Google Fonts con solo i font necessari
    const familyParams = Array.from(fonts)
      .map(f => `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500`)
      .join('&');

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => { document.head.removeChild(link); };
  }, [theme]);
}
```

### 8.4 Interazioni e animazioni

- **Fade-in sfalsato**: ogni DishCard appare con delay progressivo (0.07s × index)
- **Scroll spy**: IntersectionObserver con threshold 0.15 e rootMargin negativo
- **Expand/collapse allergeni**: animazione revealDown (opacity + max-height)
- **Hover immagine**: scale(1.06) con cubic-bezier(.16,1,.3,1)
- **Sticky nav**: blur backdrop + bordo sottile che appare dopo scroll
- **Grain texture overlay**: opzionale, controllato da `themeMenu.showGrainTexture`
- **Transizione copertina → menu**: fade-out copertina + navigazione client-side

### 8.5 Performance

- `next/image` con Cloudinary loader per WebP e resize automatico
- SSG con `revalidate: 60` + on-demand revalidation post-pubblicazione tema
- Font preload per il font principale della copertina (il primo che il cliente vede)
- Lazy loading immagini piatti sotto la fold
- Bundle target: < 100KB JS iniziale (esclusi font)
- Service worker per offline graceful
- Google Fonts caricati con `display=swap` per evitare blocco rendering

### 8.6 Gestione errori

- **Error boundary** (`error.tsx`): UI elegante con messaggio "Menu temporaneamente non disponibile"
- **Immagini non caricate**: fallback a placeholder SVG
- **Font non caricato**: fallback stack (serif o sans-serif di sistema)
- **Connessione instabile**: retry con backoff esponenziale (1s, 2s, 4s)
- **404 ristorante**: pagina personalizzata

---

## 9. Frontend — Theme Builder (Pannello Admin)

Il theme builder è la feature principale dell'admin. È un editor visuale split-panel con anteprima live.

### 9.1 Layout split panel

```
┌─────────────────────────────────────────────────────────────┐
│  Tab: Copertina | Menu | Piatti                [Pubblica ▶] │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│   PANNELLO EDITOR    │     PREVIEW IN MOCKUP iPHONE         │
│   (scrollabile)      │                                      │
│                      │      ╭─────────────╮                 │
│   ┌──────────────┐   │      │ ▬▬ notch ▬▬ │                 │
│   │ Sfondo       │   │      │ ┌─────────┐ │                 │
│   │ [Palette]    │   │      │ │ Menu    │ │                 │
│   │ [Color pick] │   │      │ │ preview │ │                 │
│   ├──────────────┤   │      │ │ live    │ │                 │
│   │ Font titolo  │   │      │ │         │ │                 │
│   │ [Font pick]  │   │      │ │ (scroll │ │                 │
│   │ Size: [—|+]  │   │      │ │  vert.) │ │                 │
│   │ Weight: [▼]  │   │      │ └─────────┘ │                 │
│   │ Color: [■]   │   │      │   ─────     │                 │
│   ├──────────────┤   │      ╰─────────────╯                 │
│   │ ⚠️ Contrasto │   │                                      │
│   │ checks       │   │    ┌─── Prova sul tuo telefono ──┐   │
│   └──────────────┘   │    │  ▓▓▓▓▓▓▓▓▓  Inquadra il QR  │   │
│                      │    │  ▓ QR   ▓  dal tuo cellulare │   │
│                      │    │  ▓▓▓▓▓▓▓▓▓                  │   │
│                      │    │  Scade tra: 58 min [↻]      │   │
│                      │    └─────────────────────────────┘   │
├──────────────────────┴──────────────────────────────────────┤
│  Bozza salvata alle 14:32  •  Scarta modifiche              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Pannello editor — Controlli per livello

**Tab "Copertina":**
- Sfondo: palette suggerite + color picker
- Immagine sfondo: upload (opzionale) + slider opacity overlay
- Logo: toggle mostra/nascondi + slider dimensione
- Font titolo: FontPicker + size slider + weight select + style toggle (italic) + letter-spacing + text-transform
- Colore titolo: palette + picker
- Font descrizione: stessi controlli
- Colore descrizione: palette + picker
- Testo CTA: input testo + font + colore + colore bordo
- Ornamento: toggle + colore
- Allineamento: center / left / right

**Tab "Menu":**
- Sfondo menu: palette + picker
- Header sezione: font + colore + stile divisore (line/dotted/ornament/none) + colore divisore
- Navigazione: font + colore testo + colore attivo + stile indicatore (underline/pill/dot/none) + sfondo
- Card: sfondo + bordo + border-radius slider + stile (elevated/flat/bordered/minimal) + toggle immagini + dimensione e raggio immagine
- Filtri: colore pill + colore testo + colore testo attivo
- Footer: sfondo + colore testo + colore accento
- Effetti: toggle grain texture + opacity slider

**Tab "Piatti":**
- Nome piatto: font + colore + weight + size + letter-spacing + transform
- Descrizione: font + colore + weight + size + letter-spacing
- Prezzo: font + colore + weight + size
- Tag/badge: colore bordo + colore testo + font
- Separatore: stile (dashed/solid/dotted/none) + colore
- Chef's choice: colore indicatore
- Allergeni: colore testo

### 9.3 Preview live — Mockup iPhone 14 Pro

La preview è racchiusa in un **mockup realistico di iPhone 14 Pro** (con notch, bordi arrotondati, cornice in titanio). Il mockup dà al ristoratore la percezione immediata di come apparirà il menu sullo smartphone del cliente.

**Mockup iPhone 14 Pro:**
- Componente `IPhoneMockup.tsx` — SVG scalabile con cornice realistica (angoli 55px, notch Dynamic Island, bordi titanio grigio scuro)
- Dimensioni schermo interne: 393×852 px (proporzioni reali iPhone 14 Pro)
- Safe area superiore di 59px per il notch
- Barra inferiore (home indicator) renderizzata come sottile linea arrotondata
- Il contenuto del menu scorre verticalmente all'interno dello schermo (scrollbar nascosta)
- Scala responsive: sui laptop più piccoli il mockup si riduce proporzionalmente mantenendo l'aspect ratio

**Componente `LivePreview.tsx` dentro il mockup:**
- Renderizza il menu con i dati reali del ristorante, applicando la bozza del tema in tempo reale
- Non è un iframe ma un componente React inline che condivide lo state con l'editor
- Ogni modifica nell'editor aggiorna lo state locale immediatamente (no debounce sulla preview visuale)
- La preview mostra la **copertina** se il tab attivo è "Copertina", il **menu** se il tab attivo è "Menu" o "Piatti"
- Toggle in alto al mockup: `[Copertina] [Menu]` per passare tra le due viste indipendentemente dal tab editor
- I dati del menu vengono fetchati una volta e riutilizzati
- Se il ristorante non ha ancora piatti, la preview usa dati placeholder (3 piatti finti con nomi tipo "Piatto di esempio")

**Auto-save bozza:**
- Le modifiche vengono salvate come bozza ogni 3 secondi (debounced) via `PATCH /api/theme/draft`
- Indicatore "Bozza salvata alle HH:MM" nel footer
- Se l'utente chiude il browser, la bozza è preservata e ripristinata alla riapertura

### 9.4 Preview sul dispositivo mobile reale (QR code)

Sotto il mockup iPhone, nel pannello di destra, è presente una sezione **"Prova sul tuo telefono"** che mostra un QR code. Il ristoratore può inquadrarlo dal suo cellulare per visualizzare la bozza del tema sul dispositivo reale, in condizioni reali di utilizzo.

**Perché serve:** il mockup dentro il browser è utile ma non sostituisce il rendering reale su un dispositivo fisico. Font, contrasto, dimensioni tocco e performance variano tra desktop e mobile. Questa feature permette di testare subito su un device vero, senza pubblicare le modifiche.

**Componente `MobilePreviewQR.tsx`:**

```
┌─────────────────────────────────────┐
│  Prova sul tuo telefono             │
│                                     │
│       ████████████████              │
│       ██ ▄▄▄ █ █▀█ ██               │
│       ██ █ █ █ ▄▀▀ ██               │
│       ██ ▀▀▀ █ ▀█▄ ██               │
│       ████████████████              │
│                                     │
│  Inquadra il QR dal tuo cellulare   │
│  per vedere le modifiche dal vivo   │
│                                     │
│  ⏱ Scade tra 58 min                 │
│  [↻ Rigenera QR]                    │
└─────────────────────────────────────┘
```

**Funzionalità:**
- Il QR punta a `https://menu.aifolly.com/preview/{token}` dove `{token}` è un token opaco temporaneo
- Il token viene generato all'apertura del theme builder via `POST /api/theme/preview-token`
- **Durata token: 1 ora dalla generazione**
- **Nuovo token ad ogni apertura** del theme builder (la precedente sessione non è più valida)
- Countdown live del tempo rimanente ("Scade tra 58 min", "Scade tra 12 min", "Scade tra 30 sec")
- Quando il countdown raggiunge 0, il QR viene sostituito da un messaggio **"QR scaduto"** e il pulsante "Rigenera" diventa l'unica azione disponibile
- **Rigenerazione manuale sempre disponibile**: il pulsante `[↻ Rigenera QR]` è cliccabile in qualsiasi momento (anche prima della scadenza) e chiama di nuovo `POST /api/theme/preview-token` — genera un nuovo token, invalida il precedente e aggiorna il QR visualizzato

**Pagina preview sul telefono (`/preview/[token]`):**

Quando il ristoratore scansiona il QR dal suo telefono, atterra su una pagina che:

1. Al mount chiama `GET /api/preview/{token}` per recuperare la bozza del tema corrente + dati del menu
2. Se il token è **valido**: renderizza la copertina del menu con il tema bozza applicato
3. Se il token è **scaduto o non valido**: mostra schermata di errore con messaggio "Questa anteprima è scaduta. Torna al theme builder sul computer per generare un nuovo QR."
4. Include una **barra fissa in basso** con due elementi:
   - Etichetta "Anteprima bozza" (sempre visibile, per non confondere con il menu pubblicato)
   - Pulsante **"↻ Aggiorna"** che rifà `GET /api/preview/{token}` e ricarica la pagina con i dati più recenti
5. La navigazione copertina → menu funziona normalmente (il token viene mantenuto nell'URL come query param o nella path)
6. **Importante**: questa pagina non è indicizzabile (`noindex, nofollow` nei meta tag) e non appare nella sitemap

**Differenze tra la pagina preview e il menu pubblico:**

| Caratteristica | Menu pubblico (`/slug`) | Preview (`/preview/token`) |
|---|---|---|
| Autenticazione | Nessuna | Token valido richiesto |
| Tema mostrato | Tema live | Bozza (fallback a live se vuota) |
| Caching | ISR 60s | No cache (sempre fresco) |
| Indicizzabile | Sì | No (`noindex`) |
| Barra "Anteprima + Aggiorna" | No | Sì |
| Analytics | Sì | No |

**Sicurezza e rate limiting:**
- Il token è un cuid opaco (non prevedibile)
- `GET /api/preview/{token}` verifica che il token esista, non sia scaduto, e che il ristorante associato sia attivo
- Rate limiting sull'endpoint preview: 60 req/min per token (più permissivo del menu pubblico, considerando che l'utente potrebbe premere "Aggiorna" ripetutamente)
- Cleanup automatico dei token scaduti via cron job giornaliero su Vercel (`/api/cron/cleanup-preview-tokens`)
- Il token viene invalidato immediatamente quando si rigenera uno nuovo dalla stessa sessione

### 9.5 Flusso "Pubblica"

1. Il ristoratore modifica il tema nel builder → modifiche salvate come bozza
2. La preview mostra l'effetto delle modifiche in tempo reale
3. La barra in alto mostra "Hai modifiche non pubblicate" con i pulsanti:
   - **"Pubblica"** → conferma modale → `POST /api/theme/publish` → tema live aggiornato → revalidation → toast "Tema pubblicato!"
   - **"Scarta modifiche"** → conferma modale → `DELETE /api/theme/draft` → ripristina preview al tema live corrente
4. Finché le modifiche non sono pubblicate, il menu visto dai clienti resta invariato

### 9.6 Flusso "Scegli preset"

Accessibile dalla pagina principale del theme builder (`/admin/theme`):
1. Galleria dei preset disponibili con miniature preview
2. Click su un preset → modale con preview full-size
3. "Applica questo tema" → `POST /api/theme/presets/apply` → il preset viene copiato come bozza
4. L'utente viene portato al tab "Copertina" per personalizzare
5. Ogni modifica parte dal preset come base

### 9.7 Componente FontPicker

```
┌────────────────────────────────────────┐
│ 🔍 Cerca font...                       │
├────────────────────────────────────────┤
│ [Serif] [Sans] [Display] [Handwriting] │
├────────────────────────────────────────┤
│ ★ Recenti                              │
│   Cormorant Garamond    Aa Bb Cc       │
│   Outfit                Aa Bb Cc       │
├────────────────────────────────────────┤
│ 📈 Popolari                            │
│   Playfair Display      Aa Bb Cc       │
│   Lato                  Aa Bb Cc       │
│   Montserrat            Aa Bb Cc       │
├────────────────────────────────────────┤
│ Tutti                                   │
│   Abel                  Aa Bb Cc       │
│   Abril Fatface         Aa Bb Cc       │
│   ...                   (virtualizzato)│
└────────────────────────────────────────┘

Sotto la selezione:
┌────────────────────────────────────────┐
│ Peso: [Light ▼]  Stile: [Normale | I] │
│ Size: [◀ 19px ▶]                       │
│ Spaziatura: [◀ 0px ▶]                  │
│ Altezza riga: [◀ 1.3 ▶]               │
│ Trasforma: [Nessuna ▼]                 │
└────────────────────────────────────────┘
```

- Lista font virtualizzata (`react-window`) per performance con ~1500 font
- Ogni font mostra "Aa Bb Cc" renderizzato nel font stesso (caricato on-demand)
- Ricerca fuzzy per nome
- Filtro per categoria (Serif, Sans-Serif, Display, Handwriting, Monospace)
- Sezione "Recenti" mostra gli ultimi 5 font usati dall'utente (salvati in localStorage)
- Sezione "Popolari" mostra i 20 font più usati sulla piattaforma
- Dopo la selezione del font, appaiono i controlli per peso, stile, dimensione, ecc.

### 9.8 Componente ColorPicker

```
┌────────────────────────────────────────┐
│ Palette suggerite:                     │
│  [■■■■■] [■■■■■] [■■■■■] [■■■■■]     │
│  Avorio   Terra   Notte   Corallo     │
├────────────────────────────────────────┤
│ Colore personalizzato:                 │
│  ┌──────────────┐  #c9b97a            │
│  │  Color wheel  │  ───────            │
│  │              │  [Copia] [Incolla]  │
│  └──────────────┘                      │
├────────────────────────────────────────┤
│ Contrasto con sfondo: 4.8:1 ✅ AA      │
└────────────────────────────────────────┘
```

- Palette suggerite in alto: click applica il colore scelto
- Color picker completo sotto: hue wheel + saturation/brightness
- Input HEX editabile con validazione
- Indicatore contrasto inline (se il colore è per testo)

---

## 10. Frontend — Altre funzionalità Admin

### 10.1 Dashboard

- Riepilogo: numero piatti, categorie, utilizzo piano
- QR code del ristorante con download PNG/SVG
- Link diretto al menu pubblico (copertina)
- Anteprima miniatura del tema corrente
- Analytics di base (se piano lo prevede)

### 10.2 Gestione Menu

- Lista categorie con drag & drop per riordinare
- Lista piatti per categoria, drag & drop per riordinare
- Toggle rapido disponibilità piatto
- Form piatto completo: nome, descrizione, prezzo, varianti, foto, categoria, tag, allergeni, chef's choice
- Duplicate rapido piatto

### 10.3 Onboarding Wizard

Flusso step-by-step per nuovi ristoranti:

1. **Info base**: nome ristorante, città, tagline → auto-genera slug
2. **Scegli tema**: galleria preset con preview → seleziona preset
3. **Logo**: upload logo (opzionale)
4. **Prima categoria + primo piatto**: form semplificato
5. **Anteprima**: preview della copertina + menu con il preset scelto e il piatto inserito
6. **QR code**: generazione e download

### 10.4 UI Admin

- shadcn/ui per tutti i componenti
- Sidebar con link a: Dashboard, Menu, Categorie, **Tema** (★), Impostazioni, QR Code
- Breadcrumb navigation
- Toast notifications
- Modale conferma per azioni distruttive

---

## 11. Pannello Super Admin

Il Super Admin gestisce l'intera piattaforma AiFolly: tenant, piani, temi preset, fatturazione. Usa la **stessa applicazione Next.js** degli admin ristoratori (Opzione A: single app, route group separato), distinguendosi per URL, sidebar e permessi.

### 11.1 Architettura e URL

Il pannello Super Admin vive sotto la URL path `/super/*` all'interno della stessa app Next.js. Esempi:
- `/super` — dashboard metriche
- `/super/tenants` — lista ristoranti
- `/super/tenants/cl123xyz` — dettaglio di un ristorante specifico
- `/super/plans` — gestione piani
- `/super/presets` — gestione temi preset
- `/super/billing` — fatturazione
- `/super/audit-log` — log azioni critiche

La separazione tra pannello admin (`/admin/*`) e pannello super (`/super/*`) è gestita tramite route group Next.js: `(admin)` e `(super-admin)`. Ogni route group ha il proprio `layout.tsx` con sidebar diversa.

### 11.2 Middleware di protezione

Il middleware Next.js (`middleware.ts`) verifica che l'utente abbia ruolo `SUPER_ADMIN` prima di permettere l'accesso a qualsiasi URL sotto `/super/*` o a qualsiasi API sotto `/api/super/*`. Se un utente con ruolo `OWNER` o `MANAGER` tenta di accedere, riceve un 403 Forbidden e viene reindirizzato al proprio dashboard admin.

```typescript
// middleware.ts — estratto della logica Super Admin
if (pathname.startsWith('/super') || pathname.startsWith('/api/super')) {
  const token = await getToken({ req });
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  
  // Verifica ruolo: deve essere presente in almeno un UserRestaurant con ruolo SUPER_ADMIN
  // (oppure, più semplice, avere il ruolo SUPER_ADMIN direttamente nel token JWT)
  if (!token.roles?.includes('SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

**Importante:** il ruolo Super Admin non è legato a un ristorante specifico. Un `SUPER_ADMIN` non appartiene a nessun `UserRestaurant` — è un utente "globale" della piattaforma. Per identificarlo nella sessione, si usa un flag `isSuperAdmin: boolean` nel token JWT di NextAuth, popolato al login verificando se esiste almeno un record `UserRestaurant` con ruolo `SUPER_ADMIN` per quell'utente.

**Alternativa più pulita:** aggiungere al modello `User` un campo `isSuperAdmin Boolean @default(false)` separato dai `UserRestaurant`, in modo che il Super Admin sia un concetto globale e non una relazione con un ristorante fittizio. Questa è la scelta consigliata per la v1.

### 11.3 Sezioni del pannello Super Admin

**Dashboard (`/super`)** — Metriche aggregate della piattaforma:
- Numero totale ristoranti (attivi / sospesi / non pubblicati)
- Nuovi tenant ultimi 7 / 30 / 90 giorni
- MRR (Monthly Recurring Revenue) calcolato dai dati Stripe
- Distribuzione per piano (Free / Pro / Business) con percentuali
- Scansioni QR totali della piattaforma (aggregato da PostHog)
- Top 10 tenant più attivi (per scansioni QR)
- Grafico trend registrazioni ultimi 30 giorni

**Tenant (`/super/tenants`)** — Lista e gestione ristoranti:
- Tabella paginata con colonne: nome, slug, città, piano, stato (attivo/sospeso/non pubblicato), data registrazione, ultima attività
- Filtri: per piano, per stato, per periodo registrazione
- Ricerca per nome o slug
- Click su riga → dettaglio ristorante
- Dettaglio ristorante include: info complete, lista utenti associati con ruoli, utilizzo corrente vs limiti piano (es. "12/20 piatti"), ultima pubblicazione tema, cronologia azioni (dall'audit log)
- **Azioni disponibili** (tutte loggate in audit log):
  - Sospendere tenant (modal con campo obbligatorio "motivo sospensione") → setta `isSuspended = true`, `suspendedAt`, `suspendedReason`. Il menu pubblico del ristorante sospeso mostra una pagina "Ristorante temporaneamente non disponibile"
  - Riattivare tenant → setta `isSuspended = false`, pulisce `suspendedAt` e `suspendedReason`
  - Cambiare piano manualmente → apre modal con dropdown piani, conferma → aggiorna `planId`
  - Impersonare OWNER → crea record `SuperAdminImpersonation`, cambia temporaneamente la sessione (con banner visibile "Stai impersonando Mario Rossi — [Termina impersonazione]")
  - Eliminare tenant → conferma con doppio step (digitare il nome del ristorante per conferma) → cascata delete di tutti i dati

**Piani (`/super/plans`)** — CRUD sui record `Plan`:
- Lista piani attivi e disattivati
- Creazione nuovo piano con form: nome, slug, limiti (maxDishes, maxCategories, maxImages), feature flag (customTheme, googleFonts, removeBranding, analytics), prezzi mensile/annuale
- Modifica piano esistente (non permette di ridurre limiti se ci sono tenant che li stanno già superando — mostra warning)
- Disattivazione piano (soft delete): i tenant esistenti mantengono il piano, ma i nuovi non possono sceglierlo
- Eliminazione hard: permessa solo se nessun tenant ha quel piano

**Temi Preset (`/super/presets`)** — CRUD sui record `ThemePreset`:
- Lista preset con thumbnail, nome, categoria, stato (attivo/disattivato)
- Creazione nuovo preset: riusa il theme builder in modalità "editor preset" (senza target restaurant — lavora direttamente sulla configurazione del preset)
- Modifica preset esistente: stesso theme builder. **Nota:** modificare un preset non impatta i ristoranti che l'hanno già applicato, perché quando un ristoratore sceglie un preset la configurazione viene copiata nella bozza (come spiegato nella sezione 9.6)
- Upload thumbnail per la galleria (screenshot preview 400×800 px)
- Riordinamento drag & drop (per cambiare l'ordine in cui appaiono nella galleria)
- Toggle attivo/disattivato
- Eliminazione preset

**Fatturazione (`/super/billing`)** — Vista aggregata:
- Tabella ristoranti con subscription attive: nome, piano, stato Stripe (`active`, `trialing`, `past_due`, `canceled`), prossima fattura, importo
- Filtri per stato subscription
- Tenant con pagamenti in ritardo evidenziati in rosso (`past_due`)
- Link diretto alla subscription nel dashboard Stripe (per azioni avanzate tipo rimborsi)
- Export CSV della lista (per il commercialista)
- **Nota:** tutte le operazioni di fatturazione complesse (rimborsi, modifiche subscription, gestione metodi di pagamento) avvengono nel dashboard Stripe. Il pannello Super Admin è solo una vista aggregata. Questo riduce drasticamente la complessità e gli errori.

**Audit Log (`/super/audit-log`)** — Registro azioni critiche:
- Tabella paginata con tutte le entry `AuditLog`
- Filtri: per azione (enum), per actor (email), per ristorante, per periodo
- Ricerca full-text nel campo metadata
- Export CSV (per compliance GDPR)
- Le entry più recenti in cima
- Click su entry → dettaglio con tutti i campi, metadata JSON formattato, IP e user-agent

### 11.4 Impersonazione

L'impersonazione permette al Super Admin di vedere la piattaforma dal punto di vista di un OWNER, utile per:
- Debug di problemi segnalati dal cliente
- Verificare che una configurazione funzioni come atteso
- Fornire supporto visivo ("vedo il tuo menu e capisco il problema")

**Flusso:**
1. Super Admin apre dettaglio tenant → click "Impersona"
2. Modal obbligatorio con campo "Motivo impersonazione" (es. "Debug ticket #456 — cliente segnala tema non applicato")
3. Conferma → crea record `SuperAdminImpersonation` con `startedAt`, `reason`, IDs
4. La sessione del Super Admin cambia: ora ha accesso al pannello `/admin/*` del ristorante target come se fosse l'OWNER
5. Un **banner arancione fisso in alto** è visibile su tutte le pagine durante l'impersonazione: "⚠️ Stai impersonando [Nome Utente] — [Termina impersonazione]"
6. Tutte le azioni fatte durante l'impersonazione vengono loggate nell'audit log con il Super Admin come actor (non l'utente impersonato) più un metadata `impersonating: true, targetUserId: xxx`
7. Click su "Termina impersonazione" → imposta `endedAt` nel record, ripristina la sessione normale del Super Admin

**Limiti durante l'impersonazione:**
- Il Super Admin impersonatore può vedere tutto ma **non può pubblicare il tema** o eliminare dati (azioni bloccate con messaggio "Azione disabilitata durante l'impersonazione")
- Non può cambiare la password dell'utente impersonato
- Non può modificare i collaboratori

### 11.5 Sicurezza del pannello Super Admin

Questa è la parte più critica dell'Opzione A. Bug nel middleware di autorizzazione possono esporre l'intera piattaforma. Regole assolute:

**Difesa in profondità** — il controllo del ruolo avviene a 3 livelli indipendenti, non solo nel middleware:
1. **Middleware Next.js** — blocca accessi a `/super/*` e `/api/super/*` senza ruolo SUPER_ADMIN
2. **Ogni API route sotto `/api/super/*`** — verifica esplicita del ruolo all'inizio dell'handler, anche se il middleware dovrebbe averlo già fatto. Se il middleware fallisce per qualsiasi motivo (es. bug, deploy parziale), il route handler è la seconda linea di difesa
3. **Ogni pagina server component sotto `/super/*`** — verifica il ruolo all'inizio del componente. Se il ruolo manca, redirect immediato

**Helper condiviso** — un'unica funzione `requireSuperAdmin()` viene chiamata in tutti e tre i punti:

```typescript
// src/lib/auth/require-super-admin.ts
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isSuperAdmin) {
    throw new Error('FORBIDDEN_SUPER_ADMIN_REQUIRED');
  }
  return session.user;
}
```

**2FA obbligatorio** — tutti gli utenti con `isSuperAdmin = true` devono avere 2FA (TOTP tipo Google Authenticator) attivo sul loro account. Il login rifiuta Super Admin senza 2FA configurato. Questa è una differenza rispetto agli OWNER/MANAGER (che hanno 2FA opzionale).

**Rate limiting aggressivo** — le API `/api/super/*` hanno rate limiting più stretto degli altri endpoint admin: 15 req/min per utente invece di 30. Un bug che fa loop infiniti nell'UI non deve permettere operazioni di massa sui tenant.

**IP allowlist opzionale** — in production è fortemente consigliato configurare un IP allowlist per l'accesso a `/super/*`. Si può implementare via `next.config.ts` con edge middleware che controlla l'header `x-forwarded-for` contro una lista di IP approvati (uffici, VPN aziendale). Questo riduce l'attack surface: anche se un Super Admin fosse compromesso, l'attaccante dovrebbe essere sulla rete giusta per usarne le credenziali.

**Audit log completo** — ogni azione Super Admin (anche la sola lettura di dati sensibili come la fatturazione) viene loggata in `AuditLog`. Questo permette di rilevare comportamenti anomali post-incidente.

**Sessioni più corte** — il JWT dei Super Admin scade dopo 4 ore invece di 30 giorni come gli altri utenti. Costringe a re-login frequente per ridurre il rischio di session hijacking.

**Nessun Super Admin self-service** — non esiste una pagina di registrazione per diventare Super Admin. I Super Admin vengono creati solo manualmente tramite script CLI (`npm run create-super-admin`) che richiede accesso al server e variabili d'ambiente. Non esiste un endpoint API per promuovere un utente a Super Admin dall'interfaccia.

### 11.6 Webhook Stripe e sincronizzazione subscription

L'endpoint `/api/webhooks/stripe/route.ts` riceve gli eventi Stripe e aggiorna i campi del ristorante:

Eventi gestiti:
- `customer.subscription.created` → popola `stripeCustomerId`, `stripeSubscriptionId`, `stripeSubscriptionStatus`, `subscriptionCurrentPeriodEnd`, associa `planId`
- `customer.subscription.updated` → aggiorna stato e piano
- `customer.subscription.deleted` → setta status a `canceled`, il ristorante torna a piano Free
- `invoice.payment_succeeded` → aggiorna `subscriptionCurrentPeriodEnd`
- `invoice.payment_failed` → setta status a `past_due`, invia email al ristoratore

Tutti gli eventi vengono verificati tramite la signature Stripe (`stripe-signature` header) per evitare webhook falsi. Il secret del webhook è in `STRIPE_WEBHOOK_SECRET` nelle variabili d'ambiente.

---

## 12. Autenticazione e Autorizzazione

**Provider:** NextAuth.js v5 con Credentials provider (email + password).

**Hashing password:** argon2id con parametri raccomandati (`memoryCost: 65536, timeCost: 3, parallelism: 4`). Mai usare bcrypt per nuovi progetti — argon2id è il vincitore del Password Hashing Competition e offre resistenza superiore a GPU e ASIC.

### 12.1 Flusso registrazione

1. L'utente compila il form di registrazione (email, password, nome)
2. Validazione Zod: email valida, password minimo 8 caratteri con almeno una maiuscola e un numero
3. Hash password con argon2id
4. Creazione record `User`
5. Redirect al wizard di onboarding (creazione primo ristorante)
6. Creazione record `Restaurant` + `UserRestaurant` con ruolo OWNER

### 12.2 Flusso invito collaboratore

1. Owner crea invito (email + ruolo) dal pannello admin
2. Email inviata con link contenente token monouso
3. Il destinatario clicca il link, crea account (o associa account esistente se già registrato)
4. Creazione record `UserRestaurant` con ruolo specificato
5. Token invalidato dopo l'uso

### 12.3 Flusso login

1. Login con email e password
2. Verifica password con argon2id
3. Per Super Admin: secondo step obbligatorio con codice TOTP a 6 cifre
4. Session JWT contenente: `userId`, `email`, lista `restaurants[]` con relativi ruoli, flag `isSuperAdmin`
5. Se l'utente ha più di un ristorante, viene mostrato un selettore per scegliere il ristorante attivo
6. Ogni API admin verifica che l'utente abbia il ruolo richiesto per il ristorante target

### 12.4 Ruoli

- **`SUPER_ADMIN`** — accesso completo alla piattaforma, gestione tenant, piani, fatturazione, temi preset, audit log. Non è legato a un ristorante specifico (è un ruolo globale tramite il flag `isSuperAdmin` sul modello `User`). Vedi sezione 11 per il dettaglio del pannello.
- **`OWNER`** — accesso completo al proprio ristorante, gestione collaboratori, può pubblicare il tema (rendere live le modifiche).
- **`MANAGER`** — accesso limitato: può modificare piatti, categorie e bozze tema, ma non può eliminare categorie, modificare impostazioni critiche del ristorante, gestire collaboratori, o pubblicare il tema (deve chiedere all'OWNER).

### 12.5 Note per il tema

- `OWNER` e `MANAGER` possono modificare il tema (bozza) tramite il theme builder
- Solo `OWNER` può pubblicare il tema (rendere live le modifiche)
- `MANAGER` può solo lavorare in bozza e chiedere all'OWNER di pubblicare

### 12.6 Note per Super Admin

- Flag `isSuperAdmin: boolean` nel modello `User` (non è una relazione con `UserRestaurant`)
- JWT di NextAuth include il campo `isSuperAdmin`
- 2FA (TOTP, libreria `otplib`) **obbligatorio** per tutti i Super Admin
- Sessioni JWT più corte (4 ore) per i Super Admin (vs 30 giorni per OWNER/MANAGER)
- Creazione Super Admin solo via CLI script: `npm run create-super-admin -- --email=admin@aifolly.com`

### 12.7 Middleware Next.js

```typescript
// middleware.ts
// Funzionalità:
// 1. Protegge tutte le rotte /admin/* e /api/* (escluse /api/menu/* e /api/sitemap)
// 2. Protegge tutte le rotte /super/* e /api/super/* con verifica isSuperAdmin
// 3. Verifica session JWT valida
// 4. Estrae restaurantId dalla sessione per le API admin
// 5. CSRF token validation su tutte le mutazioni (POST/PATCH/DELETE)
// 6. (Opzionale in production) IP allowlist per /super/* tramite SUPER_ADMIN_ALLOWED_IPS
```

---

## 13. Sicurezza

### 13.1 Rate Limiting

Implementazione con Upstash Redis in production, fallback in-memory (Map) per sviluppo locale.

```typescript
// src/lib/rate-limit.ts
// Limiti consigliati per ogni endpoint:

// API menu pubblica:        100 req/min per IP
// API admin:                 30 req/min per utente
// API Super Admin:           15 req/min per utente (più stretto)
// Upload immagini:           10 req/min per utente
// Login/registrazione:        5 req/min per IP (anti brute-force)
// Reset password:             3 req/ora per email
// API preview pubblica:      60 req/min per token (refresh manuale)
// Webhook Stripe:           non rate-limitato (signature validation è la difesa)
```

### 13.2 Validazione Upload

- Dimensione massima: 5MB per file
- Tipi consentiti: `image/jpeg`, `image/png`, `image/webp`
- Validazione MIME type reale (non solo estensione): leggere i magic bytes del file
- Cloudinary gestisce resize e sanitizzazione del contenuto
- Nome file randomizzato (cuid) per prevenire path traversal

### 13.3 Sanitizzazione Input

- Tutti gli input testuali sanitizzati con `DOMPurify` prima del rendering
- I campi `description` di piatti e categorie accettano solo testo puro (no HTML, no Markdown)
- Slug generato con `slugify()` e validato con regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`

### 13.4 Sicurezza del tema personalizzato

- I valori HEX dei colori vengono validati server-side con regex `^#[0-9a-fA-F]{6}$` per evitare CSS injection
- I nomi dei font vengono confrontati contro la lista ufficiale Google Fonts (non si accettano font arbitrari)
- Le immagini di sfondo copertina seguono le stesse regole di upload (5MB, JPEG/PNG/WebP, Cloudinary)
- I valori numerici (font size, padding, opacity) sono limitati ai range definiti negli schema Zod
- Nessun valore CSS arbitrario accettato dall'utente — tutto passa per gli schema

### 13.5 Headers di Sicurezza

```typescript
// next.config.ts headers
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY (menu non deve essere embedded in iframe)
// Referrer-Policy: strict-origin-when-cross-origin
// Content-Security-Policy: 
//   default-src 'self';
//   script-src 'self' 'unsafe-inline' *.posthog.com *.sentry.io;
//   style-src 'self' 'unsafe-inline' fonts.googleapis.com;
//   font-src 'self' fonts.gstatic.com;
//   img-src 'self' res.cloudinary.com data:;
//   connect-src 'self' *.posthog.com *.sentry.io api.stripe.com
// Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### 13.6 Sicurezza Super Admin

Vedi sezione 11.5 per il dettaglio completo. In sintesi:
- Difesa in profondità a 3 livelli (middleware + route handler + page component)
- 2FA TOTP obbligatorio
- Rate limiting aggressivo (15 req/min)
- Sessioni JWT corte (4 ore)
- IP allowlist opzionale tramite `SUPER_ADMIN_ALLOWED_IPS`
- Audit log completo di tutte le azioni
- Nessun self-service: creazione solo via CLI script
- Helper condiviso `requireSuperAdmin()` per validazione coerente

---

## 14. SEO e Structured Data

### 14.1 Meta Tags per pagina menu

```typescript
// src/app/(menu)/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const restaurant = await getRestaurant(params.slug);
  return {
    title: `${restaurant.name} — Menu Digitale`,
    description: restaurant.tagline || `Scopri il menu di ${restaurant.name}`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.tagline,
      images: [{ url: restaurant.logoUrl || '/og-default.png' }],
      type: 'website',
    },
  };
}
```

### 14.2 Structured Data (Schema.org)

Ogni pagina menu include JSON-LD con schema `Restaurant` + `Menu`, fondamentale per la visibilità su Google e i risultati ricchi (rich snippets):

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Osteria del Porto",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via del Porto 15",
    "addressLocality": "Brindisi",
    "addressRegion": "BR",
    "addressCountry": "IT"
  },
  "telephone": "+39 0831 ...",
  "url": "https://menu.aifolly.com/osteria-del-porto",
  "hasMenu": {
    "@type": "Menu",
    "name": "Menu Principale",
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Antipasti",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "Crudo di Mare",
            "description": "Tartare di tonno rosso...",
            "offers": { "@type": "Offer", "price": "18.00", "priceCurrency": "EUR" },
            "suitableForDiet": []
          }
        ]
      }
    ]
  }
}
```

### 14.3 Sitemap Dinamica

`GET /api/sitemap` genera un XML con tutti i ristoranti attivi, pubblicati e non sospesi:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://menu.aifolly.com/osteria-del-porto</loc>
    <lastmod>2026-04-05T10:30:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... altri ristoranti -->
</urlset>
```

I ristoranti sospesi (`isSuspended = true`) e le pagine preview (`/preview/[token]`) sono **esclusi** dalla sitemap.

### 14.4 Open Graph Image Dinamica

`opengraph-image.tsx` genera un'immagine OG personalizzata per ogni ristorante usando `next/og` (ImageResponse). L'immagine include nome del ristorante, tagline, logo, e usa **i font e i colori del tema personalizzato del ristorante** per coerenza visiva tra l'anteprima social e il menu reale. Questo è particolarmente importante per la condivisione su WhatsApp, Facebook, X e altre piattaforme dove l'immagine OG è il primo contatto visivo del cliente.

### 14.5 Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /super/
Disallow: /api/
Disallow: /preview/
Sitemap: https://menu.aifolly.com/api/sitemap
```

---

## 15. Analytics ed Eventi

### 15.1 Eventi tracciati

Utilizzare PostHog (consigliato per la flessibilità con eventi custom) o Plausible per analytics. Ogni evento include `restaurantSlug` come proprietà per filtrare i dati per tenant.

| Evento | Trigger | Proprietà |
|--------|---------|-----------|
| `cover_viewed` | Apertura pagina copertina | `source` (qr, link, search) |
| `cover_cta_clicked` | Click su "Scopri il menu" nella copertina | `timeOnCover` (secondi prima del click) |
| `menu_viewed` | Apertura pagina menu | `fromCover` (boolean), `source` |
| `category_scrolled` | Scroll a una nuova categoria | `categoryName` |
| `dish_expanded` | Click su piatto per espandere allergeni | `dishName`, `categoryName` |
| `filter_applied` | Attivazione filtro (vegetariano, vegano, ecc.) | `filterType` |
| `allergen_viewed` | Visualizzazione allergeni di un piatto | `dishName`, `allergens[]` |
| `qr_scanned` | Scansione QR code (inferito da `source: 'qr'`) | `time`, `dayOfWeek` |
| `theme_preset_applied` | Applicazione preset nel theme builder admin | `presetSlug` |
| `theme_published` | Pubblicazione tema (bozza → live) | `changedLevels[]` (cover/menu/dish) |
| `preview_token_generated` | Generazione nuovo QR preview mobile | `trigger` (auto, manual, expired) |
| `preview_mobile_opened` | Scansione QR dal telefono dell'admin | `tokenAgeSeconds` |
| `preview_mobile_refreshed` | Click su "Aggiorna" nella preview mobile | — |

### 15.2 Dashboard Analytics nel pannello admin (piano Pro)

Il ristoratore con piano Pro o Business visualizza nella propria dashboard:
- **Scansioni QR** per giorno e settimana (grafico a barre)
- **Piatti più visualizzati** (top 10) con conteggio espansioni
- **Orari di picco** (heatmap per giorno della settimana × ora del giorno)
- **Filtri più usati** (percentuali di utilizzo dei filtri vegetariano/vegano/senza glutine)
- **Trend visite** settimana su settimana (con freccia verde/rossa per indicare crescita o calo)
- **Tasso di engagement** (percentuale di clienti che hanno aperto almeno un dettaglio piatto)

I ristoranti con piano Free vedono solo il conteggio totale scansioni QR del mese corrente, senza dettagli.

### 15.3 Metriche piattaforma (Super Admin)

Vedi sezione 11.3 per le metriche aggregate disponibili nel pannello Super Admin: numero totale ristoranti, MRR, distribuzione piani, scansioni totali della piattaforma, top tenant.

---

## 16. QR Code

**Libreria:** `qrcode` (npm) per generazione lato server e lato client.

**Formato URL del menu pubblico:** `https://menu.aifolly.com/{slug}`

Esempio: `https://menu.aifolly.com/osteria-del-porto`

**Importante:** il QR code del menu pubblico (quello stampato sui tavoli) punta sempre alla **copertina** (`/{slug}`), non alla pagina menu (`/{slug}/menu`). Il cliente arriva alla copertina, vede il branding del ristorante, e poi tocca per entrare nel menu.

### 16.1 Funzionalità del generatore QR

- Generazione dinamica con colore personalizzabile (di default usa l'`accentColor` del tema del ristorante)
- Download in tre formati:
  - **PNG 300 dpi** — per stampa di alta qualità
  - **SVG** — per stampa vettoriale a qualsiasi dimensione
  - **PDF** — pronto per la stampa con margini e crocini di taglio
- Opzione con/senza logo del ristorante al centro del QR (con riduzione automatica della complessità per mantenere la leggibilità)
- Template scaricabile per cartellini da tavolo (formato 80×120mm pronto per stampa)

### 16.2 QR di preview admin (mobile preview del theme builder)

Diverso dal QR pubblico — vedi sezione 9.4 per il dettaglio. Punta a `https://menu.aifolly.com/preview/{token}` con token temporaneo da 1 ora, accessibile solo al ristoratore durante la modifica del tema.

---

## 17. Testing

### 17.1 Strategia

| Livello | Strumento | Copertura |
|---------|-----------|-----------|
| **Unit test** | Vitest | Validators Zod, utility functions, helpers (incluso `getContrastRatio`, `themeToCSSVars`) |
| **Component test** | Vitest + Testing Library | DishCard, FilterBar, CategoryNav, DishForm, IPhoneMockup, FontPicker, ColorPicker, ContrastChecker |
| **Integration test** | Vitest + MSW | API routes (CRUD piatti, categorie, tema, auth, super admin) |
| **E2E test** | Playwright | Flussi completi: registrazione → onboarding → crea piatto → personalizza tema → pubblica → visualizza menu pubblico |

### 17.2 Configurazione

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
```

### 17.3 Test prioritari — Menu pubblico

- Rendering corretto del menu con dati mock
- Filtri (singoli e combinati) filtrano correttamente i piatti
- Scroll spy aggiorna la categoria attiva durante lo scroll
- Expand/collapse allergeni funziona correttamente
- Varianti prezzo visualizzate correttamente nelle DishCard
- Fallback per immagini mancanti (placeholder SVG)
- Pagina 404 personalizzata per slug inesistente
- Copertina renderizza correttamente con tema personalizzato
- Navigazione copertina → menu funziona
- Font Google caricati dinamicamente con fallback corretto se irraggiungibili

### 17.4 Test prioritari — Theme Builder

- Contrast checker: test unitari per `getContrastRatio()` con coppie colore note (bianco/nero = 21, identici = 1, ecc.)
- Theme builder: rendering corretto dei 3 tab (Copertina, Menu, Piatti)
- FontPicker: ricerca, filtro per categoria, selezione, virtualizzazione lista
- ColorPicker: input HEX validato, palette suggerite applicano colori, picker libero funzionante
- Mockup iPhone: rendering corretto con proporzioni 393×852 e notch Dynamic Island
- LivePreview: aggiornamento immediato della preview dopo ogni modifica nell'editor
- Auto-save bozza dopo 3 secondi di inattività
- Flusso publish: bozza → click "Pubblica" → conferma → tema live aggiornato
- Flusso preset: selezione → click "Applica" → diventa bozza → personalizzazione
- API tema: validazione Zod respinge configurazioni malformate (colore non HEX, font inesistente, valori fuori range)
- CoverPage: rendering corretto con tema personalizzato applicato

### 17.5 Test prioritari — Preview mobile (QR)

- Generazione token: `POST /api/theme/preview-token` crea record con scadenza corretta (1 ora esatta)
- Rigenerazione manuale: il vecchio token viene invalidato quando se ne genera uno nuovo
- Countdown UI: il display del tempo rimanente si aggiorna correttamente ogni secondo
- API pubblica preview: `GET /api/preview/{token}` ritorna bozza se token valido
- Token scaduto: `GET /api/preview/{token}` ritorna 410 Gone se `expiresAt` è passato
- Token inesistente: `GET /api/preview/{token}` ritorna 404
- Pagina preview mobile: renderizza bozza con barra "Aggiorna" fissa in basso
- Pulsante "Aggiorna": rifà il fetch e aggiorna il contenuto
- Pagina preview scaduta: mostra messaggio di errore chiaro con istruzioni
- Cleanup job: rimuove token con `expiresAt < now()`
- Rate limiting: respinge più di 60 req/min sullo stesso token
- Meta noindex: la pagina preview ha i meta tag corretti per non essere indicizzata

### 17.6 Test prioritari — Admin (CRUD ristoratore)

- CRUD completo piatti (create, read, update, delete)
- Validazione form (campi obbligatori, limiti caratteri, formati)
- Upload immagine con preview e gestione errori
- Drag & drop riordinamento categorie aggiorna `sortOrder` correttamente
- Toggle disponibilità piatto immediato
- Onboarding wizard completo (registrazione → primo piatto → QR)
- Form varianti prezzo (aggiunta, rimozione, riordinamento)

### 17.7 Test prioritari — API e autorizzazione

- Autenticazione richiesta su tutte le rotte admin (rifiuto 401 se non loggato)
- Autorizzazione: MANAGER non può eliminare categorie (rifiuto 403)
- Autorizzazione: MANAGER non può pubblicare il tema (rifiuto 403)
- Rate limiting attivo su tutti gli endpoint con i limiti corretti
- Validazione input Zod con messaggi d'errore corretti e localizzati
- Revalidation path chiamata dopo ogni modifica al menu
- CSRF protection su tutte le mutazioni

### 17.8 Test prioritari — Super Admin

- Middleware: utente OWNER non può accedere a `/super/*` (redirect con 403)
- Middleware: utente MANAGER non può accedere a `/super/*`
- Middleware: utente non autenticato viene reindirizzato al login
- API `/api/super/*`: verifica ruolo esplicita anche nel route handler (difesa in profondità)
- Sospensione tenant: menu pubblico mostra pagina "Non disponibile"
- Riattivazione tenant: menu pubblico torna visibile
- Cambio piano: limiti del nuovo piano applicati immediatamente
- Eliminazione tenant: tutte le entità collegate vengono rimosse (cascade)
- Impersonazione: banner visibile su tutte le pagine durante la sessione
- Impersonazione: azioni critiche bloccate (pubblicazione tema, eliminazione)
- Impersonazione: terminare imposta `endedAt` correttamente
- Audit log: ogni azione Super Admin crea entry con actor corretto
- Audit log: durante impersonazione, actor è Super Admin con metadata `impersonating: true`
- 2FA: login Super Admin senza 2FA attivo viene bloccato
- Webhook Stripe: signature non valida → 400 Bad Request
- Webhook Stripe: `subscription.updated` aggiorna campi correttamente
- Rate limiting: `/api/super/*` più aggressivo (15 req/min)
- Metriche dashboard: calcoli MRR corretti con dati mock

---

## 18. Error Tracking e Monitoring

### 18.1 Sentry

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,         // 20% delle transazioni (performance)
  replaysSessionSampleRate: 0,   // No replay in sessione normale (privacy)
  replaysOnErrorSampleRate: 0.5, // 50% replay solo quando c'è un errore
});
```

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
});
```

### 18.2 Alert configurati

**Critici (notifica immediata):**
- **Errore 500 su API menu pubblica** — il menu è down per i clienti, urgenza massima
- **Webhook Stripe fallito** — rischio di subscription non sincronizzate, impatta la fatturazione
- **Performance degradata** — alert se p95 tempo risposta API menu > 2 secondi

**Aggregati (raggruppati per ridurre rumore):**
- **Errore upload immagine** — ogni 10 errori entro 1 ora
- **Errore autenticazione ripetuto** — più di 20 tentativi/minuto da stessa fonte (possibile brute-force)
- **Tentativo accesso `/super/*` senza permessi** — più di 10 tentativi/ora da IP diversi (possibile attacco)
- **Font Google non raggiungibile** — alert se i font non caricano (CDN Google Fonts down)

**Informativi (no notifica, solo log per analisi):**
- **Azione Super Admin fuori orario** — Super Admin compie azioni tra le 22:00 e le 7:00 (potenziale indicatore di compromissione account)
- **Rate limit raggiunto** — qualsiasi endpoint che raggiunge il limite (per capire se i limiti sono troppo stretti)

### 18.3 Logging strutturato

Tutti gli errori loggati includono:
- `userId` (se autenticato)
- `restaurantId` (se in contesto admin)
- `route` (URL completo)
- `method` (HTTP verb)
- `requestId` (per tracciare la stessa richiesta nei log)
- `userAgent` e `ipAddress`
- Stack trace completo

Sentry redact automaticamente i campi sensibili (password, token, API keys) prima di inviare i dati.

---

## 19. Multi-lingua (futuro, fase post-launch)

Il data model è già predisposto con `DishTranslation` (vedi sezione 4). Per la v1, il menu è solo in italiano.

### 19.1 Implementazione futura

Quando si vorrà aggiungere il supporto multilingua:

1. **Estendere il data model:**
   - Aggiungere `CategoryTranslation` con la stessa struttura di `DishTranslation`
   - Aggiungere `RestaurantTranslation` per nome, tagline, descrizione, allergenNote
   - Aggiungere campo `defaultLocale` su `Restaurant` (default `it`)
   - Aggiungere campo `availableLocales: String[]` su `Restaurant`

2. **Detect lingua del cliente:**
   - Leggere `Accept-Language` header del browser
   - Override tramite parametro URL `?lang=en`
   - Selettore lingua nell'header del menu pubblico (se ci sono più traduzioni disponibili)
   - Salvare la scelta in cookie per ricordarla nelle visite successive

3. **Fallback:**
   - Se traduzione non disponibile per la lingua richiesta, fallback a `defaultLocale`
   - Se anche quella manca, fallback all'italiano

4. **UI admin per gestire traduzioni:**
   - Tab per lingua nel form piatto/categoria
   - Indicatore visivo di completezza traduzioni ("3/5 piatti tradotti in inglese")
   - Bulk action per tradurre con AI (integrazione opzionale con DeepL o GPT-4)
   - Possibilità di importare/esportare CSV per traduttori esterni

### 19.2 Lingue prioritarie

In ordine di priorità per il rollout:
1. **Inglese** — turisti internazionali, mercato principale per ristoranti italiani
2. **Tedesco** — secondo turismo per volume in Italia
3. **Francese** — terzo turismo
4. **Spagnolo** — quarto turismo
5. **Cinese mandarino** — crescita rapida del turismo asiatico

### 19.3 Considerazioni

- Le traduzioni dei piatti sono delicate (gergo gastronomico, nomi propri di ricette tradizionali) — l'AI può aiutare ma è consigliata revisione umana
- Alcune indicazioni regolamentari (allergeni) devono essere conformi alle normative del paese del cliente, non solo tradotte
- Le immagini OG dinamiche dovranno essere generate per ogni lingua disponibile

---

## 20. Variabili d'Ambiente

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/aifolly_menu"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-sicuro-con-openssl-rand-base64-32"

# Cloudinary
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# Google Fonts API (per il font picker nell'admin)
GOOGLE_FONTS_API_KEY="xxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MENU_DOMAIN="http://localhost:3000"

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
NEXT_PUBLIC_POSTHOG_HOST="https://eu.posthog.com"

# Error tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_AUTH_TOKEN="sntrys_xxx"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Email
SMTP_HOST="smtp.resend.com"
SMTP_PORT=465
SMTP_USER="resend"
SMTP_PASSWORD="re_xxx"
EMAIL_FROM="noreply@aifolly.com"

# Stripe (fatturazione Super Admin)
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Cron jobs (Vercel Cron)
CRON_SECRET="genera-un-secret-per-proteggere-gli-endpoint-cron"

# Super Admin IP allowlist (opzionale, production)
SUPER_ADMIN_ALLOWED_IPS="1.2.3.4,5.6.7.8"
```

---

## 21. Istruzioni per lo Sviluppo

### 21.1 Setup iniziale

```bash
# Crea il progetto Next.js
npx create-next-app@latest aifolly-menu --typescript --tailwind --app --src-dir

# Dipendenze core
cd aifolly-menu
npm install prisma @prisma/client next-auth@5 zod @hookform/resolvers react-hook-form
npm install @tanstack/react-query cloudinary qrcode argon2
npm install -D @types/qrcode

# Theme builder
npm install react-colorful react-window
npm install -D @types/react-window

# Utility
npm install dompurify slugify
npm install -D @types/dompurify

# Super Admin: 2FA + Stripe
npm install otplib qrcode-terminal
npm install stripe @stripe/stripe-js

# Analytics e monitoring
npm install posthog-js @sentry/nextjs

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test msw

# Inizializza Prisma
npx prisma init

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu input label select \
  switch tabs toast textarea badge progress avatar separator tooltip slider popover
```

### 21.2 Ordine di sviluppo consigliato

**Fase 1 — Fondamenta:**
1. Setup progetto Next.js + Prisma + PostgreSQL
2. Schema Prisma completo (incluso ThemePreset, campi tema/draft) + migrazione
3. Seed: dati esempio (Osteria del Porto) + temi preset (almeno "Elegante" e "Minimal")
4. Tutti gli schema Zod (CoverThemeSchema, MenuThemeSchema, DishThemeSchema, validators piatti/categorie)
5. Helper `themeToCSSVars()` e `getContrastRatio()`
6. API `GET /api/menu/[slug]` con tema incluso nella response
7. Componente `ThemeProvider` (inietta CSS vars)
8. Componente `CoverPage` (pagina copertina con tema applicato)
9. Pagina menu `/{slug}/menu` con tutti i componenti + tema applicato
10. Hook `useFontLoader` per caricamento dinamico Google Fonts

**Fase 2 — Theme Builder:**
11. API tema: `GET/PATCH /api/theme/draft`, `POST /api/theme/publish`, `DELETE /api/theme/draft`
12. API preset: `GET /api/theme/presets`, `POST /api/theme/presets/apply`
13. API font: `GET /api/fonts` (proxy cachato verso Google Fonts API)
14. Componente `FontPicker` con ricerca, categorie, virtualizzazione
15. Componente `ColorPicker` con palette suggerite + picker libero
16. Componente `ContrastChecker`
17. Componente `IPhoneMockup` (SVG cornice iPhone 14 Pro con notch)
18. Componente `LivePreview` dentro il mockup (preview menu con bozza tema)
19. Componente `ThemeBuilderLayout` (split panel: editor + mockup + QR)
20. Editor copertina (`CoverEditor`)
21. Editor menu (`MenuStyleEditor`)
22. Editor piatti (`DishStyleEditor`)
23. Galleria preset (`PresetGallery`)
24. Flusso pubblica/scarta con conferma modale
25. Auto-save bozza (debounced 3s)
26. API preview token: `POST /api/theme/preview-token`, `GET /api/theme/preview-token/current`
27. API preview pubblica: `GET /api/preview/[token]`
28. Route pubblica `/preview/[token]/page.tsx` e `/preview/[token]/menu/page.tsx` (con barra "Aggiorna")
29. Componente `MobilePreviewQR` con countdown scadenza e pulsante rigenera
30. Cron job cleanup token scaduti (`/api/cron/cleanup-preview-tokens`)

**Fase 3 — Admin base:**
31. Setup NextAuth + argon2
32. Registrazione + onboarding wizard (con selezione preset al passo 2)
33. Middleware protezione rotte
34. Layout admin con sidebar (voce "Tema" nel menu)
35. CRUD categorie con riordinamento
36. CRUD piatti con form completo + varianti prezzo
37. Upload immagini Cloudinary

**Fase 4 — Polish e sicurezza:**
38. Rate limiting (incluso endpoint preview pubblico)
39. Sistema inviti collaboratori
40. QR code generator (per menu pubblico)
41. Dashboard
42. Impostazioni ristorante
43. Skeleton loaders e stati errore
44. Revalidation on-demand

**Fase 5 — Produzione:**
45. Sentry
46. PostHog (inclusi nuovi eventi tema)
47. SEO: meta tags, structured data, sitemap, OG images (con tema)
48. Security headers
49. Deploy Vercel + dominio custom
50. Service worker
51. Test suite completa

**Fase 6 — Super Admin e Monetizzazione:**

*Super Admin — fondamenta:*
52. Aggiungere campo `isSuperAdmin: boolean` al modello `User` (migrazione)
53. CLI script `scripts/create-super-admin.ts` per creare il primo Super Admin
54. Modelli `AuditLog` + `SuperAdminImpersonation` + migrazione
55. Helper `requireSuperAdmin()` condiviso
56. Middleware di protezione `/super/*` e `/api/super/*` con verifica ruolo
57. Setup 2FA (TOTP) con `otplib` — obbligatorio per Super Admin, opzionale per OWNER
58. Layout Super Admin (`(super-admin)/layout.tsx`) con sidebar dedicata
59. Pagina login con gestione 2FA step

*Super Admin — gestione tenant:*
60. API `/api/super/tenants` (GET lista con filtri e paginazione)
61. API `/api/super/tenants/[id]` (GET dettaglio, PATCH, DELETE)
62. API `/api/super/tenants/[id]/suspend` (POST/DELETE con motivo obbligatorio)
63. API `/api/super/tenants/[id]/plan` (PATCH cambio piano)
64. Pagina `/super/tenants` con `TenantList` (tabella filtri paginazione)
65. Pagina `/super/tenants/[id]` con `TenantDetail` e `TenantActions`
66. Modal conferma azioni distruttive con `ConfirmDestructiveAction` (richiede digitare nome ristorante)
67. Menu pubblico: rendering pagina "Ristorante non disponibile" se `isSuspended`

*Super Admin — impersonazione:*
68. API `/api/super/tenants/[id]/impersonate` (POST/DELETE)
69. Logica session switching via JWT extended claims
70. Componente `ImpersonationBanner` visibile su tutte le pagine admin
71. Blocco azioni critiche durante impersonazione (publish tema, delete)
72. Audit log automatico di tutte le azioni durante impersonazione

*Super Admin — piani e preset:*
73. API `/api/super/plans` (CRUD)
74. Pagina `/super/plans` con `PlanForm`
75. API `/api/super/presets` (CRUD)
76. Pagina `/super/presets` riusando il theme builder in modalità "editor preset"
77. Upload thumbnail preset + riordinamento drag & drop

*Super Admin — audit log e metriche:*
78. Middleware che scrive audit log per ogni azione critica (OWNER + Super Admin)
79. API `/api/super/audit-log` con filtri e paginazione
80. Pagina `/super/audit-log` con `AuditLogTable` + export CSV
81. API `/api/super/metrics` (aggregazioni DB + dati PostHog)
82. Pagina `/super` dashboard con `MetricsDashboard` (grafici trend)

*Monetizzazione con Stripe:*
83. Integrazione Stripe: creazione customer e subscription da onboarding
84. Webhook Stripe `/api/webhooks/stripe` con verifica signature
85. Sincronizzazione stato subscription → DB (campi `stripeSubscriptionStatus`, ecc.)
86. Enforcement limiti piano nelle API (es. blocco creazione piatto oltre `maxDishes`)
87. UI admin: pagina "Piano" con upgrade/downgrade tramite Stripe Checkout
88. API `/api/super/billing` con vista aggregata subscription
89. Pagina `/super/billing` con `BillingTable` + link a dashboard Stripe

*Sicurezza Super Admin (finale):*
90. Rate limiting aggressivo su `/api/super/*` (15 req/min)
91. IP allowlist opzionale per `/super/*` via edge middleware
92. Sessioni JWT corte (4h) per Super Admin
93. Alert Sentry per tentativi accesso falliti a `/super/*`
94. Test end-to-end completi del flusso Super Admin

### 21.3 Comandi utili

```bash
# Database
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio

# Dev
npm run dev
npm run build
npm run lint

# Test
npx vitest
npx vitest --coverage
npx playwright test

# Prisma
npx prisma generate

# Super Admin
npm run create-super-admin -- --email=admin@aifolly.com --name="Admin"
```

---

## 22. Riferimenti Design

Il prototipo interattivo del menu è disponibile nel file `menu-luxury-completo.jsx` allegato al progetto. Corrisponde al preset **"Elegante"** e va usato come riferimento per:

- Layout e spaziature della copertina
- Struttura componenti menu
- Comportamento animazioni
- Dati di esempio per il seed

---

## 23. Note Tecniche

- **ISR:** rigenerazione ogni 60s + on-demand dopo pubblicazione tema o modifica menu
- **Immagini:** WebP via Cloudinary, thumbnail 176×176 (2x retina), full 600×600
- **Font:** caricamento dinamico Google Fonts con `display=swap`. Fallback a font di sistema. Cache Google Fonts API lato server per 24h.
- **Accessibilità:** WCAG 2.1 AA. Il contrast checker nell'admin aiuta il ristoratore a rispettare i requisiti. Se il contrasto è sotto 3:1, warning rosso visibile.
- **14 allergeni EU:** Reg. 1169/2011 supportato
- **GDPR:** menu pubblico senza dati personali, consenso cookie per analytics admin. L'audit log conserva le azioni per 12 mesi (configurabile) per compliance e debug.
- **Backup:** backup giornaliero automatico del DB
- **CSS Variables sanitizzazione:** i valori HEX vengono validati server-side prima di essere salvati. I nomi font vengono confrontati con la lista Google Fonts. Nessun valore CSS arbitrario accettato per prevenire injection.
- **Cron jobs:** definiti in `vercel.json` con autenticazione tramite `CRON_SECRET`. Cron giornaliero per cleanup token preview scaduti, cron mensile per export audit log archiviato.
- **Super Admin:** creato solo via CLI script, mai self-service. 2FA TOTP obbligatorio. Sessioni JWT 4 ore. Difesa in profondità a 3 livelli (middleware + route handler + page component) per la protezione delle rotte `/super/*`.

---

*Documento generato l'8 Aprile 2026. Versione 3.3 — Documento autonomo e completo. Tutte le sezioni precedentemente referenziate alla v2 (Autenticazione, Sicurezza, SEO, Analytics, QR Code, Testing, Error Tracking, Multi-lingua) sono state integrate inline ed espanse con i dettagli specifici delle versioni successive. Questo documento contiene tutte le informazioni necessarie per lo sviluppo senza dipendenze da versioni precedenti.*

---

**Storico versioni:**
- **v1.0** — Spec iniziale base
- **v2.0** — Sicurezza, testing, SEO, analytics, onboarding, gestione prezzi
- **v3.0** — Sistema customizzazione 3 livelli, theme builder, preset, Google Fonts, contrast checker
- **v3.1** — Mockup iPhone 14 Pro + QR preview mobile con token temporanei
- **v3.2** — Pannello Super Admin completo (Opzione A), gestione tenant, impersonazione, Stripe
- **v3.3** — Consolidamento documento: rimossi tutti i riferimenti incrociati alla v2, ogni sezione è ora autonoma e completa
