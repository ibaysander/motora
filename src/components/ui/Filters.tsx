import React, { ChangeEvent, useMemo, useState } from 'react';
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
  currentFilter: number[];
  setFilter: (categoryIds: number[]) => void;
  isDarkMode: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  currentFilter,
  setFilter,
  isDarkMode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  
  // Handle toggling a category
  const handleToggle = (categoryId: number) => {
    if (currentFilter.includes(categoryId)) {
      // Remove the category if it's already in the filter
      setFilter(currentFilter.filter(id => id !== categoryId));
    } else {
      // Add the category if it's not in the filter
      setFilter([...currentFilter, categoryId]);
    }
  };
  
  // Clear all selections
  const clearSelections = () => {
    setFilter([]);
  };
  
  // Toggle all categories in a letter group
  const toggleGroup = (letter: string) => {
    const categoryIds = groupedCategories[letter].map(c => c.id);
    const allSelected = categoryIds.every(id => currentFilter.includes(id));
    
    if (allSelected) {
      // If all are selected, unselect them
      setFilter(currentFilter.filter(id => !categoryIds.includes(id)));
    } else {
      // If not all are selected, select all that aren't already selected
      const newIds = categoryIds.filter(id => !currentFilter.includes(id));
      setFilter([...currentFilter, ...newIds]);
    }
  };
  
  // Get selected categories count
  const selectedCount = currentFilter.length;

  return (
    <div className="relative">
      <div 
        className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
            : 'bg-white border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm">Categories:</span>
        <span className={`text-sm font-medium ${selectedCount > 0 ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') : ''}`}>
          {selectedCount === 0 
            ? 'All' 
            : `${selectedCount} selected`}
        </span>
        <span className="ml-2">{isExpanded ? '▲' : '▼'}</span>
      </div>
      
      {isExpanded && (
        <div 
          className={`absolute left-0 mt-1 p-4 rounded-lg border shadow-lg z-10 max-h-96 overflow-y-auto w-80 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Filter by Categories</h3>
            {selectedCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelections();
                }}
                className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clear all
              </button>
            )}
          </div>
          
          {alphabet.map(letter => (
            <div key={letter} className="mb-3">
              <div 
                className={`flex items-center mb-1 cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroup(letter);
                }}
              >
                <span className="text-sm font-medium">{letter}</span>
                <div className={`ml-2 h-px flex-grow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
              
              <div className="pl-4 space-y-1">
                {groupedCategories[letter].map(category => {
                  const isChecked = currentFilter.includes(category.id);
                  return (
                    <div 
                      key={category.id} 
                      className="flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(category.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // We're handling changes in the div's onClick
                        className="mr-2 cursor-pointer"
                      />
                      <span className={`text-sm cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 