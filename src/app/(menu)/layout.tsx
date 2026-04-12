import { SpeedInsights } from '@vercel/speed-insights/next';
import PostHogProvider from '@/components/providers/PostHogProvider';

// Speed Insights + PostHog montati solo qui (non nell'admin):
// interessa misurare il percorso del visitatore finale — cover + menu.
// PostHog: il tracking analitico è pensato per il cliente del ristorante
// (scansione QR → scoperta menu), non per le azioni admin che hanno
// obiettivi di telemetria diversi e privacy più delicata.
export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      {children}
      <SpeedInsights />
    </PostHogProvider>
  );
}
