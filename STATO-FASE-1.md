# AiFolly Menu — Stato del progetto al completamento Fase 1

## Cartella locale del progetto
`C:\Users\Michele\source\repos\aifolly-menu`

## Stack tecnologico installato
- **Next.js 16** (App Router, TypeScript, Tailwind, src/)
- **Prisma 6.19** (output: `src/generated/prisma`)
- **@prisma/client**, **zod**, **tsx** (devDep), **dotenv** (devDep)
- **PostgreSQL** su **Supabase** (region eu-west-1, progetto dev: `yyrtxbxnaglppraapoeh`)

## Variabili d'ambiente (file .env locale di sviluppo)

```
DATABASE_URL="postgresql://postgres.yyrtxbxnaglppraapoeh:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.yyrtxbxnaglppraapoeh:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

Per la produzione su Vercel vanno create credenziali separate su un nuovo progetto Supabase (`aifolly-menu-prod`). Vedi `DEPLOY-VERCEL.md` sezione 3.

## Struttura cartelle principale

```
src/
  app/
    (menu)/
      layout.tsx                      — layout minimale
      [slug]/
        page.tsx                      — copertina (server)
        loading.tsx                   — skeleton
        not-found.tsx                 — 404 personalizzata
        error.tsx                     — error boundary
        menu/
          page.tsx                    — menu (server)
    api/
      menu/[slug]/
        route.ts                      — API REST
  components/
    menu/
      ThemeProvider.tsx               — inietta CSS vars + Google Fonts
      CoverPage.tsx                   — copertina con CSS vars
      MenuHeader.tsx                  — header del menu (server)
      MenuContent.tsx                 — wrapper client con stato condiviso
      CategoryNav.tsx                 — sticky nav + scroll spy + filterbar
      FilterBar.tsx                   — pill filtri (incorporato in CategoryNav)
      DishCard.tsx                    — card piatto con expand
      AllergenBadge.tsx               — badge allergene
      MenuFooter.tsx                  — footer con coperto/buon appetito
  lib/
    prisma.ts                         — client singleton
    queries/
      restaurant.ts                   — getPublicRestaurant() condivisa
    validators/
      theme.ts                        — schemi Zod del tema (3 livelli)
      dish.ts, category.ts, restaurant.ts, upload.ts
    theme/
      contrast.ts                     — funzioni WCAG
      theme-to-css.ts                 — themeToCSSVars() con helper fontVars
  generated/
    prisma/                           — Prisma Client generato
prisma/
  schema.prisma                       — 13 modelli + 4 enum completi
  seed.ts                             — popola il DB
  seed-presets.ts                     — 8 preset configurazioni
  migrations/
    [data]_init/                      — migrazione iniziale applicata
docs/
  references/                         — documenti di riferimento per Claude Code
    AIFOLLY-MENU-SPEC-v3.3.md
    AIFOLLY-BRAND-GUIDELINES.md
    menu-luxury-completo.jsx
    cover-page-elegante.jsx
    seed-presets.ts
CLAUDE.md                             — file di contesto per Claude Code
STATO-FASE-1.md                       — questo file
DEPLOY-VERCEL.md                      — guida al deploy
```

## Comandi utili

```powershell
npm run dev                           # sviluppo locale
npx prisma db seed                    # riseeda il DB
npx prisma migrate dev --name nome    # nuova migrazione (dev)
npx prisma migrate deploy             # applica migrazioni esistenti (produzione)
npx prisma studio                     # UI per ispezionare il DB
npx tsc --noEmit                      # type-check senza compilare
npm run build                         # build di produzione (test locale)
```

## Stato del database Supabase (sia dev che prod dopo seed)

- **8 ThemePreset**: Elegante, Minimal, Rustico, Vivace, Classico, Moderno, Bistrot, Street Food
- **1 Restaurant**: "Osteria del Porto" (slug: `osteria-del-porto`, city: Brindisi, isPublished: true, isActive: true, isSuspended: false, tema Elegante applicato)
- **6 Category**: Antipasti, Primi, Secondi, Contorni, Dolci, Bevande (con sortOrder 0-5)
- **29 Dish** con tag DishTag, allergens Allergen, isChefChoice
- **6 PriceVariant** (per i 3 vini: Primitivo, Negroamaro, Verdeca — Calice + Bottiglia)

## URL locali funzionanti (dev)

- `http://localhost:3000/osteria-del-porto` — copertina
- `http://localhost:3000/osteria-del-porto/menu` — menu completo
- `http://localhost:3000/api/menu/osteria-del-porto` — API JSON
- `http://localhost:3000/ristorante-inesistente` — 404 personalizzata

## Decisioni di design importanti

1. **Multi-tenant via slug nel path URL** (non via subdomain)
2. **Tema gestito su 3 livelli** (cover, menu, dish) con override su cover/menu/dish drafts per il theme builder (Fase 2)
3. **Server Components di default**, Client Components solo dove serve interattività (DishCard, CategoryNav, FilterBar, MenuContent)
4. **CSS variables iniettate dal ThemeProvider**, non Tailwind classes hardcoded (permette theme switching dinamico)
5. **Logica draft/live** per il tema già implementata nelle API (`themeCoverDraft ?? themeCover`)
6. **Cleanup automatico** dei `<link>` Google Fonts al unmount (importante per Fase 2 con preview live)
7. **Supabase + Prisma**: usiamo entrambe le connection string (DATABASE_URL pooled, DIRECT_URL diretta) per compatibilità pgbouncer + migrazioni
8. **Data API e RLS di Supabase disabilitate** (usiamo architettura a 3 livelli con Prisma + API routes, non supabase-js direttamente)
9. **Logo AiFolly**: A geometrica con diamante oro (non implementato, solo specificato nel brand doc — sarà Fase 2)
10. **Palette AiFolly admin**: 95% neutri + 5% oro `#c9b97a` (sarà Fase 2)
11. **Font admin**: Geist (sarà Fase 2), vs Cormorant Garamond + Outfit per il menu pubblico preset Elegante

## Bug noti / scelte pragmatiche

- **Scroll orizzontale della category nav su desktop**: funziona solo con Shift+rotella o swipe trackpad, non con rotella verticale. Accettato perché il target primario è mobile (QR code al tavolo).
- **Nessuna homepage `/`**: accessibile solo via slug del ristorante. Per la demo su Vercel si può aggiungere un redirect temporaneo.
- **Nessun campo `establishedYear` o `region` sul modello Restaurant**: la copertina mostra solo `city`.
- **Nessun campo per i social** (Instagram, Facebook) sul modello Restaurant: saranno aggiunti in Fase 2.
- **Configurazione seed in `package.json#prisma`** invece di `prisma.config.ts`: i tipi TypeScript di Prisma 6.19 non supportano ancora il seed nel config. Verrà migrato quando Prisma 7 sarà rilasciato.

## Fasi successive del progetto

- **Fase 2** — Pannello admin per i ristoratori (autenticazione NextAuth + CRUD piatti/categorie + theme builder visuale + QR generator + dashboard). **Prossima fase da affrontare.**
- **Fase 3** — Rifinitura auth avanzata (2FA opzionale, gestione password, gestione collaboratori)
- **Fase 4** — Polish e sicurezza (ISR, rate limiting, testing, revalidation)
- **Fase 5** — Produzione (Sentry, PostHog, SEO, Open Graph, deploy pulito)
- **Fase 6** — Super Admin + monetizzazione (pannello Super Admin con Opzione A "stessa app", integrazione Stripe, webhook, impersonazione, audit log)

## Documenti di riferimento disponibili

1. **`docs/references/AIFOLLY-MENU-SPEC-v3.3.md`** — Specifica tecnica completa (2743 righe, autonoma)
2. **`docs/references/AIFOLLY-BRAND-GUIDELINES.md`** — Brand identity di AiFolly come marchio B2B
3. **`docs/references/menu-luxury-completo.jsx`** — Prototipo React del menu pubblico preset Elegante
4. **`docs/references/cover-page-elegante.jsx`** — Prototipo React della copertina preset Elegante
5. **`docs/references/seed-presets.ts`** — Definizione TypeScript degli 8 temi preset
6. **`DEPLOY-VERCEL.md`** — Guida al deploy su Vercel
7. **`STATO-FASE-1.md`** — Questo file, riepilogo dello stato del progetto

## Come ripartire dopo una compattazione della conversazione

Quando si riprende il lavoro con Claude Code dopo una compattazione:

1. Verificare che `CLAUDE.md` sia ancora nella root del progetto (dovrebbe essere stato committato su GitHub)
2. Incollare il contenuto di `STATO-FASE-1.md` all'inizio del nuovo prompt di Claude Code per dargli contesto
3. Indicare esplicitamente quale fase si vuole affrontare (es. "Inizia la Fase 2 — Pannello admin")
4. Claude Code leggerà i documenti di riferimento in `docs/references/` per avere il contesto completo

---

*Stato aggiornato al completamento della Fase 1. Prossimo step: deploy su Vercel seguendo `DEPLOY-VERCEL.md`, poi inizio Fase 2.*
