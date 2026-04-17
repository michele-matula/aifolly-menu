import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { deriveAccessStatus } from '@/lib/access-status';
import TenantActionForms from './TenantActionForms';

type Props = { params: Promise<{ id: string }> };

export default async function SuperTenantDetailPage({ params }: Props) {
  const { id } = await params;

  const [tenant, plans] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: { select: { email: true, emailVerified: true } },
        plan: { select: { id: true, name: true, slug: true, isFreeEternal: true } },
      },
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ isFreeEternal: 'desc' }, { priceMonthly: 'asc' }],
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!tenant) notFound();

  const access = deriveAccessStatus({
    isSuspended: tenant.isSuspended,
    suspendedReason: tenant.suspendedReason,
    trialEndsAt: tenant.trialEndsAt,
    stripeSubscriptionStatus: tenant.stripeSubscriptionStatus,
    plan: tenant.plan ? { isFreeEternal: tenant.plan.isFreeEternal, slug: tenant.plan.slug } : null,
  });

  return (
    <div>
      <Link
        href="/super/tenants"
        className="text-sm text-stone-400 hover:text-stone-300 no-underline inline-block mb-4"
      >
        ← Tenant
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-stone-100">{tenant.name}</h1>
      <p className="text-sm text-stone-500 mb-8">/{tenant.slug}</p>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <InfoCard label="Owner">
          {tenant.owner?.email ?? <span className="text-stone-500">Nessuno</span>}
          {tenant.owner && (
            <div className="text-xs text-stone-500 mt-1">
              Email {tenant.owner.emailVerified ? 'verificata' : 'non verificata'}
            </div>
          )}
        </InfoCard>
        <InfoCard label="Piano corrente">
          {tenant.plan?.name ?? <span className="text-stone-500">Nessuno</span>}
          {tenant.plan && <div className="text-xs text-stone-500 mt-1">slug: {tenant.plan.slug}</div>}
        </InfoCard>
        <InfoCard label="Stato accesso">
          {access.status === 'ok' && <span className="text-emerald-300">Attivo</span>}
          {access.status === 'trial' && (
            <span className="text-amber-300">
              Trial — scade tra {access.daysLeft} giorni (
              {access.trialEndsAt.toLocaleDateString('it-IT')})
            </span>
          )}
          {access.status === 'trial_expired' && <span className="text-red-300">Trial scaduto</span>}
          {access.status === 'suspended' && (
            <span className="text-rose-300">Sospeso{access.reason ? ` — ${access.reason}` : ''}</span>
          )}
        </InfoCard>
        <InfoCard label="Stripe">
          {tenant.stripeSubscriptionId ? (
            <>
              <div className="text-stone-100">{tenant.stripeSubscriptionStatus}</div>
              {tenant.subscriptionCurrentPeriodEnd && (
                <div className="text-xs text-stone-500 mt-1">
                  Prossima fattura: {tenant.subscriptionCurrentPeriodEnd.toLocaleDateString('it-IT')}
                </div>
              )}
            </>
          ) : (
            <span className="text-stone-500">Nessuna subscription</span>
          )}
        </InfoCard>
      </div>

      <h2 className="text-lg font-semibold text-stone-100 mb-3">Azioni</h2>
      <TenantActionForms
        tenantId={tenant.id}
        plans={plans}
        currentPlanId={tenant.plan?.id ?? null}
      />
    </div>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-800 bg-[#1c1917] p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 mb-1.5">
        {label}
      </p>
      <div className="text-sm text-stone-200">{children}</div>
    </div>
  );
}
