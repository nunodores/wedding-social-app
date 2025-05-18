import { NextResponse } from 'next/server';
import { Guest , Notification} from '@/lib/models';
import { sendNotification } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId, notification } = await req.json();

    // Get the user's FCM token from the database
    const guest = await Guest.findByPk(userId);
    if (!guest?.fcm_token) {
      return NextResponse.json(
        { error: 'User has no FCM token' },
        { status: 400 }
      );
    }
    console.log('====================================');
    console.log("CREATE NOTIFICATION");
    console.log('====================================');
      // Save notification in the DB
      await Notification.create({
        to_guest_id: userId,
        from_guest_id: notification.fromGuestId || null,
        post_id: notification.postId || null,
        type: notification.type, // 'like' | 'comment' | ...
        read_post: false,
      });

    // Send notification using Firebase Admin SDK
    const result = await sendNotification(guest.fcm_token, {
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });

    if (!result.success) {
      throw new Error('Failed to send notification');
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}