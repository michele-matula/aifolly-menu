// One-shot migration script (Fase 4 Step 6.3.a).
//
// Scarica le immagini demo Unsplash referenziate da prisma/seed.ts e le
// re-uploada su Supabase Storage (bucket restaurant-media, prefix demo-seed/).
// Stampa un manifest JSON { oldUrl -> newUrl } da applicare a seed.ts.
//
// Serve a sbloccare 6.3.b (hardening validator imageUrl per accettare solo
// host Supabase) e 6.3.c (swap <img> -> next/image, che rifiuta hostname
// non allowlist-ati in remotePatterns).
//
// Idempotente: upsert=true, filename deterministico dallo slug.
//
// Uso: npm run migrate-seed-images

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'restaurant-media';

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Errore: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti in .env',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Inventario (oldUrl -> target filename). Ordine = ordine di apparizione
// in prisma/seed.ts. L'aggiunta di nuove righe richiede di riallineare
// sia il seed sia questo inventario nella stessa sessione.
const IMAGES: Array<{ oldUrl: string; filename: string }> = [
  // Cover ristorante
  {
    oldUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    filename: 'osteria-del-porto-cover.jpg',
  },
  // Antipasti
  {
    oldUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80',
    filename: 'crudo-di-mare.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
    filename: 'polpo-alla-brace.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&q=80',
    filename: 'burrata-pugliese.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&q=80',
    filename: 'insalata-di-mare-tiepida.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80',
    filename: 'caprese-di-bufala.jpg',
  },
  // Primi
  {
    oldUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80',
    filename: 'orecchiette-ai-ricci.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80',
    filename: 'spaghettone-allo-scoglio.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&q=80',
    filename: 'risotto-al-nero-di-seppia.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=500&q=80',
    filename: 'ravioli-di-cernia.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80',
    filename: 'linguine-cacio-e-pepe-di-mare.jpg',
  },
  // Secondi
  {
    oldUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500&q=80',
    filename: 'orata-in-crosta-di-sale.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80',
    filename: 'grigliata-mista.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80',
    filename: 'baccala-in-umido.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80',
    filename: 'tagliata-di-tonno.jpg',
  },
  // Contorni
  {
    oldUrl: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80',
    filename: 'patate-al-forno.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500&q=80',
    filename: 'verdure-grigliate.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=500&q=80',
    filename: 'cicoria-ripassata.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1543339308-d595c4f5f5ab?w=500&q=80',
    filename: 'pure-di-fave.jpg',
  },
  // Dolci
  {
    oldUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80',
    filename: 'pasticciotto-leccese.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
    filename: 'semifreddo-alle-mandorle.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=500&q=80',
    filename: 'sorbetto-al-limone.jpg',
  },
  {
    oldUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
    filename: 'tortino-al-cioccolato.jpg',
  },
];

async function migrateOne(
  oldUrl: string,
  filename: string,
): Promise<string> {
  const res = await fetch(oldUrl);
  if (!res.ok) {
    throw new Error(`fetch ${oldUrl} -> HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());

  const path = `demo-seed/${filename}`;
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, buf, { contentType, upsert: true });

  if (upErr) {
    throw new Error(`upload ${path} -> ${upErr.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  console.log(
    `Migrating ${IMAGES.length} images from Unsplash to Supabase (bucket="${bucket}")...\n`,
  );

  const manifest: Record<string, string> = {};
  let ok = 0;
  let failed = 0;

  for (const { oldUrl, filename } of IMAGES) {
    try {
      const newUrl = await migrateOne(oldUrl, filename);
      manifest[oldUrl] = newUrl;
      ok++;
      console.log(`  ok  ${filename}`);
    } catch (err) {
      failed++;
      console.error(`  err ${filename}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone: ${ok} ok, ${failed} failed\n`);
  console.log('Manifest (oldUrl -> newUrl):');
  console.log(JSON.stringify(manifest, null, 2));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
