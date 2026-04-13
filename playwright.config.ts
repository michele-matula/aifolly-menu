import { defineConfig, devices } from '@playwright/test';

// Playwright config minimale per smoke e2e in locale.
// - webServer: avvia `next dev` automaticamente (SW prod-only -> dev e' pulito)
// - reuseExistingServer in locale per evitare restart se il dev e' gia' su
// - solo Chromium in questa iterazione (multi-browser puo' arrivare dopo)
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    // Turbopack cold start + primo hit al DB Supabase puo' richiedere
    // oltre 2 minuti su Windows; margine generoso per evitare timeout
    // silenziosi del bootstrap del webServer.
    timeout: 180_000,
  },
});
