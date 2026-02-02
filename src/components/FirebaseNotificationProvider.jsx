/**
 * @author KhoaNDCE170420
 * @file FirebaseNotificationProvider.jsx
 * @description Provider component that automatically registers FCM tokens when user is authenticated.
 * 
 * This component wraps the app and automatically requests notification permission
 * and registers FCM tokens with the backend when a user logs in.
 * 
 * How it works:
 * - Monitors authentication state via AuthContext
 * - Automatically requests notification permission when user is authenticated
 * - Registers FCM token with backend API
 * - Handles errors gracefully without breaking the app
 * 
 * How to use for other features:
 * 
 * 1. This component is already integrated in App.jsx, no changes needed.
 * 
 * 2. To add notifications for new features, you only need to:
 *    - Send notifications from backend (see NotificationService.js documentation)
 *    - Update notificationService.js to handle new notification types
 * 
 * 3. The component automatically handles:
 *    - Permission requests
 *    - Token registration
 *    - Message listening (via useFirebaseNotifications hook)
 * 
 * 4. If you need to manually trigger token registration:
 *    const { requestPermissionAndRegister } = useFirebaseNotifications();
 *    await requestPermissionAndRegister();
 * 
 * Note: This component should wrap your entire app in App.jsx to ensure
 * notifications work for all authenticated users.
 */

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseNotifications } from '../hooks/useFirebaseNotifications';

const FirebaseNotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { requestPermissionAndRegister, isSupported } = useFirebaseNotifications();

  // Auto-register FCM token when user is authenticated
  useEffect(() => {
    if (isAuthenticated() && isSupported) {
      // Delay a bit to ensure Firebase is fully initialized
      const timer = setTimeout(() => {
        requestPermissionAndRegister().catch(err => {
          console.warn('Failed to register FCM token:', err);
        });
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isSupported, requestPermissionAndRegister]);

  return <>{children}</>;
};

export default FirebaseNotificationProvider;
