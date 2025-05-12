import { NextResponse } from 'next/server';
import { Guest } from '@/lib/models';
import { getSession } from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { token } = await req.json();
    
    // Update the guest's FCM token
    await Guest.update(
      { fcm_token: token },
      { where: { id: session.id } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to save token' },
      { status: 500 }
    );
  }
}