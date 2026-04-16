import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`check-slug:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Troppi tentativi.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug || slug.length < 3 || slug.length > 60 || !slugRegex.test(slug)) {
    return NextResponse.json({ available: false });
  }

  const existing = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
