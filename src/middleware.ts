import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = new Set(['/', '/login', '/register', '/forgot-password', '/reset-password']);

const ROLE_PREFIX: Record<string, string> = {
  ADMIN: '/admin',
  DEV: '/dev',
  FINANCE: '/finance',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get('access_token')?.value ??
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
