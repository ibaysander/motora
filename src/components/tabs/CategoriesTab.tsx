import React from 'react';
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
          <PaginationLimitSelector
            type="categories"
            value={paginationConfig.itemsPerPage}
            onChange={(value) => handleItemsPerPageChange(value)}
            isDarkMode={isDarkMode}
            itemsPerPageOptions={itemsPerPageOptions}
          />
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
                <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((category, index) => (
                <tr key={category.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
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
          {paginatedData.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => {
                setSelectedCategory(category);
                setIsCategoryModalOpen(true);
              }}
              onDelete={handleDeleteCategory}
              isDarkMode={isDarkMode}
              productsCount={products.filter(p => p.categoryId === category.id).length}
            />
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