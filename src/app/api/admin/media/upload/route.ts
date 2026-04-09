import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToStorage } from '@/lib/media/upload';
import { MediaKindSchema } from '@/lib/validators/upload';
import type { MediaKind } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const restaurantId = formData.get('restaurantId') as string | null;
  const kindRaw = formData.get('kind') as string | null;

  if (!file || !restaurantId || !kindRaw) {
    return NextResponse.json({ success: false, error: 'Parametri mancanti.' }, { status: 400 });
  }

  // Verifica ownership
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });
  if (!restaurant || restaurant.ownerId !== session.user.id) {
    return NextResponse.json({ success: false, error: 'Non trovato.' }, { status: 404 });
  }

  // Valida kind
  const kindResult = MediaKindSchema.safeParse(kindRaw);
  if (!kindResult.success) {
    return NextResponse.json({ success: false, error: 'Tipo non valido.' }, { status: 400 });
  }

  try {
    const { url, mediaAsset } = await uploadImageToStorage({
      restaurantId,
      kind: kindResult.data as MediaKind,
      file,
    });

    return NextResponse.json({ success: true, url, mediaAssetId: mediaAsset.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore upload.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
