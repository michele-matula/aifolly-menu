'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { writeAuditLog } from '@/lib/audit-log';

export type TenantActionState = {
  success: boolean;
  error?: string;
};

export async function changeTenantPlan(
  tenantId: string,
  _prevState: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const admin = await requireSuperAdmin();

  const planId = formData.get('planId') as string | null;
  if (!planId) {
    return { success: false, error: 'Seleziona un piano.' };
  }

  const [tenant, plan] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, planId: true },
    }),
    prisma.plan.findUnique({
      where: { id: planId },
      select: { id: true, slug: true, name: true, isFreeEternal: true },
    }),
  ]);
  if (!tenant) notFound();
  if (!plan) return { success: false, error: 'Piano non valido.' };

  const oldPlanSlug = tenant.planId
    ? (await prisma.plan.findUnique({ where: { id: tenant.planId }, select: { slug: true } }))?.slug
    : null;

  // Assegnando Free Perenne o un piano paid attivo, azzera il trial.
  // Free Trial invece lascia il trial corrente (il Super Admin potrebbe
  // volere estenderlo manualmente con l'azione dedicata).
  const shouldResetTrial = plan.isFreeEternal || plan.slug !== 'free-trial';

  await prisma.restaurant.update({
    where: { id: tenantId },
    data: {
      planId: plan.id,
      ...(shouldResetTrial ? { trialEndsAt: null } : {}),
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    actorEmail: admin.email,
    actorRole: UserRole.SUPER_ADMIN,
    action: 'TENANT_PLAN_CHANGED',
    entityType: 'Restaurant',
    entityId: tenantId,
    restaurantId: tenantId,
    metadata: {
      fromPlan: oldPlanSlug,
      toPlan: plan.slug,
      trialReset: shouldResetTrial,
    },
  });

  revalidatePath(`/super/tenants/${tenantId}`);
  revalidatePath('/super/tenants');
  return { success: true };
}

export async function extendTenantTrial(
  tenantId: string,
  _prevState: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const admin = await requireSuperAdmin();

  const daysRaw = formData.get('days') as string | null;
  const days = daysRaw ? parseInt(daysRaw, 10) : NaN;
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return { success: false, error: 'Inserisci un numero di giorni tra 1 e 365.' };
  }

  const tenant = await prisma.restaurant.findUnique({
    where: { id: tenantId },
    select: { id: true, trialEndsAt: true },
  });
  if (!tenant) notFound();

  // Se il trial esiste ancora (anche scaduto), parti da quella data.
  // Se e' null (piano paid / free perenne attivo), parti da now.
  const base = tenant.trialEndsAt && tenant.trialEndsAt.getTime() > Date.now()
    ? tenant.trialEndsAt
    : new Date();
  const newEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.restaurant.update({
    where: { id: tenantId },
    data: { trialEndsAt: newEnd },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    actorEmail: admin.email,
    actorRole: UserRole.SUPER_ADMIN,
    action: 'TENANT_TRIAL_EXTENDED',
    entityType: 'Restaurant',
    entityId: tenantId,
    restaurantId: tenantId,
    metadata: {
      days,
      previousTrialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
      newTrialEndsAt: newEnd.toISOString(),
    },
  });

  revalidatePath(`/super/tenants/${tenantId}`);
  revalidatePath('/super/tenants');
  return { success: true };
}
