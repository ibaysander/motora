import React, { useState } from 'react';
import { Brand, Product } from '../../hooks/useApi';
import { SortConfig, PaginationConfig } from '../../features/products';
import { BrandCard } from '../../features/brands';
import { BrandViewToggle } from '../ui/ViewToggles';
import { PaginationLimitSelector, PaginationButtons } from '../ui/Pagination';
import BrandModal from '../ui/BrandModal';
import { AlphabeticalFilter } from '../ui/Filters';

interface BrandsTabProps {
  products: Product[];
  brands: Brand[];
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  brandViewMode: 'table' | 'card';
  setBrandViewMode: (mode: 'table' | 'card') => void;
  paginationConfig: PaginationConfig;
  sortConfig: SortConfig;
  handleItemsPerPageChange: (itemsPerPage: number) => void;
  handlePageChange: (page: number) => void;
  getSortIcon: (key: string) => string;
  requestSort: (key: string) => void;
  paginatedData: Brand[];
  totalPages: number;
  filteredBrands: Brand[];
  newBrand: Partial<Brand>;
  setNewBrand: (brand: Partial<Brand>) => void;
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
  isBrandModalOpen: boolean;
  setIsBrandModalOpen: (isOpen: boolean) => void;
  handleAddBrand: () => void;
  handleUpdateBrand: () => void;
  handleDeleteBrand: (id: number) => void;
  itemsPerPageOptions: number[];
  alphabeticalFilter: string | null;
  setAlphabeticalFilter: (filter: string | null) => void;
}

const BrandsTab: React.FC<BrandsTabProps> = ({
  products,
  brands,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  brandViewMode,
  setBrandViewMode,
  paginationConfig,
  sortConfig,
  handleItemsPerPageChange,
  handlePageChange,
  getSortIcon,
  requestSort,
  paginatedData,
  totalPages,
  filteredBrands,
  newBrand,
  setNewBrand,
  selectedBrand,
  setSelectedBrand,
  isBrandModalOpen,
  setIsBrandModalOpen,
  handleAddBrand,
  handleUpdateBrand,
  handleDeleteBrand,
  itemsPerPageOptions,
  alphabeticalFilter,
  setAlphabeticalFilter
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map(brand => brand.id));
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
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected brands?`)) {
      try {
        // Sequential deletion to avoid overwhelming the server
        for (const id of selectedItems) {
          await handleDeleteBrand(id);
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
        <h1 className="text-2xl font-bold">Brands</h1>
        <div className="flex items-center gap-4">
          <BrandViewToggle
            viewMode={brandViewMode}
            setViewMode={setBrandViewMode}
            isDarkMode={isDarkMode}
          />
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Brand
          </button>
        </div>
      </header>

      <div className="mb-6">
        {/* Alphabetical Filter */}
        <AlphabeticalFilter
          currentFilter={alphabeticalFilter}
          setFilter={setAlphabeticalFilter}
          isDarkMode={isDarkMode}
          type="brands"
        />
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search brands..."
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
              type="brands"
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
          {brandViewMode === 'card' && (
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

      {/* Brands display */}
      {brandViewMode === 'table' ? (
        <div className="w-full overflow-hidden">
          <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="min-w-full divide-y divide-gray-200">
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
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((brand, index) => (
                  <tr key={brand.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(brand.id)}
                        onChange={() => toggleSelectItem(brand.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">{((paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage) + index + 1}</td>
                    <td className="px-6 py-4 text-sm">{brand.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedBrand(brand);
                          setIsBrandModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-600 mr-4"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedItems.length > 0 && (
            <div className="col-span-full mb-4 flex flex-wrap gap-2">
              {paginatedData.map(brand => (
                <label key={brand.id} className={`flex items-center p-2 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                } ${selectedItems.includes(brand.id) ? 'border-2 border-blue-500' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(brand.id)}
                    onChange={() => toggleSelectItem(brand.id)}
                    className="mr-2 rounded"
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          )}
          {paginatedData.map(brand => (
            <div key={brand.id} className={`relative ${selectedItems.includes(brand.id) ? 'ring-2 ring-blue-500' : ''}`}>
              {brandViewMode === 'card' && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(brand.id)}
                    onChange={() => toggleSelectItem(brand.id)}
                    className="rounded"
                  />
                </div>
              )}
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={() => {
                  setSelectedBrand(brand);
                  setIsBrandModalOpen(true);
                }}
                onDelete={handleDeleteBrand}
                isDarkMode={isDarkMode}
                productsCount={products.filter(p => p.brandId === brand.id).length}
              />
            </div>
          ))}
        </div>
      )}

      {/* Brand Modal */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => {
          setIsBrandModalOpen(false);
          setSelectedBrand(null);
          setNewBrand({ name: '' });
        }}
        onSave={selectedBrand ? handleUpdateBrand : handleAddBrand}
        brand={selectedBrand || newBrand}
        setBrand={(brand) => {
          if (selectedBrand) {
            setSelectedBrand(brand as Brand);
          } else {
            setNewBrand(brand);
          }
        }}
        isDarkMode={isDarkMode}
        isAddMode={!selectedBrand}
      />
    </div>
  );
};

export default BrandsTab; 