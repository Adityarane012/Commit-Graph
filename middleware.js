import { NextResponse } from 'next/server';

export function middleware(request) {
  // Protect /repositories, /repo, and /github paths
  if (request.nextUrl.pathname.startsWith('/repositories') || request.nextUrl.pathname.startsWith('/repo') || request.nextUrl.pathname.startsWith('/github')) {
    // Check for our simple auth cookie
    const authCookie = request.cookies.get('commitgraph_auth');
    
    // If not authenticated, redirect to login
    if (!authCookie || authCookie.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
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
