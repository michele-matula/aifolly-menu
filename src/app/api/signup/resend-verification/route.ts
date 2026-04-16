import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Rate limit per IP
  const ipRl = checkRateLimit(`resend-ip:${ip}`, 5, 60_000);
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: 'Troppi tentativi.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(ipRl.resetInMs / 1000)) } }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // Non rivelare se l'email esiste
    return NextResponse.json({ ok: true });
  }

  // Rate limit per email
  const emailRl = checkRateLimit(`resend:${email}`, 2, 60_000);
  if (!emailRl.allowed) {
    return NextResponse.json(
      { error: 'Troppi tentativi.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(emailRl.resetInMs / 1000)) } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, emailVerified: true },
  });

  // Non rivelare se l'email esiste o è già verificata
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString('hex');
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: tokenExpires,
    },
  });

  try {
    await sendVerificationEmail({ to: email, token, userName: user.name });
  } catch (err) {
    console.error('[resend-verification] Email send failed:', err);
  }

  return NextResponse.json({ ok: true });
}
