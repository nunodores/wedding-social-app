import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: any;

// Only initialize messaging in browser environment
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

// Request permission and get FCM token
async function saveFcmToken(token: string) {
  try {
    const response = await fetch('/api/notifications/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Failed to save FCM token');
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return { success: false, error };
  }
}

export const requestNotificationPermission = async () => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn("This browser does not support notifications");
            return null;
        }

        // First register service worker
        const registration = await navigator.serviceWorker
            .register('/firebase-messaging-sw.js', {
                scope: '/',
                // Remove the type: 'module'
            });

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;

        // Then request notification permission
        const permission = await Notification.requestPermission();
        console.log('Permission status:', permission);

        if (permission !== "granted") {
            console.warn("Notification permission denied.");
            return null;
        }

        // Pass Firebase config to service worker
        registration.active?.postMessage({ 
            type: 'FIREBASE_CONFIG', 
            config: firebaseConfig 
        });

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (!token) {
            console.warn("Failed to retrieve FCM token.");
            return null;
        }

        // Save the token
        const result = await saveFcmToken(token);
        if (!result.success) {
            console.error("Error saving token:", result.error);
            return null;
        }

        return token;
    } catch (error) {
        console.error('Error requesting permission:', error);
        return null;
    }
};

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  return onMessage(messaging, callback);
}

export { app };