import React from 'react';
import { useTheme } from '../../context/ThemeContext';

type TabType = 'products' | 'categories' | 'brands';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const { isDarkMode } = useTheme();

  return (
    <nav className={`flex space-x-4 p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
      <button
        className={`px-4 py-2 text-lg font-semibold ${
          currentTab === 'products' 
            ? 'text-blue-500 border-b-2 border-blue-500' 
            : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600'
        }`}
        onClick={() => onTabChange('products')}
      >
        Products
      </button>
      <button
        className={`px-4 py-2 text-lg font-semibold ${
          currentTab === 'categories' 
            ? 'text-blue-500 border-b-2 border-blue-500' 
            : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600'
        }`}
        onClick={() => onTabChange('categories')}
      >
        Categories
      </button>
      <button
        className={`px-4 py-2 text-lg font-semibold ${
          currentTab === 'brands' 
            ? 'text-blue-500 border-b-2 border-blue-500' 
            : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600'
        }`}
        onClick={() => onTabChange('brands')}
      >
        Brands
      </button>
    </nav>
  );
}; 