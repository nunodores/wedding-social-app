import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

// Initialize Firebase Cloud Messaging
let messaging: any;

// Only initialize messaging in browser environment
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export async function subscribeToNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  return onMessage(messaging, callback);
}

export async function sendNotification(userId: string, title: string, body: string, data?: any) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification: {
          title,
          body,
          data,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}