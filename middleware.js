import { NextResponse } from 'next/server';
import auth from '@/lib/auth.js';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/dashboard/login') {
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session?.user && session.user.is_active !== false) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // No valid session — let the login page render normally.
    }
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.is_active === false) {
      const loginUrl = new URL('/dashboard/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  } catch {
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
