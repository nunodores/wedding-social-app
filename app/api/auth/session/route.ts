import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(null);
    }
    return NextResponse.json(session);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(null);
  }
}