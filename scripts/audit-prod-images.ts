// Read-only audit delle URL immagine nel DB target.
// Serve per decidere se la migrazione di Step 6.3.a va estesa a prod
// oppure se e' no-op (caso probabile se best-salerno e' stato creato
// via pannello admin con upload di immagini reali su Supabase).
//
// Uso:
//   1. Export delle env vars di prod (DATABASE_URL, DIRECT_URL,
//      NEXT_PUBLIC_SUPABASE_URL) nella shell corrente.
//   2. npx tsx scripts/audit-prod-images.ts
//
// Non modifica nulla. Stampa un report con:
// - Count totale di ristoranti e piatti
// - URL cover/logo non-Supabase (se presenti, elenca tutti)
// - URL dish.imageUrl non-Supabase (se presenti, elenca i primi 20)

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL mancante: non posso calcolare l\'host atteso.');
    process.exit(1);
  }
  const allowedHost = new URL(supabaseUrl).host;

  console.log(`Audit immagini — target host atteso: ${allowedHost}\n`);

  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      coverUrl: true,
      logoUrl: true,
    },
  });

  const dishCount = await prisma.dish.count();
  const dishes = await prisma.dish.findMany({
    select: { id: true, name: true, imageUrl: true },
    where: { imageUrl: { not: null } },
  });

  console.log(`Ristoranti totali: ${restaurants.length}`);
  console.log(`Piatti totali: ${dishCount} (${dishes.length} con imageUrl)\n`);

  // Helper: un URL e' "suspect" se non vuoto e il suo host non corrisponde
  // ad allowedHost. Gli URL null/vuoti sono OK.
  function isSuspect(url: string | null): boolean {
    if (!url) return false;
    try {
      return new URL(url).host !== allowedHost;
    } catch {
      return true; // URL malformato = suspect
    }
  }

  // Restaurants
  const suspectRestaurants: Array<{ slug: string; field: string; url: string }> = [];
  for (const r of restaurants) {
    if (isSuspect(r.coverUrl)) {
      suspectRestaurants.push({ slug: r.slug, field: 'coverUrl', url: r.coverUrl! });
    }
    if (isSuspect(r.logoUrl)) {
      suspectRestaurants.push({ slug: r.slug, field: 'logoUrl', url: r.logoUrl! });
    }
  }

  console.log('== Restaurant cover/logo non-Supabase ==');
  if (suspectRestaurants.length === 0) {
    console.log('(nessuno — tutti i cover/logo sono su Supabase o null)');
  } else {
    for (const s of suspectRestaurants) {
      console.log(`  ${s.slug}.${s.field}: ${s.url}`);
    }
  }

  // Dishes
  const suspectDishes = dishes.filter(d => isSuspect(d.imageUrl));
  console.log(`\n== Dish imageUrl non-Supabase ==`);
  if (suspectDishes.length === 0) {
    console.log('(nessuno — tutti gli imageUrl sono su Supabase o null)');
  } else {
    console.log(`Totale: ${suspectDishes.length} piatti`);
    const sample = suspectDishes.slice(0, 20);
    for (const d of sample) {
      console.log(`  ${d.name}: ${d.imageUrl}`);
    }
    if (suspectDishes.length > 20) {
      console.log(`  ... e altri ${suspectDishes.length - 20}`);
    }
  }

  console.log('\n== Verdetto ==');
  if (suspectRestaurants.length === 0 && suspectDishes.length === 0) {
    console.log('NO-OP: nessuna URL non-Supabase. La migrazione prod non e\' necessaria.');
  } else {
    console.log(
      `AZIONE RICHIESTA: ${suspectRestaurants.length} restaurant field + ${suspectDishes.length} dish.imageUrl da sistemare.`,
    );
  }
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
