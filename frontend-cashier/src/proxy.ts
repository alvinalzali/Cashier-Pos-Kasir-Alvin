// src/middleware.ts ke proxy.ts
// menghindari kebingungan middleware dan proxy
// source: https://nextjs.org/docs/messages/middleware-to-proxy

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // fungsi middleware ini akan dijalankan untuk setiap request
  // untuk cek token pada header dan redirect

  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // cek token pada header
  if (!token && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/',
            '/dashboard/:path*',
            '/products/:path*',
            '/cart/:path*',
            '/history/:path*',
            '/auth/:path*'],
};