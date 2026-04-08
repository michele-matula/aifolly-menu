import { z } from 'zod';

// Schema originale Fase 1 (include restaurantId per uso API)
export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  description: z.string().max(200).trim().optional(),
  icon: z.string().max(10).optional(),
  isVisible: z.boolean().default(true),
  restaurantId: z.string().cuid(),
});

export type CreateCategory = z.infer<typeof CreateCategorySchema>;

// ── Admin form schemas ──────────────────────────────────────

export const AdminCreateCategorySchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').max(50).trim(),
  description: z.string().max(200).trim().optional().or(z.literal('')),
  icon: z.string().max(10).optional().or(z.literal('')),
  isVisible: z.boolean().default(true),
});

export const AdminUpdateCategorySchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').max(50).trim(),
  description: z.string().max(200).trim().optional().or(z.literal('')),
  icon: z.string().max(10).optional().or(z.literal('')),
  isVisible: z.boolean().default(true),
});

export const ReorderCategoriesSchema = z.array(
  z.object({
    id: z.string(),
    sortOrder: z.number().int().min(0),
  })
);

export type AdminCreateCategory = z.infer<typeof AdminCreateCategorySchema>;
export type AdminUpdateCategory = z.infer<typeof AdminUpdateCategorySchema>;
