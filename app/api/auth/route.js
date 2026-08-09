import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { action, password } = await request.json();
    
    if (action === 'login') {
      // Hardcoded hackathon password for demonstration
      if (password === 'devengers2026') {
        const response = NextResponse.json({ success: true });
        
        // Set secure HttpOnly cookie
        response.cookies.set({
          name: 'commitgraph_auth',
          value: 'authenticated',
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        
        return response;
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid password' }, 
          { status: 401 }
        );
      }
    } 
    
    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      
      // Clear the cookie
      response.cookies.delete('commitgraph_auth');
      
      return response;
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
