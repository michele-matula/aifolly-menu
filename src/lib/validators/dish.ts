import { z } from 'zod';
import { DishTag, Allergen } from '@/generated/prisma/client';

export const CreateDishSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  price: z.number().positive().max(9999.99).optional(),
  priceLabel: z.string().max(30).optional(),
  categoryId: z.string().cuid(),
  tags: z.array(z.nativeEnum(DishTag)).default([]),
  allergens: z.array(z.nativeEnum(Allergen)).default([]),
  isChefChoice: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  variants: z.array(z.object({
    label: z.string().min(1).max(30),
    price: z.number().positive().max(9999.99),
  })).max(5).default([]),
});

export const UpdateDishSchema = CreateDishSchema.partial();

export type CreateDish = z.infer<typeof CreateDishSchema>;
export type UpdateDish = z.infer<typeof UpdateDishSchema>;
