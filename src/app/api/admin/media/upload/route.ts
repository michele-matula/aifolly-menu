import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToStorage } from '@/lib/media/upload';
import { MediaKindSchema } from '@/lib/validators/upload';
import { checkRateLimit } from '@/lib/rate-limit';
import { getRestaurantAccessStatus } from '@/lib/access-status';
import { checkPlanLimit } from '@/lib/plan-limits';
import type { MediaKind } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Non autenticato.' }, { status: 401 });
  }

  const rate = checkRateLimit(`upload:${session.user.id}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: 'Troppi upload. Riprova tra qualche secondo.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(rate.resetInMs / 1000).toString() },
      }
    );
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

  // Difesa in profondita': blocca se trial scaduto o ristorante sospeso.
  // In condizioni normali l'UI admin e' gia' redirectata da requireOwnership,
  // ma questo protegge da chiamate dirette all'API.
  const access = await getRestaurantAccessStatus(restaurantId);
  if (access.status === 'trial_expired' || access.status === 'suspended') {
    return NextResponse.json(
      { success: false, error: 'Accesso al ristorante bloccato.' },
      { status: 403 }
    );
  }

  // Enforcement quota immagini
  const quota = await checkPlanLimit(restaurantId, 'maxImages');
  if (!quota.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Hai raggiunto il limite di ${quota.limit} immagini previsto dal tuo piano.`,
      },
      { status: 403 }
    );
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
