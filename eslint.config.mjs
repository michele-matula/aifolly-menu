import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vitest coverage output (generato): non e' codice nostro.
    "coverage/**",
    // Prototipi di riferimento per il design del menu pubblico
    // (docs/references/*.jsx, seed-presets.ts). Snapshot esterni
    // che non vengono importati in runtime, non vogliamo che le
    // loro scelte vincolino le regole lint del prodotto.
    "docs/**",
    // Script di generazione dati (seed, migrazioni). Eseguiti solo
    // via `tsx prisma/seed.ts` o dal Prisma CLI, non bundlati nel
    // runtime Next. I cast su payload JSON di Prisma sono comuni
    // e tiparli come Prisma.InputJsonValue e' churn senza valore.
    "prisma/**",
  ]),
]);

export default eslintConfig;
