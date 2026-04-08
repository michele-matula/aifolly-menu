# 🚀 AiFolly Menu — Guida al Deploy su Vercel

> Salva questo file come `DEPLOY-VERCEL.md` nella cartella root del progetto (`C:\Users\Michele\source\repos\aifolly-menu\DEPLOY-VERCEL.md`). Contiene tutti i passaggi per portare AiFolly Menu online gratis, raggiungibile da un URL pubblico che puoi mostrare ai clienti.

## Premessa: cosa otterrai

Alla fine di questa guida avrai:
- Il codice di AiFolly Menu su **GitHub** (repository privato gratis)
- Il sito deployato su **Vercel** (gratis fino a limiti molto generosi per un MVP)
- Un URL pubblico del tipo `https://aifolly-menu-<hash>.vercel.app` oppure `https://aifolly-menu.vercel.app`
- Il menu visibile da qualsiasi dispositivo nel mondo a `https://aifolly-menu.vercel.app/osteria-del-porto`
- Deploy automatico ad ogni push su GitHub (zero configurazione futura)

**Costo totale: 0 euro.** Vercel Free ti dà 100 GB di bandwidth/mese, che è più che sufficiente per testare con clienti. Supabase Free include già il database.

**Tempo stimato: 45-60 minuti** se è la prima volta che usi Vercel, meno se sei già esperto.

---

## Sezione 1 — Preparazione del codice per il deploy

Prima di deployare, devi applicare alcune modifiche al progetto locale che sono **essenziali** perché Vercel possa buildare correttamente.

### 1.1 Sposta `prisma` da devDependency a dependency normale

Vercel di default non installa le devDependencies in produzione, ma durante il build ha bisogno di lanciare `prisma generate`. Quindi `prisma` deve essere nelle dependencies normali, non in devDependencies.

Apri `package.json` nel progetto e verifica: se vedi `"prisma": "^..."` nella sezione `"devDependencies"`, **spostalo** nella sezione `"dependencies"`. Dovrebbe essere simile a questo:

```json
{
  "dependencies": {
    "@prisma/client": "^6.19.x",
    "next": "^16.x.x",
    "prisma": "^6.19.x",
    "react": "^19.x.x",
    "react-dom": "^19.x.x",
    "zod": "^4.x.x"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.x.x",
    "eslint": "^9",
    "tailwindcss": "^4",
    "tsx": "^4.x.x",
    "typescript": "^5"
  }
}
```

Se non sei sicuro, lancia in PowerShell dalla cartella del progetto:
```powershell
npm uninstall prisma
npm install prisma
```
Questo lo reinstalla come dependency normale.

### 1.2 Aggiungi lo script `postinstall` al `package.json`

Sempre in `package.json`, nella sezione `"scripts"`, aggiungi uno script `postinstall` che lancia `prisma generate`. Questo fa sì che ogni volta che Vercel installa le dipendenze, il Prisma Client venga rigenerato con lo schema aggiornato.

La sezione scripts dovrebbe diventare:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "postinstall": "prisma generate"
}
```

Lo script `postinstall` viene lanciato automaticamente da npm dopo `npm install`, senza che tu lo debba invocare.

### 1.3 Crea il file `.gitignore` (verifica che sia corretto)

Verifica che nella root del progetto esista un file `.gitignore` e che contenga almeno queste righe:

```
node_modules
.next
.env
.env.local
.env*.local
/src/generated/prisma
.DS_Store
*.log
```

In particolare è **critico** che `.env` e `.env.local` siano lì dentro. Non vuoi committare le credenziali del database.

Se trovi `.env*.local` ma non `.env`, aggiungi anche `.env` (senza estensione). 

`next-app` di default lo genera già correttamente, ma conviene verificare.

### 1.4 Test finale in locale prima del deploy

Da PowerShell, dalla cartella del progetto, lancia:

```powershell
npm run build
```

Se il build va a buon fine (vedi "✓ Compiled successfully" alla fine), sei pronto. Se ci sono errori, **risolvili prima di procedere** — un errore in locale sarà un errore anche su Vercel. Gli errori più comuni a questo stadio sono:
- `prisma: command not found` → non hai spostato prisma in dependencies
- `Cannot find module '@/generated/prisma'` → Prisma Client non generato, lancia `npx prisma generate`
- Errori TypeScript → lancia `npx tsc --noEmit` per vederli senza buildare

Se tutto ok, vai al prossimo step.

---

## Sezione 2 — Crea il repository GitHub

Vercel può deployare in due modi: da GitHub (consigliato, con auto-deploy su ogni push) o via CLI. Useremo la via GitHub che è più semplice e robusta a lungo termine.

### 2.1 Crea un account GitHub (se non ce l'hai già)

Vai su **https://github.com** e registrati. Gratis.

### 2.2 Installa Git (se non l'hai già)

Lo hai già installato all'inizio del progetto (`git version 2.51.1`), quindi sei a posto. Verifica con:

```powershell
git --version
```

### 2.3 Configura Git con le tue credenziali (se è la prima volta)

Se non hai mai usato Git prima, configura nome ed email:

```powershell
git config --global user.name "Il Tuo Nome"
git config --global user.email "tuaemail@example.com"
```

Usa la stessa email che hai usato per registrarti su GitHub.

### 2.4 Crea il repository GitHub via browser

1. Vai su **https://github.com/new**
2. **Repository name**: `aifolly-menu`
3. **Description**: "AiFolly Menu — SaaS multi-tenant per menu digitali QR code"
4. **Private** (importante, non public — il codice contiene logica business proprietaria)
5. **NON** selezionare "Initialize this repository with a README", "Add .gitignore", o "Choose a license" — perché abbiamo già un progetto locale con i suoi file
6. Clicca **"Create repository"**

GitHub ti mostrerà una pagina con le istruzioni per connettere un repository locale esistente. Le useremo nel prossimo step.

### 2.5 Inizializza Git nel progetto locale e fai il primo commit

Da PowerShell, dalla cartella `C:\Users\Michele\source\repos\aifolly-menu`:

```powershell
git init
git add .
git status
```

Il comando `git status` ti mostra cosa verrà committato. **Verifica attentamente** che NON ci sia `.env` nella lista. Se lo vedi, significa che il `.gitignore` non sta funzionando — non procedere, torna al punto 1.3 e risolvi.

Se `.env` NON è nella lista (ottimo), procedi con il primo commit:

```powershell
git commit -m "Fase 1 completata — menu pubblico funzionante"
```

Ora collega il repository locale a quello GitHub (sostituisci `TUO_USERNAME` con il tuo username GitHub):

```powershell
git remote add origin https://github.com/TUO_USERNAME/aifolly-menu.git
git branch -M main
git push -u origin main
```

Alla prima push, GitHub ti potrebbe chiedere di autenticarti. Si aprirà una finestra del browser o di un helper credenziali. Segui le istruzioni (la cosa più semplice è loggarti via browser).

Una volta completata la push, vai su `https://github.com/TUO_USERNAME/aifolly-menu` e dovresti vedere tutti i file del progetto online. **Importante**: verifica che NON ci sia il file `.env` tra quelli visibili su GitHub. Se per qualche motivo è finito lì, **cambia immediatamente la password del database Supabase** e rimuovi il file dalla storia Git (operazione complessa — chiedi aiuto se succede).

---

## Sezione 3 — Crea un secondo database Supabase per la produzione

**Regola fondamentale**: non usare lo stesso database per sviluppo e produzione. In sviluppo potresti cancellare accidentalmente dati o far casino con le migrazioni; non vuoi che questo impatti il database reale che i clienti vedono.

### 3.1 Crea il nuovo progetto Supabase

1. Vai su **https://supabase.com/dashboard**
2. Clicca **"New Project"**
3. Compila:
   - **Name**: `aifolly-menu-prod`
   - **Database Password**: genera una nuova password (diversa da quella di dev) e **salvala in un posto sicuro**
   - **Region**: `Central EU (Frankfurt)` o `West Europe (Ireland)` — la stessa di dev per consistenza
   - **Pricing Plan**: Free
4. Clicca **"Create new project"** e aspetta 2-3 minuti

### 3.2 Disabilita Data API e automatic RLS

Durante la creazione, Supabase ti chiederà di nuovo le opzioni:
- **Enable Data API** → **OFF**
- **Enable automatic RLS** → **OFF**

Gli stessi motivi dello sviluppo: usiamo Prisma, non `supabase-js`.

### 3.3 Ottieni le connection string

Quando il progetto è pronto, clicca il pulsante **"Connect"** in alto, vai sul tab **ORMs → Prisma**, e copia le due stringhe. Le riconoscerai perché hanno un project ID diverso da quello di dev:

```
DATABASE_URL="postgresql://postgres.NUOVOID:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.NUOVOID:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

Sostituisci `[YOUR-PASSWORD]` con la vera password di produzione e **tienile da parte** — ti serviranno su Vercel e per il seed del database di prod.

### 3.4 Applica le migrazioni sul database di produzione

Dal tuo computer locale, lancia le migrazioni Prisma **puntando al database di produzione**. Il modo più sicuro è usare una variabile d'ambiente temporanea senza toccare il tuo `.env` locale. In PowerShell:

```powershell
$env:DATABASE_URL="postgresql://postgres.NUOVOID:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
$env:DIRECT_URL="postgresql://postgres.NUOVOID:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
npx prisma migrate deploy
```

Sostituisci le credenziali con quelle vere di produzione. `migrate deploy` applica tutte le migrazioni esistenti in modo sicuro per ambienti di produzione (non genera nuove migrazioni, applica solo quelle già nella cartella `prisma/migrations/`).

Se vedi "Applied 1 migration" o "No pending migrations to apply", sei a posto.

### 3.5 Seed del database di produzione

Stessa variabile d'ambiente, lancia il seed:

```powershell
npx prisma db seed
```

Dovresti vedere gli stessi log del seed di dev: 8 preset, 1 ristorante "Osteria del Porto", 29 piatti, 6 varianti. Se tutto va a buon fine, il database di produzione è popolato con gli stessi dati del dev.

### 3.6 Chiudi le variabili temporanee

Importante: chiudi PowerShell e riaprilo. Questo ripristina le tue variabili d'ambiente al valore originale del file `.env` (dev). Altrimenti rischi di eseguire operazioni su produzione mentre pensi di essere in dev.

**Verifica** lanciando `npm run dev` e aprendo `http://localhost:3000/osteria-del-porto` — dovresti vedere ancora la copertina del tuo dev locale. Se vedi la stessa cosa sono tornati i valori giusti.

---

## Sezione 4 — Deploy su Vercel

### 4.1 Crea un account Vercel

1. Vai su **https://vercel.com/signup**
2. Clicca **"Continue with GitHub"** (la via più semplice perché useremo GitHub per il deploy)
3. Autorizza Vercel ad accedere al tuo GitHub
4. Durante il setup, potrebbe chiederti "Hobby" vs "Pro" — scegli **Hobby** (gratis, perfetto per il nostro caso)

### 4.2 Importa il progetto da GitHub

1. Dalla dashboard Vercel, clicca **"Add New..."** → **"Project"**
2. Nella sezione "Import Git Repository" vedrai la lista dei tuoi repository GitHub
3. Cerca **`aifolly-menu`** e clicca **"Import"**

Se non vedi il repository nella lista (può succedere quando è privato):
- Clicca "Adjust GitHub App Permissions"
- Nella pagina GitHub che si apre, dai a Vercel l'accesso al repository `aifolly-menu`
- Torna su Vercel e riprova

### 4.3 Configura il progetto Vercel

Nella pagina di configurazione del progetto, Vercel rileverà automaticamente che è un progetto Next.js. Verifica queste cose:

- **Framework Preset**: Next.js (rilevato automaticamente, lascia così)
- **Root Directory**: `./` (default, lascia così)
- **Build Command**: lascia vuoto (Vercel usa `next build` di default)
- **Output Directory**: lascia vuoto (Vercel usa `.next` di default)
- **Install Command**: lascia vuoto (Vercel usa `npm install` di default)

### 4.4 Configura le variabili d'ambiente

Questa è la parte più importante. Clicca su **"Environment Variables"** per espandere la sezione e aggiungi le due variabili:

**Variabile 1:**
- **Key**: `DATABASE_URL`
- **Value**: la tua `DATABASE_URL` di **produzione** (pooled, porta 6543, con `?pgbouncer=true`)
- **Environment**: seleziona **tutti e 3** (Production, Preview, Development)

**Variabile 2:**
- **Key**: `DIRECT_URL`
- **Value**: la tua `DIRECT_URL` di **produzione** (porta 5432)
- **Environment**: seleziona **tutti e 3** (Production, Preview, Development)

**Attenzione**: non incollare le URL di dev. Qui vanno le URL del nuovo progetto `aifolly-menu-prod`.

### 4.5 Clicca Deploy

Clicca il grosso pulsante **"Deploy"**. Vercel inizierà a buildare il progetto. Vedrai un log in tempo reale che mostra:

1. **Cloning repository** — Clona il codice da GitHub
2. **Installing dependencies** — Lancia `npm install` (qui il `postinstall` farà partire `prisma generate`)
3. **Building** — Lancia `next build`
4. **Deploying** — Pubblica l'output sui server Vercel

Il processo richiede 2-4 minuti. Se vedi errori in questa fase, fermati e chiedi aiuto.

### 4.6 Verifica che il deploy sia andato a buon fine

Quando il deploy finisce con successo, vedrai una schermata di "Congratulations!" con una preview del sito e un link tipo `https://aifolly-menu-abc123.vercel.app`.

Clicca il link e dovresti vedere... la pagina iniziale di Next.js, non la tua copertina. **È atteso**, perché abbiamo una route `/[slug]` ma non una route `/` (la homepage). Per vedere la copertina di "Osteria del Porto" vai a:

```
https://aifolly-menu-abc123.vercel.app/osteria-del-porto
```

(sostituisci con il tuo URL Vercel). Dovresti vedere la copertina identica a quella di dev, poi cliccando "Scopri il menu" il menu completo.

---

## Sezione 5 — Post-deploy e troubleshooting comune

### 5.1 Home page che va al 404

Se vai a `https://aifolly-menu-abc123.vercel.app/` vedi un 404. È normale — non abbiamo ancora creato una landing page del marchio AiFolly (sarà fatta in Fase 2/5). Per ora l'app è accessibile solo ai singoli slug dei ristoranti.

Se vuoi un redirect temporaneo dalla home a `/osteria-del-porto` come demo, crea un file `src/app/page.tsx` così:

```typescript
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/osteria-del-porto');
}
```

Committa, pusha, Vercel redeploya automaticamente.

### 5.2 Errore `prisma: command not found` durante il build

Hai dimenticato di spostare `prisma` da devDependencies a dependencies. Vedi sezione 1.1, fai la modifica, committa, pusha.

### 5.3 Errore `Environment variable not found: DATABASE_URL`

Le variabili d'ambiente non sono state salvate correttamente, oppure non sono associate all'environment "Production". Vai su Vercel → tuo progetto → Settings → Environment Variables, verifica che siano lì e che il checkbox "Production" sia attivo. Se modifichi una env var, devi **riavviare il deploy** (Deployments → i tre puntini sul deploy più recente → Redeploy).

### 5.4 Errore `prepared statement "s0" already exists` durante una query

Problema noto con Supabase pgbouncer. La `DATABASE_URL` deve contenere `?pgbouncer=true` alla fine. Vedi sezione 4.4 e verifica che nella variabile d'ambiente su Vercel sia presente quella parte.

### 5.5 Il menu funziona ma i font non si caricano

Vercel a volte ha problemi con Google Fonts caricati dinamicamente nel lato client. Se vedi che la copertina si vede con font di sistema invece di Cormorant Garamond, è probabilmente un problema di Content Security Policy. Per ora Next.js 16 dovrebbe gestirlo automaticamente, ma se succede, apri DevTools → Console e cerca errori CSP relativi a `fonts.googleapis.com`. In quel caso bisogna aggiungere un header CSP in `next.config.ts`.

### 5.6 Auto-deploy su ogni push

Da questo momento, ogni volta che fai:

```powershell
git add .
git commit -m "descrizione modifica"
git push
```

Vercel rileva il nuovo commit e riavvia automaticamente il deploy. In 2-3 minuti il nuovo codice è online. Questo è uno dei motivi principali per cui si usa Vercel con GitHub: zero friction per il deployment.

### 5.7 Visualizzazione dei log di produzione

Per vedere cosa succede sul server in produzione (errori, query Prisma, ecc.):

1. Vercel → tuo progetto → tab **Logs**
2. Oppure dal tuo computer, dalla cartella progetto: `vercel logs` (richiede l'installazione del CLI con `npm i -g vercel`)

---

## Sezione 6 — Dominio custom (opzionale, per dopo)

Quando vuoi avere un URL più pulito del default Vercel, puoi collegare un dominio custom.

### 6.1 Compra un dominio

Consigliati per semplicità:
- **Cloudflare Registrar** (https://dash.cloudflare.com/registrar) — il più economico, prezzo al costo
- **Namecheap** (https://namecheap.com)
- **Porkbun** (https://porkbun.com) — buoni prezzi

Nomi potenziali: `aifolly.com`, `aifolly.app`, `aifollymenu.com`, `menudigitale.app`. Verifica la disponibilità. Il costo va da 10€ a 30€/anno a seconda del TLD.

### 6.2 Collega il dominio a Vercel

1. Vercel → tuo progetto → Settings → **Domains**
2. Inserisci il dominio (es. `aifolly.com`)
3. Vercel ti mostrerà dei record DNS da aggiungere
4. Vai sul pannello del tuo registrar e aggiungi quei record (di solito un CNAME o un record A)
5. Aspetta 5-60 minuti che il DNS si propaghi
6. Vercel rileverà automaticamente e configurerà SSL

Dopo di che, `https://aifolly.com/osteria-del-porto` funzionerà esattamente come l'URL Vercel.

---

## Sezione 7 — Checklist finale

Prima di dichiarare il deploy completato, verifica questi punti:

- [ ] Il codice è pushato su GitHub nel repository privato `aifolly-menu`
- [ ] Vercel ha importato il progetto e il deploy è "Ready" (verde)
- [ ] Aprendo `https://[tuo-url].vercel.app/osteria-del-porto` si vede la copertina con foto e pulsante CTA
- [ ] Cliccando "Scopri il menu" si vede il menu completo con 29 piatti nelle 6 categorie
- [ ] Lo scroll spy funziona (la categoria attiva si aggiorna scrollando)
- [ ] I filtri Vegetariano/Vegano/Senza Glutine funzionano
- [ ] Cliccando su un piatto si espandono gli allergeni
- [ ] Il 404 personalizzato appare su `https://[tuo-url].vercel.app/ristorante-inesistente`
- [ ] Il file `.env` NON è visibile nel repository GitHub
- [ ] Le env vars su Vercel puntano al database di **produzione** (non di dev)

Se tutti i punti sono verdi, hai AiFolly Menu online e puoi mostrarlo ai clienti. 🎉

---

## Sezione 8 — Come mostrare il menu a un cliente

1. Dal tuo telefono, apri il browser e vai a `https://[tuo-url].vercel.app/osteria-del-porto`
2. Il menu si carica in 1-2 secondi
3. Mostra al cliente: la copertina → "Questo è quello che vede il cliente scansionando il QR code"
4. Tap "Scopri il menu" → "Poi entra nel menu vero e proprio"
5. Mostra i filtri, lo scroll spy, l'espansione degli allergeni sui piatti
6. Mostra le varianti prezzo cliccando su un vino (Primitivo, Negroamaro, Verdeca)

Se vuoi un QR code di prova per farli scansionare, vai su https://qr-code-generator.com, inserisci l'URL completo `https://[tuo-url].vercel.app/osteria-del-porto`, scarica il PNG, e stampalo su un foglio. Cliente scansiona → menu appare.

---

## Note finali importanti

**Sicurezza delle credenziali**: Le env vars sono salvate crittografate su Vercel e non sono visibili nel codice. Ma se per qualche motivo pubblichi questo `DEPLOY-VERCEL.md` online, **assicurati di aver rimosso/oscurato le connection string di esempio** prima di farlo.

**Costi Supabase Free**: 500 MB di storage database, 2 GB di trasferimento dati/mese, 1 GB di storage file. Più che sufficiente per testare con decine di ristoranti. Quando/se diventa stretto, l'upgrade a Pro costa 25$/mese ed è istantaneo.

**Costi Vercel Free**: 100 GB di bandwidth/mese, 100 GB-Hours di serverless function execution, deploy illimitati. Per un prodotto in fase MVP/beta è abbondante. L'upgrade a Pro costa 20$/mese per utente.

**Prossimi passi dopo il deploy**: dovresti verificare nel browser che tutto funzioni come in locale (identico comportamento), e poi tornare in chat per iniziare la **Fase 2 — Pannello Admin**. Con questo file salvato e la conversazione compattata, ripartiremo con contesto fresco ma tutto il background necessario.
