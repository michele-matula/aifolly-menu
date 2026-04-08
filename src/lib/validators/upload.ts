import { z } from 'zod';

export const UploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 5 * 1024 * 1024, 'Massimo 5MB')
    .refine(
      f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Solo JPEG, PNG o WebP'
    ),
});

export type Upload = z.infer<typeof UploadSchema>;
