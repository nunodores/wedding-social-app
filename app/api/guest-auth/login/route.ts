import { NextResponse } from 'next/server';
import { signInGuest } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { email, password, weddingEventId } = await request.json();

    if (!email || !password || !weddingEventId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Authenticate guest
    const result = await signInGuest(email, password, weddingEventId);
    
    return NextResponse.json({
      guest: result.guest,
      session: result.session,
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 }
    );
  }
}