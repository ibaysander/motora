import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const { isDarkMode } = useTheme();
  const buttons = [];

  // Always show first page
  buttons.push(
    <button
      key={1}
      onClick={() => onPageChange(1)}
      className={`px-3 py-1 border rounded ${
        currentPage === 1 ? 'bg-blue-600 text-white' : ''
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

  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    buttons.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-1 border rounded ${
          currentPage === i ? 'bg-blue-600 text-white' : ''
        }`}
      >
        {i}
      </button>
    );
  }

  // Add ellipsis before last page if needed
  if (currentPage < totalPages - 2) {
    buttons.push(
      <span key="ellipsis2" className="px-2">...</span>
    );
  }

  // Always show last page if there is more than one page
  if (totalPages > 1) {
    buttons.push(
      <button
        key={totalPages}
        onClick={() => onPageChange(totalPages)}
        className={`px-3 py-1 border rounded ${
          currentPage === totalPages ? 'bg-blue-600 text-white' : ''
        }`}
      >
        {totalPages}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          isDarkMode 
            ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
        }`}
      >
        Previous
      </button>
      {buttons}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          isDarkMode 
            ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
        }`}
      >
        Next
      </button>
    </div>
  );
}; 