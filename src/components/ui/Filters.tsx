import React, { ChangeEvent } from 'react';
import { Category } from '../../hooks/useApi';

interface AlphabeticalFilterProps {
  currentFilter: string | null;
  setFilter: (letter: string | null) => void;
  isDarkMode: boolean;
  type: string;
}

export const AlphabeticalFilter: React.FC<AlphabeticalFilterProps> = ({
  currentFilter,
  setFilter,
  isDarkMode,
  type
}) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setFilter(null)}
        className={`px-3 py-1 rounded ${
          currentFilter === null 
            ? 'bg-blue-600 text-white' 
            : isDarkMode 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {alphabet.map(letter => (
        <button
          key={letter}
          onClick={() => setFilter(letter)}
          className={`px-3 py-1 rounded ${
            currentFilter === letter 
              ? 'bg-blue-600 text-white' 
              : isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

interface CategoryFilterProps {
  categories: Category[];
  currentFilter: number | null;
  setFilter: (categoryId: number | null) => void;
  isDarkMode: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  currentFilter,
  setFilter,
  isDarkMode
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Category:</span>
      <select
        value={currentFilter || ''}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value ? Number(e.target.value) : null)}
        className={`border rounded-lg p-2 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
      >
        <option value="">All Categories</option>
        {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}; 