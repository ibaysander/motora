// @ts-ignore
import React, { createContext, useContext, FC, ReactNode } from 'react';
import { useNotification } from '../hooks';
import Notification from '../components/ui/Notification';

type NotificationType = 'success' | 'error';

interface NotificationContextType {
  setNotificationMessage: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: FC<NotificationProviderProps> = ({ children }) => {
  const { 
    showNotification, 
    notificationMessage, 
    notificationType, 
    setNotificationMessage, 
    hideNotification 
  } = useNotification();

  return (
    <NotificationContext.Provider value={{ setNotificationMessage }}>
      {children}
      
      {/* Global Notification Component */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        show={showNotification}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}; 