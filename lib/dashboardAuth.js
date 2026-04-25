import { headers } from 'next/headers';
import auth from '@/lib/auth.js';

export async function getAuthenticatedUser(request) {
  try {
    let reqHeaders;
    if (request instanceof Request) {
      reqHeaders = request.headers;
    } else {
      reqHeaders = await headers();
    }

    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user || session.user.is_active === false) return null;
    return session.user;
  } catch {
    return null;
  }
}

export async function requireAdmin(request) {
  const user = await getAuthenticatedUser(request);
  if (!user || user.role !== 'admin') {
    return { error: 'Forbidden', status: 403 };
  }
  return user;
}
