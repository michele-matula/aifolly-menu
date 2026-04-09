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

  if (!args.email || !args.password) {
    console.error('Uso: npm run create-user -- --email <email> --password <password> [--name <name>]');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(args.email)) {
    console.error('Errore: formato email non valido.');
    process.exit(1);
  }

  if (args.password.length < 8) {
    console.error('Errore: la password deve essere di almeno 8 caratteri.');
    process.exit(1);
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: args.email,
        passwordHash: hashSync(args.password, 10),
        name: args.name || null,
      },
    });
    console.log(`Utente creato: ${user.id} (${user.email})`);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      console.error(`Errore: l'email ${args.email} è già registrata.`);
    } else {
      console.error('Errore nella creazione utente:', err);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
