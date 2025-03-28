import React from 'react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
  productsCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete, isDarkMode, productsCount }) => {
  return (
    <div 
      className={`rounded-lg shadow-lg p-4 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {category.name}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {productsCount} Products
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(category)}
            className="text-blue-500 hover:text-blue-600"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="text-red-500 hover:text-red-600"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard; 