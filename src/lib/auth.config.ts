import type { NextAuthConfig } from 'next-auth';

// Auth config senza dipendenze Node.js — usato dal middleware (Edge Runtime)
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [], // Il provider Credentials è aggiunto in auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isLoginPage = nextUrl.pathname === '/admin/login';

      if (isAdminRoute && !isLoginPage && !isLoggedIn) {
        return false; // NextAuth redirects to signIn page
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
