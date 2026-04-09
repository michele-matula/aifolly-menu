import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Restaurant } from '@prisma/client';

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/admin/login');
  }
  return session.user as { id: string; email: string; name?: string | null };
}

export async function requireOwnership(restaurantId: string) {
  const user = await getCurrentUser();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant || restaurant.ownerId !== user.id) {
    notFound();
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
