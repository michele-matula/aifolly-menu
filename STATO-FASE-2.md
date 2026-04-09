# AiFolly Menu — Stato Fase 2 (completata)

## Branch di lavoro
`feature/fase-2-admin` (da `main`) — **mergeare su `main` prima del deploy**

## Step completati

- [x] **Step 1** — Schema auth (User/Account/Session/VerificationToken), NextAuth v5 Credentials, middleware `/admin/*`, script CLI `create-user` e `assign-restaurant`, login page, layout admin minimale.
- [x] **Step 2** — Layout admin con sidebar, dashboard con card ristoranti, route group `(dashboard)` e `(auth)`, pagina Info ristorante con form e Server Actions, helper `requireOwnership`.
- [x] **Step 3** — CRUD Categorie con drag & drop (@dnd-kit), auto-slug, modali create/edit, delete bloccato su categorie con piatti, riordino in transazione.
- [x] **Step 4** — CRUD Piatti completo: lista filtrabile per categoria + ricerca, drag & drop dentro una categoria, form con tag/allergeni come pills (enum array), varianti prezzo dinamiche, toggle chef's choice e visibility, cambio categoria con ricalcolo sortOrder. Micro-fix parallelo: `isAvailable` ora renderizzato nel menu pubblico con stile "esaurito" (opacity + badge + prezzo barrato).
- [x] **Step 5** — Upload immagini su Supabase Storage: bucket `restaurant-media` configurato, modello `MediaAsset` + migrazione, client Supabase server-side con service role key, API routes `/api/admin/media/*` (upload/delete/list), componente `ImageUploader` riutilizzabile integrato in form piatto, pagina Media Library con filtro e delete.
- [x] **Step 6** — Theme builder visuale con preview live: split view a 2 tab (Copertina/Menu), iframe preview con cache-bust, debounce 800ms auto-save, 48 font Google curati, controllo contrasto WCAG inline, preset picker con 8 preset, logica draft/live con pubblicazione esplicita. **Fix sicurezza critico**: le pagine pubbliche ora mostrano il tema draft SOLO a owner autenticati via `?previewDraft=1`; prima erano visibili a chiunque.
- [x] **Step 7** — QR code generator: libreria `qrcode`, helper isomorfo per PNG/SVG, pagina con preview + 3 bottoni di download (PNG 1024, PNG XL 2048, SVG), URL pubblico con bottone copia, suggerimenti di stampa. Warning rafforzato sul campo slug nella pagina Info (cambiare slug rompe i QR stampati).
- [x] **Step 8** — Polish finale: `sonner` come sistema di toast globale, migrazione di tutti i banner "fatti a mano" degli step precedenti, `loading.tsx` skeleton per ogni route admin, `error.tsx` boundaries, mobile responsive review con sidebar hamburger e tab scrollabili, accessibilità minima (label, focus, aria), build di produzione verificata.

## Debt tecnico aperto da Fase 2 (da affrontare in fasi successive)

- **Migrazione `middleware.ts` → `proxy.ts`**: Next.js 16 avvisa che `middleware.ts` è deprecato in favore di `proxy.ts` (runtime Node.js completo). Non bloccante, la build passa. Da migrare in un PR dedicato, preferibilmente in Fase 4 (polish e sicurezza) quando c'è tempo di testare con calma.
- **Focus trap nelle modali admin**: le modali (create/edit categoria, conferma delete, conferma preset, ecc.) hanno ESC e click-outside per chiudere, ma non intrappolano il focus con Tab. Accettabile per ora, da completare in Fase 4 come parte dell'audit accessibilità.
- **Favicon e branding admin**: attualmente c'è il favicon default di Next.js. Verrà sostituito quando sarà pronto il logo AiFolly definitivo (brand guidelines già scritte in `docs/references/AIFOLLY-BRAND-GUIDELINES.md`, ma l'asset grafico non è ancora prodotto).
- **UI di pubblicazione/depubblicazione ristorante mancante**: lo schema ha il campo `Restaurant.isPublished` (Boolean default false), la route pubblica `/[slug]` rispetta il flag e filtra i ristoranti non pubblicati. Ma nel pannello admin NON esiste nessun controllo per togglare `isPublished` — nessun toggle nella tab Info, nessun bottone "Pubblica ristorante", nessun menu sullo stato. Il workflow attuale richiede di aggiornare il flag via SQL diretto su Supabase. Scoperto durante il rodaggio della Fase 3 (deploy). Da implementare in Fase 4 o 5: probabilmente un toggle nella tab Info sezione "Stato pubblicazione", o un bottone nell'header del ristorante accanto al badge "Bozza", con dialog di conferma perché pubblicare è un'azione che espone il ristorante al pubblico.
- **`prisma.config.ts` vs `package.json#prisma` — deprecation warning**: ogni comando `prisma generate` / `migrate deploy` stampa un warning "`package.json#prisma` is deprecated and will be removed in Prisma 7". Il progetto ha entrambi, ma `prisma.config.ts` prende il sopravvento (come conferma il warning successivo "The Prisma config file in prisma.config.ts overrides..."). Da pulire il campo `prisma` in `package.json` prima di migrare a Prisma 7.
- **Aggiornamento a Prisma 7**: durante i deploy è emerso un suggerimento di aggiornamento da 6.19.3 a 7.x. È una major version, va gestita in sessione dedicata dopo aver letto la migration guide ufficiale. Da pianificare in Fase 4 o 5.

## Prossimo step — Deploy su Vercel

1. Seguire `DEPLOY-VERCEL.md` (guida scritta in Fase 1).
2. Creare nuovo progetto Supabase `aifolly-menu-prod` con credenziali separate dal dev.
3. Applicare le migrazioni sulla prod: `add_auth_and_ownership`, `add_media_asset` (più la migrazione iniziale di Fase 1).
4. Creare bucket `restaurant-media` anche su Supabase prod + stesse policy RLS.
5. Configurare variabili d'ambiente su Vercel (vedi sezione sotto).
6. Deploy.
7. Post-deploy: creare il primo utente con `create-user` (dovrà essere eseguito in locale puntando alle env di produzione, temporaneamente).

## Dopo il deploy

- Fase 3 — Rifinitura auth avanzata (2FA opzionale, gestione password, collaboratori)
- Fase 4 — Polish e sicurezza (ISR, rate limiting, testing, revalidation, migrazione `proxy.ts`, focus trap modali)
- Fase 5 — Produzione (Sentry, PostHog, SEO, Open Graph, ottimizzazione immagini, orphan cleanup job)
- Fase 6 — Super Admin + Stripe (pannello Super Admin con Opzione A "stessa app", integrazione Stripe, webhook, impersonazione, audit log)

## Decisioni architetturali chiave prese in Fase 2

- **1 User → N Restaurant** (campo `ownerId` su Restaurant, nullable per ora)
- **Auth**: solo email+password (NextAuth v5 Credentials, sessione JWT, bcryptjs)
- **Creazione utenti**: solo via script CLI (`npm run create-user`), il vero Super Admin sarà Fase 6
- **Upload immagini**: sempre via API route server-side (mai client diretto), service role key per bypassare RLS, path convention `{restaurantId}/{kind}/{timestamp}-{random}-{filename}`
- **Tag e allergeni dei piatti**: enum array PostgreSQL (DishTag, Allergen), non tabelle join
- **Drag & drop**: `@dnd-kit` con reindicizzazione completa in transazione Prisma (no fractional indexing)
- **Cleanup orfani immagini**: pragmatico, non perfetto; orphan job è Fase 5
- **Route groups**: `(auth)` per login, `(dashboard)` per tutto il resto dell'admin
- **Theme builder UX**: 2 tab (Copertina/Menu) invece di 3 separate per i livelli cover/menu/dish, perché il ristoratore pensa in termini di "copertina" e "pagina menu", non in termini di 3 livelli tecnici
- **Preview tema**: iframe con cache-bust via counter, non reload programmatico; più robusto
- **Debounce auto-save tema**: 800ms, con indicatore "Salvataggio.../Salvato ✓" inline (no toast per non spammare)
- **QR code**: generato on-demand, mai salvato in Storage; è funzione pura dello slug

## File chiave aggiunti in Fase 2

### Auth e middleware
- `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/lib/auth-helpers.ts`
- `src/middleware.ts`

### Supabase Storage
- `src/lib/supabase/server.ts`, `src/lib/media/upload.ts`, `src/lib/media/delete.ts`
- `src/app/api/admin/media/**`

### Theme builder
- `src/lib/theme/google-fonts.ts` (48 font curati)
- `src/app/admin/(dashboard)/restaurants/[id]/theme/actions.ts`
- `src/components/admin/theme/**` (16 file: ThemeBuilder, CoverControls, MenuControls, DishControls, PresetPicker, ColorField, FontConfigEditor, FontFamilyPicker, ContrastWarning, ThemePreviewFrame, ThemeActionsHeader, ConfirmModal, NumberField, SelectField, ToggleField, ecc.)

### QR code
- `src/lib/qr/generate.ts`
- `src/components/admin/QRManager.tsx`

### Polish Step 8
- `src/lib/toast.ts` (wrapper sonner)
- `loading.tsx` e `error.tsx` sparsi sulle route admin

### Script CLI
- `scripts/create-user.ts`, `scripts/assign-restaurant.ts`

### Layout e navigazione admin
- `src/app/admin/(auth)/login/`, `src/app/admin/(dashboard)/**`
- `src/components/admin/Sidebar.tsx`, `CategoriesManager.tsx`, `DishesList.tsx`, `DishForm.tsx`, `ImageUploader.tsx`

### Migrazioni Prisma
- `add_auth_and_ownership` (User, Account, Session, VerificationToken, Restaurant.ownerId)
- `add_media_asset` (modello MediaAsset + enum MediaKind)

## Variabili d'ambiente da replicare su Vercel (produzione)

```
# Database (Supabase prod, nuovo progetto aifolly-menu-prod)
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...pooler.supabase.com:5432/postgres"

# NextAuth
AUTH_SECRET="..."  # generare nuovo con `npx auth secret`, NON riusare quello dev
AUTH_TRUST_HOST="true"

# Supabase Storage (prod)
NEXT_PUBLIC_SUPABASE_URL="https://<progetto-prod>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."  # service_role del progetto prod, mai committare
SUPABASE_STORAGE_BUCKET="restaurant-media"

# App URL pubblico (per QR code generator)
NEXT_PUBLIC_APP_URL="https://aifolly-menu.vercel.app"  # o dominio custom
```

⚠️ **Nessuna variabile del dev va riusata in produzione.** Nuovo `AUTH_SECRET`, nuovo progetto Supabase, nuova service role key.

## Come ripartire per il deploy

1. Aprire il terminale in `C:\Users\Michele\source\repos\aifolly-menu`
2. `git status` — verifica di essere su `feature/fase-2-admin` e pulito
3. Smoke test finale in locale: `npm run dev`, login, giro completo del pannello (~5 minuti)
4. Merge del branch su main:
   ```powershell
   git checkout main
   git merge --no-ff feature/fase-2-admin -m "feat: complete Fase 2 - admin panel"
   git push origin main
   ```
5. Aprire una nuova conversazione con Claude, incollare questo file, e dire:
   **"Fase 2 completata e mergeata su main. Procediamo con il deploy su Vercel seguendo DEPLOY-VERCEL.md."**
