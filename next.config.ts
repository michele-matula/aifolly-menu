import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Derivo l'host consentito per next/image da NEXT_PUBLIC_SUPABASE_URL cosi'
// lo stesso .env copre dev/prod senza hardcodare il project ref. Fail-closed:
// se l'env manca, il build fallisce invece di allowlistare "tutto".
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL non definita: next.config.ts non puo' derivare l'host per images.remotePatterns",
  );
}
const supabaseHost = new URL(supabaseUrl).host;

// CSP costruita per l'app reale (Sentry EU, PostHog EU, Vercel Insights,
// Supabase Storage, Google Fonts dei temi). Se cambia l'host di un
// servizio (es. Sentry US), aggiornare qui di conseguenza.
const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    // Next.js inietta script di hydration inline; senza unsafe-inline il
    // sito non parte. Una transizione a nonce richiede refactor del root
    // layout — non in scope per Step 4.
    "'unsafe-inline'",
    "https://*.ingest.de.sentry.io",
    "https://eu.i.posthog.com",
    "https://eu-assets.i.posthog.com",
  ],
  "style-src": [
    "'self'",
    // CoverPage/MenuPage usano inline <style> per le animazioni del tema.
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "img-src": ["'self'", "data:", "blob:", `https://${supabaseHost}`],
  "connect-src": [
    "'self'",
    "https://*.ingest.de.sentry.io",
    "https://eu.i.posthog.com",
    "https://eu-assets.i.posthog.com",
    "https://vitals.vercel-insights.com",
  ],
  // Sentry session replay (attivo solo on-error) crea worker da blob.
  "worker-src": ["'self'", "blob:"],
  // Pari con X-Frame-Options: SAMEORIGIN — il theme builder usa iframe
  // same-origin per la preview live.
  "frame-ancestors": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
  "upgrade-insecure-requests": [],
};

const cspString = Object.entries(CSP_DIRECTIVES)
  .map(([directive, sources]) =>
    sources.length > 0 ? `${directive} ${sources.join(" ")}` : directive,
  )
  .join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // SAMEORIGIN (non DENY come da spec §13.5) perché il theme builder
  // usa un iframe same-origin per la preview live del menu.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS: Vercel serve già in HTTPS, rendiamo esplicito l'enforcement.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: cspString },
];

const nextConfig: NextConfig = {
  // Prisma deve essere trattato come pacchetto esterno (non bundle-ato) per
  // garantire che i binari del query engine siano disponibili al runtime
  // delle serverless function.
  serverExternalPackages: ["@prisma/client"],
  images: {
    // AVIF per-first, WebP fallback. Il browser negozia via Accept header.
    formats: ["image/avif", "image/webp"],
    // Allowlist minima: solo object/public di Supabase Storage (no signed,
    // no altri path). Deriva dall'env per stare in sync con dev/prod.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Upload source maps per stack trace leggibili in Sentry.
  // L'auth token viene da SENTRY_AUTH_TOKEN (env var su Vercel).
  org: "aifolly",
  project: "aifolly-menu",

  // Source maps uploadate ma non esposte al client.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Silenzia i log del plugin durante il build.
  silent: !process.env.CI,
});
