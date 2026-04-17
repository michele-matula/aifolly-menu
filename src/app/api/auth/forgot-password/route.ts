import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const ipRl = checkRateLimit(`forgot-pwd-ip:${ip}`, 5, 60_000);
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: 'Troppi tentativi.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(ipRl.resetInMs / 1000)) } }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: true });
  }

  const emailRl = checkRateLimit(`forgot-pwd:${email}`, 2, 60_000);
  if (!emailRl.allowed) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, passwordHash: true },
  });

  // Non rivelare se l'email esiste. Utenti Google-only (no passwordHash)
  // non hanno una password da resettare, ma non lo riveliamo.
  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString('hex');
  const tokenExpires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpiresAt: tokenExpires,
    },
  });

  try {
    await sendPasswordResetEmail({ to: email, token, userName: user.name });
  } catch (err) {
    console.error('[forgot-password] Email send failed:', err);
  }

  return NextResponse.json({ ok: true });
}
