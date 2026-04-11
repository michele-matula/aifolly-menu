import { NextResponse, type NextRequest } from 'next/server';
import { handlers } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const { GET } = handlers;

// Rate limit the Credentials login callback to mitigate brute-force.
// Spec §13.1: 5 req/min per IP. Other NextAuth POST routes (signout,
// session, csrf, providers, OAuth callbacks) pass through untouched.
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.endsWith('/callback/credentials')) {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`login:${ip}`, 5, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche secondo.' },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil(rate.resetInMs / 1000).toString() },
        }
      );
    }
  }
  return handlers.POST(request);
}
