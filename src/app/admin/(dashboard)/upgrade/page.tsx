import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getRestaurantAccessStatus } from '@/lib/access-status';

type Props = {
  searchParams: Promise<{ restaurantId?: string }>;
};

// La pagina upgrade deve restare accessibile anche quando il ristorante è in
// trial_expired o suspended (e' l'uscita di sicurezza da quegli stati).
// Non chiama requireOwnership con requireAccess: true per evitare loop di redirect.
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

  const access = await getRestaurantAccessStatus(restaurant.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-[#1c1917] tracking-tight mb-2">
        Accesso al pannello bloccato
      </h1>
      <p className="text-sm text-[#78716c] mb-8">
        Ristorante: <span className="font-medium text-[#1c1917]">{restaurant.name}</span>
      </p>

      {access.status === 'trial_expired' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 mb-6">
          <h2 className="text-base font-semibold text-amber-900 mb-2">
            Il periodo di prova è terminato
          </h2>
          <p className="text-sm text-amber-800 leading-relaxed">
            Il tuo ristorante ha completato i 15 giorni di prova gratuita.
            Per continuare a modificare il menu e renderlo disponibile ai clienti,
            sottoscrivi uno dei nostri piani.
          </p>
        </div>
      )}

      {access.status === 'suspended' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 mb-6">
          <h2 className="text-base font-semibold text-red-900 mb-2">
            Ristorante sospeso
          </h2>
          <p className="text-sm text-red-800 leading-relaxed">
            Il tuo ristorante è stato sospeso dall&apos;amministrazione
            {access.reason ? (
              <>
                {' '}
                con la seguente motivazione: <em>{access.reason}</em>
              </>
            ) : (
              '.'
            )}{' '}
            Per informazioni contatta il supporto.
          </p>
        </div>
      )}

      {(access.status === 'ok' || access.status === 'trial') && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 mb-6">
          <h2 className="text-base font-semibold text-emerald-900 mb-2">
            Il tuo accesso è attivo
          </h2>
          <p className="text-sm text-emerald-800 leading-relaxed">
            Non serve sottoscrivere un piano al momento.{' '}
            <Link href={`/admin/restaurants/${restaurant.id}`} className="underline">
              Torna al pannello
            </Link>
            .
          </p>
        </div>
      )}

      <p className="text-sm text-[#78716c]">
        La scelta dei piani e il checkout saranno disponibili a breve.
      </p>
    </div>
  );
}
