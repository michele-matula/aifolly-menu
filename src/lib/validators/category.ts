import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  description: z.string().max(200).trim().optional(),
  icon: z.string().max(10).optional(),
  isVisible: z.boolean().default(true),
  restaurantId: z.string().cuid(),
});

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
