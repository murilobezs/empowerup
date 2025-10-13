import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children, pollInterval = 30000 }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      if (!isMountedRef.current) return;
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setHasLoaded(false);
      setLastUpdatedAt(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getNotifications();
      
      if (!isMountedRef.current) return;

      if (response?.success && response.notifications) {
        const notificationsArray = Array.isArray(response.notifications) ? response.notifications : [];
        
        setNotifications(notificationsArray);
        setUnreadCount(response.unread_count || 0);
        setError(null);
        setHasLoaded(true);
        setLastUpdatedAt(new Date().toISOString());
      } else {
        setError(response?.message || 'Erro ao buscar notificações');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err?.message || 'Erro ao buscar notificações');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setHasLoaded(false);
      setLastUpdatedAt(null);
      return;
    }

    fetchNotifications();

    if (pollInterval && pollInterval > 0) {
      const intervalId = setInterval(fetchNotifications, pollInterval);
      return () => {
        clearInterval(intervalId);
      };
    }

    return undefined;
  }, [user, pollInterval, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return false;

    const target = notifications.find(notif => notif.id === notificationId);
    const wasUnread = target ? !target.is_read : true;

    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response?.success) {
        setNotifications(prev => prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        ));
        if (wasUnread) {
          setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
        }
        setLastUpdatedAt(new Date().toISOString());
        return true;
      }
      return false;
    } catch (err) {
      console.error('NotificationsProvider - erro ao marcar como lida:', err);
      return false;
    }
  }, [user, notifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return false;

    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response?.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        setUnreadCount(0);
        setLastUpdatedAt(new Date().toISOString());
        return true;
      }
      return false;
    } catch (err) {
      console.error('NotificationsProvider - erro ao marcar todas como lidas:', err);
      return false;
    }
  }, [user]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    hasLoaded,
    lastUpdatedAt,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }), [notifications, unreadCount, loading, error, hasLoaded, lastUpdatedAt, fetchNotifications, markAsRead, markAllAsRead]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === null) {
    throw new Error('useNotifications deve ser utilizado dentro de NotificationsProvider');
  }
  return context;
};
