import 'dotenv/config';
import { randomBytes } from 'crypto';
import { sendVerificationEmail, EmailDeliveryError } from '../src/lib/email';

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

  if (!args.to) {
    console.error('Uso: npm run smoke-email -- --to <email> [--name <name>]');
    console.error('');
    console.error('Invia una email di verifica di test con un token dummy.');
    console.error('Il link nel corpo punta a /verify-email?token=XXX ma la pagina');
    console.error('non esiste ancora: e\' un test visuale/delivery, non funzionale.');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(args.to)) {
    console.error('Errore: formato email non valido.');
    process.exit(1);
  }

  const dummyToken = `smoke-${randomBytes(16).toString('hex')}`;
  console.log(`Invio email di verifica di test a ${args.to}...`);
  console.log(`Token dummy: ${dummyToken}`);

  try {
    const { id } = await sendVerificationEmail({
      to: args.to,
      token: dummyToken,
      userName: args.name || null,
    });
    console.log(`Email inviata. Message id Resend: ${id}`);
    console.log('');
    console.log('Note:');
    console.log('- In dev con EMAIL_FROM=onboarding@resend.dev, l\'email arriva');
    console.log('  solo al proprietario dell\'account Resend (safety del free tier).');
    console.log('- Il link nel corpo non funziona: /verify-email sara\' implementato in 6a.13.');
  } catch (err) {
    if (err instanceof EmailDeliveryError) {
      console.error(`Errore di invio: ${err.message}`);
      if (err.cause) {
        console.error('Causa:', err.cause);
      }
    } else {
      console.error('Errore non previsto:', err);
    }
    process.exit(1);
  }
}

main();
