/**
 * @author KhoaNDCE170420
 * @file useFirebaseNotifications.js
 * @description Custom React hook for Firebase Cloud Messaging notifications.
 * 
 * This hook provides a convenient way to:
 * - Check if browser supports notifications
 * - Request notification permissions
 * - Register FCM tokens with backend
 * - Listen for foreground and background messages
 * - Display toast notifications when app is open
 * 
 * Usage:
 * const { fcmToken, registerToken, isSupported, requestPermissionAndRegister } = useFirebaseNotifications();
 * 
 * How to use for other features:
 * 
 * 1. The hook automatically listens for all Firebase messages and displays them.
 *    No additional code needed in your components.
 * 
 * 2. Notifications are automatically handled based on their data.type field:
 *    - Toast notifications appear when app is open (handled here)
 *    - Browser notifications appear when app is closed (handled by service worker)
 *    - Navigation is handled by notificationService.handleNotificationClick()
 * 
 * 3. To manually trigger notification permission request:
 *    const { requestPermissionAndRegister } = useFirebaseNotifications();
 *    await requestPermissionAndRegister();
 * 
 * 4. To check if notifications are supported:
 *    const { isSupported } = useFirebaseNotifications();
 *    if (isSupported) {
 *      // Show notification settings UI
 *    }
 * 
 * Note: This hook is automatically used by FirebaseNotificationProvider component.
 * You typically don't need to use it directly in other components.
 */

import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onMessageListener } from '../config/firebase';
import { registerFCMToken, handleNotificationClick } from '../services/notificationService';
import { toast } from 'react-toastify';

export const useFirebaseNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if browser supports notifications
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
        setIsSupported(true);
        return true;
      }
      setIsSupported(false);
      return false;
    };

    checkSupport();
  }, []);

  // Register FCM token with backend
  const registerToken = useCallback(async (token) => {
    if (!token) {
      console.warn('No token provided to register');
      return false;
    }

    setIsRegistering(true);
    try {
      const result = await registerFCMToken(token);
      
      if (result.status === 'OK') {
        console.log('FCM token registered successfully');
        setFcmToken(token);
        return true;
      } else {
        console.error('Failed to register FCM token:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  // Request permission and get token
  const requestPermissionAndRegister = useCallback(async () => {
    if (!isSupported) {
      console.warn('Notifications not supported in this browser');
      return null;
    }

    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        const registered = await registerToken(token);
        if (registered) {
          return token;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in requestPermissionAndRegister:', error);
      return null;
    }
  }, [isSupported, registerToken]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported) return;

    const unsubscribe = onMessageListener((payload) => {
      console.log('Foreground message received:', payload);
      
      const notification = payload.notification || {};
      const data = payload.data || {};
      
      // Dispatch custom event to notify NotificationBell to refresh
      // NotificationBell fetches notifications from database API
      // Notifications are already saved in database before FCM is sent
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fcm-notification-received', {
          detail: { notificationId: data.notificationId }
        }));
      }
      
      // Show toast notification
      if (notification.title || notification.body) {
        toast.info(notification.body || notification.title, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => {
            handleNotificationClick(data);
          }
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSupported]);

  // Handle service worker messages (background notifications)
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return;

    const handleMessage = (event) => {
      console.log('Background message received:', event.data);
      
      if (event.data) {
        const notification = event.data.notification;
        if (notification) {
          // Show browser notification
          new Notification(notification.title, {
            body: notification.body,
            icon: notification.image || '/logo.png',
            badge: '/logo.png',
            tag: 'notification',
            requireInteraction: false
          });
        }

        // Handle notification data
        if (event.data.data) {
          handleNotificationClick(event.data.data);
        }
      }
    };

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [isSupported]);

  return {
    fcmToken,
    isSupported,
    isRegistering,
    registerToken,
    requestPermissionAndRegister
  };
};
