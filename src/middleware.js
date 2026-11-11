import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { ROLES, ROLE_HOME } from '@/shared/constants';

// Server-side route protection (previously only a client-side redirect, so
// protected pages were served to anonymous users).
const ROLE_FOR_PREFIX = [
  ['/admin', ROLES.ADMIN],
  ['/customer', ROLES.CUSTOMER],
];

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const { pathname } = req.nextUrl;
    const required = ROLE_FOR_PREFIX.find(([prefix]) => pathname.startsWith(prefix))?.[1];
    if (required && role !== required) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] || '/login', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => Boolean(token) },
    pages: { signIn: '/login' },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/customer/:path*', '/account/:path*'],
};
