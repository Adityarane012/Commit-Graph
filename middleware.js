import { NextResponse } from 'next/server';

export function middleware(request) {
  // Authentication removed for frictionless hackathon demo
  return NextResponse.next();
}

export const config = {
  // Apply middleware to specific routes
  matcher: [
    '/repositories/:path*',
    '/repo/:path*',
    '/github/:path*',
  ],
};
