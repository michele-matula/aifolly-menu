import { prisma } from '@/lib/prisma';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase/server';
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validators/upload';
import type { MediaKind } from '@prisma/client';

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_');
}

export async function uploadImageToStorage({
  restaurantId,
  kind,
  file,
}: {
  restaurantId: string;
  kind: MediaKind;
  file: File;
}) {
  // Validazione
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('Tipo file non supportato. Usa JPEG, PNG, WebP o AVIF.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Il file supera il limite di 5MB.');
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const sanitized = sanitizeFilename(file.name);
  const path = `${restaurantId}/${kind.toLowerCase()}/${timestamp}-${random}-${sanitized}`;

  // Upload a Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error(`Upload fallito: ${uploadError.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  const url = urlData.publicUrl;

  // Salva metadati in DB — rollback file se fallisce
  try {
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        restaurantId,
        kind,
        url,
        path,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });

    return { url, path, mediaAsset };
  } catch (dbError) {
    // Cleanup: rimuovi il file appena caricato
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([path]);
    throw dbError;
  }
}
