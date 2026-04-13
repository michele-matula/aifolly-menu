import { describe, it, expect } from 'vitest';
import {
  CreateCategorySchema,
  AdminCreateCategorySchema,
  AdminUpdateCategorySchema,
  ReorderCategoriesSchema,
} from './category';

const VALID_CUID = 'ckvgwbtti0000hby0z0q3l4pq';

describe('CreateCategorySchema', () => {
  it('accepts a minimal valid payload', () => {
    const r = CreateCategorySchema.safeParse({
      name: 'Antipasti',
      restaurantId: VALID_CUID,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isVisible).toBe(true); // default
  });

  it('trims name', () => {
    const r = CreateCategorySchema.parse({
      name: '  Antipasti  ',
      restaurantId: VALID_CUID,
    });
    expect(r.name).toBe('Antipasti');
  });

  it('rejects empty name / over-length name / description / icon', () => {
    expect(
      CreateCategorySchema.safeParse({ name: '', restaurantId: VALID_CUID }).success,
    ).toBe(false);
    expect(
      CreateCategorySchema.safeParse({
        name: 'x'.repeat(51),
        restaurantId: VALID_CUID,
      }).success,
    ).toBe(false);
    expect(
      CreateCategorySchema.safeParse({
        name: 'ok',
        restaurantId: VALID_CUID,
        description: 'x'.repeat(201),
      }).success,
    ).toBe(false);
    expect(
      CreateCategorySchema.safeParse({
        name: 'ok',
        restaurantId: VALID_CUID,
        icon: 'x'.repeat(11),
      }).success,
    ).toBe(false);
  });

  it('rejects malformed restaurantId (not a cuid)', () => {
    expect(
      CreateCategorySchema.safeParse({ name: 'ok', restaurantId: 'plain-string' }).success,
    ).toBe(false);
  });
});

describe('AdminCreateCategorySchema / AdminUpdateCategorySchema', () => {
  it('accepts empty string literal for optional text fields', () => {
    const r = AdminCreateCategorySchema.safeParse({
      name: 'Antipasti',
      description: '',
      icon: '',
    });
    expect(r.success).toBe(true);
  });

  it('update schema has the same shape and applies defaults', () => {
    const r = AdminUpdateCategorySchema.parse({ name: 'ok' });
    expect(r.isVisible).toBe(true);
  });

  it('rejects missing name', () => {
    expect(AdminCreateCategorySchema.safeParse({}).success).toBe(false);
  });
});

describe('ReorderCategoriesSchema', () => {
  it('accepts an empty array', () => {
    expect(ReorderCategoriesSchema.safeParse([]).success).toBe(true);
  });

  it('accepts valid reorder payload', () => {
    const r = ReorderCategoriesSchema.safeParse([
      { id: 'a', sortOrder: 0 },
      { id: 'b', sortOrder: 1 },
    ]);
    expect(r.success).toBe(true);
  });

  it('rejects non-integer / negative sortOrder', () => {
    expect(
      ReorderCategoriesSchema.safeParse([{ id: 'a', sortOrder: 1.5 }]).success,
    ).toBe(false);
    expect(
      ReorderCategoriesSchema.safeParse([{ id: 'a', sortOrder: -1 }]).success,
    ).toBe(false);
  });
});
