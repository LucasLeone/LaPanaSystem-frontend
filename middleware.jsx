import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;


  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/_next',
    '/favicon.ico',
    '/public',
  ];

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;
  const userCookie = request.cookies.get('user')?.value;

  if (!token || !userCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = JSON.parse(userCookie);
    const userRole = user.user_type;


    if (pathname === '/dashboard') {
      return NextResponse.next();
    }

    const roleAllowedPaths = {
      SELLER: [
        '/',
        '/dashboard/products',
        '/dashboard/expenses',
        '/dashboard/sales',
        '/dashboard/profile',
      ],
      DELIVERY: [
        '/dashboard/returns',
        '/dashboard/delivery',
        '/dashboard/collect',
        '/dashboard/profile',
      ],
    };

    if (userRole === 'ADMIN') {
      return NextResponse.next();
    }

    const allowedPaths = roleAllowedPaths[userRole] || [];

    const isAllowed = allowedPaths.some(
      path => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!isAllowed) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error al procesar el middleware:', error);
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
