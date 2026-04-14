import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

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

  if (!args.email) {
    console.error('Uso: npx tsx scripts/create-super-admin.ts --email <email> [--password <password>] [--name <name>]');
    console.error('  Se --password e\' omesso, promuove un utente esistente a Super Admin.');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(args.email)) {
    console.error('Errore: formato email non valido.');
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: args.email } });

    if (existing) {
      if (args.password) {
        console.error(
          `Errore: utente ${args.email} gia' esistente. Ometti --password per promuoverlo a Super Admin.`
        );
        process.exit(1);
      }
      if (existing.isSuperAdmin) {
        console.log(`${args.email} e' gia' Super Admin. Nessuna modifica.`);
        return;
      }
      await prisma.user.update({
        where: { id: existing.id },
        data: { isSuperAdmin: true },
      });
      console.log(`Utente ${args.email} promosso a Super Admin.`);
      return;
    }

    if (!args.password) {
      console.error(
        `Errore: utente ${args.email} non esiste e --password non fornita. Crea prima un utente con npm run create-user, oppure passa --password per crearlo contestualmente.`
      );
      process.exit(1);
    }
    if (args.password.length < 8) {
      console.error('Errore: la password deve essere di almeno 8 caratteri.');
      process.exit(1);
    }

    const user = await prisma.user.create({
      data: {
        email: args.email,
        passwordHash: hashSync(args.password, 10),
        name: args.name || null,
        emailVerified: new Date(),
        isSuperAdmin: true,
      },
    });
    console.log(`Super Admin creato: ${user.id} (${user.email})`);
  } catch (err) {
    console.error('Errore nella creazione Super Admin:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
