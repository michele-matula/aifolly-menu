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
| A03 | Injection | ✅ | Prisma parametrizzata, React escape default, 0 `dangerouslySetInnerHTML`, 0 `child_process`, HEX colori validati Zod, **font whitelist aggiunta in 1.3.c** |
| A04 | Insecure Design | ⚠️ | Decisioni chiave già prese (multi-tenant, draft visibility), nessun threat model formale |
| A05 | Security Misconfiguration | ⚠️ | 4 header attivi, **CSP differita** |
| A06 | Vulnerable Components | ✅ | `npm audit` 0/543, ma **nessun Dependabot/Renovate**, Prisma 6 vs 7 noto |
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
- **Warning Google Fonts preload** — il browser segnala
  "preloaded but not used within a few seconds" sull'URL di
  `fonts.googleapis.com/css2?family=...`. Probabile mismatch
  `as` attribute o URL del preload diverso da quello effettivamente
  caricato. **Indizio scoperto in Step 3**: i file
  `(menu)/[slug]/error.tsx` e `not-found.tsx` includono inline un
  `<link>` con la stessa URL Google Fonts — potrebbe essere la
  sorgente del preload non usato. Da verificare e fixare in
  Step 6 (performance review).
- **Refactor `theme/loading.tsx`** da generico a content-shaped:
  funziona ma è meno polish degli altri loading. Non bloccante.
- **`<DishFormSkeleton />` componente condiviso**: solo se nasce un
  terzo call site oltre a `dishes/new` e `dishes/[dishId]/edit`.

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

## Prossimi step di Fase 4 (dopo Step 4)

- **Step 5 — Audit a11y completo** (form admin, screen reader, focus
  trap esteso al di là delle modali).
- **Step 6 — Performance review** (Core Web Vitals sul menu pubblico,
  ottimizzazione immagini, lazy loading, **fix warning Google Fonts
  preload**).

L'ordine può cambiare in base alle priorità. Nota: la numerazione
degli step segue l'ordine in cui li affrontiamo, NON l'ordine
originale dello scaletta nello spec.
