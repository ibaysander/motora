// @ts-ignore
import React from 'react';

interface PaginationLimitSelectorProps {
  type: string;
  value: number;
  onChange: (value: number) => void;
  isDarkMode: boolean;
  itemsPerPageOptions: number[];
}

export const PaginationLimitSelector: React.FC<PaginationLimitSelectorProps> = ({ 
  type, 
  value, 
  onChange, 
  isDarkMode,
  itemsPerPageOptions 
}) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm">Show:</span>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`border rounded-lg p-2 text-sm ${
        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
      }`}
    >
      {itemsPerPageOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <span className="text-sm">entries</span>
  </div>
);

interface PaginationButtonsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDarkMode: boolean;
}

export const PaginationButtons: React.FC<PaginationButtonsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isDarkMode
}) => {
  const buttons = [];

  // Always show first page
  buttons.push(
    <button
      key={1}
      onClick={() => onPageChange(1)}
      className={`px-3 py-1 border rounded ${
        currentPage === 1 
          ? isDarkMode 
            ? 'bg-blue-600 text-white' 
            : 'bg-blue-500 text-white'
          : isDarkMode
            ? 'bg-gray-800 text-gray-300 border-gray-700' 
            : 'bg-white text-gray-700 border-gray-300'
      }`}
    >
      1
    </button>
  );

  // Add ellipsis and pages around current page
  if (currentPage > 3) {
    buttons.push(
      <span key="ellipsis1" className="px-2">...</span>
    );
  }

  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    buttons.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-1 border rounded ${
          currentPage === i 
            ? isDarkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-800 text-gray-300 border-gray-700' 
              : 'bg-white text-gray-700 border-gray-300'
        }`}
      >
        {i}
      </button>
    );
  }

  if (currentPage < totalPages - 2) {
    buttons.push(
      <span key="ellipsis2" className="px-2">...</span>
    );
  }

  if (totalPages > 1) {
    buttons.push(
      <button
        key={totalPages}
        onClick={() => onPageChange(totalPages)}
        className={`px-3 py-1 border rounded ${
          currentPage === totalPages 
            ? isDarkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-800 text-gray-300 border-gray-700' 
              : 'bg-white text-gray-700 border-gray-300'
        }`}
      >
        {totalPages}
      </button>
    );
  }

  return <div className="flex items-center space-x-2">{buttons}</div>;
}; 