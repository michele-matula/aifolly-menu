import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRestaurantAccessStatus } from '@/lib/access-status';
import type { Restaurant } from '@prisma/client';

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/admin/login');
  }
  return session.user as { id: string; email: string; name?: string | null; isSuperAdmin: boolean };
}

// Guard per pagine e Server Actions del pannello Super Admin.
// Redirige al login se l'utente non e' autenticato o non e' Super Admin.
// Defense-in-depth oltre al gate in auth.config.ts (proxy middleware).
export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user.isSuperAdmin) {
    redirect('/admin/login');
  }
  return user;
}

export interface RequireOwnershipOptions {
  // Default true: se il ristorante è in trial_expired o suspended, redirect a /admin/upgrade.
  // Passa false per punti di ingresso che devono restare accessibili anche in stato bloccato
  // (es. la pagina /admin/upgrade stessa, se mai carica dati del ristorante).
  requireAccess?: boolean;
}

export async function requireOwnership(
  restaurantId: string,
  options: RequireOwnershipOptions = {}
) {
  const { requireAccess = true } = options;
  const user = await getCurrentUser();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant || restaurant.ownerId !== user.id) {
    notFound();
  }

  if (requireAccess) {
    const access = await getRestaurantAccessStatus(restaurantId);
    if (access.status === 'trial_expired' || access.status === 'suspended') {
      redirect(`/admin/upgrade?restaurantId=${restaurantId}`);
    }
  }

  return restaurant;
}

export async function requireOwnershipBySlug(slug: string) {
  const user = await getCurrentUser();

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant || restaurant.ownerId !== user.id) {
    notFound();
  }

  return restaurant;
}

/**
 * Soft ownership check: returns the restaurant if the current user owns it,
 * null otherwise. Never redirects or throws — safe for degrading gracefully
 * (e.g. ignoring preview params for non-owners).
 */
export async function tryGetOwnershipBySlug(slug: string): Promise<Restaurant | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant || restaurant.ownerId !== session.user.id) return null;
  return restaurant;
}
