// src/lib/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';


export async function getAuthSession() {
  return await getServerSession(authOptions);
}

// Role guard to use in API routes
export async function isAuthorized(role: 'admin' | 'team') {
  const session = await getAuthSession();
  return session?.user?.role === role;
}
