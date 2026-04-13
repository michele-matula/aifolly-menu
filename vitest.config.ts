import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/theme/**', 'src/lib/validators/**'],
      // google-fonts.ts e' un catalogo dati con helper derivati: i consumer
      // (FontFamilySchema, FontPicker) ne verificano indirettamente i payload.
      // Test diretti degli helper possono essere aggiunti in un sub-step futuro.
      exclude: ['src/lib/theme/google-fonts.ts'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
