// @ts-ignore
import React, { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { LayoutProvider } from '../contexts/LayoutContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import store from '../store';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps all application providers in a single component
 */
const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <LayoutProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </LayoutProvider>
    </Provider>
  );
};

export default AppProviders; 