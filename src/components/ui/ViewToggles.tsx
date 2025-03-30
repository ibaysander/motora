// @ts-ignore
import React from 'react';

interface ViewToggleProps {
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  isDarkMode: boolean;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode, isDarkMode }) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={() => setViewMode('table')}
      className={`p-2 rounded-lg ${
        viewMode === 'table'
          ? isDarkMode
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white'
          : isDarkMode
            ? 'bg-gray-700 text-gray-300'
            : 'bg-gray-100 text-gray-600'
      }`}
    >
      📋 Table
    </button>
    <button
      onClick={() => setViewMode('card')}
      className={`p-2 rounded-lg ${
        viewMode === 'card'
          ? isDarkMode
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white'
          : isDarkMode
            ? 'bg-gray-700 text-gray-300'
            : 'bg-gray-100 text-gray-600'
      }`}
    >
      🗂️ Cards
    </button>
  </div>
);

export const CategoryViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode, isDarkMode }) => (
  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} isDarkMode={isDarkMode} />
);

export const BrandViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode, isDarkMode }) => (
  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} isDarkMode={isDarkMode} />
);

export const MotorcycleViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode, isDarkMode }) => (
  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} isDarkMode={isDarkMode} />
); 