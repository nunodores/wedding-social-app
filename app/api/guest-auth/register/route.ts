import { NextResponse } from 'next/server';
import { registerGuest } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { name, email, password, weddingEventId } = await request.json();

    if (!name || !email || !password || !weddingEventId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Register guest
    const result = await registerGuest(name, email, password, weddingEventId);
    
    return NextResponse.json({
      guest: result.guest,
      session: result.session,
    });
  } catch (error) {
    console.error('Guest registration error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}