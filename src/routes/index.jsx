/**
 * @author KhoaNDCE170420
 * @file notificationService.js
 * @description Service to handle FCM token registration and notification click handling.
 *
 * This service provides functions to:
 * - Register FCM tokens with the backend API
 * - Handle notification clicks and navigate to appropriate pages based on notification type
 *
 * How to add notifications for other features:
 *
 * 1. In your backend service, send notification with appropriate data:
 *    await NotificationService.sendToUser(userId, {
 *      title: "Your Title",
 *      body: "Your message",
 *      data: {
 *        type: "your_feature",  // e.g., "order", "contact", "product"
 *        action: "view_detail", // e.g., "view_order", "view_contact"
 *        // Add any additional data needed for navigation
 *        orderId: "123",
 *        contactId: "456"
 *      }
 *    });
 *
 * 2. Update handleNotificationClick function below to handle your new type:
 *
 *    if (notificationData?.type === 'order') {
 *      if (notificationData?.action === 'view_order') {
 *        const orderId = notificationData?.orderId;
 *        window.location.href = `/customer/orders/${orderId}`;
 *      }
 *    }
 *
 *    if (notificationData?.type === 'contact') {
 *      if (notificationData?.action === 'view_contact') {
 *        window.location.href = '/customer/contact-history';
 *      }
 *    }
 *
 * 3. Update service worker (firebase-messaging-sw.js) if you need different
 *    default navigation for background notifications.
 *
 * 4. The notification will automatically appear as:
 *    - Browser notification (when app is closed/background)
 *    - Toast notification (when app is open) - handled by useFirebaseNotifications hook
 */


import apiClient from '../utils/axiosConfig';


/**
 * Register FCM token with backend
 * @param {string} fcmToken - FCM token from Firebase
 * @returns {Promise<Object>} Response from backend
 */
export const registerFCMToken = async (fcmToken) => {
  try {
    if (!fcmToken) {
      throw new Error('FCM token is required');
    }


    const response = await apiClient.post('/notifications/register-token', {
      fcmToken: fcmToken
    });


    return response.data;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    throw error;
  }
};


/**
 * Handle notification click (when user clicks on notification)
 * @param {Object} notificationData - Data from notification
 */
export const handleNotificationClick = (notificationData) => {
  console.log('Notification clicked:', notificationData);
 
  // Get user role from localStorage (role is stored separately, not in user object)
  const userRole = localStorage.getItem('role') || '';
 
  // Handle different notification types
  if (notificationData?.type === 'discount') {
    // Navigate to discount/voucher page based on user role
    if (notificationData?.action === 'view_voucher' || notificationData?.action === 'view_discount') {
      let path = '/';
     
      // Normalize role (support both underscore and dash formats)
      const normalizedRole = userRole.replace(/_/g, '-');
     
      // Determine path based on user role
      if (normalizedRole === 'customer') {
        path = '/customer/vouchers';
      } else if (normalizedRole === 'admin') {
        path = '/admin/discounts';
      } else if (normalizedRole === 'sales-staff') {
        path = '/sale-staff/discounts';
      } else {
        // Default: try customer path first, fallback to home
        path = '/customer/vouchers';
      }
     
      console.log('Navigating to:', path, 'for role:', normalizedRole);
      window.location.href = path;
    }
  }


  if (notificationData?.type === 'preorder') {
    if (notificationData?.action === 'view_my_preorders') {
      window.location.href = '/customer/my-pre-orders';
    }
  }


  // Order: backend chỉ gửi thông báo khi admin cập nhật trạng thái đơn (action: view_order)
  if (notificationData?.type === 'order') {
    const orderId = notificationData?.orderId;
    if (notificationData?.action === 'view_order' && orderId) {
      window.location.href = `/customer/orders/${orderId}`;
      return;
    }
    if (orderId) {
      window.location.href = `/customer/orders/${orderId}`;
    }
  }
};




