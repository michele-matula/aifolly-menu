import { z } from 'zod';

export const UpdateRestaurantSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  tagline: z.string().max(100).trim().optional(),
  slug: z.string()
    .min(3).max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini')
    .optional(),
  coverCharge: z.number().min(0).max(99.99).optional(),
  serviceNote: z.string().max(200).optional(),
  allergenNote: z.string().max(500).optional(),
});

export type UpdateRestaurant = z.infer<typeof UpdateRestaurantSchema>;
