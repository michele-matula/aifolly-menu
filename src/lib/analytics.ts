// Typed event layer sopra posthog-js. Centralizza i nomi degli eventi
// e le loro proprietà per evitare drift tra call site e dashboard.
// Server-safe: su server i metodi sono no-op (PostHog è client-only).

import posthog from "posthog-js";

export type TrafficSource = "qr" | "link" | "search" | "direct";

// Mappa evento → forma delle proprietà. Riflette la tabella della
// spec §15.1. `restaurantSlug` è registrato come super-property dal
// provider e viene aggiunto automaticamente a ogni evento.
type EventMap = {
  cover_viewed: { source: TrafficSource };
  cover_cta_clicked: { timeOnCover: number };
  menu_viewed: { fromCover: boolean; source: TrafficSource };
};

export function track<K extends keyof EventMap>(
  event: K,
  properties: EventMap[K],
): void {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

// ── Source detection ────────────────────────────────────────

const SEARCH_ENGINES = [
  "google.",
  "bing.",
  "duckduckgo.",
  "yahoo.",
  "ecosia.",
  "yandex.",
  "baidu.",
];

export function detectSource(): TrafficSource {
  if (typeof window === "undefined") return "direct";

  // I QR code stampati includono ?source=qr per distinguerli.
  const params = new URLSearchParams(window.location.search);
  if (params.get("source") === "qr") return "qr";

  const ref = document.referrer;
  if (!ref) return "direct";

  try {
    const refHost = new URL(ref).hostname;
    if (SEARCH_ENGINES.some((se) => refHost.includes(se))) return "search";
    return "link";
  } catch {
    return "direct";
  }
}

// ── fromCover tracking ──────────────────────────────────────

// Segnala che l'utente ha visitato la copertina. Letto dal menu per
// capire se la navigazione è interna (cover → menu) o diretta (QR →
// menu, caso raro ma possibile se il QR punta direttamente al menu).
const COVER_VISITED_KEY = "aifolly:cover-visited";

export function markCoverVisited(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COVER_VISITED_KEY, slug);
  } catch {
    // sessionStorage disabilitato (incognito restrittivo, ecc.) → ignora.
  }
}

export function wasCoverVisited(slug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(COVER_VISITED_KEY) === slug;
  } catch {
    return false;
  }
}
