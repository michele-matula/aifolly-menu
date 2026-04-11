import { SpeedInsights } from '@vercel/speed-insights/next';

// Speed Insights montato solo qui (non nell'admin): interessa misurare
// il percorso del visitatore finale — cover + menu — non i form admin
// che hanno auditing e obiettivi di performance diversi. Lo script
// no-op in dev e invia metrics solo in produzione su Vercel.
export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  );
}
