# AiFolly — Brand Identity & Design System

> **Documento di riferimento per il branding del marchio AiFolly**
> Versione: 1.0 · Data: 8 Aprile 2026
>
> Questo documento definisce l'identità visiva del marchio AiFolly: il SaaS che i ristoratori usano per gestire il proprio menu digitale. **Importante:** questo è il branding di AiFolly come prodotto B2B, *non* dei menu pubblici dei ristoranti (che hanno la loro identità personalizzabile tramite il theme builder).

---

## 1. Brand Personality

### 1.1 Posizionamento

AiFolly si posiziona come **lo strumento tech-forward per ristoratori che vogliono un menu digitale senza compromessi**. Non è un tool generico per "fare siti web", non è un menu PDF mascherato. È una piattaforma specializzata, costruita con la stessa cura e attenzione ai dettagli che un grande chef mette nei suoi piatti.

Il marchio si ispira a SaaS di riferimento come **Linear**, **Vercel**, **Framer** — strumenti che hanno alzato l'asticella del design B2B trasformando software professionale in oggetti che dà piacere usare. AiFolly vuole essere percepito allo stesso modo: serio, professionale, ma non noioso.

### 1.2 Tono di voce

**Cosa siamo:**
- **Diretti** — Frasi brevi, niente giri di parole. Il ristoratore è impegnato, rispettiamo il suo tempo.
- **Competenti** — Conosciamo il dominio. Sappiamo cosa vuol dire gestire un locale, non parliamo di "user engagement", parliamo di "scansioni QR ai tavoli".
- **Eleganti** — Usiamo bene la lingua italiana. Niente anglicismi gratuiti, ma niente nemmeno purismi forzati.
- **Pratici** — Ogni testo deve aiutare l'utente a fare qualcosa, non a sentirsi intelligenti noi.

**Cosa NON siamo:**
- ❌ Casual o "amichevoloni" tipo "Ehi! 👋 Vuoi creare il tuo menu super-figo?"
- ❌ Aziendalisti tipo "Soluzioni innovative per la digitalizzazione del settore HoReCa"
- ❌ Tech-bro tipo "Stack di nuova generazione per disrupting the menu space"
- ❌ Eccessivamente formali tipo "La preghiamo di cliccare il pulsante sottostante"

### 1.3 Esempi pratici di copy

| Contesto | ❌ Sbagliato | ✅ Giusto |
|---|---|---|
| Pulsante azione | "Clicca qui per creare!" | "Crea piatto" |
| Errore form | "Oops! Qualcosa è andato storto 😅" | "Inserisci un nome per il piatto" |
| Conferma successo | "Yeah! Tutto fatto! 🎉" | "Piatto salvato" |
| Vuoto stato | "Non c'è niente qui ancora!" | "Nessun piatto in questa categoria. Crea il primo." |
| Email transazionale | "Ciao caro ristoratore!" | "Ciao Mario," |
| Welcome onboarding | "Benvenuto nella famiglia AiFolly!" | "Benvenuto su AiFolly. Iniziamo a costruire il tuo menu." |
| Fattura pagata | "Fattura saldata con successo! Grazie!" | "Pagamento ricevuto. La fattura è disponibile in Fatturazione." |
| Errore critico | "Ops! Si è verificato un errore inaspettato 😰" | "Qualcosa non ha funzionato. Riprova tra qualche istante." |

### 1.4 Naming

- **Nome del prodotto:** AiFolly Menu (versione completa) o AiFolly (versione breve nel contesto)
- **Nome dell'azienda:** AiFolly (la stessa entità, niente "AiFolly s.r.l." nei testi UI a meno di contesti legali/fatturazione)
- **Pronuncia:** "Ai-Fòl-li" (accento sulla seconda sillaba)
- **Capitalizzazione:** sempre `AiFolly` con la "F" maiuscola interna. Mai "Aifolly", "AIFOLLY", "ai folly", "ai-folly"
- **Mai usare:** "the platform", "il software", "il sistema", "la piattaforma" come sostituti del nome. Usa "AiFolly" o riformula la frase.

---

## 2. Logo

### 2.1 Concetto

Il logo AiFolly combina due elementi: un **simbolo geometrico distintivo** (la "A" stilizzata come monogramma) e il **wordmark** in font geometrico. Il simbolo è progettato per funzionare anche da solo come favicon e icona app.

### 2.2 Costruzione del simbolo

Il simbolo è una **A maiuscola geometrica costruita con due segmenti angolati**, con la barra orizzontale sostituita da un sottile **diamante d'oro** che richiama l'ornamento del preset Elegante (lo stesso `✦` usato nei menu).

```
SVG concettuale del simbolo (50×50):

   ╱ ╲
  ╱   ╲
 ╱  ◆  ╲      ◆ = diamante oro (#c9b97a)
╱_______╲     ╱╲ = stroke nero (#0a0a0a) o bianco (#fafafa)
```

**Specifiche tecniche del simbolo:**
- **Dimensioni base:** 32×32 px (favicon, navigation bar)
- **Versione media:** 48×48 px (header sidebar admin, email)
- **Versione grande:** 80×80 px (login page, dashboard hero)
- **Stroke width:** 2px su 32px, scalato proporzionalmente
- **Diamante interno:** sempre in oro `#c9b97a`, dimensione 25% del simbolo
- **Stroke della A:** nero `#0a0a0a` in light mode, bianco-avorio `#fafaf8` in dark mode
- **Mai usare:** ombre, gradienti, effetti glow, bordi multipli, varianti colorate

### 2.3 Wordmark

Accanto al simbolo (o da solo, in contesti dove serve solo testo) c'è il wordmark "AiFolly" composto in **Geist Sans Medium** o **Inter Medium**, con la "F" leggermente più larga per dare carattere al monogramma.

**Spacing:** lo spazio tra simbolo e wordmark è esattamente la larghezza del simbolo diviso 2 (es. simbolo 32px → gap 16px tra simbolo e "A" del wordmark).

**Allineamento verticale:** il wordmark è allineato al **centro ottico** del simbolo, non al centro geometrico (sembra più centrato visualmente).

### 2.4 Lockup ufficiali

**Lockup orizzontale (default):**
```
[◆ A ◆]  AiFolly
```
Da usare in: header del pannello admin, email transazionali, pagina di login, footer.

**Lockup verticale (per spazi quadrati):**
```
[◆ A ◆]
AiFolly
```
Da usare in: hero dell'onboarding, splash screen, social media profile picture, copertine documenti PDF.

**Solo simbolo:**
```
[◆ A ◆]
```
Da usare in: favicon, app icon iOS/Android, navigazione collassata della sidebar, watermark discreto nelle email.

**Solo wordmark:**
```
AiFolly
```
Da usare in: footer minimalisti, riferimenti inline ("Powered by AiFolly"), link di testo.

### 2.5 Regole di utilizzo

**✅ DA FARE:**
- Mantieni sempre uno **spazio di rispetto** intorno al logo pari alla larghezza del simbolo
- Su sfondi colorati, usa la versione con stroke che contrasta meglio (nero su chiaro, bianco su scuro)
- Quando il logo è cliccabile, deve sempre portare alla dashboard principale o alla landing page

**❌ DA NON FARE:**
- Non ruotare il logo
- Non distorcere le proporzioni (no stretch orizzontale o verticale)
- Non cambiare il colore del diamante (è sempre oro)
- Non aggiungere effetti (ombre, glow, riflessi, animazioni elaborate)
- Non posizionare il logo su immagini ad alto contrasto senza un overlay di protezione
- Non usare come decorazione ornamentale (es. ripetuto come pattern)

### 2.6 SVG del logo (riferimento per Claude Code)

```svg
<!-- Versione orizzontale, stroke nero (light mode) -->
<svg width="140" height="32" viewBox="0 0 140 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Simbolo: A stilizzata 32×32 -->
  <g transform="translate(0,0)">
    <!-- Barra sinistra della A -->
    <line x1="6" y1="28" x2="16" y2="4" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round"/>
    <!-- Barra destra della A -->
    <line x1="26" y1="28" x2="16" y2="4" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round"/>
    <!-- Diamante oro al centro -->
    <path d="M 16 16 L 19 19 L 16 22 L 13 19 Z" fill="#c9b97a"/>
  </g>
  <!-- Wordmark -->
  <text x="48" y="22" 
        font-family="Geist, Inter, system-ui, sans-serif" 
        font-size="18" 
        font-weight="500" 
        fill="#0a0a0a" 
        letter-spacing="-0.3">AiFolly</text>
</svg>
```

> **Nota per Claude Code:** quando implementi il logo nel pannello admin, crea un componente `<Logo variant="horizontal" | "vertical" | "symbol" | "wordmark" theme="light" | "dark" />` che incapsula tutte queste varianti. Mettilo in `src/components/ui/Logo.tsx`.

---

## 3. Color Palette

### 3.1 Filosofia

La palette di AiFolly segue la regola **"95% neutri + 5% oro"**. Quasi tutto è bianco/nero/grigio (struttura tech-forward), e l'oro `#c9b97a` appare solo nei punti che contano: pulsanti primari, badge di stato attivo, accenti sui dati importanti, link cliccabili in alcuni contesti.

Questa scelta ha due benefici:
1. **Continuità visiva con il menu pubblico** del preset Elegante (l'oro è il filo conduttore)
2. **Massima leggibilità e calma visiva** del pannello admin (un tool di lavoro non deve stancare)

### 3.2 Tokens — Light Mode

```css
/* ── Backgrounds ── */
--bg-primary:    #ffffff;       /* Sfondo principale, card */
--bg-secondary:  #fafafa;       /* Sfondo pagina, sezioni */
--bg-tertiary:   #f5f5f5;       /* Hover state, input background */
--bg-elevated:   #ffffff;       /* Modali, dropdown (con shadow) */

/* ── Text ── */
--text-primary:    #0a0a0a;     /* Titoli, testo principale */
--text-secondary:  #525252;     /* Testo secondario, descrizioni */
--text-tertiary:   #737373;     /* Label, hint, placeholder */
--text-disabled:   #a3a3a3;     /* Stati disabilitati */
--text-inverse:    #ffffff;     /* Testo su sfondi scuri */

/* ── Borders ── */
--border-primary:    #e5e5e5;   /* Bordi card, dividers principali */
--border-secondary:  #f0f0f0;   /* Dividers leggeri */
--border-strong:     #d4d4d4;   /* Bordi input, focus rings */

/* ── Brand Accent — ORO ── */
--accent-primary:     #c9b97a;  /* Oro AiFolly (uguale al menu Elegante) */
--accent-hover:       #a68c4e;  /* Oro scuro (hover, active) */
--accent-light:       #e8dfc8;  /* Oro chiaro (background pill, badge) */
--accent-bg:          #faf7ed;  /* Oro pallidissimo (background sezioni accentate) */
--accent-text:        #6b5828;  /* Testo su sfondo oro chiaro */

/* ── Stati semantici ── */
--success:        #10b981;      /* Verde — pubblicato, attivo, OK */
--success-bg:     #ecfdf5;
--success-text:   #047857;

--warning:        #f59e0b;      /* Arancione — bozza, in attesa */
--warning-bg:     #fffbeb;
--warning-text:   #b45309;

--danger:         #dc2626;      /* Rosso — errore, eliminazione */
--danger-bg:      #fef2f2;
--danger-text:    #b91c1c;

--info:           #0ea5e9;      /* Blu — info, hint */
--info-bg:        #f0f9ff;
--info-text:      #0369a1;
```

### 3.3 Tokens — Dark Mode

```css
/* ── Backgrounds ── */
--bg-primary:    #0a0a0a;       /* Sfondo principale, card scura */
--bg-secondary:  #141414;       /* Sfondo pagina */
--bg-tertiary:   #1f1f1f;       /* Hover state, input */
--bg-elevated:   #1a1a1a;       /* Modali, dropdown */

/* ── Text ── */
--text-primary:    #fafafa;     /* Titoli, testo principale (avorio bianco) */
--text-secondary:  #a3a3a3;     /* Testo secondario */
--text-tertiary:   #737373;     /* Label, hint */
--text-disabled:   #525252;     /* Stati disabilitati */
--text-inverse:    #0a0a0a;     /* Testo su sfondi chiari */

/* ── Borders ── */
--border-primary:    #262626;   /* Bordi card */
--border-secondary:  #1f1f1f;   /* Dividers leggeri */
--border-strong:     #404040;   /* Bordi input, focus rings */

/* ── Brand Accent — ORO (stesso identico) ── */
--accent-primary:     #c9b97a;  /* Oro AiFolly — INVARIATO in dark mode */
--accent-hover:       #d6c98e;  /* Oro più chiaro per hover su scuro */
--accent-light:       #3a3320;  /* Oro scuro come background badge */
--accent-bg:          #1a1810;  /* Oro pallidissimo dark */
--accent-text:        #e8dfc8;  /* Testo oro chiaro su sfondo scuro */

/* ── Stati semantici ── */
--success:        #10b981;
--success-bg:     #052e1f;
--success-text:   #34d399;

--warning:        #f59e0b;
--warning-bg:     #2e1f05;
--warning-text:   #fbbf24;

--danger:         #ef4444;
--danger-bg:      #2e0a0a;
--danger-text:    #f87171;

--info:           #0ea5e9;
--info-bg:        #082f49;
--info-text:      #38bdf8;
```

### 3.4 Uso dell'oro — Regole rigide

L'oro è l'elemento più distintivo del marchio. Va usato con disciplina, mai sprecato:

**✅ DOVE USARE l'oro:**
- Pulsante CTA primario (un solo "primary" per pagina, mai due)
- Diamante del logo (sempre)
- Indicatore di pagina/sezione attiva nella sidebar
- Link in evidenza (es. "Vai al menu pubblico →")
- Bordo del campo input in stato `:focus`
- Badge "Pro" o "Business" nel piano corrente
- Valori numerici importanti (es. MRR nel dashboard Super Admin)
- Checkmark di campi completati nell'onboarding

**❌ DOVE NON USARE l'oro:**
- Testo body (riduce la leggibilità)
- Icone generiche (sidebar, toolbar)
- Bordi delle card (usa `--border-primary`)
- Stati di errore o successo (usa i colori semantici)
- Sfondi grandi (l'oro è un accento, non un fondo)
- Più di 3-4 elementi oro per schermata (regola del 5%)

### 3.5 Stati semantici — Quando usarli

Anche se la palette è dominata da neutri + oro, i 4 colori semantici sono essenziali per UX:

| Colore | Quando | Esempio concreto |
|---|---|---|
| **Verde** (success) | Conferme, stati attivi, pubblicato | Badge "Pubblicato", toast "Piatto salvato", icona check completato |
| **Arancione** (warning) | Bozze, in attesa, attenzione moderata | Badge "Bozza", banner "Hai modifiche non pubblicate", "Token in scadenza" |
| **Rosso** (danger) | Errori, eliminazione, sospensione | Errore form, modal di conferma eliminazione, "Tenant sospeso" |
| **Blu** (info) | Suggerimenti, hint, info neutre | Tooltip, banner "Lo sapevi che...", info contestuali |

---

## 4. Typography

### 4.1 Font scelti

| Uso | Font | Pesi disponibili | Note |
|---|---|---|---|
| **Display + UI** | Geist Sans | 300, 400, 500, 600, 700 | Default per tutto il pannello admin |
| **Monospace** | Geist Mono | 400, 500 | Codice, ID, numeri tecnici |
| **Body alternativo** | Inter (fallback) | 400, 500, 600, 700 | Se Geist non disponibile |

**Perché Geist:** è il font ufficiale di Vercel, progettato specificamente per le interfacce tech-forward. Ha proporzioni ideali per UI dense, supporta le tabular numbers (essenziali per dashboard), è gratuito e disponibile su Google Fonts. **Linear** usa un font custom simile, **Vercel** usa proprio Geist. È la scelta tipografica più riconoscibilmente "moderno SaaS" del 2026.

> **Nota importante:** AiFolly usa Geist nel pannello admin, MA il menu pubblico dei ristoratori usa i font scelti dal loro tema (Cormorant Garamond, Playfair, Anton, ecc.). Non confondere i due contesti: Geist è solo per AiFolly come marchio.

### 4.2 Scala tipografica

```css
/* ── Display (titoli grandi, hero) ── */
--text-display-2xl: 60px;  /* Linea: 1.0,  Tracking: -2px,  Weight: 600 */
--text-display-xl:  48px;  /* Linea: 1.1,  Tracking: -1.5px, Weight: 600 */
--text-display-lg:  36px;  /* Linea: 1.15, Tracking: -1px,   Weight: 600 */

/* ── Headings ── */
--text-h1: 30px;  /* Linea: 1.2,  Tracking: -0.5px, Weight: 600 */
--text-h2: 24px;  /* Linea: 1.25, Tracking: -0.4px, Weight: 600 */
--text-h3: 20px;  /* Linea: 1.3,  Tracking: -0.3px, Weight: 600 */
--text-h4: 18px;  /* Linea: 1.35, Tracking: -0.2px, Weight: 500 */

/* ── Body ── */
--text-body-lg: 16px; /* Linea: 1.6,  Tracking: 0,    Weight: 400 */
--text-body:    14px; /* Linea: 1.55, Tracking: 0,    Weight: 400 — DEFAULT */
--text-body-sm: 13px; /* Linea: 1.5,  Tracking: 0,    Weight: 400 */

/* ── Label/UI ── */
--text-label:   12px; /* Linea: 1.4,  Tracking: 0.1, Weight: 500 */
--text-caption: 11px; /* Linea: 1.4,  Tracking: 0.2, Weight: 400 */
--text-overline: 11px; /* Linea: 1,    Tracking: 1.2, Weight: 600, UPPERCASE */
```

### 4.3 Regole tipografiche

**✅ Sempre:**
- Body text di default: 14px (Geist Regular)
- Tabular numbers per tutti i numeri in tabelle e dashboard (`font-feature-settings: "tnum"`)
- Letter-spacing negativo sui titoli grandi (rende il display più "tight" e moderno)
- Line-height generoso sul body (1.55-1.6) per leggibilità

**❌ Mai:**
- Testo sotto 11px (illeggibile)
- Font-weight 700 sui paragrafi (troppo pesante)
- Italic gratuito (in un tool tech, l'italic distrae)
- ALL CAPS su testo lungo (solo overline e button labels)
- Mix di Geist e altri font sans-serif (Inter, Outfit, ecc.) — uno solo

---

## 5. Spacing & Layout

### 5.1 Scala di spacing (base 4px)

```css
--space-0:   0;
--space-1:   4px;   /* Micro */
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;  /* Default per gap inline */
--space-5:   20px;
--space-6:   24px;  /* Default per padding card */
--space-8:   32px;  /* Spacing tra sezioni */
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;  /* Spacing tra blocchi grandi */
--space-20:  80px;
--space-24:  96px;
```

### 5.2 Layout del pannello admin

**Sidebar:**
- Larghezza: 240px (espansa) / 64px (collassata)
- Padding interno: 16px
- Background: `--bg-secondary`
- Border-right: 1px solid `--border-primary`

**Topbar:**
- Altezza: 56px
- Padding orizzontale: 24px
- Background: `--bg-primary`
- Border-bottom: 1px solid `--border-primary`

**Content area:**
- Padding: 32px (laterale) × 24px (verticale)
- Max-width: 1280px (centrato su schermi grandi)

### 5.3 Border radius

```css
--radius-none: 0;
--radius-sm:   4px;   /* Input, button piccoli */
--radius-md:   6px;   /* Button, badge — DEFAULT */
--radius-lg:   8px;   /* Card, modali */
--radius-xl:   12px;  /* Card hero, immagini grandi */
--radius-full: 9999px; /* Pill, avatar, dot */
```

**Filosofia:** in linea con il tech-forward, AiFolly usa angoli arrotondati ma **non eccessivi**. Niente "blob" rotondi tipici di app casual. Il default è 6px per i pulsanti, 8px per le card. Questo dà un feel "sharp" ma non rigido.

### 5.4 Shadows

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.04);                                  /* Subtle elevation */
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04); /* Card hover */
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04); /* Modali */
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.04); /* Dropdown */
```

**Nota dark mode:** in dark mode le shadow sono praticamente invisibili. Per dare elevation ai componenti, usa **bordi sottili** (`--border-strong`) invece delle ombre.

---

## 6. Componenti chiave (linee guida visive)

### 6.1 Pulsanti

**Primary (oro):**
- Background: `--accent-primary`
- Text: `--text-inverse` (o `#0a0a0a` per migliore contrasto su oro)
- Border: nessuno
- Padding: 10px 20px (default), 8px 14px (small), 12px 28px (large)
- Border-radius: `--radius-md` (6px)
- Font: Geist 14px Medium (500)
- Hover: background `--accent-hover`
- **Massimo 1 per pagina/sezione**

**Secondary (outline):**
- Background: trasparente
- Text: `--text-primary`
- Border: 1px solid `--border-strong`
- Stesso padding del primary
- Hover: background `--bg-tertiary`

**Ghost (text only):**
- Background: trasparente
- Text: `--text-secondary`
- Border: nessuno
- Hover: background `--bg-tertiary`, text `--text-primary`

**Destructive (per eliminazioni):**
- Background: trasparente in default, `--danger-bg` in hover
- Text: `--danger`
- Border: 1px solid `--danger`

### 6.2 Card

- Background: `--bg-primary`
- Border: 1px solid `--border-primary`
- Border-radius: `--radius-lg` (8px)
- Padding: `--space-6` (24px)
- Shadow: nessuna di default, `--shadow-sm` se elevata

### 6.3 Input

- Background: `--bg-primary`
- Border: 1px solid `--border-strong`
- Border-radius: `--radius-md` (6px)
- Padding: 10px 12px
- Font: Geist 14px
- **Focus state:** border `--accent-primary`, box-shadow `0 0 0 3px var(--accent-light)`
- Error state: border `--danger`, box-shadow `0 0 0 3px var(--danger-bg)`

### 6.4 Badge

Usato per stati (Pubblicato, Bozza, ecc.) e tag.

- Padding: 2px 8px
- Border-radius: `--radius-full`
- Font: Geist 11px Medium (500), tracking 0.1
- Border: 1px solid (colore semantico)
- Background: versione `-bg` del colore semantico
- Text: versione `-text` del colore semantico

Esempio "Pubblicato":
- Background: `--success-bg`
- Border: `--success`
- Text: `--success-text`

### 6.5 Sidebar item

- Altezza: 36px
- Padding: 8px 12px
- Border-radius: `--radius-md`
- Font: Geist 14px Regular
- Icona: 18px, allineata a sinistra con gap 12px
- Default: text `--text-secondary`
- Hover: background `--bg-tertiary`, text `--text-primary`
- **Active:** background `--accent-bg`, text `--accent-text`, **bordo sinistro 2px** in `--accent-primary`

---

## 7. Iconografia

### 7.1 Libreria

**Lucide React** (`lucide-react`) — la stessa libreria già nelle dipendenze del progetto. È:
- Open source, ~1500 icone
- Stroke-based (perfette per stili tech-forward)
- Customizzabili (stroke-width, dimensione, colore)
- React-friendly

### 7.2 Regole d'uso

- **Stroke-width: 1.75** di default (più sottile del 2 standard, più elegante)
- **Dimensione standard: 16px** per UI inline, 18px per sidebar items, 20px per toolbar
- **Mai usare** icone di colori diversi nello stesso contesto (es. tutte le icone della sidebar dello stesso colore)
- **Mai mixare** Lucide con altre libraries (no FontAwesome, no Heroicons in contemporanea)

### 7.3 Icone consigliate per contesti specifici

| Contesto | Icona Lucide | Note |
|---|---|---|
| Dashboard | `LayoutDashboard` | |
| Menu (lista piatti) | `UtensilsCrossed` | |
| Categorie | `FolderOpen` | |
| Theme builder | `Palette` | |
| Impostazioni | `Settings` | |
| QR Code | `QrCode` | |
| Logout | `LogOut` | |
| Profilo | `User` o `CircleUser` | |
| Notifiche | `Bell` | |
| Aiuto | `CircleHelp` | |
| Cerca | `Search` | |
| Aggiungi | `Plus` | |
| Modifica | `Pencil` (non Edit) | |
| Elimina | `Trash2` (non Trash) | |
| Conferma | `Check` | |
| Chiudi | `X` | |
| Preview/Eye | `Eye` | |
| Pubblica | `Send` o `Globe` | |
| Drag handle | `GripVertical` | |
| Più/meno | `Plus` / `Minus` | |
| Freccia link | `ArrowRight` | |
| Avviso | `TriangleAlert` | |
| Errore | `CircleX` | |
| Successo | `CircleCheck` | |
| Info | `Info` | |

---

## 8. Email transazionali — Stile visivo

Le email transazionali (invito collaboratore, reset password, fatturazione fallita) seguono il branding AiFolly. Tutte sono **plain HTML semplice**, ottimizzate per dispositivi mobile e per la dark mode dei client email.

### 8.1 Struttura base

```
┌─────────────────────────────────┐
│                                 │
│        [◆ A ◆]  AiFolly         │  ← Header con logo (centrato, 32px alto)
│                                 │
├─────────────────────────────────┤
│                                 │
│   Titolo dell'email             │  ← Geist 24px Semibold, allineato a sx
│   in due righe se serve         │
│                                 │
│   Ciao {nome},                  │  ← Body text 15px
│                                 │
│   Testo principale dell'email,  │
│   conciso ma cordiale, max      │
│   2-3 paragrafi.                │
│                                 │
│        [Pulsante azione]        │  ← CTA oro centrato
│                                 │
│   Eventuale testo di follow-up  │
│   o disclaimer.                 │
│                                 │
├─────────────────────────────────┤
│                                 │
│  AiFolly · menu.aifolly.com     │  ← Footer minimal con link
│  Disiscriviti                   │
│                                 │
└─────────────────────────────────┘
```

### 8.2 Specifiche tecniche

- **Larghezza max:** 560px (centrato)
- **Background email:** `#fafafa`
- **Background container:** `#ffffff`
- **Padding container:** 40px (laterale) × 48px (verticale)
- **Border-radius container:** 8px
- **Font:** Geist (con fallback Inter, system-ui, sans-serif)
- **Shadow container:** `0 1px 3px rgba(0,0,0,0.05)` (sottile)
- **Footer text:** 12px, colore `#737373`

### 8.3 Email principali (preview copy)

**1. Conferma registrazione:**
> Oggetto: `Benvenuto su AiFolly`
> 
> Ciao Mario,
> 
> Grazie per esserti registrato su AiFolly. Per attivare il tuo account, clicca il pulsante qui sotto.
> 
> [Conferma email]
> 
> Il link è valido per 24 ore. Se non hai richiesto questa email, puoi ignorarla.

**2. Invito collaboratore:**
> Oggetto: `Mario ti ha invitato a gestire Osteria del Porto`
> 
> Ciao,
> 
> Mario Rossi ti ha invitato a unirti come collaboratore al menu di **Osteria del Porto** su AiFolly, con il ruolo di **Manager**.
> 
> [Accetta invito]
> 
> Questo invito scade tra 7 giorni.

**3. Reset password:**
> Oggetto: `Reimposta la password di AiFolly`
> 
> Ciao Mario,
> 
> Hai richiesto di reimpostare la password del tuo account AiFolly. Clicca il pulsante per scegliere una nuova password.
> 
> [Reimposta password]
> 
> Il link è valido per 1 ora. Se non hai richiesto questa email, ignora questo messaggio — il tuo account è al sicuro.

**4. Pagamento fallito:**
> Oggetto: `Problema con il pagamento del piano AiFolly`
> 
> Ciao Mario,
> 
> Il pagamento per il piano **Pro** di Osteria del Porto non è andato a buon fine. Il tuo menu è ancora attivo, ma per evitare interruzioni ti chiediamo di aggiornare il metodo di pagamento entro 7 giorni.
> 
> [Aggiorna pagamento]
> 
> Per qualsiasi domanda, rispondi a questa email.

**5. Tema pubblicato (notifica):**
> Oggetto: `Il tuo nuovo tema è online`
> 
> Ciao Mario,
> 
> Le modifiche al tema di **Osteria del Porto** sono ora visibili a tutti i clienti che scansionano il QR code.
> 
> [Vai al menu pubblico]

> **Nota:** queste sono solo previews del copy. I template HTML completi delle email vanno definiti come step separato (Passo 5 del nostro percorso). Qui ho voluto darti un'idea del tono di voce in azione.

---

## 9. Landing page (homepage del marchio)

La landing page `menu.aifolly.com` (o `aifolly.com` se preferisci) è il primo contatto dei ristoratori con il marchio. Deve trasmettere immediatamente:

1. **Cosa fa AiFolly** (in 5 secondi di lettura)
2. **Perché è diverso** (mockup del theme builder e dei preset)
3. **Quanto costa** (piani trasparenti)
4. **Chi lo usa già** (eventuali testimonianze, logo clienti)

### 9.1 Struttura raccomandata

1. **Hero** — Titolo grande "Il menu del tuo ristorante. Eleganza digitale.", sottotitolo, CTA "Inizia gratis" + "Vedi una demo"
2. **Showcase preset** — Galleria visiva degli 8 preset con possibilità di anteprima live
3. **Theme builder demo** — GIF/video del theme builder in azione
4. **Features key** — 4 blocchi: QR code, customizzazione, analytics, multi-tenant
5. **Pricing** — Tabella 3 colonne (Free, Pro, Business)
6. **Testimonianze** — Quote di ristoratori (anche fittizi all'inizio)
7. **FAQ** — 6-8 domande frequenti
8. **Footer** — Link legali, social, contatti

### 9.2 Linee guida visive landing

- **Stesso branding del pannello admin** (Geist, palette neutra + oro)
- **Più spazio bianco** rispetto al pannello admin (la landing è marketing, non tool)
- **Hero text molto grande** (display-2xl o display-xl)
- **Animazioni sottili** allo scroll (fade-in degli elementi, parallax leggero)
- **Niente stock photo generiche** di "team in ufficio sorridenti" — usa solo screenshot reali del prodotto e foto curate di cibo/ristoranti

---

## 10. Asset da produrre

Lista degli asset visivi che il team design dovrà creare prima del lancio. **Non bloccanti** per lo sviluppo iniziale (Claude Code può usare placeholder), ma necessari per la versione production.

| Asset | Formato | Dimensioni | Priorità |
|---|---|---|---|
| Logo SVG (lockup orizzontale, light) | SVG | scalabile | Critica |
| Logo SVG (lockup orizzontale, dark) | SVG | scalabile | Critica |
| Logo SVG (solo simbolo, light + dark) | SVG | scalabile | Critica |
| Logo PNG (per email) | PNG | 200×40 px @2x | Alta |
| Favicon | ICO + PNG | 16, 32, 48 px | Alta |
| App icon iOS | PNG | 1024×1024 + tutte le size | Media |
| App icon Android | PNG | 512×512 | Media |
| Open Graph image (default) | PNG | 1200×630 | Alta |
| Twitter card image | PNG | 1200×600 | Media |
| Thumbnail preset (×8) | PNG | 400×800 | Alta |
| Hero illustration landing | SVG/PNG | 1200×800 | Media |
| Screenshot dashboard (per landing) | PNG | 1440×900 | Media |
| Loading spinner / placeholder | SVG | 32×32 | Bassa |

---

## 11. Riferimenti e ispirazioni

Per mantenere il marchio coerente nel tempo, questi sono i riferimenti visivi a cui ispirarsi:

- **[Linear](https://linear.app)** — Tipografia, sidebar, dark mode, dettagli UI
- **[Vercel](https://vercel.com)** — Geist font, palette neutri + accento, landing page
- **[Resend](https://resend.com)** — Email transazionali, copy pulito
- **[Stripe](https://stripe.com)** — Documentazione, dashboard struttura
- **[Framer](https://framer.com)** — Microinterazioni, animazioni
- **Per il copy:** lo stile editoriale di **NN/g (Nielsen Norman Group)** — diretto, senza fronzoli, basato su evidence

**Cosa NON imitare:**
- ❌ Zomato, Deliveroo, JustEat (troppo consumer, troppo colorati)
- ❌ Square, Toast, Lightspeed (troppo aziendalisti, palette banali)
- ❌ Wix, Squarespace (troppo "drag-and-drop per nonne")

---

## 12. Coerenza con il menu pubblico

**Importante:** il branding AiFolly deve dialogare con il menu pubblico ma non sovrastarlo.

| Aspetto | AiFolly (admin) | Menu pubblico (preset Elegante) |
|---|---|---|
| **Tono** | Tech, professionale | Caldo, ospitale |
| **Font** | Geist (sans-serif geometrico) | Cormorant Garamond + Outfit |
| **Palette dominante** | Bianco/grigio neutro | Avorio caldo |
| **Colore brand** | **Oro `#c9b97a`** (continuità) | **Oro `#c9b97a`** (continuità) |
| **Densità** | Compatta (UI dense) | Generosa (esperienza lettura) |
| **Animazioni** | Sottili, funzionali | Eleganti, narrative |

L'oro `#c9b97a` è il **filo conduttore** che lega le due esperienze: il ristoratore lavora nel pannello tech-forward AiFolly, ma quando scansiona il QR del suo menu vede lo stesso oro nei badge e nei dettagli del preset Elegante. Coerenza emotiva senza forzature stilistiche.

---

## 13. Note finali per Claude Code

Quando implementerai il branding nel pannello admin AiFolly:

1. **Crea un file `src/styles/brand.css`** (o `tailwind.config.ts` esteso) con tutti i CSS custom properties di sezione 3
2. **Implementa il toggle light/dark mode** usando `prefers-color-scheme` come default + override manuale salvato in localStorage
3. **Crea il componente `<Logo />`** con tutte le varianti di sezione 2.6
4. **Crea i componenti UI base** (`<Button />`, `<Card />`, `<Input />`, `<Badge />`) seguendo le specifiche di sezione 6, basandoti su shadcn/ui ma personalizzando con i token di branding
5. **Importa Geist via Google Fonts** in `app/layout.tsx`:
   ```typescript
   import { Geist, Geist_Mono } from "next/font/google";
   const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
   const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
   ```
6. **Usa Lucide React** per tutte le icone, mai mescolare con altre librerie
7. **Quando installi shadcn/ui**, sovrascrivi il default theme con i tokens di sezione 3 prima di aggiungere componenti

---

*Documento generato l'8 Aprile 2026 — AiFolly Brand Guidelines v1.0. Da considerare insieme a `AIFOLLY-MENU-SPEC-v3.3.md` come fonte di verità del marchio. Aggiornare questo documento prima di introdurre cambiamenti visuali significativi al pannello admin o al marchio.*
