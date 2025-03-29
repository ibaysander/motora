import React, { useState } from 'react';
import { Category, Product } from '../../hooks/useApi';
import { SortConfig, PaginationConfig } from '../../features/products';
import { CategoryCard } from '../../features/categories';
import { CategoryViewToggle } from '../ui/ViewToggles';
import { PaginationLimitSelector, PaginationButtons } from '../ui/Pagination';
import CategoryModal from '../ui/CategoryModal';

interface CategoriesTabProps {
  products: Product[];
  categories: Category[];
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryViewMode: 'table' | 'card';
  setCategoryViewMode: (mode: 'table' | 'card') => void;
  paginationConfig: PaginationConfig;
  sortConfig: SortConfig;
  handleItemsPerPageChange: (itemsPerPage: number) => void;
  handlePageChange: (page: number) => void;
  getSortIcon: (key: string) => string;
  requestSort: (key: string) => void;
  paginatedData: Category[];
  totalPages: number;
  filteredCategories: Category[];
  newCategory: Partial<Category>;
  setNewCategory: (category: Partial<Category>) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (isOpen: boolean) => void;
  handleAddCategory: () => void;
  handleUpdateCategory: () => void;
  handleDeleteCategory: (id: number) => void;
  itemsPerPageOptions: number[];
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({
  products,
  categories,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  categoryViewMode,
  setCategoryViewMode,
  paginationConfig,
  sortConfig,
  handleItemsPerPageChange,
  handlePageChange,
  getSortIcon,
  requestSort,
  paginatedData,
  totalPages,
  filteredCategories,
  newCategory,
  setNewCategory,
  selectedCategory,
  setSelectedCategory,
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  handleAddCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  itemsPerPageOptions
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map(category => category.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected categories?`)) {
      try {
        // Sequential deletion to avoid overwhelming the server
        for (const id of selectedItems) {
          await handleDeleteCategory(id);
        }
        
        // Clear selection
        setSelectedItems([]);
      } catch (error) {
        console.error('Error during bulk deletion:', error);
        alert('An error occurred during bulk deletion. Please try again.');
      }
    }
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex items-center gap-4">
          <CategoryViewToggle
            viewMode={categoryViewMode}
            setViewMode={setCategoryViewMode}
            isDarkMode={isDarkMode}
          />
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Category
          </button>
        </div>
      </header>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200'
              } border`}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <PaginationLimitSelector
              type="categories"
              value={paginationConfig.itemsPerPage}
              onChange={(value) => handleItemsPerPageChange(value)}
              isDarkMode={isDarkMode}
              itemsPerPageOptions={itemsPerPageOptions}
            />
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>
          {categoryViewMode === 'card' && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <select
                value={`${sortConfig.key}:${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split(':');
                  if (key === 'none') {
                    requestSort('');
                  } else {
                    requestSort(key);
                  }
                }}
                className={`border rounded-lg p-2 text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="none">No sorting</option>
                <optgroup label="Name">
                  <option value="name:asc">Name (A-Z)</option>
                  <option value="name:desc">Name (Z-A)</option>
                </optgroup>
              </select>
            </div>
          )}
          <div className="flex items-center gap-4">
            <PaginationButtons
              currentPage={paginationConfig.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Categories display */}
      {categoryViewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className={`min-w-full rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium w-8">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedItems.length === paginatedData.length}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium">
                  <button
                    onClick={() => requestSort('name')}
                    className="flex items-center gap-1 hover:bg-opacity-10 hover:bg-gray-500 px-1 py-0.5 rounded"
                  >
                    Name
                    <span className="text-xs">{getSortIcon('name')}</span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((category, index) => (
                <tr key={category.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <td className="px-3 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(category.id)}
                      onChange={() => toggleSelectItem(category.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-sm">{category.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsCategoryModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-600 mr-4"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedItems.length > 0 && (
            <div className="col-span-full mb-4 flex flex-wrap gap-2">
              {paginatedData.map(category => (
                <label key={category.id} className={`flex items-center p-2 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                } ${selectedItems.includes(category.id) ? 'border-2 border-blue-500' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(category.id)}
                    onChange={() => toggleSelectItem(category.id)}
                    className="mr-2 rounded"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          )}
          {paginatedData.map(category => (
            <div key={category.id} className={`relative ${selectedItems.includes(category.id) ? 'ring-2 ring-blue-500' : ''}`}>
              {categoryViewMode === 'card' && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(category.id)}
                    onChange={() => toggleSelectItem(category.id)}
                    className="rounded"
                  />
                </div>
              )}
              <CategoryCard
                category={category}
                onEdit={() => {
                  setSelectedCategory(category);
                  setIsCategoryModalOpen(true);
                }}
                onDelete={handleDeleteCategory}
                isDarkMode={isDarkMode}
                productsCount={products.filter(p => p.categoryId === category.id).length}
              />
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
          setNewCategory({ name: '' });
        }}
        onSave={selectedCategory ? handleUpdateCategory : handleAddCategory}
        category={selectedCategory || newCategory}
        setCategory={(category) => {
          if (selectedCategory) {
            setSelectedCategory(category as Category);
          } else {
            setNewCategory(category);
          }
        }}
        isDarkMode={isDarkMode}
        isAddMode={!selectedCategory}
      />
    </div>
  );
};

export default CategoriesTab; 