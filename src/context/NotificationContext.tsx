import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationContextType, NotificationType } from '../types';

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  hideNotification: () => {},
});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationState {
  message: string;
  type: NotificationType;
  isVisible: boolean;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => {
      hideNotification();
    }, 3000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification.isVisible && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}; 