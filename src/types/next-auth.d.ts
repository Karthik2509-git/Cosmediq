import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    branchId: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      branchId: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    branchId: string;
  }
}
