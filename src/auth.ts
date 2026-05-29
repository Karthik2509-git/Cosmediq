import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { authConfig } from '@/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Query User from Database
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash || !user.isActive) {
          return null;
        }

        // Compare Hashed Password
        const passwordMatches = bcrypt.compareSync(password, user.passwordHash);

        if (passwordMatches) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId,
          };
        }

        return null;
      },
    }),
  ],
});
