import { Resend } from 'resend';
import { buildVerificationEmail } from '@/lib/email-templates/verification';

const VERIFICATION_TOKEN_TTL_HOURS = 24;

export class EmailDeliveryError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'EmailDeliveryError';
  }
}

let cachedClient: Resend | null = null;

// Lazy init: l'import di questo modulo non deve fallire a build-time se le
// env non sono settate (Vercel build senza secrets, smoke test CLI isolato).
function getResendClient(): Resend {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailDeliveryError(
      'RESEND_API_KEY non configurata. Imposta la variabile d\'ambiente prima di inviare email.'
    );
  }
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

function getFromAddress(): string {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new EmailDeliveryError(
      'EMAIL_FROM non configurata. Imposta la variabile d\'ambiente con un indirizzo valido (es. "AiFolly Menu <onboarding@resend.dev>").'
    );
  }
  return from;
}

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new EmailDeliveryError(
      'NEXT_PUBLIC_APP_URL non configurata: impossibile costruire il link di verifica.'
    );
  }
  return url.replace(/\/$/, '');
}

type SendVerificationEmailInput = {
  to: string;
  token: string;
  userName?: string | null;
};

type SendVerificationEmailResult = {
  id: string;
};

export async function sendVerificationEmail(
  input: SendVerificationEmailInput
): Promise<SendVerificationEmailResult> {
  const { to, token, userName } = input;
  const verifyUrl = `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;

  const { subject, html, text } = buildVerificationEmail({
    userName,
    verifyUrl,
    expiresInHours: VERIFICATION_TOKEN_TTL_HOURS,
  });

  const client = getResendClient();
  const { data, error } = await client.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new EmailDeliveryError(
      `Resend ha rifiutato l'invio: ${error.message ?? 'errore sconosciuto'}`,
      error
    );
  }
  if (!data?.id) {
    throw new EmailDeliveryError('Resend non ha restituito un id del messaggio.');
  }
  return { id: data.id };
}
