import React from 'react';
import { Motorcycle } from '../../../features/products/types';

interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  onEdit: (motorcycle: Motorcycle) => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
  productsCount: number;
}

const MotorcycleCard: React.FC<MotorcycleCardProps> = ({ motorcycle, onEdit, onDelete, isDarkMode, productsCount }) => {
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
            {motorcycle.manufacturer}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Model: {motorcycle.model || ''}
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {productsCount} Products
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(motorcycle)}
            className="text-blue-500 hover:text-blue-600"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(motorcycle.id)}
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

export default MotorcycleCard; 