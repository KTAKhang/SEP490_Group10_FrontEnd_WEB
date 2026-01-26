/**
 * @author KhoaNDCE170420
 * @file firebase-messaging-sw.js
 * @description Firebase Cloud Messaging Service Worker for handling background notifications.
 * 
 * This service worker handles push notifications when the app is closed or in the background.
 * It displays browser notifications and handles click events to navigate users to relevant pages.
 * 
 * Important:
 * - This file MUST be in the public/ directory for Vite to serve it correctly
 * - Service workers run in a separate context and cannot access localStorage or React state
 * - Firebase config must be hardcoded here (cannot use environment variables)
 * 
 * How to customize for other features:
 * 
 * 1. Update notification click handler to support new notification types:
 * 
 *    if (data.type === 'order') {
 *      event.waitUntil(
 *        clients.openWindow('/customer/orders')
 *      );
 *    }
 * 
 *    if (data.type === 'contact') {
 *      event.waitUntil(
 *        clients.openWindow('/customer/contact-history')
 *      );
 *    }
 * 
 * 2. Customize notification appearance:
 *    const notificationOptions = {
 *      body: payload.notification?.body || '',
 *      icon: '/custom-icon.png',  // Change icon
 *      badge: '/badge.png',       // Change badge
 *      tag: 'notification',
 *      requireInteraction: true,  // Keep notification until user interacts
 *      data: payload.data || {}
 *    };
 * 
 * 3. Add custom notification actions (if needed):
 *    const notificationOptions = {
 *      // ... other options
 *      actions: [
 *        { action: 'view', title: 'View' },
 *        { action: 'dismiss', title: 'Dismiss' }
 *      ]
 *    };
 * 
 * Note: Service worker is automatically registered by firebase.js when requesting
 * notification permission. No manual registration needed.
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config - sử dụng cùng config với frontend
// Lưu ý: Service worker không thể truy cập import.meta.env, nên cần hardcode hoặc inject từ build
const firebaseConfig = {
  apiKey: "AIzaSyCBtfvbEzubRScxD2KxY276G5V3rr5XG7Q",
  authDomain: "sep490-e18c1.firebaseapp.com",
  projectId: "sep490-e18c1",
  storageBucket: "sep490-e18c1.firebasestorage.app",
  messagingSenderId: "758300195194",
  appId: "1:758300195194:web:01eba631d378d78e3f7ec3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.image || '/logo.png',
    badge: '/logo.png',
    tag: 'notification',
    requireInteraction: false,
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();

  // Handle click action based on notification data
  const data = event.notification.data || {};
  
  // Service worker cannot access localStorage, so we'll use a default path
  // The frontend notificationService will handle role-based navigation
  // For service worker, we'll navigate to a common path and let the app handle routing
  if (data.action === 'view_voucher' || data.action === 'view_discount' || data.type === 'discount') {
    // Default to customer vouchers page (most common case)
    // If user is admin/sales-staff, they can navigate from there or the app will redirect
    event.waitUntil(
      clients.openWindow('/customer/vouchers')
    );
  } else {
    // Default: open app root
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
