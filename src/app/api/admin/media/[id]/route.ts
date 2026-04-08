import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteMediaAsset } from '@/lib/media/delete';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autenticato.' }, { status: 401 });
  }

  const { id } = await params;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: { restaurant: { select: { ownerId: true } } },
  });

  if (!asset || asset.restaurant.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Non trovato.' }, { status: 404 });
  }

  try {
    await deleteMediaAsset(id, asset.restaurantId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
