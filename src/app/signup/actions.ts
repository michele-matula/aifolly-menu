'use server';

import { randomBytes } from 'crypto';
import { hashSync } from 'bcryptjs';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { SignupSchema } from '@/lib/validators/signup';
import { sendVerificationEmail } from '@/lib/email';

type SignupResult =
  | { error?: undefined }
  | { error: string; fieldErrors?: Partial<Record<string, string>> };

export async function signupRestaurant(input: {
  restaurantName: string;
  ownerName: string;
  email: string;
  password: string;
  slug: string;
}): Promise<SignupResult> {
  // Rate limit
  const headersList = await headers();
  const ip = getClientIp(new Request('http://localhost', { headers: headersList }));
  const rl = checkRateLimit(`signup:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return { error: 'Troppi tentativi. Riprova tra qualche secondo.' };
  }

  // Validation
  const parsed = SignupSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: 'Verifica i campi evidenziati.', fieldErrors };
  }

  const { restaurantName, ownerName, email, password, slug } = parsed.data;

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Questo indirizzo email è già registrato.', fieldErrors: { email: 'Email già registrata' } };
  }

  // Check slug uniqueness
  const existingSlug = await prisma.restaurant.findUnique({ where: { slug } });
  if (existingSlug) {
    return { error: 'Questo indirizzo del menu è già in uso.', fieldErrors: { slug: 'Indirizzo già in uso' } };
  }

  // Create user + restaurant + verification token in a transaction
  const passwordHash = hashSync(password, 10);
  const token = randomBytes(32).toString('hex');
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const trialEndsAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  // Find the free-trial plan
  const freePlan = await prisma.plan.findFirst({
    where: { slug: 'free-trial' },
  });

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: ownerName,
        passwordHash,
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: tokenExpires,
      },
    });

    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        ownerId: user.id,
        planId: freePlan?.id ?? null,
        trialEndsAt,
      },
    });

    await tx.userRestaurant.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        role: 'OWNER',
      },
    });
  });

  // Send verification email (non-blocking: signup succeeds even if email fails)
  try {
    await sendVerificationEmail({ to: email, token, userName: ownerName });
  } catch (err) {
    console.error('[signup] Email verification send failed:', err);
  }

  return {};
}
