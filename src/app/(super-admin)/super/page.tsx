import { prisma } from '@/lib/prisma';

export default async function SuperDashboardPage() {
  const [totalRestaurants, totalUsers, plansCount, suspendedCount] = await Promise.all([
    prisma.restaurant.count(),
    prisma.user.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.restaurant.count({ where: { isSuspended: true } }),
  ]);

  const stats = [
    { label: 'Ristoranti', value: totalRestaurants },
    { label: 'Utenti', value: totalUsers },
    { label: 'Piani attivi', value: plansCount },
    { label: 'Sospesi', value: suspendedCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-100 mb-1">Dashboard</h1>
      <p className="text-sm text-stone-400 mb-8">
        Panoramica operativa della piattaforma AiFolly Menu.
      </p>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-stone-800 bg-[#1c1917] p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-stone-100">{s.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-stone-500">
        Le sezioni Tenant e Piani saranno attive nei prossimi sub-step.
      </p>
    </div>
  );
}
