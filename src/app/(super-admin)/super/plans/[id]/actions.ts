'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { writeAuditLog } from '@/lib/audit-log';

export type PlanEditState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const PlanEditSchema = z.object({
  name: z.string().min(1, 'Obbligatorio').max(60, 'Max 60 caratteri'),
  priceMonthly: z.number({ message: 'Numero non valido' }).min(0).max(9999),
  stripePriceId: z.string().trim().max(100).optional().or(z.literal('')),
  maxDishes: z.number().int().min(0).max(10000),
  maxCategories: z.number().int().min(0).max(1000),
  maxImages: z.number().int().min(0).max(10000),
  customTheme: z.boolean(),
  googleFonts: z.boolean(),
  removeBranding: z.boolean(),
  analytics: z.boolean(),
  isActive: z.boolean(),
});

export async function updatePlan(
  planId: string,
  _prevState: PlanEditState,
  formData: FormData
): Promise<PlanEditState> {
  const admin = await requireSuperAdmin();

  const raw = {
    name: String(formData.get('name') ?? '').trim(),
    priceMonthly: Number(formData.get('priceMonthly')),
    stripePriceId: String(formData.get('stripePriceId') ?? '').trim(),
    maxDishes: Number(formData.get('maxDishes')),
    maxCategories: Number(formData.get('maxCategories')),
    maxImages: Number(formData.get('maxImages')),
    customTheme: formData.get('customTheme') === 'on',
    googleFonts: formData.get('googleFonts') === 'on',
    removeBranding: formData.get('removeBranding') === 'on',
    analytics: formData.get('analytics') === 'on',
    isActive: formData.get('isActive') === 'on',
  };

  const result = PlanEditSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: 'Verifica i campi evidenziati.', fieldErrors };
  }

  const existing = await prisma.plan.findUnique({ where: { id: planId } });
  if (!existing) notFound();

  const d = result.data;

  // stripePriceId vuoto = null in DB (coerente con il pattern dei piani free)
  const stripePriceId = d.stripePriceId && d.stripePriceId.length > 0 ? d.stripePriceId : null;

  // Cattura il diff per l'audit log (solo i campi cambiati). Serializzato come
  // stringhe per garantire JSON-compatibilita' (Decimal prezzo monthly, ecc.)
  const diff: Record<string, { from: string | null; to: string | null }> = {};
  const fields: (keyof typeof d)[] = [
    'name', 'priceMonthly', 'maxDishes', 'maxCategories', 'maxImages',
    'customTheme', 'googleFonts', 'removeBranding', 'analytics', 'isActive',
  ];
  for (const f of fields) {
    const from = String(existing[f]);
    const to = String(d[f]);
    if (from !== to) {
      diff[f] = { from, to };
    }
  }
  if (existing.stripePriceId !== stripePriceId) {
    diff.stripePriceId = { from: existing.stripePriceId, to: stripePriceId };
  }

  try {
    await prisma.plan.update({
      where: { id: planId },
      data: {
        name: d.name,
        priceMonthly: d.priceMonthly,
        stripePriceId,
        maxDishes: d.maxDishes,
        maxCategories: d.maxCategories,
        maxImages: d.maxImages,
        customTheme: d.customTheme,
        googleFonts: d.googleFonts,
        removeBranding: d.removeBranding,
        analytics: d.analytics,
        isActive: d.isActive,
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      return {
        success: false,
        error: 'Lo stripePriceId e\' gia\' in uso da un altro piano.',
        fieldErrors: { stripePriceId: ['Gia\' in uso'] },
      };
    }
    throw err;
  }

  if (Object.keys(diff).length > 0) {
    await writeAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: UserRole.SUPER_ADMIN,
      action: 'PLAN_UPDATED',
      entityType: 'Plan',
      entityId: planId,
      metadata: { planSlug: existing.slug, changes: diff },
    });
  }

  revalidatePath(`/super/plans/${planId}`);
  revalidatePath('/super/plans');
  return { success: true };
}
