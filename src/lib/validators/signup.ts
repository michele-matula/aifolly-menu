import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SignupSchema = z.object({
  restaurantName: z.string()
    .min(2, 'Minimo 2 caratteri')
    .max(80, 'Massimo 80 caratteri')
    .trim(),
  ownerName: z.string()
    .min(2, 'Minimo 2 caratteri')
    .max(80, 'Massimo 80 caratteri')
    .trim(),
  email: z.string()
    .email('Email non valida')
    .max(100)
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(8, 'Minimo 8 caratteri'),
  slug: z.string()
    .min(3, 'Minimo 3 caratteri')
    .max(60, 'Massimo 60 caratteri')
    .regex(slugRegex, 'Solo lettere minuscole, numeri e trattini'),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const RestaurantOnboardingSchema = z.object({
  restaurantName: z.string()
    .min(2, 'Minimo 2 caratteri')
    .max(80, 'Massimo 80 caratteri')
    .trim(),
  slug: z.string()
    .min(3, 'Minimo 3 caratteri')
    .max(60, 'Massimo 60 caratteri')
    .regex(slugRegex, 'Solo lettere minuscole, numeri e trattini'),
});

export type RestaurantOnboardingInput = z.infer<typeof RestaurantOnboardingSchema>;
