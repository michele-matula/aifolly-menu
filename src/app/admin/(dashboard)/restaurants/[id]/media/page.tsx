import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import MediaLibrary from '@/components/admin/MediaLibrary';

type Props = { params: Promise<{ id: string }> };

export default async function MediaPage({ params }: Props) {
  const { id } = await params;
  await requireOwnership(id);

  const assets = await prisma.mediaAsset.findMany({
    where: { restaurantId: id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const totalSize = assets.reduce((sum, a) => sum + a.sizeBytes, 0);

  const serialized = assets.map(a => ({
    id: a.id,
    url: a.url,
    kind: a.kind,
    filename: a.filename,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <MediaLibrary
      initialAssets={serialized}
      totalSize={totalSize}
    />
  );
}
