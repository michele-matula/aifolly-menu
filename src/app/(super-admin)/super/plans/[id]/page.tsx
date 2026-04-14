import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PlanEditForm from './PlanEditForm';

type Props = { params: Promise<{ id: string }> };

export default async function SuperPlanEditPage({ params }: Props) {
  const { id } = await params;

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { _count: { select: { restaurants: true } } },
  });
  if (!plan) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/super/plans"
        className="text-sm text-stone-400 hover:text-stone-300 no-underline inline-block mb-4"
      >
        ← Piani
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-stone-100 mb-1">
        {plan.name}
      </h1>
      <p className="text-sm text-stone-500 mb-8">
        Configurazione · slug <code className="text-stone-400">{plan.slug}</code>
        {plan.isFreeEternal && (
          <span className="ml-3 inline-block px-2 py-0.5 rounded bg-violet-900/50 text-violet-300 text-xs uppercase tracking-wide">
            Free Perenne
          </span>
        )}
      </p>

      <PlanEditForm
        plan={{
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          priceMonthly: Number(plan.priceMonthly).toFixed(2),
          stripePriceId: plan.stripePriceId,
          maxDishes: plan.maxDishes,
          maxCategories: plan.maxCategories,
          maxImages: plan.maxImages,
          customTheme: plan.customTheme,
          googleFonts: plan.googleFonts,
          removeBranding: plan.removeBranding,
          analytics: plan.analytics,
          isActive: plan.isActive,
          isFreeEternal: plan.isFreeEternal,
          restaurantCount: plan._count.restaurants,
        }}
      />
    </div>
  );
}
