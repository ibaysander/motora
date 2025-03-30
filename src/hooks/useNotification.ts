// @ts-ignore
import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error';

interface UseNotificationResult {
  showNotification: boolean;
  notificationMessage: string;
  notificationType: NotificationType;
  setNotificationMessage: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

/**
 * Custom hook for managing notifications in the application
 * @returns Object containing notification state and methods to control it
 */
export const useNotification = (): UseNotificationResult => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('success');

  const setNotificationMessage = useCallback((message: string, type: NotificationType = 'success') => {
    setMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  }, []);

  const hideNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  return {
    showNotification,
    notificationMessage,
    notificationType,
    setNotificationMessage,
    hideNotification
  };
}; 