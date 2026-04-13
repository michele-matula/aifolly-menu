import { describe, it, expect } from 'vitest';
import { UpdateRestaurantSchema, UpdateRestaurantInfoSchema } from './restaurant';

describe('UpdateRestaurantSchema', () => {
  it('accepts a fully valid partial update', () => {
    const r = UpdateRestaurantSchema.safeParse({
      name: 'Osteria del Porto',
      slug: 'osteria-del-porto',
      coverCharge: 2.5,
    });
    expect(r.success).toBe(true);
  });

  it('accepts an empty object (everything is optional)', () => {
    expect(UpdateRestaurantSchema.safeParse({}).success).toBe(true);
  });

  it('rejects slug with invalid characters', () => {
    expect(UpdateRestaurantSchema.safeParse({ slug: 'Osteria del Porto' }).success).toBe(false);
    expect(UpdateRestaurantSchema.safeParse({ slug: 'osteria_del_porto' }).success).toBe(false);
    expect(UpdateRestaurantSchema.safeParse({ slug: '-leading-dash' }).success).toBe(false);
    expect(UpdateRestaurantSchema.safeParse({ slug: 'trailing-' }).success).toBe(false);
    expect(UpdateRestaurantSchema.safeParse({ slug: 'a' }).success).toBe(false); // min 3
  });

  it('rejects coverCharge out of [0, 99.99]', () => {
    expect(UpdateRestaurantSchema.safeParse({ coverCharge: -1 }).success).toBe(false);
    expect(UpdateRestaurantSchema.safeParse({ coverCharge: 100 }).success).toBe(false);
  });
});

describe('UpdateRestaurantInfoSchema', () => {
  const base = {
    name: 'Osteria',
    slug: 'osteria-del-porto',
  };

  it('accepts only name + slug (other fields optional)', () => {
    expect(UpdateRestaurantInfoSchema.safeParse(base).success).toBe(true);
  });

  it('accepts empty strings for optional url fields (literal "")', () => {
    const r = UpdateRestaurantInfoSchema.safeParse({
      ...base,
      email: '',
      website: '',
      logoUrl: '',
    });
    expect(r.success).toBe(true);
  });

  it('rejects a malformed email when provided', () => {
    expect(
      UpdateRestaurantInfoSchema.safeParse({ ...base, email: 'not-an-email' }).success,
    ).toBe(false);
  });

  it('rejects a non-URL website when provided', () => {
    expect(
      UpdateRestaurantInfoSchema.safeParse({ ...base, website: 'example' }).success,
    ).toBe(false);
  });

  it('requires name and rejects empty name', () => {
    expect(UpdateRestaurantInfoSchema.safeParse({ slug: 'x-y-z' }).success).toBe(false);
    expect(
      UpdateRestaurantInfoSchema.safeParse({ ...base, name: '' }).success,
    ).toBe(false);
  });
});
