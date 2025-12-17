import { auth } from './auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  
  if (session.user.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  return session;
}
