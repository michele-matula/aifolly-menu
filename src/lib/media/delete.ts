import { prisma } from '@/lib/prisma';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase/server';

// Strategia: elimina prima il record DB (la fonte di verità), poi il file dal bucket.
// Se la rimozione dal bucket fallisce, resta un file orfano (minor) ma il record DB è pulito
// e l'utente non vede più l'asset. Preferibile al contrario (file rimosso ma record fantasma).
export async function deleteMediaAsset(mediaAssetId: string, restaurantId: string): Promise<void> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaAssetId } });

  if (!asset || asset.restaurantId !== restaurantId) {
    throw new Error('Media asset non trovato.');
  }

  // 1. Elimina record DB
  await prisma.mediaAsset.delete({ where: { id: mediaAssetId } });

  // 2. Elimina file dal bucket (best-effort)
  const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([asset.path]);
  if (error) {
    console.error(`[media/delete] Cleanup bucket fallito per ${asset.path}: ${error.message}`);
  }
}
