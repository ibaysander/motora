import React, { ChangeEvent, useMemo } from 'react';
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
  // Group categories by first letter
  const groupedCategories = useMemo(() => {
    // Sort categories alphabetically
    const sortedCategories = [...categories].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
    
    // Group by first letter
    const grouped: Record<string, Category[]> = {};
    
    sortedCategories.forEach(category => {
      const firstLetter = category.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(category);
    });
    
    return grouped;
  }, [categories]);

  // Get all unique first letters in alphabetical order
  const alphabet = useMemo(() => 
    Object.keys(groupedCategories).sort(),
  [groupedCategories]);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Category:</span>
      <select
        value={currentFilter || ''}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value ? Number(e.target.value) : null)}
        className={`border rounded-lg p-2 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
      >
        <option value="">All Categories</option>
        
        {alphabet.map(letter => (
          <React.Fragment key={letter}>
            {/* Add a divider with the letter */}
            <option disabled className={`font-bold ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
              --- {letter} ---
            </option>
            
            {/* Add all categories starting with this letter */}
            {groupedCategories[letter].map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </React.Fragment>
        ))}
      </select>
    </div>
  );
}; 