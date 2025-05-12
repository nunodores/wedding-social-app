import { NextResponse } from 'next/server';
import { Guest } from '@/lib/models';
import { getSession } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fcmToken } = await request.json();
    if (!fcmToken) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    // Update guest's FCM token
    await Guest.update(
      { fcm_token: fcmToken },
      { where: { id: session.id } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to update FCM token' },
      { status: 500 }
    );
  }
}