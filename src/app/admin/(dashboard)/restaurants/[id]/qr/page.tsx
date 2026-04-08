import { requireOwnership } from '@/lib/auth-helpers';
import { generateQRPng } from '@/lib/qr/generate';
import QRManager from '@/components/admin/QRManager';

type Props = { params: Promise<{ id: string }> };

export default async function QRPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await requireOwnership(id);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${restaurant.slug}`;
  const previewDataUrl = await generateQRPng(publicUrl, { size: 512 });

  return (
    <QRManager
      slug={restaurant.slug}
      publicUrl={publicUrl}
      previewDataUrl={previewDataUrl}
      restaurantName={restaurant.name}
    />
  );
}
