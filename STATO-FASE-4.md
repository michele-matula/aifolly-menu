# AiFolly Menu — Stato Fase 4 (in corso)

Fase 4 = Polish e sicurezza. Lo Step 1 (security baseline) ha alzato
la base di sicurezza prima di affrontare gli altri temi. Lo Step 2
(data cache + tag invalidation) ha rimosso l'overhead DB sul menu
pubblico mantenendo immediatezza delle modifiche admin. Lo Step 3
(loading states + boundaries) ha chiuso i gap di skeleton/error
boundary residui di Fase 2 Step 8. Lo Step 4 (auth hardening) ha
chiuso il debt esplicito di Step 1 rate-limitando il callback
Credentials di NextAuth a 5 req/min per IP e rifacendo il logout
via Server Action per risolvere un bug CSRF scoperto dal smoke test
dello step stesso (il form HTML in Sidebar lasciava la sessione viva).
Lo Step 6 (performance review) ha chiuso il warning Google Fonts
preload iniettando i font del tema server-side, ottimizzato le
immagini del menu pubblico con next/image + AVIF/WebP, e introdotto
Speed Insights per baseline metrics. Durante lo step sono emersi due
gap pre-esistenti che sono stati chiusi contestualmente: un advisory
DoS Next.js (patch bump 16.2.3) e un validator imageUrl del piatto
che accettava URL arbitrari (hardening analogo a 1.3.d). Nota: la
numerazione degli step riflette l'ordine di esecuzione, non l'ordine
della scaletta originale nello spec — Step 5 (audit a11y) e' l'ultimo
rimasto di Fase 4.

## Branch e workflow

- Workflow: dev-first, un commit per sub-step, type check + build dopo
  ogni modifica, smoke test in dev prima di committare. Per ogni step
  un branch dedicato `feature/fase-4-...`, merge `--no-ff` su main,
  smoke test in prod post-deploy Vercel.

## Step 1 — Security baseline

Obiettivo: coprire le minacce più probabili allo stadio attuale del
progetto (clickjacking, scraping aggressivo, upload abusivo, CSS
injection via tema) con cambi a basso blast radius. Non punta a
copertura OWASP completa — è una baseline.

### Sub-step completati

| Sub | Cosa | File chiave | Commit |
|---|---|---|---|
| 1.1 | Security header HTTP base (4 header globali via `next.config.ts`) | `next.config.ts` | `d21b491` |
| 1.2 | Rate limiting in-memory su 2 endpoint critici | `src/lib/rate-limit.ts`, route handlers | `dcbeb8f` |
| 1.3 | Hardening tema + upload + audit dipendenze | `validators/theme.ts`, `media/upload.ts`, `theme/google-fonts.ts` | (commit pendente) |

### Sub-step 1.1 — Security headers

Aggiunti 4 header globali a tutte le route via `next.config.ts`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

**Why `SAMEORIGIN` invece di `DENY` (deviazione dalla spec §13.5)**: il
theme builder usa un iframe same-origin (`/{slug}?previewDraft=1`) per
la preview live. `DENY` lo bloccherebbe. La spec §13.5 era stata scritta
prima del theme builder, quindi devio consapevolmente.

**CSP esplicitamente differita**: è l'header più rischioso da
configurare (può rompere Supabase Storage, Google Fonts, l'iframe di
preview, Sonner). La pianifico come step dedicato dopo aver integrato
Sentry/PostHog (Fase 5) così conoscerò tutte le origini da allowlistare
in una sola passata.

### Sub-step 1.2 — Rate limiting

Helper sliding-window in-memory in `src/lib/rate-limit.ts`. Applicato a:

- `GET /api/menu/[slug]` → 100 req/min per IP
- `POST /api/admin/media/upload` → 10 req/min per `session.user.id`

Entrambi tornano `429 Too Many Requests` con header `Retry-After` quando
il budget è esaurito.

**Why in-memory e non Upstash Redis**: la spec §13.1 raccomanda Redis
con fallback in-memory. Per ora basta solo l'in-memory, con limitazione
nota e documentata: su Vercel lo stato è per-singola-Lambda-instance,
quindi un client distribuito su più instance può superare il limite
globale. È mitigation, non enforcement forte. Upstash quando vediamo
abuse reale o quando Sentry segnala rate limit raggiunti.

**Why sliding window e non token bucket**: più semplice, meno stato,
sufficiente per "non più di X richieste in Y secondi". Token bucket
serve per smoothing del traffico, qui non è quello che vogliamo.

**Login rate limit non implementato in questo step**: NextAuth v5
Credentials non espone hook puliti per pre-auth rate limiting, serve
un wrapper custom. È debt esplicito, step dedicato successivo.

### Sub-step 1.3 — Hardening tema + upload + audit

**1.3.a — `npm audit`**: 0 vulnerabilità su 543 dipendenze. Niente da
aggiornare.

**1.3.b — Password policy**: già presente in `scripts/create-user.ts`
(min 8 caratteri, regex email, bcrypt cost 10). Non c'è un endpoint
pubblico di registration, l'onboarding è solo CLI manuale, quindi è
adeguato.

**1.3.c — Whitelist font family**: `validators/theme.ts` accettava
`z.string().min(1).max(100)` su `family`, in violazione della spec
§13.4 che dice "i nomi dei font vengono confrontati contro la lista
ufficiale Google Fonts". Aggiunto `FONT_FAMILY_SET` (Set di lookup
O(1)) in `theme/google-fonts.ts` derivato da `CURATED_FONTS` (48 font).
Il validator ora rifiuta qualsiasi font fuori dal catalogo curato. I
default dei preset usano già font del catalogo, quindi nessuna
regressione.

**1.3.d — `backgroundImageUrl` ristretto a Supabase**: prima accettava
`z.string().url()` (qualsiasi URL). Ora richiede che l'host coincida
con `new URL(NEXT_PUBLIC_SUPABASE_URL).host`. Fail-closed: se l'env è
mancante o l'URL è malformato, rifiuta. Motivazione: evita che un owner
malizioso punti il background a un dominio terzo che farebbe tracking
dei visitatori del menu pubblico (non è SSRF perché il fetch è client-
side, ma è un gap di privacy).

**1.3.e — Magic bytes upload**: aggiunto `detectImageMime()` in
`lib/media/upload.ts` che legge i primi 12 byte del file e verifica le
signature di JPEG (FFD8FF), PNG (89504E47...), WebP ("RIFF"..."WEBP"),
AVIF ("ftypavif"). Strict match: se i magic bytes non corrispondono al
MIME dichiarato dal browser, l'upload viene rifiutato. Difesa contro
file con estensione/MIME falsificati. AVIF supporta solo il major brand
"avif" — varianti meno comuni come "avis"/"mif1" sarebbero rifiutate
(trade-off accettabile).

## Audit OWASP Top 10 — stato attuale

Snapshot informale eseguito durante lo Step 1. Non è uno scan
automatizzato, è una review per ispezione del codice.

| # | Rischio | Stato | Note |
|---|---|---|---|
| A01 | Broken Access Control | ✅ | `proxy.ts` su `/admin/:path*`, ownership check su tutte le API admin via `restaurant.ownerId === session.user.id` |
| A02 | Cryptographic Failures | ✅ | bcryptjs, JWT NextAuth, HTTPS Vercel, **HSTS aggiunto in 1.1**, secrets in env |
| A03 | Injection | ✅ | Prisma parametrizzata, React escape default, 0 `dangerouslySetInnerHTML`, 0 `child_process`, HEX colori validati Zod, **font whitelist aggiunta in 1.3.c**, **dish.imageUrl ristretto a host Supabase in Step 6.3.b** |
| A04 | Insecure Design | ⚠️ | Decisioni chiave già prese (multi-tenant, draft visibility), nessun threat model formale |
| A05 | Security Misconfiguration | ⚠️ | 4 header attivi, **CSP differita** |
| A06 | Vulnerable Components | ✅ | `npm audit` 0/450 post-bump, **Next 16.2.3 patch** (GHSA-q4gf-8mx6-v5v3, Step 6.4), ma **nessun Dependabot/Renovate**, Prisma 6 vs 7 noto |
| A07 | Auth Failures | ⚠️ | bcrypt + JWT OK, **rate limit login aggiunto in Step 4** (5/min per IP), **logout CSRF fix in Step 4.4** (Server Action), no 2FA (Fase 6), no account lockout |
| A08 | Data Integrity | ⚠️ | `package-lock.json` OK, Vercel firma i deploy, niente di più sofisticato |
| A09 | Logging/Monitoring | ❌ | Solo Vercel function logs, no Sentry, no PostHog, no audit log — è il gap più grande, lavoro di Fase 5 |
| A10 | SSRF | ✅ | L'app non fa fetch server-side di URL forniti dall'utente |

## Step 2 — Data cache + tag invalidation

Obiettivo: rimuovere l'overhead DB sulle pagine pubbliche del menu,
mantenendo immediatezza nelle modifiche admin (quando il ristoratore
pubblica un cambio, il visitatore lo vede subito, non dopo 60s).

### Sub-step completati

| Sub | Cosa | File chiave | Commit |
|---|---|---|---|
| 2.1 | Data cache helper + RESTAURANT_TAG centralizzato | `lib/cache/restaurant.ts`, `lib/queries/restaurant.ts`, 2 pagine pubbliche | `972bc58` |
| 2.2 | Tag invalidation in tutte le mutation pubbliche | 4 file di server actions admin | `3a09764` |
| 2.3 | Test funzionali in dev (5 scenari) | — | (no commit) |
| 2.4 | Update STATO-FASE-4.md | `STATO-FASE-4.md` | (commit pendente) |

### Sub-step 2.1 — Data cache (non page-level ISR)

**Why data cache e non `export const revalidate = 60`**: in App Router
le pagine che leggono `searchParams` o cookie diventano automaticamente
dynamic — `revalidate = 60` non basta. Le 2 pagine pubbliche leggono
entrambi (`searchParams.previewDraft` per il preview owner, e cookie
via `tryGetOwnershipBySlug`). Quindi non possiamo cachare la pagina
intera. Invece cachiamo il **data fetch**: la query Prisma pesante
(`getPublicRestaurant`) viene wrappata in `unstable_cache` con
`revalidate: 60` e tag `restaurant:${slug}`. La pagina rende ancora
per ogni request (~ms), ma il bottleneck DB sparisce.

`force-dynamic` è stato rimosso da entrambe le pagine; l'effetto
runtime resta lo stesso (sono dinamiche per altri motivi), ma è
documentalmente corretto.

**Why centralizzare RESTAURANT_TAG**: se i ~5 call site della
invalidazione costruissero a mano la stringa `restaurant:${slug}`,
basterebbe un typo in uno solo (`restaurants:` plurale, o
`restaurant_${slug}` con underscore) per avere un bug **silenzioso**:
"quando modifico una categoria il menu pubblico si aggiorna subito,
ma quando modifico un piatto resta vecchio per 60s". Hard da spottare
in code review. Centralizzare la costante (`RESTAURANT_TAG(slug)`) +
exporre un singolo helper (`invalidateRestaurantPublic(slug)`) che la
usa elimina la bug class.

**Why preview branch separato**: le pagine continuano a chiamare
`getPublicRestaurant` direttamente quando `?previewDraft=1` è settato,
così l'owner che sta editando vede SEMPRE l'ultimo draft, anche se la
cache pubblica è calda. Pattern documentato nella spec §9.4.

### Sub-step 2.2 — Hookup invalidazione

Sostituite le chiamate `revalidatePath('/${slug}')` +
`revalidatePath('/${slug}/menu')` con `invalidateRestaurantPublic(slug)`
in 4 file di mutation server actions:

- `restaurants/[id]/actions.ts`: `updateRestaurantInfo` (gestisce
  cambio slug invalidando sia il tag vecchio che il nuovo),
  `setRestaurantPublished`
- `theme/actions.ts`: `publishTheme` (le mutation di draft —
  `updateThemeDraft`, `applyPreset`, `discardDraft` — NON invalidano
  perché toccano solo la preview, che non passa per la cache)
- `categories/actions.ts`: helper `revalidateRestaurant` aggiornato,
  i 4 CRUD/reorder ereditano
- `dishes/actions.ts`: stesso pattern del helper categorie

I `revalidatePath('/admin/...')` sono stati lasciati invariati: le
pagine admin non sono dietro `unstable_cache`, quindi il meccanismo
path-based è quello giusto per loro.

**Why `updateTag` invece di `revalidateTag`**: in Next 16 la signature
di `revalidateTag` è cambiata e ora richiede un `profile` parametro
(`revalidateTag(tag, profile)`). Inoltre Next 16 ha introdotto
`updateTag(tag)` con semantica **read-your-own-writes** quando chiamato
da una server action. È esattamente quello che vogliamo: dopo un
mutation admin, il tag viene invalidato E la prossima lettura nella
stessa request vede il dato fresco. `revalidateTag` con profile è
pensato per casi diversi (cache lifetime profile-based, modello nuovo).

### Sub-step 2.3 — Test funzionali (5 scenari, tutti verdi)

Eseguiti in dev su `npm run dev`:

1. **Cache hit base**: prima request a `/best-salerno` = miss, seconda
   = cache hit (verificato visivamente, niente query Prisma duplicate
   nei log)
2. **Modifica nome categoria** dal pannello admin → la pagina pubblica
   riflette il cambio **immediatamente** (non dopo 60s)
3. **Pubblica tema**: cambio colore + click Pubblica → il menu pubblico
   riflette immediatamente
4. **Update info ristorante** (tagline) → riflette immediatamente
5. **Preview iframe** (`?previewDraft=1`) → SEMPRE fresca, anche con
   la cache pubblica calda (passa per il branch non-cached)

Build di produzione e `tsc --noEmit` puliti dopo ogni sub-step.

### Decisione architetturale: `unstable_cache` vs `'use cache'`

Next 16 introduce un nuovo modello di caching basato sulla direttiva
`'use cache'` con `cacheTag()` + `cacheLife(profile)` (profili
predefiniti `'default'`, `'minutes'`, `'hours'`, ecc., oppure custom
`{ stale, revalidate, expire }`).

Abbiamo scelto **`unstable_cache`** per Step 2 anche se è la API
legacy. Motivazioni:
- Funziona, è stabile in pratica, e il diff è compatto
- Il modello a 3 dimensioni del nuovo API è overkill per il nostro
  caso ("cache 60s, invalida on demand")
- L'invalidazione usa già `updateTag`, che è la nuova API — quindi
  siamo solo metà-dietro

`unstable_cache` quasi sicuramente sparirà in Next 17. La migrazione
al directive `'use cache'` è debt esplicito, vedi sotto.

## Step 3 — Loading states + error boundaries

Obiettivo: chiudere i gap di skeleton e error boundary residui da
Fase 2 Step 8. Pure UI work, basso rischio, niente logica toccata.

### Sub-step completati

| Sub | Cosa | File chiave | Commit |
|---|---|---|---|
| 3.1 | Skeleton content-shaped per la pagina menu pubblica | `(menu)/[slug]/menu/loading.tsx` | `f545374` |
| 3.2 | Form skeletons + root boundaries (4 file) | `dishes/new/loading.tsx`, `dishes/[dishId]/edit/loading.tsx`, `not-found.tsx`, `global-error.tsx` | `4c8dc81` |
| 3.3 | Update STATO-FASE-4.md | `STATO-FASE-4.md` | (commit pendente) |

### Audit pre-step (cosa esisteva già da Fase 2 Step 8)

**Pagine pubbliche**: il cover (`(menu)/[slug]`) aveva già loading,
error e not-found di alta qualità (skeleton content-shaped, error
brandizzato con retry). Il menu (`(menu)/[slug]/menu`) ereditava
loading/error/not-found dal cover, **causando un flash visivo
sbagliato durante il tap "Scopri il menu"**: il cliente vedeva uno
skeleton a forma di copertina che poi diventava un menu.

**Admin**: 7 file `loading.tsx` esistenti (dashboard, restaurant info,
categories, dishes, media, qr, theme) + 2 file `error.tsx` (dashboard,
restaurant info). Le sub-route `dishes/new` e `dishes/[dishId]/edit`
**ereditavano lo skeleton di dishes** (lista) — sbagliato, sono form.

**Root**: niente `not-found.tsx` (Next default per URL non matchati),
niente `global-error.tsx` (no last-resort boundary).

### Sub-step 3.1 — Menu page skeleton

Nuovo `(menu)/[slug]/menu/loading.tsx` ~140 righe. Stessa palette e
animazione `skeletonPulse` del cover loading per coerenza visiva
durante la transizione. Struttura content-shaped: header hero, sticky
nav (5 pill), section header, 4 dish card (thumbnail + title +
description + price), footer placeholder. Tutto inline `<style>` e
inline styles, no Tailwind — coerente con lo stile del cover loading.

### Sub-step 3.2 — Form skeletons + root boundaries

4 file nuovi:

- **`dishes/new/loading.tsx`** e **`dishes/[dishId]/edit/loading.tsx`**:
  form skeleton con 6 coppie label/input + 2 button. Tailwind
  (`animate-pulse bg-stone-100`) per coerenza con gli altri admin
  loading. **Duplicati intenzionalmente**: estrarre `<DishFormSkeleton/>`
  a 2 call site è scope creep prematuro. Se in futuro nasce un terzo
  call site, valuto refactor.
- **`src/app/not-found.tsx`**: root 404 brandizzato per URL non
  matchati da nessuna route. Usa il root layout (Geist + Tailwind).
  Le pagine `(menu)` hanno il loro `not-found.tsx` dedicato con copy
  diversa ("ristorante non trovato"), che resta prioritario sul match
  più specifico.
- **`src/app/global-error.tsx`**: last-resort error boundary con il
  proprio `<html>` + `<body>` (sostituisce il root layout intero se
  attivato). **Minimale**: niente font custom, niente Tailwind, niente
  dipendenze dal layout — deve funzionare anche se il layout stesso
  è crashato. `'use client'` come richiede il pattern Next.

### Cosa NON ho fatto in Step 3 (debt esplicito)

- **Refactor di `theme/loading.tsx`** da skeleton generico a
  content-shaped. Funziona, è polish ulteriore non necessario.
- **Loading skeleton per `/admin/login` e `/`**: entrambi static, no
  fetching, no value.
- **Estrazione `<DishFormSkeleton />` componente condiviso**: 2 call
  site, DRY prematuro.
- **Audit a11y dei boundary** (focus management, screen reader
  announcements del loading state): è Step 5.
- **Fix warning Google Fonts preload**: durante l'audit ho notato che
  `(menu)/[slug]/error.tsx` e `not-found.tsx` includono inline un
  `<link href="https://fonts.googleapis.com/css2?family=Cormorant..."`
  che usa la stessa URL del warning. Potrebbe essere correlato. Lo
  affronto in Step 6 (performance review).

### Verifica e workflow

- Branch dedicato `feature/fase-4-step-3-loading-states`
- 3 commit (uno per sub-step come da plan)
- `tsc --noEmit` e `npm run build` puliti dopo ogni commit
- Test manuale in dev: navigazione cover → menu, refresh durante load,
  apertura form dish nuovo, simulazione 404 con URL random

## Step 4 — Auth hardening (login rate limit + logout CSRF fix)

Obiettivo originale: chiudere il debt esplicito di Step 1 (login rate
limit non implementato perché NextAuth v5 Credentials non espone hook
puliti pre-auth) e coprire il target della spec §13.1: "5 req/min per
IP". Durante lo smoke test dello step è emerso un bug CSRF pre-esistente
sul pulsante logout che è stato fixato nello stesso branch perché
scoperto dalla stessa verifica e tematicamente coerente (entrambi
riguardano hardening dell'auth surface NextAuth v5).

### Sub-step completati

| Sub | Cosa | File chiave | Commit |
|---|---|---|---|
| 4.1 | Wrapper `POST` in `[...nextauth]/route.ts` che rate-limita il path `/callback/credentials` | `api/auth/[...nextauth]/route.ts` | `cb26533` |
| 4.2 | 429 body NextAuth-client compatible + UX client specifica | `route.ts`, `login/login-form.tsx` | `d5697c1` |
| 4.3 | Update `STATO-FASE-4.md` (rate limit) | `STATO-FASE-4.md` | `cd60ae0` |
| 4.4 | Fix logout via Server Action (MissingCSRF bug) | `admin/(dashboard)/actions.ts` (nuovo), `Sidebar.tsx` | `5b09e37` |
| 4.5 | Update `STATO-FASE-4.md` (logout fix) | `STATO-FASE-4.md` | (commit pendente) |

### Threat model

Oggi un attaccante può brute-forceare `POST /api/auth/callback/credentials`
con l'unico throttle naturale di bcrypt (cost 10, ~60-80ms). In pratica
~10-15 tentativi/s per account su un singolo thread, ~50k/h —
sufficiente per dizionari piccoli ma non per brute force completo. Il
rate limit a 5 req/min abbassa il tetto a 7200 tentativi/giorno/IP,
rendendo impraticabile qualsiasi attacco seriale.

### Architettura scelta: wrapper del `POST` handler

NextAuth v5 espone `handlers.POST` come **unico** App Route Handler
che dispatcha internamente tutte le sub-route (`/callback/...`,
`/signout`, `/session`, `/csrf`, ecc.). Intercettiamo il POST prima di
delegare, controlliamo che `request.nextUrl.pathname.endsWith(
'/callback/credentials')`, e solo in quel caso applichiamo
`checkRateLimit(\`login:${ip}\`, 5, 60_000)`. Tutti gli altri POST
NextAuth passano attraverso intatti — signout, csrf, futuri callback
OAuth.

**Why NON nel callback `authorize` di NextAuth** (alternativa scartata):

- `authorize` può accedere a `credentials`/`request`, ma non può
  produrre una `NextResponse` con `status: 429` proper. Return `null`
  = "credenziali non valide", throw = "configurazione" — in entrambi
  i casi il client non può distinguere il 429 dal fallimento auth.
- Dal wrapper del route handler restituiamo una 429 HTTP reale con
  header `Retry-After`, coerente con `/api/menu/[slug]` e
  `/api/admin/media/upload` già rate-limitati.
- Separazione pulita: rate limit è HTTP concern, auth è credentials
  concern.

### Sub-step 4.1 — Rate limit su `/callback/credentials`

Wrapper di ~25 righe in `src/app/api/auth/[...nextauth]/route.ts`.
Usa `checkRateLimit` + `getClientIp` da `src/lib/rate-limit.ts` con
chiave `login:${ip}`, limit 5, window 60_000 ms (spec §13.1).

### Sub-step 4.2 — 429 body NextAuth-client compatible

Bug latente scoperto durante la verifica: `next-auth/react` (v5) nel
client-side `signIn()` fa **unconditionally**:

```js
const error = new URL(data.url).searchParams.get("error") ?? undefined;
```

(vedi `node_modules/next-auth/react.js:174`). Se il body della 429
non contiene un `data.url` valido assoluto, `new URL(undefined)` lancia
`TypeError`, il promise di `signIn` rigetta, il form resta bloccato in
`loading=true` con l'utente a fissare uno spinner senza feedback.

**Fix lato server**: il 429 ora include un `url` assoluto che punta a
`/admin/login?error=RateLimit`, lasciando `error` come campo leggibile
umano (ignorato da signIn ma utile a curl/chiamanti diretti).

```json
{
  "url": "https://aifolly-menu.vercel.app/admin/login?error=RateLimit",
  "error": "Troppi tentativi. Riprova tra qualche secondo."
}
```

Con questo shape, `signIn()` ritorna pulito
`{ error: 'RateLimit', code: undefined, status: 429, ok: false, url: null }`.

**Fix lato client**: `login-form.tsx` branch esplicito su
`result?.status === 429` per mostrare "Troppi tentativi. Riprova tra
qualche secondo." invece del generico "Email o password non corretti".
La protezione reale resta server-side, il messaggio è UX.

Ho accettato di introdurre 4.2 come commit separato (non amend di 4.1)
perché il workflow proibisce amend e perché la storia in git log
riflette onestamente la scoperta del bug latente durante la verifica.

### Parametri rate limit

- `limit = 5`, `window = 60_000 ms` da spec §13.1
- Chiave IP-only (`login:${ip}`): coerente con spec, nessun budget
  parallelo per-email per ora
- Nota NAT: utenti dietro lo stesso NAT condividono il budget. Per
  AiFolly in pratica è irrilevante (pochi ristoratori)
- Nota per-Lambda: stato in-memory, non cross-instance. Stesso trade-off
  documentato in Step 1 sub-step 1.2. Mitigation, non enforcement forte.

### Sub-step 4.3 — Update STATO-FASE-4.md (rate limit)

Sezione Step 4 (questa), aggiornamento riga OWASP A07, rimozione del
"login rate limit" dalla debt list di Step 1, spostamento nella lista
"Cosa NON ho fatto in Step 4".

### Sub-step 4.4 — Logout via Server Action (fix MissingCSRF)

**Discovery**: durante lo smoke test post-4.3 ho chiesto all'utente di
verificare il flusso completo login → logout → re-login. Al click su
"Esci" l'utente veniva redirect a `/admin/login?error=MissingCSRF`.
Investigato via lettura del codice NextAuth core + riproduzione con
curl sul cookie jar reale.

**Root cause**: il form in `src/components/admin/Sidebar.tsx:56` era
scritto così dai tempi di Fase 2 Step 2 (commit `1c171d4`, 8 aprile):

```tsx
<form action="/api/auth/signout" method="POST">
  <button type="submit">Esci</button>
</form>
```

Puro HTML, nessun campo `csrfToken` nel body. NextAuth v5 enforce
double-submit-cookie CSRF su tutti i POST state-changing (non solo su
`/callback/credentials`): la catena è `AuthInternal` →
`createCSRFToken` → verifica `cookie.token === body.csrfToken` →
fail → `validateCSRF("signout", false)` → throw `MissingCSRF` →
redirect a `pages.signIn` con `?error=MissingCSRF`. Crucialmente il
throw avviene **prima** di `actions.signOut`, quindi `authjs.session-
token` non viene mai cancellato. Il pulsante logout era decorativo: il
browser atterrava sulla pagina di login ma la sessione restava viva.
Chiunque ricaricasse `/admin` dopo il "logout" ritrovava la sessione
attiva.

Classe di bug: security logout CSRF. Non è un data breach remoto ma
è una vulnerabilità funzionale reale (accesso fisico al browser dopo
un "logout" apparente → sessione ancora valida).

**Perché non è stato notato prima**: il pulsante logout non è mai
stato testato nel browser prima di questo smoke test. Fase 2 Step 2
aveva test dei form admin ma non del logout. Il rodaggio Fase 3
(`STATO-RODAGGIO.md`) non aveva logout come test case. In dev si tende
a killare il processo invece di cliccare "Esci".

**Soluzione scelta: Server Action**

Nuovo file `src/app/admin/(dashboard)/actions.ts`:

```ts
'use server';
import { signOut } from '@/lib/auth';

export async function signOutAction() {
  await signOut({ redirectTo: '/admin/login' });
}
```

E `Sidebar.tsx` ora ha `<form action={signOutAction}>` invece della
stringa URL.

**Perché Server Action e non `signOut` da `next-auth/react`**
(alternativa A scartata):

- `next-auth/react` signOut() fa `getCsrfToken()` + `POST
  /api/auth/signout` — due roundtrip, richiede JavaScript, passa
  ancora per il route HTTP che è stato wrappato dal rate limiter
  di Step 4.1. Workaround ingegneristico che sostituisce un form
  rotto con una chiamata fetch invece di risolvere il problema alla
  radice.
- La Server Action bypassa completamente `/api/auth/signout`. Chiama
  direttamente `signOut()` server-side dall'istanza NextAuth, che
  invalida il JWT, cancella il cookie di sessione, e gestisce la
  redirect via `redirectTo`. Zero roundtrip per CSRF fetch, zero
  JSON marshalling, zero URL handling.

**Perché Server Action e non hidden input csrfToken** (alternativa B
scartata):

- Richiederebbe di leggere `cookies()` in un Server Component,
  parsare il cookie `authjs.csrf-token` nel formato `token|hash`,
  iniettare il token grezzo come hidden input. Tutto basato su
  internals NextAuth non garantiti stabili tra minor version.
- E se l'utente arriva su `/admin` senza aver mai hit `/api/auth/csrf`
  prima, il cookie non esiste — dovremmo forzare la generazione lato
  server. Fragile.

**Perché Server Action è strutturalmente corretta**:

1. **CSRF protection framework-level**: Next.js 16 firma gli action
   ID con il server secret, check `Origin`/`Host` header, encoding
   opaco dell'endpoint. Un sito cross-origin non può forgiare la
   chiamata. Più robusto del double-submit-cookie manuale.
2. **Progressive enhancement**: il form funziona anche con JS
   disabilitato. Next.js dispatcha la form submission al server via
   POST standard. Nessuna perdita di funzionalità.
3. **Un roundtrip**. NextAuth client signOut() fa due. Server Action
   fa uno.
4. **Type-safe**. L'import di `signOutAction` è tipato; cambiamenti
   futuri alla signature triggererebbero errori di compilazione.
5. **Pattern ufficiale NextAuth v5**. La [doc upstream](https://authjs.dev)
   mostra esattamente questo pattern come raccomandato.
6. **Coerente con il resto del codebase**. Admin usa già Server
   Actions per `restaurants/[id]/actions.ts`,
   `categories/actions.ts`, `dishes/actions.ts`, `theme/actions.ts`.
   Il logout diventa cittadino di prima classe dello stesso sistema.

**Location del file**: `src/app/admin/(dashboard)/actions.ts` perché
la Sidebar è renderizzata solo dentro il layout `(dashboard)`,
co-locato con il consumatore unico. Non lo metto in `src/lib/` perché
non è una utility generica — è l'action di una pagina specifica.

**Verifica** (smoke test in dev completato dall'utente):

1. Hard refresh su `/admin/login`
2. Login ok con credenziali demo → redirect a `/admin`
3. Click "Esci" → redirect a `/admin/login` **senza** `?error=MissingCSRF`
4. Cookie `authjs.session-token` rimosso da DevTools
5. Visita diretta a `/admin` → proxy middleware rimanda a `/admin/login`
6. Re-login → entra normalmente

`npx tsc --noEmit` e `npm run build` puliti post-modifica.

### Sub-step 4.5 — Update STATO-FASE-4.md (logout fix)

Questa sezione + rinomina dello step a "Auth hardening" + aggiornamento
della riga OWASP A07 (il logout rotto era un gap di auth management,
ora chiuso).

### Cosa NON ho fatto in Step 4 (debt esplicito)

- **Account lockout** (blocco persistente dopo N fallimenti per
  email): serve storage DB (`User.failedLoginAttempts` + `lockedUntil`).
  Più aggressivo del rate limit ma non nella spec. Sub-step futuro se
  vediamo abuse.
- **Email-based rate limit parallelo**: budget per-email in aggiunta
  al budget per-IP. Richiederebbe di clonare il body della form. Non
  nella spec §13.1.
- **CAPTCHA progressivo** (hCaptcha/Turnstile dopo N tentativi):
  overkill per il volume di traffico attuale, dipendenza esterna
  aggiunta.
- **Reset password flow**: non esiste nemmeno oggi nel prodotto
  (onboarding CLI-manuale via `scripts/create-user.ts`). Quando verrà
  implementato ci sarà bisogno di un rate limit dedicato (3 req/ora
  per email, da spec §13.1).
- **Test automatizzato del rate limit**: la verifica è stata manuale
  via curl loop. Test automatico serve infra di setup (mock del
  buckets Map) che non vale il costo per un singolo endpoint.

### Verifica in dev

Test con curl loop (script in-session, non persistente):

1. `GET /api/auth/csrf` per ottenere token + cookie
2. Loop di 6 `POST /api/auth/callback/credentials?json=true` con
   credenziali sbagliate
3. Attempts 1-5: HTTP 302 (fallimento auth normale)
4. Attempt 6: HTTP 429 con header `Retry-After` e body
   `{"url":"...?error=RateLimit","error":"Troppi tentativi..."}`
5. `POST /api/auth/signout` subito dopo: HTTP 302, non rate-limited
   (il path non matcha `/callback/credentials`)

`tsc --noEmit` e `npm run build` puliti dopo ciascun sub-step.

## Step 6 — Performance review

Obiettivo: ottimizzare il percorso del visitatore finale (cover +
menu pubblico) sotto tre assi — font loading, immagini, baseline
metrics — e chiudere il warning "preloaded but not used" emerso in
Step 3. Durante l'esecuzione sono emersi due gap pre-esistenti che
sono stati chiusi contestualmente perche' bloccanti o tematicamente
coerenti: un validator `imageUrl` del piatto non ristretto e un
advisory DoS Next.js scoperto all'install di `@vercel/speed-insights`.

### Sub-step completati

| Sub | Cosa | File chiave | Commit |
|---|---|---|---|
| 6.1 | Font loading strutturale server-side | `MenuFonts.tsx` (nuovo), `ThemeProvider.tsx`, `(menu)/[slug]/page.tsx`, `(menu)/[slug]/menu/page.tsx`, `error.tsx`, `not-found.tsx` | `89547d4` |
| 6.2 | `next.config.ts` images remotePatterns + AVIF/WebP | `next.config.ts` | `d8d941f` |
| 6.3.a | Migrazione seed Unsplash → Supabase Storage | `scripts/migrate-seed-images.ts` (nuovo), `prisma/seed.ts`, `package.json` | `0b53382` |
| 6.3.b | Hardening `dish.imageUrl` a host Supabase | `validators/url.ts` (nuovo), `validators/theme.ts`, `validators/dish.ts` | `cc9fb9e` |
| 6.3.c | Swap `<img>` → `<Image>` in cover e dish card | `CoverPage.tsx`, `DishCard.tsx` | `68e1e1e` |
| 6.4 | Patch bump Next 16.2.2 → 16.2.3 (security DoS) | `package.json`, `package-lock.json` | `fdd321b` |
| 6.5 | Vercel Speed Insights nel layout menu | `(menu)/layout.tsx`, `package.json` | `485a32d` |
| 6.6 | Update STATO-FASE-4.md | `STATO-FASE-4.md` | (commit pendente) |

### Audit pre-step

Prima di toccare codice ho eseguito un audit su 7 aree del menu
pubblico (Google Fonts, immagini, strategia loading, bundle JS,
public assets, route config, Web Vitals). Findings rilevanti:

- **Google Fonts**: doppio path di caricamento. `ThemeProvider`
  client-side iniettava un `<link>` via `useEffect` (causando FOUT).
  `(menu)/[slug]/error.tsx` e `not-found.tsx` avevano un `<link>`
  hardcoded a Cormorant+Outfit — sorgente confermata del warning
  "preloaded but not used" segnalato in Step 3.
- **Immagini**: zero `next/image`. Tag `<img>` grezzi in `CoverPage`
  (logo + hero) e `DishCard` (thumbnail). Nessun `priority`, nessun
  `sizes`, nessun lazy esplicito, `next.config.ts` senza
  `remotePatterns`. Il hero cover e' LCP della pagina pubblica e
  restava non ottimizzato.
- **Bundle JS**: pulito. 6 client component, zero librerie di
  animazione/UI pesanti, solo React hooks + IntersectionObserver
  nativo. Nessun intervento necessario.
- **Web Vitals**: nessuna misurazione attiva. `@vercel/speed-insights`
  non installato, `web-vitals` non in `package.json`.

### Sub-step 6.1 — Font loading strutturale server-side

**Problema**: `ThemeProvider.tsx` era un client component che, in un
`useEffect`, creava un `<link rel="stylesheet">` puntando a Google
Fonts e lo appendeva a `document.head`. Doppio costo:

1. **FOUT**: il font del tema viene applicato solo dopo hydration,
   quindi il primo paint usa il system font, poi c'e' un flash quando
   il font custom arriva. Visibile soprattutto su connessioni lente.
2. **No preload**: il browser non puo' preloadare il font prima di
   aver eseguito JS, quindi perdiamo 100-300ms di parallelismo.

**Fix strutturale**: estratto `<MenuFonts/>` come server component
che:

- Colleziona le 9 famiglie di font dal `FullTheme` (cover 3, menu 2,
  dish 4), dedupando
- Emette `<link rel="preconnect">` per `fonts.googleapis.com` e
  `fonts.gstatic.com`
- Emette `<link rel="stylesheet" precedence="default">` con tutte le
  families in un'unica request

React 19 **hoista** automaticamente i `<link>` nel `<head>` e dedupa
su `precedence` tra route. `ThemeProvider` diventa un server component
semplificato che applica solo le CSS vars sul wrapper div — via
`'use client'` e `useEffect`.

**Perche' server component** (alternativa client scartata): il layout
e le due page sono gia' server-side, hanno accesso al `slug` e al
`theme` via data fetch. Non c'e' motivo di deferire la decisione dei
font al runtime client. Il server sa esattamente quali font servono.

**Perche' non un layout condiviso `(menu)/[slug]/layout.tsx`**
(alternativa scartata): un layout non riceve `searchParams`, quindi
non puo' distinguere il branch `previewDraft=1` (owner autenticato
che vede il draft del tema) dal pubblico. Preferisco duplicare
`<MenuFonts theme={theme}/>` nelle due page (cover + menu) che
gestiscono gia' il draft handling nel proprio flow. La duplicazione
e' due righe — accettabile.

**`error.tsx` e `not-found.tsx`**: i `<link>` hardcoded a Cormorant+
Outfit sono stati rimossi. Motivazione: su una 404 non c'e' modo di
sapere quale tenant mostrare (lo slug non esiste), quindi non posso
caricare i font del tema. Su un error boundary, lo slug esiste ma il
dato potrebbe essere corrotto. In entrambi i casi, system font stack
(`Georgia, "Times New Roman", serif` per i titoli; `system-ui,
-apple-system, "Segoe UI", sans-serif` per il resto) e' la scelta
strutturalmente corretta. Trade-off accettabile: questi boundary
sono rari, il polish font non e' critico.

### Sub-step 6.2 — next.config.ts images remotePatterns

Propedeutico a 6.3.c: senza `images.remotePatterns`, `next/image`
rifiuta qualsiasi URL non allowlist-ato con errore "hostname
unconfigured".

- **`formats: ['image/avif', 'image/webp']`**: il browser negozia via
  `Accept` header. AVIF e' ~30-50% piu' piccolo di JPEG, WebP e'
  fallback per browser vecchi.
- **`hostname` derivato da `NEXT_PUBLIC_SUPABASE_URL`**: stesso
  pattern di 1.3.d (`backgroundImageUrl`), stesso motivo — dev e prod
  condividono la config senza hardcodare il project ref. Fail-closed:
  se l'env manca, il build tira throw (no allowlist silenzioso).
- **`pathname: '/storage/v1/object/public/**'`**: restringe alle sole
  risorse pubbliche. I signed URL temporanei (che il progetto non
  usa) verrebbero rifiutati. Se in futuro si aggiungono, si allarga
  il pattern.

`minimumCacheTTL` non toccato (default 60s). Alzarlo ha senso solo
se avessimo un alto volume di traffico, il che non e' il caso attuale.

### Sub-step 6.3 — Image optimization (a/b/c)

Originariamente uno step unico. Durante l'implementazione e' emerso
che il seed del DB dev usava 23 URL Unsplash hardcoded per le
immagini demo (`prisma/seed.ts`). `next/image` le rifiutava al
runtime (`images.unsplash.com` non in `remotePatterns`). Inoltre il
validator `dish.ts:41` era `z.string().max(500).optional()` — nessuna
restrizione di host, un owner poteva inserire URL arbitrari. Questo
era un gap di sicurezza pre-esistente, analogo a quello chiuso in
1.3.d per `backgroundImageUrl`, ma dimenticato per `imageUrl`.

Il sub-step e' stato spezzato in tre commit in ordine strutturale:
prima la migrazione dei dati (altrimenti il validator strict rompe
il form admin esistente), poi il validator, poi lo swap. Ogni commit
ha senso autonomo e puo' essere rollback-ato indipendentemente.

**6.3.a — Migrazione seed Unsplash → Supabase Storage**: creato
`scripts/migrate-seed-images.ts` (one-shot, committato come
reference). Lo script:

1. Inventario hardcoded di 23 URL (22 piatti + 1 cover ristorante)
   con target filename deterministico (slug del piatto)
2. Per ciascuno: `fetch` da Unsplash → upload su bucket
   `restaurant-media` sotto prefix `demo-seed/` via service role key
3. `upsert: true` per idempotenza (lo script e' ri-eseguibile)
4. Stampa un manifest `{ oldUrl → newUrl }` da applicare a `seed.ts`

Delle 23 URL, **22 sono state migrate**. Una (`pure-di-fave`,
`photo-1543339308-...`) ha risposto 404 perche' Unsplash ha rimosso
l'immagine. Per quel piatto ho impostato `imageUrl: null` con un
commento che documenta il 404. Il `DishCard` gestisce gia' il caso
senza thumbnail.

Dopo la migrazione, `prisma/seed.ts` ha solo URL Supabase. Re-seed
del DB dev con `npx prisma db seed` (6 categorie, 29 piatti).

**Prod NON toccata in 6.3.a**: il DB prod ha il suo stato indipendente,
la migrazione verra' eseguita come nota operativa prima del merge di
Step 6 (vedi sezione "Nota operativa: migrazione DB prod" a fine di
questo step).

**Prefix `demo-seed/` dedicato**: separato dai path
`{restaurantId}/{kind}/{timestamp}-{random}-{filename}` usati dagli
upload reali degli owner. Non interferisce con la convenzione
esistente.

**6.3.b — Hardening validator `imageUrl`**: estratto
`SupabaseImageUrlSchema` da `theme.ts` (dove era inline in 1.3.d) a
un nuovo file `validators/url.ts`, condiviso tra `theme.ts` (per
`backgroundImageUrl`) e `dish.ts` (per `imageUrl`). Re-export da
`theme.ts` per backcompat con i call site esistenti.

`dish.ts:imageUrl` diventa
`SupabaseImageUrlSchema.optional().or(z.literal(''))` — accetta URL
Supabase, omissione, o stringa vuota (= nessuna immagine, semantica
esistente del form). Rifiuta tutto il resto.

Verificato con unit test inline via tsx, 6 casi: URL Supabase valido
(ok), URL Unsplash (rifiutato), URL evil.com (rifiutato), stringa
vuota (ok), undefined (ok), URL malformato (rifiutato). Tutti pass.

**Perche' extract in `url.ts` e non import da `theme.ts`** (più
pragmatico): `SupabaseImageUrlSchema` non e' theme-specifica — e'
una constraint cross-cutting sugli URL di immagine del progetto.
Importare il validator del dish da `theme.ts` sarebbe asimmetrico
(dish e' concettualmente piu' semplice del theme). Estratto in un
file dedicato di 15 righe, importato da entrambi. L'aggiunta di un
file e' accettabile per la chiarezza del namespace.

**6.3.c — Swap `<img>` → `<Image>` in `CoverPage` e `DishCard`**:

- **Cover hero**: `<Image fill priority sizes="(max-width: 480px)
  100vw, 480px">`. E' l'LCP del menu pubblico, `priority` dice al
  browser di preloadarla via `<link rel="preload" as="image">`
  nell'`<head>`.
- **Dish thumbnail**: `<Image fill sizes="128px">`. Lazy di default
  (sotto la fold). `128px` copre il range della CSS var
  `--card-image-size` (96-128 nei preset).
- **Cover logo**: `<Image width={200} height={200} style={{ width:
  'auto', height: 'auto', maxHeight: 'var(--cover-logo-max-height)',
  maxWidth: 200, objectFit: 'contain' }}>`. Il logo e' uploadato
  dall'owner, aspect ratio sconosciuta. `width`/`height` sono solo
  hint per il loader; CSS constraints + auto gestiscono il rendering
  finale. Accettato un piccolo rischio di pop-in di dimensione al
  caricamento (non visto nei test).

Rimosso il workaround `imgRef.current?.complete` nei due componenti:
`next/image` gestisce gia' il caso "immagine in cache del browser"
chiamando `onLoad` durante l'hydration. Il fallback manuale era per
i `<img>` grezzi, ora obsoleto.

Fade-in on-load (`opacity: imgLoaded ? 1 : 0` + transition) e filtri
visivi (`saturate(...) contrast(...)`) mantenuti invariati. Le
animazioni visive sono preservate pixel-perfect.

### Sub-step 6.4 — Patch bump Next 16.2.2 → 16.2.3 (security)

**Scoperta**: durante `npm install @vercel/speed-insights` (per 6.5)
npm ha segnalato `1 high severity vulnerability`. `npm audit` ha
rivelato che NON era del nuovo pacchetto ma di `next` stesso:
advisory **GHSA-q4gf-8mx6-v5v3** (DoS con Server Components in
16.0.0-beta.0..16.2.2). Il fix e' `next@16.2.3`. Step 1.3.a aveva
fatto `npm audit` con 0/543, quindi l'advisory e' emerso nel
frattempo.

**Commit atomico**: bump isolato dal feature work, per facilitare
rollback in caso di regressione. Durante il bump ho disinstallato
temporaneamente `@vercel/speed-insights` (aggiunto per errore prima
di scoprire l'advisory) per tenere il diff pulito, poi l'ho
reinstallato in 6.5.

**Pinning esatto**: il progetto pinna `next` e `eslint-config-next`
senza caret (stile reproducibility). `npm install pkg@version`
avrebbe usato caret by default, quindi ho usato `--save-exact` per
entrambi. Post-bump: `npm audit` pulito (0/449).

**Smoke test completo** (menu pubblico, login admin, form edit piatto,
logout): nessuna regressione. Un patch bump da 16.2.2 a 16.2.3
dovrebbe essere sostanzialmente no-op funzionale, e cosi' e' stato.

### Sub-step 6.5 — Vercel Speed Insights

Montato `<SpeedInsights/>` da `@vercel/speed-insights/next` nel
layout `(menu)`. Una riga di import + una riga di component.

**Perche' solo nel layout (menu) e non nell'admin**: interessa
misurare il percorso del visitatore finale — cover + menu — non i
form admin che hanno obiettivi di performance diversi (form-centric,
token `time to interactive` vs LCP). Mescolare i sample nello stesso
dashboard diluisce il segnale.

**Perche' ora e non Fase 5 insieme a Sentry/PostHog**: chiudere Step
6 ("performance review") senza misurazione era monco. Inoltre,
installando Speed Insights prima del deploy di 6.1/6.3.c raccolgo
una baseline che poi posso confrontare con le metriche post-deploy
per quantificare il delta LCP/CLS/INP dei sub-step precedenti.

In dev il component non invia metrics reali (debug mode). Le vere
metriche arriveranno dopo il merge + deploy Vercel, visibili nel tab
**Speed Insights** del dashboard progetto. Il smoke test di prod di
Step 6 include "verifica che Speed Insights riceva eventi".

### Cosa NON ho fatto in Step 6 (debt esplicito)

- **Migrazione seed per Puré di Fave**: la foto Unsplash originale e'
  404. Per ora `imageUrl: null`. Opzioni future: cercare una foto
  alternativa, oppure commissionare uno shoot. Non bloccante.
- **`minimumCacheTTL` custom** su `next.config.ts images`: lasciato
  al default (60s). Alzarlo serve solo con alto volume di traffico.
- **Refactor `theme/loading.tsx`** da skeleton generico a
  content-shaped (era gia' in debt da Step 3): invariato.
- **CSP** (era in debt da Step 1): invariato. Ora con Speed Insights
  monteremo un endpoint aggiuntivo da allowlistare, rendendo CSP
  leggermente piu' complicata. Rimane Fase 5/6.
- **`<link rel="modulepreload">` per chunk critici del menu**:
  Next 16 li aggiunge gia' automaticamente. Verificato sul build
  output, nessun intervento necessario.
- **Image blur placeholder** (`placeholder="blur"` su `<Image>`): non
  applicabile — richiederebbe un blur hash pre-calcolato per ogni
  immagine uploadata, infrastruttura di trasformazione assente. Il
  fade-in on-load da `opacity:0` copre l'esigenza visiva con costo
  di implementazione zero.
- **Test automatizzato del validator `imageUrl`** (6.3.b): verificato
  via unit test inline eseguito una volta, non persistito. Stesso
  pattern del test rate-limit di Step 4 — il costo di una test suite
  dedicata non e' giustificato per un singolo validator. Il test
  sara' ripreso quando Fase 5 introdurra' una test infrastructure
  generale.
- **Dependabot/Renovate** per intercettare advisories come
  GHSA-q4gf-8mx6-v5v3 automaticamente: ancora debt di Fase 5. Step 6.4
  ha evidenziato che il monitoraggio manuale e' insufficiente —
  l'advisory e' stato scoperto "per caso" durante un install
  non-correlato.

### Nota operativa: audit DB prod (NO-OP confermato)

Step 6.3.a ha migrato solo il DB dev. Rischio potenziale sul merge:
se il DB prod avesse URL non-Supabase in `Restaurant.coverUrl/logoUrl`
o `Dish.imageUrl`, il validator 6.3.b rigetterebbe qualsiasi save del
form admin su quei record e `next/image` rifiuterebbe il rendering.

**Esito**: il DB prod contiene un solo tenant (`best-salerno`, creato
via pannello admin, non via seed) con 1 piatto. Audit read-only
eseguito con `scripts/audit-prod-images.ts` puntato a prod via un
`.env.prod.local` temporaneo (cancellato dopo l'uso):

```
Ristoranti totali: 1
Piatti totali: 1 (1 con imageUrl)

== Restaurant cover/logo non-Supabase ==
(nessuno — tutti i cover/logo sono su Supabase o null)

== Dish imageUrl non-Supabase ==
(nessuno — tutti gli imageUrl sono su Supabase o null)

== Verdetto ==
NO-OP: nessuna URL non-Supabase. La migrazione prod non e' necessaria.
```

Il merge di Step 6 su main e' safe senza modifiche al DB prod.
`scripts/audit-prod-images.ts` resta committato come reference per
audit futuri (es. prima di aggiungere nuove restrizioni simili al
validator, o periodicamente per verificare la compliance).

### Verifica e workflow

- Branch dedicato `feature/fase-4-step-6-performance`
- 8 commit (1 per sub-step, rispettando la granularita' per code
  review futura; 6.3 spezzato in a/b/c per isolare il re-seed dal
  validator dallo swap)
- `tsc --noEmit` + `npm run build` puliti dopo ogni commit
- Smoke test in dev su: cover, menu, 404, error boundary, form admin
  edit piatto, login/logout, Speed Insights script load
- Per 6.3.b: unit test inline del validator con 6 casi (tutti pass)
- Push su main post-approvazione, smoke test in prod post-deploy
  Vercel, verifica dashboard Speed Insights per i primi eventi

## Debt esplicito (rimandato a sub-step / fasi successive)

### Da Step 1 (sicurezza)
- **CSP** — sub-step dedicato dopo Sentry/PostHog per allowlistare in
  un colpo solo. Trade-off: rischio rottura alto, beneficio incremento
  marginale rispetto alla baseline attuale.
- ~~**Login rate limit**~~ — chiuso in Step 4.
- **Upstash Redis per rate limit cross-instance** — quando vediamo
  abuse reale o quando vogliamo rate limit affidabile in produzione.
- **Sentry + PostHog** — Fase 5 (sezione dedicata).
- **Audit log** — Fase 6 (Super Admin).
- **Aggiornamento Prisma 6 → 7** — sessione dedicata, è una major.
- **Dependabot/Renovate** — Fase 5 con il resto della pipeline di
  qualità.
- **2FA TOTP** — Fase 6 per Super Admin (obbligatorio) e Owner
  (opzionale).
- **CSRF protection esplicita** — NextAuth gestisce il CSRF per le
  sue route, le server actions Next.js sono protette dal framework.
  Da verificare formalmente in Fase 5.

### Da Step 2 (data cache)
- **Migrazione `unstable_cache` → `'use cache'` directive** — Next 17
  deprecherà quasi sicuramente `unstable_cache`. Sessione dedicata,
  da combinare con Prisma 6→7 e altri update major. Comporta anche
  rivalutare il modello di profile vs `revalidate` semplice.
- **Cache cross-instance su Vercel** — `unstable_cache` su Vercel è
  per-Lambda (come il rate limit). Non è un problema di correttezza
  (l'invalidazione via tag funziona dentro la singola Lambda) ma
  significa che istanze diverse possono avere cache desincronizzate
  per ~60s. In produzione lo step finale è cache distribuita
  (Upstash Redis o Vercel Data Cache premium).
- **API route `/api/menu/[slug]`** — non passa per la cache. Non è
  usata dall'app stessa, quindi non è bloccante. Eventualmente
  cachable in futuro se ci servono client esterni.
- **Orphan media cleanup** — quando un MediaAsset usato come
  `Restaurant.logoUrl`/`coverUrl` viene cancellato, la cache pubblica
  resta valida ma punta a un URL 404. Già nel debt list di Fase 5
  (vedi `STATO-FASE-2.md`).

### Performance / UX (per future fasi)
- ~~**Warning Google Fonts preload**~~ — chiuso in Step 6.1
  (font iniettati server-side via `<MenuFonts/>`, hardcoded rimossi
  da error/not-found).
- **Refactor `theme/loading.tsx`** da generico a content-shaped:
  funziona ma è meno polish degli altri loading. Non bloccante.
- **`<DishFormSkeleton />` componente condiviso**: solo se nasce un
  terzo call site oltre a `dishes/new` e `dishes/[dishId]/edit`.

### Da Step 6 (performance)
- **Foto sostitutiva per Puré di Fave**: la foto Unsplash originale
  ha risposto 404 durante la migrazione 6.3.a, il piatto e' rimasto
  con `imageUrl: null`. Trovare una foto sostitutiva o commissionare
  uno shoot. Non bloccante.
- **Migrazione DB prod** — da eseguire prima del merge di Step 6 su
  main. Vedi "Nota operativa" in fondo a Step 6 per le due opzioni.
- **Dependabot/Renovate** — rimarcato anche qui: 6.4 ha chiuso un
  advisory scoperto per caso durante un install non-correlato. Il
  monitoraggio manuale e' insufficiente, serve automazione. Fase 5.
- **Image blur placeholder** (`placeholder="blur"` su `<Image>`):
  richiederebbe un blur hash pre-calcolato per ogni immagine
  uploadata, infrastruttura di trasformazione assente. Il fade-in
  on-load copre l'esigenza visiva.
- **Cleanup SVG template in `public/`** (`file.svg`, `globe.svg`,
  `next.svg`, `vercel.svg`, `window.svg`): boilerplate non usato.
  Cleanup generico, non performance-related.

## Verifica e workflow seguito (per ogni sub-step)

1. Branch dedicato `feature/fase-4-...`
2. 1 commit per sub-step (granularity per code review futura)
3. `npx tsc --noEmit` pulito dopo ogni modifica
4. `npm run build` pulito prima del commit
5. Smoke test in dev (curl o pannello admin) sui flussi toccati
6. Per gli endpoint con rate limit: test di stress via curl loop
7. Per gli upload e i flussi che richiedono auth: test manuale da
   pannello admin (l'utente)
8. Smoke test in prod post-deploy Vercel prima di chiudere lo step

## Step 5 — Audit a11y completo (WCAG 2.1 AA) ✅

Branch: `feature/fase-4-step-5-a11y`
Commit: `feat(a11y): complete WCAG 2.1 AA accessibility audit`

### Cosa è stato fatto

Audit accessibilità completo su tutto il pannello admin e le pagine
pubbliche. 22 file toccati, 5 aree di intervento:

1. **Loading boundaries** (11 file `loading.tsx`):
   `role="status"` + `aria-live="polite"` + testo visually-hidden
   contestuale (es. "Caricamento piatti in corso…"). Gli screen reader
   annunciano ora il caricamento quando Next.js mostra uno skeleton.

2. **Error boundaries** (3 file `error.tsx`):
   `role="alert"` sul container errore + auto-focus al mount via
   `useRef`/`useEffect` + `tabIndex={-1}` con `outline: none`.
   Lo screen reader annuncia l'errore e il focus si sposta sul
   messaggio per azione immediata.

3. **Form a11y** (5 file: login-form, info-form, DishForm,
   CategoryForm, ImageUploader):
   - `aria-required="true"` su tutti i campi obbligatori
   - `aria-invalid` dinamico quando il campo ha errori di validazione
   - `aria-describedby` che collega ogni input al proprio messaggio
     d'errore tramite id univoco (es. `name-error`, `price-error`)
   - `role="alert"` sui banner errore generici di form
   - `aria-busy` sul bottone submit durante il salvataggio
   - ImageUploader: `role="button"` + `tabIndex={0}` + handler
     `onKeyDown` (Enter/Space) + `aria-label` contestuale sulla
     dropzone, rendendola navigabile da tastiera

4. **Modal/dialog a11y** (4 componenti: ConfirmModal, CategoriesManager
   Modal, DishForm delete dialog, DishesList delete dialog):
   `aria-labelledby` verso il titolo + `aria-describedby` verso la
   descrizione, con `id` corrispondenti su `<h3>` e `<p>`.

5. **Navigation + action buttons** (3 file: Sidebar, DishesList,
   CategoriesManager):
   - `aria-current="page"` sul link attivo nella sidebar
   - `aria-label` contestuale (con nome entità) su tutti i bottoni
     icona che avevano solo `title`
   - `aria-pressed` sul toggle "proposta dello chef"
   - `aria-label` sul drag handle in DishesList (mancava)

### Cosa NON è stato fatto (e perché)

- **Skip link** ("Vai al contenuto"): il pannello admin ha una
  sidebar con 1 solo link nav + il contenuto è subito dopo. Il
  rapporto costo/beneficio non giustifica l'aggiunta.
- **Landmark `<main>`**: già presente nel layout admin dashboard.
- **`aria-live` per progresso upload percentuale**: l'upload è
  istantaneo (< 1s per immagini ≤ 5MB su Supabase). Un annuncio
  "Caricamento..." + "Errore" copre il caso. Progresso granulare
  sarebbe over-engineering.

---

## Fase 4 — Chiusura

Con Step 5 tutti e 6 gli step di Fase 4 sono completati:

| Step | Titolo                        | Branch                              |
|------|-------------------------------|-------------------------------------|
| 1    | Security baseline             | `feature/fase-4-step-1-security`    |
| 2    | Data cache + tag invalidation | `feature/fase-4-step-2-cache`       |
| 3    | Loading states + error bounds | `feature/fase-4-step-3-loading`     |
| 4    | Auth hardening                | `feature/fase-4-step-4-auth`        |
| 6    | Performance review            | `feature/fase-4-step-6-performance` |
| 5    | Audit a11y completo           | `feature/fase-4-step-5-a11y`        |

Ordine di esecuzione: 1 → 2 → 3 → 4 → 6 → 5 (Step 6 anticipato
perché il warning Google Fonts era già mezzo tirato da Step 3).

Fase 4 chiusa. Non procedere oltre senza esplicita richiesta.
