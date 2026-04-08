\# AiFolly Menu — Progetto



\## Cos'è AiFolly Menu



AiFolly Menu è una piattaforma SaaS multi-tenant per la creazione e gestione di menu digitali per ristoranti e bar. I clienti finali scansionano un QR code dal tavolo e visualizzano il menu del locale sul proprio smartphone, senza scaricare app. I ristoratori gestiscono il menu da un pannello admin con un theme builder visuale che permette personalizzazione avanzata su 3 livelli (copertina, menu, piatti).



\## Stack tecnologico



\- \*\*Framework\*\*: Next.js 14+ (App Router) con TypeScript

\- \*\*Styling\*\*: Tailwind CSS + shadcn/ui (per il pannello admin)

\- \*\*Database\*\*: PostgreSQL (Supabase per dev e prod)

\- \*\*ORM\*\*: Prisma

\- \*\*Validazione\*\*: Zod

\- \*\*Auth\*\*: NextAuth.js v5 (da fase 3, non ora)

\- \*\*Hosting\*\*: Vercel (in produzione)



\## Documenti di riferimento (in `docs/references/`)



PRIMA DI INIZIARE QUALSIASI TASK, leggi sempre questi documenti:



1\. \*\*`AIFOLLY-MENU-SPEC-v3.3.md`\*\* — Specifica tecnica completa (architettura, data model, API, sezioni del prodotto). È la fonte di verità per tutto. È un documento autonomo, non rimanda ad altre versioni.



2\. \*\*`AIFOLLY-BRAND-GUIDELINES.md`\*\* — Brand identity di AiFolly come marchio (palette colori, tipografia Geist, logo, tone of voice). Serve solo per il pannello admin (Fase 2 in poi), NON per i menu pubblici dei ristoranti che hanno tema personalizzabile.



3\. \*\*`menu-luxury-completo.jsx`\*\* — Prototipo React del menu pubblico nel preset "Elegante". È il riferimento pixel-perfect visivo per il livello "Menu" del tema. Quando implementi i componenti del menu pubblico, basati su questo file per layout, animazioni, comportamenti.



4\. \*\*`cover-page-elegante.jsx`\*\* — Prototipo React della pagina copertina nel preset "Elegante". Riferimento visuale per il livello "Cover" del tema.



5\. \*\*`seed-presets.ts`\*\* — Definizione TypeScript completa degli 8 temi preset. Da usare nel seed Prisma.



\## Convenzioni di sviluppo



\- \*\*Linguaggio\*\*: italiano per UI, copy, testi utente. Codice e commenti in inglese.

\- \*\*Naming\*\*: camelCase per variabili e funzioni, PascalCase per componenti React e tipi TypeScript, kebab-case per file e cartelle.

\- \*\*Path imports\*\*: usa sempre `@/\*` (configurato in `tsconfig.json` come alias di `src/\*`)

\- \*\*Componenti\*\*: server components di default, client components solo quando strettamente necessario (stato, eventi, hook browser)

\- \*\*Stile codice\*\*: niente commenti ovvi. I commenti spiegano il "perché", non il "cosa".



\## Stato corrente del progetto



Il progetto è VUOTO. Si parte da zero. Non c'è ancora nessun file Next.js, nessun package.json, nessuna installazione.



\## Fase attuale: Fase 1 — Fondamenta



Vedi sezione 21.2 della spec per l'ordine di sviluppo completo. La Fase 1 include i task dal numero 1 al 10. Non procedere oltre la Fase 1 senza esplicita richiesta dell'utente.

