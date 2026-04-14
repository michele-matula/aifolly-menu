import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    isSuperAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      isSuperAdmin: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    isSuperAdmin?: boolean;
  }
}
