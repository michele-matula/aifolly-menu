import { test, expect } from '@playwright/test';

// Smoke del flusso pubblico: copertina -> click CTA -> pagina menu.
// Usa il ristorante seed "osteria-del-porto". Test strutturale: verifica
// presenza dei componenti chiave senza dipendere dai testi del seed
// (che possono cambiare), cosi' resta stabile nel tempo.

const SLUG = 'osteria-del-porto';

test.describe('Menu pubblico @smoke', () => {
  test('copertina -> menu: CTA, categorie, piatti, filtri', async ({ page }) => {
    // 1. Copertina del ristorante
    await page.goto(`/${SLUG}`);
    await expect(page).toHaveTitle(/Osteria del Porto/);

    // Nome ristorante renderizzato sulla cover
    await expect(page.getByText('Osteria del Porto').first()).toBeVisible();

    // 2. CTA verso il menu
    const cta = page.locator(`a[href="/${SLUG}/menu"]`).first();
    await expect(cta).toBeVisible();
    await cta.click();

    await page.waitForURL(`**/${SLUG}/menu`);
    await expect(page).toHaveURL(new RegExp(`/${SLUG}/menu$`));

    // 3. Struttura del menu pubblico
    //    - almeno una categoria nella sticky nav
    await expect(page.locator('.menu-cat-btn').first()).toBeVisible();

    //    - almeno un piatto renderizzato
    await expect(page.locator('.menu-dish-card').first()).toBeVisible();

    //    - barra filtri presente e cliccabile (prende il primo pulsante
    //      filtro e lo attiva; non verifichiamo l'effetto del filtro qui,
    //      e' materia di un test dedicato)
    const firstFilter = page.locator('.menu-filter-btn').first();
    await expect(firstFilter).toBeVisible();
    await firstFilter.click();
  });
});
