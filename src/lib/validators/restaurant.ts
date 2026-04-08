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

// Form "Info" nell'admin — campi modificabili dal ristoratore
export const UpdateRestaurantInfoSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').max(100).trim(),
  slug: z.string()
    .min(3, 'Minimo 3 caratteri')
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini'),
  tagline: z.string().max(100).trim().optional().or(z.literal('')),
  description: z.string().max(2000).trim().optional().or(z.literal('')),
  city: z.string().max(100).trim().optional().or(z.literal('')),
  province: z.string().max(10).trim().optional().or(z.literal('')),
  address: z.string().max(200).trim().optional().or(z.literal('')),
  phone: z.string().max(30).trim().optional().or(z.literal('')),
  email: z.string().email('Email non valida').max(100).optional().or(z.literal('')),
  website: z.string().url('URL non valido').max(200).optional().or(z.literal('')),
  logoUrl: z.string().max(500).optional().or(z.literal('')),
  coverUrl: z.string().max(500).optional().or(z.literal('')),
});

export type UpdateRestaurantInfo = z.infer<typeof UpdateRestaurantInfoSchema>;
