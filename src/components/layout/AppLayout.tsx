// @ts-ignore
import React, { FC, ReactNode } from 'react';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';
import { useLayout } from '../../contexts/LayoutContext';

interface AppLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

/**
 * Layout component for the application, includes sidebar, notifications, etc.
 */
const AppLayout: FC<AppLayoutProps> = ({ children, onLogout }) => {
  const { isDarkMode, isExpanded, setIsExpanded, currentTab, setCurrentTab } = useLayout();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarToggle 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded} 
        isDarkMode={isDarkMode}
      />
      <div className="flex">
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          isDarkMode={isDarkMode}
          onLogout={onLogout}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
        <main className={`flex-1 ${isExpanded ? 'ml-40' : 'ml-0'} transition-all duration-200`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 