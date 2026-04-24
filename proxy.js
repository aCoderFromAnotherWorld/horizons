import { NextResponse } from 'next/server';
import auth from '@/lib/auth.js';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/dashboard/login') {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.is_active === false) {
      const loginUrl = new URL('/dashboard/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/dashboard/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
