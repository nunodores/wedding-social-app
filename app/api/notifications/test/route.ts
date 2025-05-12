import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { sendNotification } from '@/lib/firebase-admin';
import { Guest } from '@/lib/models';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the guest's FCM token
    const guest = await Guest.findByPk(session.id);
    if (!guest?.fcm_token) {
      return NextResponse.json(
        { error: 'No FCM token found' },
        { status: 400 }
      );
    }

    // Send a test notification
    const result = await sendNotification(guest.fcm_token, {
      title: 'Test Notification',
      body: 'If you see this, notifications are working! 🎉',
      data: {
        url: '/notifications'
      }
    });

    if (!result.success) {
      throw new Error('Failed to send notification');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}