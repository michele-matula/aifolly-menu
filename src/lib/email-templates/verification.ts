type VerificationEmailInput = {
  userName?: string | null;
  verifyUrl: string;
  expiresInHours: number;
};

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export function buildVerificationEmail(input: VerificationEmailInput): EmailTemplate {
  const { userName, verifyUrl, expiresInHours } = input;
  const greeting = userName ? `Ciao ${escapeHtml(userName)},` : 'Ciao,';
  const greetingText = userName ? `Ciao ${userName},` : 'Ciao,';

  const subject = 'Verifica la tua email — AiFolly Menu';

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:40px 40px 24px 40px;">
              <h1 style="margin:0 0 24px 0;font-size:24px;font-weight:600;color:#18181b;">Benvenuto su AiFolly Menu</h1>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;">${greeting}</p>
              <p style="margin:0 0 24px 0;font-size:16px;line-height:1.5;">
                Grazie per esserti registrato. Per attivare il tuo account e iniziare il trial gratuito di 15 giorni, verifica la tua email cliccando sul bottone qui sotto.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                <tr>
                  <td style="border-radius:8px;background:#18181b;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:8px;">Verifica la mia email</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;color:#71717a;">
                Oppure copia e incolla questo link nel tuo browser:
              </p>
              <p style="margin:0 0 24px 0;font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="${verifyUrl}" style="color:#2563eb;text-decoration:underline;">${verifyUrl}</a>
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.5;color:#71717a;">
                Il link scade tra ${expiresInHours} ore. Se non hai creato tu questo account, puoi ignorare questo messaggio.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e4e4e7;font-size:13px;color:#a1a1aa;">
              AiFolly Menu — Menu digitali per ristoranti e bar
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${greetingText}

Grazie per esserti registrato su AiFolly Menu. Per attivare il tuo account
e iniziare il trial gratuito di 15 giorni, verifica la tua email aprendo
questo link:

${verifyUrl}

Il link scade tra ${expiresInHours} ore. Se non hai creato tu questo
account, puoi ignorare questo messaggio.

— AiFolly Menu`;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
