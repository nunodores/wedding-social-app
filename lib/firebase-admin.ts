import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin
const apps = getApps();

if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminMessaging = getMessaging();

export async function sendNotification(token: string, notification: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
    };

    const response = await adminMessaging.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
}

export async function sendPostLikeNotification(
  receiverFcmToken: string,
  likerName: string,
) {
  try {
    console.log('====================================');
    console.log(receiverFcmToken);
    console.log('====================================');
    return await sendNotification(receiverFcmToken, {
      title: 'New Like',
      body: `${likerName} liked your post`,
      data: {
        type: 'POST_LIKE',
      }
    });
  } catch (error) {
    console.error('Error sending like notification:', error);
    return false;
  }
}