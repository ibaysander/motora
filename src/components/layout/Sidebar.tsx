// @ts-ignore
import React from 'react';

export interface SidebarProps {
  currentTab: 'products' | 'categories' | 'brands';
  setCurrentTab: (tab: 'products' | 'categories' | 'brands') => void;
  isDarkMode: boolean;
  onLogout: () => void;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

interface Tab {
  id: 'products' | 'categories' | 'brands';
  icon: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'products', icon: '📦', label: 'Products' },
  { id: 'categories', icon: '📁', label: 'Categories' },
  { id: 'brands', icon: '🏢', label: 'Brands' }
];

const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  isDarkMode, 
  onLogout, 
  isExpanded 
}) => {
  return (
    <div className={`${isExpanded ? 'w-40 translate-x-0' : 'w-0 -translate-x-full'} fixed left-0 top-0 bottom-0 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex flex-col justify-between py-6 transition-all duration-300 ease-in-out z-20 overflow-hidden`}>
      <div className="flex flex-col items-center">
        <div className="mb-8 flex items-center justify-center">
          <span className="text-2xl">🏍️</span>
        </div>
        
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`w-32 justify-start px-3 h-10 mb-4 rounded-xl flex items-center text-lg transition-all duration-300 ease-in-out
              ${currentTab === tab.id 
                ? isDarkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            title={tab.label}
          >
            <span>{tab.icon}</span>
            <span className="ml-2 text-xs opacity-100 transition-opacity duration-300">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Logout button at the bottom of sidebar */}
      <div className="flex flex-col items-center">
        <button
          onClick={onLogout}
          className={`w-32 justify-start px-3 h-10 rounded-xl flex items-center text-lg transition-all duration-300 ease-in-out
            ${isDarkMode ? 'text-red-400 hover:bg-gray-800' : 'text-red-500 hover:bg-gray-200'}`}
          title="Logout"
        >
          <span>🚪</span>
          <span className="ml-2 text-xs opacity-100 transition-opacity duration-300">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 