import { describe, it, expect } from 'vitest';
import {
  CreateDishSchema,
  UpdateDishSchema,
  AdminDishSchema,
  ReorderDishesSchema,
} from './dish';

const VALID_CUID = 'ckvgwbtti0000hby0z0q3l4pq';

describe('CreateDishSchema', () => {
  const base = {
    name: 'Tagliolini al tartufo',
    categoryId: VALID_CUID,
  };

  it('accepts a minimal valid dish', () => {
    const r = CreateDishSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tags).toEqual([]);
      expect(r.data.allergens).toEqual([]);
      expect(r.data.variants).toEqual([]);
      expect(r.data.isAvailable).toBe(true);
      expect(r.data.isChefChoice).toBe(false);
    }
  });

  it('trims name and description', () => {
    const r = CreateDishSchema.parse({
      ...base,
      name: '  Tagliolini  ',
      description: '  con tartufo bianco  ',
    });
    expect(r.name).toBe('Tagliolini');
    expect(r.description).toBe('con tartufo bianco');
  });

  it('accepts valid tags and allergens enums', () => {
    const r = CreateDishSchema.safeParse({
      ...base,
      tags: ['VEGETARIANO', 'PICCANTE'],
      allergens: ['GLUTINE', 'LATTE'],
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown tag / allergen values', () => {
    expect(
      CreateDishSchema.safeParse({ ...base, tags: ['CARNIVORO'] }).success,
    ).toBe(false);
    expect(
      CreateDishSchema.safeParse({ ...base, allergens: ['VIBRANIUM'] }).success,
    ).toBe(false);
  });

  it('rejects price out of [>0, 9999.99]', () => {
    expect(CreateDishSchema.safeParse({ ...base, price: 0 }).success).toBe(false);
    expect(CreateDishSchema.safeParse({ ...base, price: -1 }).success).toBe(false);
    expect(CreateDishSchema.safeParse({ ...base, price: 10000 }).success).toBe(false);
  });

  it('rejects more than 5 variants', () => {
    const variants = Array.from({ length: 6 }, (_, i) => ({
      label: `v${i}`,
      price: 10,
    }));
    expect(CreateDishSchema.safeParse({ ...base, variants }).success).toBe(false);
  });

  it('rejects malformed categoryId (not a cuid)', () => {
    expect(
      CreateDishSchema.safeParse({ ...base, categoryId: 'nope' }).success,
    ).toBe(false);
  });
});

describe('UpdateDishSchema (partial)', () => {
  it('accepts an empty object', () => {
    expect(UpdateDishSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a single field update', () => {
    expect(UpdateDishSchema.safeParse({ name: 'Nuovo nome' }).success).toBe(true);
  });
});

describe('AdminDishSchema', () => {
  const base = { name: 'Carpaccio', categoryId: 'cat-id-123', price: null };

  it('accepts minimal payload with price=null and empty optional strings', () => {
    const r = AdminDishSchema.safeParse({
      ...base,
      description: '',
      priceLabel: '',
      imageUrl: '',
    });
    expect(r.success).toBe(true);
  });

  it('accepts up to 10 variants (admin cap)', () => {
    const variants = Array.from({ length: 10 }, (_, i) => ({
      label: `v${i}`,
      price: 5,
    }));
    expect(AdminDishSchema.safeParse({ ...base, variants }).success).toBe(true);
  });

  it('rejects more than 10 variants', () => {
    const variants = Array.from({ length: 11 }, (_, i) => ({
      label: `v${i}`,
      price: 5,
    }));
    expect(AdminDishSchema.safeParse({ ...base, variants }).success).toBe(false);
  });

  it('rejects variant with missing label / non-positive price', () => {
    expect(
      AdminDishSchema.safeParse({
        ...base,
        variants: [{ label: '', price: 5 }],
      }).success,
    ).toBe(false);
    expect(
      AdminDishSchema.safeParse({
        ...base,
        variants: [{ label: 'ok', price: 0 }],
      }).success,
    ).toBe(false);
  });

  it('rejects categoryId empty string', () => {
    expect(
      AdminDishSchema.safeParse({ ...base, categoryId: '' }).success,
    ).toBe(false);
  });
});

describe('ReorderDishesSchema', () => {
  it('accepts a valid payload', () => {
    expect(
      ReorderDishesSchema.safeParse({
        categoryId: 'cat-1',
        orderedIds: ['d1', 'd2', 'd3'],
      }).success,
    ).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(ReorderDishesSchema.safeParse({ categoryId: 'cat-1' }).success).toBe(false);
    expect(ReorderDishesSchema.safeParse({ orderedIds: [] }).success).toBe(false);
  });
});
