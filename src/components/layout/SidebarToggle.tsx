// @ts-ignore
import React from 'react';

interface SidebarToggleProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  isDarkMode: boolean;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isExpanded, 
  setIsExpanded, 
  isDarkMode
}) => {
  return (
    <button 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`fixed top-4 ${isExpanded ? 'left-[10rem]' : 'left-4'} z-30 w-8 h-8 rounded-full flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      } shadow-md transition-all duration-300 ease-in-out`}
    >
      {isExpanded ? '◀' : '▶'}
    </button>
  );
};

export default SidebarToggle; 