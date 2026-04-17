import { NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const ipRl = checkRateLimit(`reset-pwd-ip:${ip}`, 10, 60_000);
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!token) {
    return NextResponse.json({ error: 'Token mancante.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'La password deve avere almeno 8 caratteri.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
    select: {
      id: true,
      email: true,
      passwordResetTokenExpiresAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Token non valido o già utilizzato.' },
      { status: 400 }
    );
  }

  if (
    user.passwordResetTokenExpiresAt &&
    user.passwordResetTokenExpiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: 'Il link è scaduto. Richiedi un nuovo reset della password.' },
      { status: 400 }
    );
  }

  const passwordHash = hashSync(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
