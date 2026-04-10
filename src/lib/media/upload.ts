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

// Verifica che i magic bytes del file corrispondano a un'immagine reale.
// Difesa contro upload di file con estensione/MIME falsificati (es. .exe rinominato .jpg).
async function detectImageMime(file: File): Promise<string | null> {
  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return 'image/png';
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return 'image/webp';
  }
  // AVIF: "....ftypavif" (major brand "avif")
  if (
    buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 &&
    buf[8] === 0x61 && buf[9] === 0x76 && buf[10] === 0x69 && buf[11] === 0x66
  ) {
    return 'image/avif';
  }
  return null;
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

  // Magic bytes: il contenuto reale deve corrispondere al MIME dichiarato.
  const detectedMime = await detectImageMime(file);
  if (!detectedMime || detectedMime !== file.type) {
    throw new Error('Il file non è un\'immagine valida.');
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
