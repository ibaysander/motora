import React from 'react';
import { Category } from '../../hooks/useApi';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category: Partial<Category> | null;
  setCategory: (category: Partial<Category>) => void;
  isDarkMode: boolean;
  isAddMode: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  setCategory,
  isDarkMode,
  isAddMode
}) => {
  if (!isOpen) return null;
  
  const title = isAddMode ? 'Add New Category' : 'Edit Category';
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`rounded-lg p-6 w-96 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="space-y-4">
          <div>
            <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Category Name:</label>
            <input
              type="text"
              value={category?.name || ''}
              onChange={(e) => setCategory({ ...category, name: e.target.value })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
              placeholder="Enter category name"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            {isAddMode ? 'Save' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal; 