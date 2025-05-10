import { NextResponse } from 'next/server';
import { verifyEventAccess } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { slug, password } = await request.json();

    if (!slug || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify wedding event access
    const event = await verifyEventAccess(slug, password);
    
    if (!event) {
      return NextResponse.json(
        { message: 'Invalid event credentials' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      weddingEventId: event.id,
      name: event.name,
    });
  } catch (error) {
    console.error('Event auth error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}