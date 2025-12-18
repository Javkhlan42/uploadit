'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Github } from 'lucide-react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="hidden md:block">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-gray-500">{(session.user as any).role}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
    >
      <Github className="h-4 w-4" />
      Sign in with GitHub
    </button>
  );
}
