import { NextResponse } from 'next/server';
import sql from '@/lib/db/index.js';

// Cookie name must match the cookiePrefix in lib/auth.js: 'horizons' → 'horizons.session_token'
const SESSION_COOKIE = 'horizons.session_token';

/**
 * GET /api/auth/signout
 *
 * Server-side sign-out that is immune to client-side fetch timing issues.
 * The browser navigates here directly (window.location.href), which means:
 *   1. The session is deleted from the database
 *   2. The cookie is force-cleared via Set-Cookie in this response
 *   3. The browser follows the redirect to /dashboard/login *after* processing
 *      Set-Cookie — so proxy.js sees no cookie and passes through cleanly
 */
export async function GET(request) {
  // Read the session token directly from the cookie header (works with any JS runtime)
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)horizons\.session_token=([^;]+)/);
  const token = match?.[1] ? decodeURIComponent(match[1]) : null;

  if (token) {
    try {
      // Delete the session row directly — bypasses any potential issues with
      // Better Auth's sign-out handler while guaranteeing DB cleanup.
      await sql`DELETE FROM "session" WHERE token = ${token}`;
    } catch {
      // Continue even if deletion fails; the cookie clear below is the hard guarantee.
    }
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const clearCookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;

  const response = NextResponse.redirect(new URL('/dashboard/login', request.url));
  response.headers.set('Set-Cookie', clearCookie);
  return response;
}
