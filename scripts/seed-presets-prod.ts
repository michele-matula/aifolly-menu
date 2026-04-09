/**
 * scripts/seed-presets-prod.ts
 *
 * Wrapper per eseguire seedPresets() puntando a un DB qualsiasi
 * via le variabili d'ambiente DATABASE_URL e DIRECT_URL settate
 * temporaneamente in shell. Usato per il seed dei soli preset di
 * tema sul database di produzione, senza toccare altre tabelle.
 *
 * Uso (in PowerShell, dopo aver settato $env:DATABASE_URL e $env:DIRECT_URL):
 *   npx tsx scripts/seed-presets-prod.ts
 */

import { PrismaClient } from '@prisma/client';
import { seedPresets } from '../prisma/seed-presets';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Connecting to database...');
    console.log(`Target: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] ?? 'unknown'}`);
    console.log('');

    await seedPresets(prisma);

    console.log('');
    console.log('✓ Preset seeding completed successfully.');
  } catch (err) {
    console.error('✗ Error during preset seeding:');
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();