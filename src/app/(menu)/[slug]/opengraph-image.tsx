import { ImageResponse } from "next/og";
import { getCachedPublicRestaurant } from "@/lib/queries/restaurant";
import type { CoverTheme } from "@/lib/validators/theme";

// Spec §14.4.
//
// Trade-off: la spec menziona "font e colori del tema personalizzato" ma
// l'injection di font Google personalizzati in ImageResponse richiede
// fetch del TTF a build-time per ogni ristorante, fragile e costoso.
// Qui usiamo solo i COLORI del tema (titleColor, backgroundColor,
// ornamentColor) e font generici di sistema — priorità alla leggibilità
// dell'anteprima social più che alla fedeltà al tema.

export const alt = "Menu del ristorante";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getCachedPublicRestaurant(slug);

  if (!restaurant) {
    // Fallback neutro se il ristorante non esiste/non è pubblicato.
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FAFAF8",
            color: "#1a1a18",
            fontSize: 48,
            fontFamily: "serif",
          }}
        >
          AiFolly Menu
        </div>
      ),
      size,
    );
  }

  const cover = restaurant.themeCover as CoverTheme;
  const bg = cover?.backgroundColor || "#FAFAF8";
  const titleColor = cover?.titleColor || "#1a1a18";
  const descColor = cover?.descriptionColor || "#6b6358";
  const ornamentColor = cover?.ornamentColor || "#c9b97a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          padding: 80,
        }}
      >
        {/* Top ornament */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div style={{ width: 80, height: 2, background: ornamentColor }} />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `2px solid ${ornamentColor}`,
            }}
          />
          <div style={{ width: 80, height: 2, background: ornamentColor }} />
        </div>

        {/* City */}
        {restaurant.city && (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 10,
              textTransform: "uppercase",
              color: ornamentColor,
              marginBottom: 32,
              fontFamily: "sans-serif",
            }}
          >
            {restaurant.city}
          </div>
        )}

        {/* Restaurant name */}
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontStyle: "italic",
            color: titleColor,
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 28,
            maxWidth: "90%",
          }}
        >
          {restaurant.name}
        </div>

        {/* Tagline */}
        {restaurant.tagline && (
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: descColor,
              fontFamily: "sans-serif",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            {restaurant.tagline}
          </div>
        )}

        {/* Bottom brand */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            fontSize: 14,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: ornamentColor,
            fontFamily: "sans-serif",
            opacity: 0.7,
          }}
        >
          AiFolly Menu
        </div>
      </div>
    ),
    size,
  );
}
