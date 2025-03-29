// @ts-ignore
import React, { FC, ReactNode } from 'react';
import { LayoutProvider } from '../contexts/LayoutContext';
import { NotificationProvider } from '../contexts/NotificationContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps all application providers in a single component
 */
const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <LayoutProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </LayoutProvider>
  );
};

export default AppProviders; 