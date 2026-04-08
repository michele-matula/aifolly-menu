import { z } from 'zod';

// Costanti condivise tra frontend e backend
export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const MEDIA_KINDS = ['LOGO', 'COVER', 'DISH', 'GENERIC'] as const;
export const MediaKindSchema = z.enum(MEDIA_KINDS);

export const UploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= MAX_FILE_SIZE, 'Massimo 5MB')
    .refine(
      f => (ACCEPTED_MIME_TYPES as readonly string[]).includes(f.type),
      'Solo JPEG, PNG, WebP o AVIF'
    ),
});

export type Upload = z.infer<typeof UploadSchema>;
