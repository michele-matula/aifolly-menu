import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function SuperPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: [{ isFreeEternal: 'desc' }, { priceMonthly: 'asc' }],
    include: { _count: { select: { restaurants: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-100 mb-1">Piani</h1>
      <p className="text-sm text-stone-400 mb-8">
        Configurazione dei piani di subscription. Modifiche applicate immediatamente:
        i nuovi ristoranti useranno i nuovi valori, gli esistenti vengono influenzati
        dal momento del salvataggio.
      </p>

      <div className="rounded-lg border border-stone-800 bg-[#1c1917] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-900 text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="text-left px-4 py-2.5">Nome</th>
              <th className="text-left px-4 py-2.5">Slug</th>
              <th className="text-left px-4 py-2.5">Prezzo</th>
              <th className="text-left px-4 py-2.5">Limiti</th>
              <th className="text-left px-4 py-2.5">Tenant</th>
              <th className="text-left px-4 py-2.5">Stato</th>
              <th className="w-8 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-stone-900/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-stone-100">{p.name}</div>
                  {p.isFreeEternal && (
                    <div className="text-[10px] uppercase tracking-wide text-violet-300">
                      Free Perenne
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-stone-400 font-mono">{p.slug}</td>
                <td className="px-4 py-3 text-stone-200">€{Number(p.priceMonthly).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-stone-400">
                  {p.maxDishes} piatti · {p.maxCategories} cat · {p.maxImages} img
                </td>
                <td className="px-4 py-3 text-stone-300">{p._count.restaurants}</td>
                <td className="px-4 py-3">
                  {p.isActive ? (
                    <span className="text-xs text-emerald-300">Attivo</span>
                  ) : (
                    <span className="text-xs text-stone-500">Disattivato</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/super/plans/${p.id}`}
                    className="text-amber-400 hover:text-amber-300 no-underline text-sm"
                  >
                    →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
