import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--') && i + 1 < args.length) {
      result[arg.slice(2)] = args[++i];
    }
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.name || !args.slug) {
    console.error(
      'Uso: npx tsx scripts/create-restaurant.ts --name <name> --slug <slug> [--owner-email <email>] [--preset <preset-slug>] [--tagline <tagline>] [--description <description>]'
    );
    process.exit(1);
  }

  // Validazione slug: solo lowercase, numeri, trattini
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(args.slug)) {
    console.error(
      "Errore: lo slug deve contenere solo lettere minuscole, numeri e trattini (es. 'osteria-del-porto')."
    );
    process.exit(1);
  }

  try {
    // Risolvi owner se fornito
    let ownerId: string | null = null;
    if (args['owner-email']) {
      const owner = await prisma.user.findUnique({
        where: { email: args['owner-email'] },
      });
      if (!owner) {
        console.error(`Errore: utente ${args['owner-email']} non trovato.`);
        process.exit(1);
      }
      ownerId = owner.id;
    }

    // Carica preset se fornito (servirà sia per validazione sia per inizializzare il tema)
    let presetData: { coverConfig: unknown; menuConfig: unknown; dishConfig: unknown } | null = null;
    if (args.preset) {
      const preset = await prisma.themePreset.findUnique({
        where: { slug: args.preset },
      });
      if (!preset) {
        console.error(
          `Errore: preset di tema "${args.preset}" non trovato. Preset disponibili: vedi tabella ThemePreset.`
        );
        process.exit(1);
      }
      presetData = {
        coverConfig: preset.coverConfig,
        menuConfig: preset.menuConfig,
        dishConfig: preset.dishConfig,
      };
    }

    // Crea il ristorante
    const restaurant = await prisma.restaurant.create({
      data: {
        name: args.name,
        slug: args.slug,
        tagline: args.tagline || null,
        description: args.description || null,
        themePreset: args.preset || null,
        // Se è stato fornito un preset, copia i suoi config nei campi tema
        // del ristorante, altrimenti lascia gli oggetti vuoti di default.
        ...(presetData
          ? {
              themeCover: presetData.coverConfig as object,
              themeMenu: presetData.menuConfig as object,
              themeDish: presetData.dishConfig as object,
            }
          : {}),
        ownerId: ownerId,
      },
    });

    console.log(`Ristorante creato: ${restaurant.id}`);
    console.log(`  Nome:    ${restaurant.name}`);
    console.log(`  Slug:    ${restaurant.slug}`);
    if (ownerId) {
      console.log(`  Owner:   ${args['owner-email']} (${ownerId})`);
    } else {
      console.log(`  Owner:   nessuno (assegnabile dopo con assign-restaurant.ts)`);
    }
    if (args.preset) {
      console.log(`  Preset:  ${args.preset}`);
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      console.error(`Errore: lo slug "${args.slug}" è già in uso.`);
    } else {
      console.error('Errore nella creazione ristorante:', err);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();