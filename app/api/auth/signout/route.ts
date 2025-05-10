import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth-server';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}