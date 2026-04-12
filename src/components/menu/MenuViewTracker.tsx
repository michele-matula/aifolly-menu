"use client";

import { useEffect } from "react";
import { track, detectSource, wasCoverVisited } from "@/lib/analytics";

// Client-side tracker per l'evento `menu_viewed`. Montato come
// componente "fantasma" dal server component /{slug}/menu/page.tsx
// per avere accesso alle API del browser (sessionStorage, document).
export default function MenuViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track("menu_viewed", {
      fromCover: wasCoverVisited(slug),
      source: detectSource(),
    });
  }, [slug]);

  return null;
}
