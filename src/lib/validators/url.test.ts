import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { SupabaseImageUrlSchema } from './url';

describe('SupabaseImageUrlSchema', () => {
  describe('when NEXT_PUBLIC_SUPABASE_URL is set', () => {
    beforeAll(() => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    });
    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it('accepts URLs hosted on the Supabase project host', () => {
      const ok = SupabaseImageUrlSchema.safeParse(
        'https://abc.supabase.co/storage/v1/object/public/images/x.jpg',
      );
      expect(ok.success).toBe(true);
    });

    it('rejects URLs on a different host (no third-party images)', () => {
      expect(
        SupabaseImageUrlSchema.safeParse('https://evil.example.com/x.jpg').success,
      ).toBe(false);
      expect(
        SupabaseImageUrlSchema.safeParse('https://xyz.supabase.co/x.jpg').success,
      ).toBe(false);
    });

    it('rejects malformed URLs', () => {
      expect(SupabaseImageUrlSchema.safeParse('not-a-url').success).toBe(false);
      expect(SupabaseImageUrlSchema.safeParse('').success).toBe(false);
    });
  });

  describe('when NEXT_PUBLIC_SUPABASE_URL is missing (fail-closed)', () => {
    beforeAll(() => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    });
    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it('rejects even well-formed Supabase-looking URLs', () => {
      expect(
        SupabaseImageUrlSchema.safeParse('https://abc.supabase.co/x.jpg').success,
      ).toBe(false);
    });
  });
});
