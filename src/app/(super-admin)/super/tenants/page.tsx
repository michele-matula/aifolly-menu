import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { deriveAccessStatus } from '@/lib/access-status';

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'ok':            return { text: 'Attivo',           color: 'bg-emerald-900/50 text-emerald-300' };
    case 'trial':         return { text: 'Trial',            color: 'bg-amber-900/50 text-amber-300' };
    case 'trial_expired': return { text: 'Trial scaduto',    color: 'bg-red-900/50 text-red-300' };
    case 'suspended':     return { text: 'Sospeso',          color: 'bg-rose-900/50 text-rose-300' };
    default:              return { text: status,             color: 'bg-stone-800 text-stone-300' };
  }
}

export default async function SuperTenantsPage() {
  const tenants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      isSuspended: true,
      suspendedReason: true,
      trialEndsAt: true,
      stripeSubscriptionStatus: true,
      owner: { select: { email: true } },
      plan: { select: { name: true, slug: true, isFreeEternal: true } },
    },
  });

  const rows = tenants.map((t) => {
    const access = deriveAccessStatus({
      isSuspended: t.isSuspended,
      suspendedReason: t.suspendedReason,
      trialEndsAt: t.trialEndsAt,
      stripeSubscriptionStatus: t.stripeSubscriptionStatus,
      plan: t.plan ? { isFreeEternal: t.plan.isFreeEternal, slug: t.plan.slug } : null,
    });
    return { ...t, access };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-100 mb-1">Tenant</h1>
      <p className="text-sm text-stone-400 mb-8">
        {tenants.length} ristoranti registrati nella piattaforma.
      </p>

      <div className="rounded-lg border border-stone-800 bg-[#1c1917] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-900 text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="text-left px-4 py-2.5">Ristorante</th>
              <th className="text-left px-4 py-2.5">Owner</th>
              <th className="text-left px-4 py-2.5">Piano</th>
              <th className="text-left px-4 py-2.5">Stato</th>
              <th className="text-left px-4 py-2.5">Creato</th>
              <th className="w-8 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {rows.map((t) => {
              const s = statusLabel(t.access.status);
              return (
                <tr key={t.id} className="hover:bg-stone-900/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-100">{t.name}</div>
                    <div className="text-xs text-stone-500">/{t.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-300">
                    {t.owner?.email ?? <span className="text-stone-500">—</span>}
                  </td>
                  <td className="px-4 py-3 text-stone-300">
                    {t.plan?.name ?? <span className="text-stone-500">Nessuno</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>
                      {s.text}
                    </span>
                    {t.access.status === 'trial' && (
                      <span className="ml-2 text-xs text-stone-400">
                        scade in {t.access.daysLeft}g
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">
                    {t.createdAt.toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/super/tenants/${t.id}`}
                      className="text-amber-400 hover:text-amber-300 no-underline text-sm"
                    >
                      →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                  Nessun ristorante registrato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
