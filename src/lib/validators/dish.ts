import { z } from 'zod';
import { DishTag, Allergen } from '@prisma/client';

// ── Schema Fase 1 (API pubblica) ────────────────────────────

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

// ── Schema admin ────────────────────────────────────────────

const PriceVariantInput = z.object({
  id: z.string().optional(), // presente = update, assente = create
  label: z.string().min(1, 'Etichetta obbligatoria').max(30),
  price: z.number({ message: 'Prezzo obbligatorio' }).positive('Prezzo > 0').max(9999.99),
});

export const AdminDishSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').max(100).trim(),
  description: z.string().max(500).trim().optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Seleziona una categoria'),
  price: z.number().min(0).max(9999.99).nullable(),
  priceLabel: z.string().max(30).optional().or(z.literal('')),
  imageUrl: z.string().max(500).optional().or(z.literal('')),
  tags: z.array(z.nativeEnum(DishTag)).default([]),
  allergens: z.array(z.nativeEnum(Allergen)).default([]),
  isChefChoice: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  variants: z.array(PriceVariantInput).max(10).default([]),
});

export const ReorderDishesSchema = z.object({
  categoryId: z.string(),
  orderedIds: z.array(z.string()),
});

export type AdminDish = z.infer<typeof AdminDishSchema>;
export type PriceVariantInputType = z.infer<typeof PriceVariantInput>;
