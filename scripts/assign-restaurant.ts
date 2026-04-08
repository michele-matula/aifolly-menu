import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

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

  if (!args['restaurant-slug'] || !args['user-email']) {
    console.error('Uso: npm run assign-restaurant -- --restaurant-slug <slug> --user-email <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: args['user-email'] } });
    if (!user) {
      console.error(`Errore: utente ${args['user-email']} non trovato.`);
      process.exit(1);
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { slug: args['restaurant-slug'] } });
    if (!restaurant) {
      console.error(`Errore: ristorante ${args['restaurant-slug']} non trovato.`);
      process.exit(1);
    }

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { ownerId: user.id },
    });

    console.log(`Ristorante "${restaurant.name}" assegnato a ${user.email}`);
  } catch (err) {
    console.error('Errore:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
