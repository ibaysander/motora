// @ts-ignore
import React, { createContext, useState, useEffect, useContext, FC, ReactNode } from 'react';

interface LayoutContextType {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  currentTab: 'products' | 'categories' | 'brands';
  setCurrentTab: (tab: 'products' | 'categories' | 'brands') => void;
}

const defaultLayoutContext: LayoutContextType = {
  isDarkMode: false,
  setIsDarkMode: () => {},
  isExpanded: true,
  setIsExpanded: () => {},
  currentTab: 'products',
  setCurrentTab: () => {}
};

export const LayoutContext = createContext<LayoutContextType>(defaultLayoutContext);

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: FC<LayoutProviderProps> = ({ children }) => {
  // Initialize with values from localStorage or defaults
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved === 'false' ? false : true; // Default to true if not set
  });
  
  const [currentTab, setCurrentTab] = useState<'products' | 'categories' | 'brands'>('products');
  
  // Update localStorage whenever dark mode changes
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Update localStorage whenever sidebar state changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', isExpanded.toString());
  }, [isExpanded]);
  
  const value = {
    isDarkMode,
    setIsDarkMode,
    isExpanded,
    setIsExpanded,
    currentTab,
    setCurrentTab
  };
  
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}; 