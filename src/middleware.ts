import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthRoute = nextUrl.pathname.startsWith('/login');
  
  // Dashboard routes
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isStaffRoute = nextUrl.pathname.startsWith('/staff');
  const isDoctorRoute = nextUrl.pathname.startsWith('/doctor');
  const isPatientRoute = nextUrl.pathname.startsWith('/patient');

  // 1. If visiting /login while logged in, redirect to respective dashboard
  if (isAuthRoute && isLoggedIn && userRole) {
    const dashboardMap: Record<string, string> = {
      ADMIN: '/admin',
      STAFF: '/staff',
      DOCTOR: '/doctor',
      PATIENT: '/patient',
    };
    return NextResponse.redirect(new URL(dashboardMap[userRole] || '/', nextUrl));
  }

  // 2. Strict Role Checks
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  if (isStaffRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  if (isDoctorRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (userRole !== 'DOCTOR' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  if (isPatientRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (userRole !== 'PATIENT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  return NextResponse.next();
});

// Configure middleware matcher for all panel folders and authentication routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/doctor/:path*',
    '/patient/:path*',
    '/login',
  ],
};
