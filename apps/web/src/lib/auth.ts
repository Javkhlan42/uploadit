import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if ((user as any).role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}
