import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  basePath: '/api/auth',
  session: {
    strategy: 'database', // Use database sessions with adapter
  },
  callbacks: {
    async session({ session, user }) {
      // Add role to session from database user
      if (session.user && user) {
        session.user.role = (user as { role?: string }).role || 'user';
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  trustHost: true, // Trust the host in production
});
