/**
 * @author KhoaNDCE170420
 * @file NotificationBell.jsx
 * @description Notification bell component that displays notifications in a dropdown popup.
 * 
 * This component:
 * - Fetches notifications from backend API
 * - Displays unread count badge on bell icon
 * - Shows dropdown with scrollable notification list
 * - Handles marking notifications as read
 * - Navigates user when clicking on notifications
 * 
 * Design System:
 * - Uses Remix Icons (ri-*)
 * - Color palette: green-600/700/800, gray-900 for headings, gray-600/700 for body
 * - Typography: font-bold/black for headings, font-normal/medium for body
 * - Layout: rounded-2xl, shadow-xl, airy spacing
 * - Cards: white bg, rounded-2xl, hover effects
 * 
 * How it works:
 * - Fetches notifications on mount and when user clicks bell
 * - Polls for new notifications periodically
 * - Updates unread count badge automatically
 * - Handles click events to navigate based on notification data
 * 
 * Usage:
 * <NotificationBell />
 */

import { useState, useEffect, useRef } from 'react';
import apiClient from '../../utils/axiosConfig';
import { handleNotificationClick as handleNotificationClickService } from '../../services/notificationService';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications', {
        params: {
          page: pageNum,
          limit: 20
        }
      });

      if (response.data.status === 'OK') {
        const newNotifications = response.data.data || [];
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        setUnreadCount(response.data.unreadCount || 0);
        setHasMore(newNotifications.length === 20);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only (lightweight)
  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      if (response.data.status === 'OK') {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      // If dropdown is open, refresh notifications
      if (isOpen) {
        fetchNotifications(1, false);
      }
    }, 30000);

    // Listen for FCM notification events (when new FCM notification arrives)
    const handleFCMNotification = () => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications(1, false);
      }
    };

    window.addEventListener('fcm-notification-received', handleFCMNotification);

    return () => {
      clearInterval(interval);
      window.removeEventListener('fcm-notification-received', handleFCMNotification);
    };
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false);
      setPage(1);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle scroll to load more
  const handleScroll = () => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      
      if (response.data.status === 'OK') {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      
      if (response.data.status === 'OK') {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      handleMarkAsRead(notification._id, { stopPropagation: () => {} });
    }

    // Navigate based on notification data
    if (notification.data) {
      handleNotificationClickService(notification.data);
    }

    setIsOpen(false);
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return notificationDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <i className="ri-notification-3-line text-2xl text-gray-700"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl z-50 max-h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-black text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <i className="ri-close-line text-lg text-gray-600"></i>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-1"
          >
            {loading && notifications.length === 0 ? (
              <div className="py-20 px-6 text-center">
                <i className="ri-loader-4-line text-4xl text-green-600 animate-spin mb-4"></i>
                <p className="text-gray-600 font-medium">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 px-6 text-center">
                <i className="ri-notification-off-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600 font-medium">No notifications</p>
                <p className="text-sm text-gray-500 mt-2">You're all caught up!</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all ${
                      !notification.isRead ? 'bg-green-50 border-l-4 border-l-green-600' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon based on type */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        !notification.isRead 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {notification.type === 'discount' && (
                          <i className="ri-coupon-line text-xl"></i>
                        )}
                        {notification.type === 'order' && (
                          <i className="ri-shopping-bag-line text-xl"></i>
                        )}
                        {notification.type === 'contact' && (
                          <i className="ri-customer-service-line text-xl"></i>
                        )}
                        {notification.type === 'product' && (
                          <i className="ri-product-hunt-line text-xl"></i>
                        )}
                        {notification.type === 'news' && (
                          <i className="ri-newspaper-line text-xl"></i>
                        )}
                        {notification.type === 'preorder' && (
                          <i className="ri-shopping-cart-line text-xl"></i>
                        )}
                        {!['discount', 'order', 'contact', 'product', 'news', 'preorder'].includes(notification.type) && (
                          <i className="ri-notification-line text-xl"></i>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={`text-sm font-bold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="ml-2 w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 font-medium">
                            {formatTime(notification.createdAt)}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification._id, e)}
                              className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && hasMore && (
                  <div className="py-6 px-6 text-center">
                    <i className="ri-loader-4-line text-2xl text-green-600 animate-spin mb-2"></i>
                    <p className="text-sm text-gray-500 font-medium">Loading more...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-center text-gray-600 font-medium">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && (
                  <span className="ml-2 text-green-600 font-bold">
                    • {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
