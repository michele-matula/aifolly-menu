import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { MediaKind } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autenticato.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  const kindFilter = searchParams.get('kind');

  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurantId richiesto.' }, { status: 400 });
  }

  // Ownership check
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });
  if (!restaurant || restaurant.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Non trovato.' }, { status: 404 });
  }

  const where: Record<string, unknown> = { restaurantId };
  if (kindFilter) where.kind = kindFilter as MediaKind;

  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ assets });
}
