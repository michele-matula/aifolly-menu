import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 20% delle transazioni — bilanciamento tra visibilità e costo.
  tracesSampleRate: 0.2,

  // No replay in sessione normale (privacy clienti del ristorante).
  replaysSessionSampleRate: 0,
  // 50% replay solo quando c'è un errore — per riprodurre il bug.
  replaysOnErrorSampleRate: 0.5,

  // Filtering: ignora errori noti che non sono actionable.
  ignoreErrors: [
    // Browser extensions e script di terze parti
    "ResizeObserver loop",
    "Non-Error promise rejection captured",
  ],
});
