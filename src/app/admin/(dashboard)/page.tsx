import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: user.id },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-semibold text-[#1c1917] tracking-tight">
        I tuoi ristoranti
      </h1>
      <p className="text-sm text-[#78716c] mt-1 mb-8">
        {restaurants.length === 0
          ? 'Nessun ristorante collegato'
          : `${restaurants.length} ristorante${restaurants.length > 1 ? 'i' : ''} collegato${restaurants.length > 1 ? 'i' : ''} al tuo account`}
      </p>

      {/* Empty state */}
      {restaurants.length === 0 && (
        <div className="text-center py-16 px-8 border border-dashed border-[#e7e5e4] rounded-lg">
          <p className="text-[#78716c] text-sm">
            Nessun ristorante collegato al tuo account.
            <br />
            Contatta l&apos;amministratore per farti assegnare un ristorante.
          </p>
        </div>
      )}

      {/* Restaurant grid */}
      {restaurants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {restaurants.map(r => (
            <div
              key={r.id}
              className="bg-white border border-[#e7e5e4] rounded-lg p-5 hover:border-[#d6d3d1] hover:shadow-sm transition-all"
            >
              {/* Name + status */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-base font-semibold text-[#1c1917] leading-tight">
                  {r.name}
                </h2>
                <span
                  className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    r.isPublished
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {r.isPublished ? 'Pubblicato' : 'Bozza'}
                </span>
              </div>

              {/* City */}
              {r.city && (
                <p className="text-sm text-[#78716c] mb-4">{r.city}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-auto pt-2">
                <Link
                  href={`/admin/restaurants/${r.id}`}
                  className="text-[13px] font-medium text-[#c9b97a] hover:text-[#b5a468] no-underline transition-colors"
                >
                  Apri pannello →
                </Link>
                {r.isPublished && (
                  <a
                    href={`/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#a8a29e] hover:text-[#78716c] no-underline transition-colors"
                  >
                    Vedi menu ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
