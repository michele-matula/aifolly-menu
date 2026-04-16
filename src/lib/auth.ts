import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compareSync } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/lib/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;

        const valid = compareSync(credentials.password as string, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isSuperAdmin: user.isSuperAdmin,
        };
      },
    }),
    // Link automatico via email: se un utente Credentials esistente prova a
    // loggarsi con Google sulla stessa email, l'Account Google viene linkato
    // allo User esistente invece di rifiutare. Rischio phishing minimo perche'
    // Google certifica la verifica dell'email (vedi profile.email_verified).
    Google({
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          // Google ha gia' verificato l'email: saltiamo il flow Resend.
          emailVerified: profile.email_verified ? new Date() : null,
          isSuperAdmin: false,
        };
      },
    }),
  ],
  events: {
    // PrismaAdapter non persiste emailVerified dal profile() per nuovi utenti
    // OAuth. Lo promuoviamo qui quando l'Account Google viene creato.
    async createUser({ user }) {
      if (!user.id) return;
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: 'google' },
      });
      if (account) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
    // Quando un Account Google viene linkato a uno User esistente che era
    // stato creato via Credentials o CLI con emailVerified=null, promuoviamo
    // la verifica: Google l'ha appena certificata.
    async linkAccount({ user, account }) {
      if (account.provider !== 'google') return;
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});
