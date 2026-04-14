import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getRestaurantAccessStatus } from '@/lib/access-status';
import { getPaidPlans } from '@/lib/queries/plans';

type Props = {
  searchParams: Promise<{ restaurantId?: string }>;
};

function featureSummary(p: {
  maxDishes: number;
  maxCategories: number;
  maxImages: number;
  customTheme: boolean;
  googleFonts: boolean;
  removeBranding: boolean;
  analytics: boolean;
}): string[] {
  return [
    `Fino a ${p.maxDishes} piatti`,
    `Fino a ${p.maxCategories} categorie`,
    `Fino a ${p.maxImages} immagini`,
    p.customTheme ? 'Theme builder personalizzato' : 'Tema solo da preset (nessuna modifica)',
    p.googleFonts ? 'Google Fonts abilitati' : 'Font di sistema',
    p.removeBranding ? 'Nessun branding AiFolly nel menu pubblico' : 'Branding AiFolly visibile',
    p.analytics ? 'Analytics avanzate' : 'Nessuna analytics',
  ];
}

// La pagina upgrade deve restare accessibile anche quando il ristorante e' in
// trial_expired o suspended (e' l'uscita di sicurezza da quegli stati).
export default async function UpgradePage({ searchParams }: Props) {
  const { restaurantId } = await searchParams;
  const user = await getCurrentUser();

  if (!restaurantId) {
    notFound();
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, name: true, ownerId: true },
  });

  if (!restaurant || restaurant.ownerId !== user.id) {
    notFound();
  }

  const [access, plans] = await Promise.all([
    getRestaurantAccessStatus(restaurant.id),
    getPaidPlans(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-[#1c1917] tracking-tight mb-2">
        Scegli un piano per {restaurant.name}
      </h1>

      {access.status === 'trial_expired' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
          <p className="text-sm text-amber-900">
            Il periodo di prova è terminato. Sottoscrivi un piano per continuare a
            modificare il menu e renderlo disponibile ai clienti.
          </p>
        </div>
      )}

      {access.status === 'suspended' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-900">
            Il ristorante è stato sospeso dall&apos;amministrazione
            {access.reason ? (
              <>
                {' '}
                con la motivazione: <em>{access.reason}</em>
              </>
            ) : (
              '.'
            )}{' '}
            Per informazioni contatta il supporto.
          </p>
        </div>
      )}

      {access.status === 'trial' && (
        <p className="text-sm text-[#78716c] mb-6">
          Il tuo trial è ancora attivo (scade tra {access.daysLeft}{' '}
          {access.daysLeft === 1 ? 'giorno' : 'giorni'}). Puoi sottoscrivere un piano in
          qualsiasi momento per sbloccare le funzioni avanzate.
        </p>
      )}

      {access.status === 'ok' && (
        <p className="text-sm text-[#78716c] mb-6">
          Il tuo accesso è attualmente attivo.{' '}
          <Link href={`/admin/restaurants/${restaurant.id}`} className="underline">
            Torna al pannello
          </Link>
          .
        </p>
      )}

      {plans.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
          Nessun piano configurato. Contatta il supporto.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => {
            const features = featureSummary(p);
            const price = Number(p.priceMonthly).toFixed(2);
            return (
              <div
                key={p.id}
                className="rounded-xl border border-stone-200 bg-white p-6 flex flex-col"
              >
                <h2 className="text-lg font-semibold text-[#1c1917]">{p.name}</h2>
                <p className="mt-1 mb-4 text-2xl font-semibold text-[#1c1917]">
                  €{price}
                  <span className="text-sm font-normal text-[#78716c]"> / mese</span>
                </p>
                <ul className="text-sm text-[#57534e] space-y-1.5 mb-6 flex-1">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled
                  className="w-full px-4 py-2 rounded-md bg-stone-100 text-stone-400 text-sm font-medium cursor-not-allowed"
                  title="Checkout disponibile a breve"
                >
                  Sottoscrivi — in arrivo
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-xs text-[#a8a29e]">
        Il checkout sicuro via Stripe sarà disponibile nel prossimo aggiornamento.
      </p>
    </div>
  );
}
