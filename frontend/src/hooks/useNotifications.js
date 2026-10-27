import { useState, useEffect, useRef, useCallback } from 'react';
import notificationsService from '../services/notificationsService.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function useNotifications() {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const seenIdsRef = useRef(new Set());
  const isFirstLoad = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user || user.role !== 'STUDENT') {
      setNotifications([]);
      return;
    }
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);

      // Trigger swipe toast for newly arrived notifications after first load
      if (!isFirstLoad.current) {
        list.forEach((n) => {
          if (!n.is_read && !seenIdsRef.current.has(n.id)) {
            toast.info(n.title, n.message || n.description || '');
          }
        });
      }

      // Record seen IDs
      list.forEach((n) => seenIdsRef.current.add(n.id));
      isFirstLoad.current = false;
    } catch (err) {
      // Background polling: fail silently
      console.error('Failed to poll notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAllAsRead,
  };
}

export default useNotifications;
