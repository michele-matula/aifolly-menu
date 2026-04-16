import type { NextAuthConfig } from 'next-auth';

// Auth config senza dipendenze Node.js — usato dal middleware (Edge Runtime)
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [], // Il provider Credentials è aggiunto in auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isSuperAdmin = auth?.user?.isSuperAdmin === true;

      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isLoginPage = nextUrl.pathname === '/admin/login';
      const isSuperRoute = nextUrl.pathname.startsWith('/super') || nextUrl.pathname.startsWith('/api/super');
      const isSignupRoute = nextUrl.pathname.startsWith('/signup') || nextUrl.pathname.startsWith('/verify-email');

      // /super/* e /api/super/* richiedono isSuperAdmin nel token.
      // Utenti non-super vengono rimandati alla home (un 404-style hard block,
      // la pagina /super non deve essere scopribile da non-Super Admin).
      if (isSuperRoute) {
        if (!isLoggedIn || !isSuperAdmin) {
          return Response.redirect(new URL('/admin/login', nextUrl));
        }
        return true;
      }

      // Signup + verify-email sono rotte pubbliche (o accessibili a utenti
      // loggati senza Restaurant per completare l'onboarding Google)
      if (isSignupRoute) return true;

      if (isAdminRoute && !isLoginPage && !isLoggedIn) {
        return false; // NextAuth redirects to signIn page
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = user.isSuperAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = token.isSuperAdmin ?? false;
      }
      return session;
    },
  },
};
