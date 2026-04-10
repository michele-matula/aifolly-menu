# AiFolly Menu — Stato Fase 4 (in corso)

Fase 4 = Polish e sicurezza. Lo Step 1 (security baseline) è il primo
blocco di lavoro: alza la base di sicurezza dell'applicazione prima di
affrontare gli altri temi (ISR, revalidation, performance, a11y).

## Branch e workflow

- Branch di lavoro: `feature/fase-4-security-baseline` (da `main`)
- Workflow: dev-first, un commit per sub-step, type check + build dopo
  ogni modifica, smoke test in dev prima di committare.

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
| A07 | Auth Failures | ⚠️ | bcrypt + JWT OK, **no rate limit login**, no 2FA (Fase 6), no account lockout |
| A08 | Data Integrity | ⚠️ | `package-lock.json` OK, Vercel firma i deploy, niente di più sofisticato |
| A09 | Logging/Monitoring | ❌ | Solo Vercel function logs, no Sentry, no PostHog, no audit log — è il gap più grande, lavoro di Fase 5 |
| A10 | SSRF | ✅ | L'app non fa fetch server-side di URL forniti dall'utente |

## Debt esplicito (rimandato a sub-step / fasi successive)

- **CSP** — sub-step dedicato dopo Sentry/PostHog per allowlistare in
  un colpo solo. Trade-off: rischio rottura alto, beneficio incremento
  marginale rispetto alla baseline attuale.
- **Login rate limit** — sub-step separato. NextAuth Credentials non
  espone hook puliti, serve wrapper custom o middleware sul POST a
  `/api/auth/callback/credentials`.
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

## Verifica e workflow seguito (per ogni sub-step)

1. Branch dedicato `feature/fase-4-security-baseline`
2. 1 commit per sub-step
3. `npx tsc --noEmit` pulito dopo ogni modifica
4. `npm run build` pulito prima del commit
5. Smoke test in dev (curl o pannello admin) sui flussi toccati
6. Per gli endpoint con rate limit: test di stress via curl loop
7. Per gli upload: test manuale da pannello admin (l'utente)

## Prossimi step di Fase 4 (dopo Step 1)

Step 1 è solo la baseline di sicurezza. Resta da fare per chiudere
Fase 4:

- **Step 2 — ISR e revalidation**: il menu pubblico oggi è
  server-rendered on demand. Aggiungere `revalidate: 60` + on-demand
  revalidation post-pubblicazione tema/menu (vedi spec §21.2 punto 44
  e §17 per ISR).
- **Step 3 — Login rate limit + altre rifiniture sicurezza** (debt
  da Step 1).
- **Step 4 — Skeleton loader e stati di errore mancanti**.
- **Step 5 — Audit a11y completo** (form admin, screen reader, focus
  trap esteso al di là delle modali).
- **Step 6 — Performance review** (Core Web Vitals sul menu pubblico,
  ottimizzazione immagini, lazy loading).

L'ordine può cambiare in base alle priorità — questo è solo un piano
indicativo da rivalutare a fine Step 1.
