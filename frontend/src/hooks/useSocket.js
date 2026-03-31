import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

let socketInstance = null;

export const useSocket = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || initialized.current) return;

    initialized.current = true;

    socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001',
      {
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected:', socketInstance.id);
      socketInstance.emit('join-room', user._id);
    });

    socketInstance.on('notification', (notification) => {
      addNotification(notification);
      // Browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.svg',
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        initialized.current = false;
      }
    };
  }, [isAuthenticated, user?._id]);

  return socketInstance;
};

export const getSocket = () => socketInstance;