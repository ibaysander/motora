import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onClearData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClearData }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-800'} text-white`}>
      <h1 className="text-2xl font-bold">Motorcycle Parts Management</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={onClearData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Clear All Data
        </button>
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-500'}`}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </header>
  );
}; 