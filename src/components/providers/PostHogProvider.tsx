"use client";

import posthog from "posthog-js";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Init guard: l'import di questo modulo accade solo lato client,
// ma il provider può remount-are (Strict Mode dev, HMR). L'init
// deve avvenire una sola volta per pageview session.
let initialized = false;

function init(): void {
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

  if (!key) {
    // Build pulito anche senza chiave (dev locale, preview Vercel
    // senza env). No-op silenzioso: gli eventi track() restano no-op.
    return;
  }

  posthog.init(key, {
    api_host: host,
    // Pageview manuale: alcune pagine (menu) vogliono proprietà custom
    // (fromCover, source). Evitiamo doppio tracking disabilitando
    // l'autocapture di pageview.
    capture_pageview: "history_change",
    // Privacy-first per il menu pubblico dei clienti finali.
    disable_session_recording: true,
    persistence: "localStorage+cookie",
  });

  initialized = true;
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    init();
  }, []);

  // Registra `restaurantSlug` come super-property: viene allegato
  // automaticamente a ogni evento (spec §15.1 — ogni evento include
  // restaurantSlug come proprietà per filtrare i dati per tenant).
  useEffect(() => {
    if (!initialized) return;
    const match = pathname?.match(/^\/([^/]+)/);
    const slug = match?.[1];
    if (slug && slug !== "admin" && slug !== "api") {
      posthog.register({ restaurantSlug: slug });
    }
  }, [pathname]);

  return <>{children}</>;
}
