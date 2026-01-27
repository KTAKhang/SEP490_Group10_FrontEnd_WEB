/**
 * Firebase Configuration for Frontend
 * 
 * HƯỚNG DẪN LẤY CONFIG:
 * 1. Vào Firebase Console: https://console.firebase.google.com/
 * 2. Chọn project: sep490-e18c1
 * 3. Vào Project Settings > General tab
 * 4. Scroll xuống "Your apps" section
 * 5. Nếu chưa có Web app, click "Add app" > Web icon
 * 6. Copy Firebase config object và paste vào đây
 * 
 * 
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase config từ environment variables
// Các biến được lấy từ file .env với prefix VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;

// Chỉ khởi tạo messaging nếu đang chạy trên browser (không phải SSR)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    // Register service worker first (if not already registered)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope'
        });
        console.log('Service Worker registered:', registration.scope);
      } catch (swError) {
        console.warn('Service Worker registration failed:', swError);
        // Continue anyway - Firebase might still work
      }
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      // VAPID key: Lấy từ Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.warn('VAPID key not configured. Please set VITE_FIREBASE_VAPID_KEY in .env');
        return null;
      }

      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        console.log('FCM token obtained:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } else {
      console.warn('Notification permission denied:', permission);
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages (when app is open)
 * @param {Function} callback - Callback function to handle messages
 */
export const onMessageListener = (callback) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {}; // Return empty unsubscribe function
  }

  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

export { messaging };
export default app;
