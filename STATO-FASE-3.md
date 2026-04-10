# AiFolly Menu — Stato Fase 3 (deploy su Vercel — completata)

## Risultato finale

- ✅ Repo GitHub privato: https://github.com/michele-matula/aifolly-menu
- ✅ Supabase prod: progetto `aifolly-menu-prod` su region Ireland (eu-west-1)
- ✅ Vercel production: https://aifolly-menu.vercel.app
- ✅ Primo utente admin creato in prod: `matulamichele@gmail.com`
- ✅ Primo ristorante di test creato in prod: "Best" (slug `best-salerno`), pubblicato, tema Elegante applicato
- ✅ Flusso completo validato: login admin → tab Info → tab Tema → preview iframe → menu pubblico in incognito

## Cronologia sintetica della sessione di deploy

1. **Setup repo su GitHub** (branch master → main, primo push privato)
2. **Fase 1 — preparazione codice**: aggiunto `postinstall: prisma generate` al `package.json`
3. **Fase 2 — Supabase prod**: creato progetto, bucket Storage `restaurant-media` con policy SELECT pubblica, applicate 3 migrazioni Prisma, seedati 8 preset di tema tramite nuovo script `scripts/seed-presets-prod.ts`
4. **Fase 3 — Vercel**: account creato, repo importato, 8 env vars configurate (DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_TRUST_HOST, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET, NEXT_PUBLIC_APP_URL), primo deploy andato a buon fine
5. **Battaglia con Prisma su Vercel** (vedi sezione "Lezioni apprese" sotto)
6. **Fase 4 — post-deploy**: creato primo utente admin, creato primo ristorante di test, validato flusso end-to-end

## Decisioni architetturali prese durante il deploy

### Migrazione da `prisma-client` a `prisma-client-js` (forzata)

**Problema**: il progetto era stato creato con `generator client { provider = "prisma-client" }` (il nuovo provider sperimentale di Prisma 6) e con `output = "../src/generated/prisma"` (path custom). Questa combinazione su Vercel con Next.js 16 (Turbopack) causa un errore al runtime sulle serverless function: `PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"`. Il binario del query engine viene generato correttamente durante il build su Vercel, ma né Turbopack né Webpack riescono a tracciarlo e copiarlo nel bundle della Lambda perché è in un path custom fuori da `node_modules`.

**Tentativi falliti** (documentati per evitare di riprovare in futuro):
- Aggiunta di `binaryTargets = ["native", "rhel-openssl-3.0.x"]` al `schema.prisma` → non risolve
- Aggiunta di `serverExternalPackages: ["@prisma/client"]` a `next.config.ts` → non risolve
- Aggiunta di `outputFileTracingIncludes: { "/**/*": ["./src/generated/prisma/**/*"] }` a `next.config.ts` → non risolve
- Switch da Turbopack a Webpack tramite `next build --webpack` → non risolve (anzi cambia solo il path cercato, ora `.next/server/chunks`)

**Fix definitivo**: refactor completo a `provider = "prisma-client-js"` (il provider stabile tradizionale) con output di default in `node_modules/.prisma/client`. Questo è il pattern standard Prisma + Next.js + Vercel documentato e funzionante. Modifiche:
- `schema.prisma`: `provider = "prisma-client-js"`, rimosso `output`, tenuto `binaryTargets`
- 13 file applicativi: import modificato da `'@/generated/prisma/client'` (e varianti) a `'@prisma/client'`
- Cancellata cartella `src/generated/prisma`
- `next.config.ts`: tenuto solo `serverExternalPackages: ["@prisma/client"]`
- `package.json`: ritorno a `"build": "next build"` (Turbopack)

**Regola per il futuro**: per i prossimi progetti AiFolly che usano Next.js + Prisma + Vercel, **SEMPRE usare `provider = "prisma-client-js"` con output di default**. Il nuovo provider `prisma-client` (senza `-js`) è Preview/sperimentale e non compatibile con il deploy serverless Vercel out-of-the-box.

### Seed minimo in produzione (Opzione B)

Scelta di seedare in prod **solo gli 8 preset di tema**, niente ristorante demo, niente piatti di esempio. Questo mantiene pulito il DB prod e evita confusione con dati finti quando arriveranno clienti reali. Script dedicato: `scripts/seed-presets-prod.ts`.

### Script CLI per creazione ristoranti

Creato nuovo script `scripts/create-restaurant.ts` (non esisteva in Fase 2). Motivazione: il pannello admin pre-Super-Admin non permette la creazione di ristoranti dall'interfaccia web, quindi serviva un tool CLI analogo a `create-user.ts` e `assign-restaurant.ts`. Lo script:
- Crea il ristorante con `name` e `slug` obbligatori
- Accetta opzionalmente `--owner-email` per settare `ownerId`
- Accetta opzionalmente `--preset <slug>` per applicare un preset di tema
- **Copia i `coverConfig`/`menuConfig`/`dishConfig` del preset nei campi `themeCover`/`themeMenu`/`themeDish` del ristorante al momento della creazione** (importante: senza questo, il theme builder del frontend crasha con "Cannot read properties of undefined (reading 'family')" perché si aspetta strutture JSON popolate, non `{}` vuoti)

## Bug scoperti durante il rodaggio post-deploy (tutti fixati o documentati)

### Bug 1 — Theme builder crasha se il ristorante ha tema vuoto (FIXATO)

**Sintomo**: cliccando sulla tab Tema di un ristorante appena creato, React renderizza l'error boundary con messaggio "Qualcosa è andato storto — Cannot read properties of undefined (reading 'family')".

**Causa**: lo script `create-restaurant.ts` originale creava ristoranti con `themeCover = {}`, `themeMenu = {}`, `themeDish = {}` (default Prisma). Il theme builder nel frontend assume che quegli oggetti contengano sempre strutture tipo `{ heading: { font: { family: '...' } } }` e crasha leggendo `.family` su `undefined`.

**Fix**: modificato `create-restaurant.ts` per caricare il preset via `prisma.themePreset.findUnique()` e copiare `coverConfig`/`menuConfig`/`dishConfig` nei campi del ristorante al momento della creazione.

**Debt residuo minore**: ✅ chiuso nel rodaggio post-Fase 3 (vedi `STATO-RODAGGIO.md`). Aggiunto gating in `theme/page.tsx`: se i 6 campi tema (live + draft) sono tutti vuoti, viene renderizzato il nuovo `EmptyThemeState` con il `PresetPicker` in evidenza, invece di montare `ThemeBuilder` che crasha. Resta aperto il caso (non producibile dagli script attuali) di tema parzialmente popolato.

### Bug 2 — Nessuna UI per pubblicare/depubblicare un ristorante (FIXATO nel rodaggio post-Fase 3)

**Sintomo**: il ristorante viene creato con `isPublished = false` (default schema). La query pubblica `/[slug]` filtra sui ristoranti pubblicati e risponde "Ristorante non trovato" anche se il ristorante esiste nel DB. Ma nel pannello admin non c'era nessun controllo per togglare `isPublished`.

**Workaround usato in Fase 3**: update manuale via SQL Editor su Supabase: `UPDATE "Restaurant" SET "isPublished" = true WHERE slug = 'best-salerno';`

**Fix applicato** (vedi `STATO-RODAGGIO.md`, commit `10be7b1`): aggiunta sezione "Stato pubblicazione" in fondo alla tab Info con `ToggleField` + `ConfirmModal`. Server action `setRestaurantPublished` con `requireOwnership`, update Prisma, e `revalidatePath` su admin + slug pubblico (`/[slug]` e `/[slug]/menu`). I dialog di conferma usano copy diversi e variant `primary`/`destructive` a seconda della direzione (publish vs unpublish). Il badge "Bozza/Pubblicato" nell'header del layout si aggiorna automaticamente grazie a `revalidatePath`.

## File nuovi creati in Fase 3

- `scripts/seed-presets-prod.ts` — wrapper per seedare solo i preset di tema in produzione
- `scripts/create-restaurant.ts` — script CLI per creare ristoranti con preset applicato
- `STATO-FASE-3.md` — questo file

## File modificati in Fase 3

- `package.json` — aggiunto script `postinstall: prisma generate`
- `prisma/schema.prisma` — refactor provider da `prisma-client` a `prisma-client-js`, rimosso output custom, aggiunto `binaryTargets`
- `next.config.ts` — aggiunto `serverExternalPackages: ["@prisma/client"]`
- 13 file applicativi in `src/`, `prisma/`, `scripts/` — import aggiornati da `@/generated/prisma/client` (e varianti) a `@prisma/client`
- Cancellata cartella `src/generated/prisma`

## Variabili d'ambiente configurate su Vercel

Tutte 8 settate per Production + Preview + Development: