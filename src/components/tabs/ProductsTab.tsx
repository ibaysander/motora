import React, { ChangeEvent } from 'react';
import { Product, Category, Brand } from '../../hooks/useApi';
import { SortConfig, PaginationConfig, ProductCard, ProductList } from '../../features/products';
import Dashboard from '../ui/Dashboard';
import ImportExportButtons from '../ui/ImportExportButtons';
import { ViewToggle } from '../ui/ViewToggles';
import { PaginationLimitSelector, PaginationButtons } from '../ui/Pagination';
import ProductModal from '../ui/ProductModal';
import { CategoryFilter } from '../ui/Filters';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: number | null;
  setCategoryFilter: (categoryId: number | null) => void;
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  paginationConfig: PaginationConfig;
  sortConfig: SortConfig;
  handleItemsPerPageChange: (itemsPerPage: number) => void;
  handlePageChange: (page: number) => void;
  getSortIcon: (key: string) => string;
  requestSort: (key: string) => void;
  paginatedData: Product[];
  totalPages: number;
  filteredProducts: Product[];
  newProduct: Partial<Product>;
  setNewProduct: (product: Partial<Product>) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (isOpen: boolean) => void;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (isOpen: boolean) => void;
  handleAddProduct: () => void;
  handleUpdateProduct: () => void;
  handleDeleteProduct: (id: number) => void;
  handleImportExcel: (e: ChangeEvent<HTMLInputElement>) => void;
  handleExport: () => void;
  isImporting: boolean;
  isExporting: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  itemsPerPageOptions: number[];
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  brands,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
  paginationConfig,
  sortConfig,
  handleItemsPerPageChange,
  handlePageChange,
  getSortIcon,
  requestSort,
  paginatedData,
  totalPages,
  filteredProducts,
  newProduct,
  setNewProduct,
  selectedProduct,
  setSelectedProduct,
  isAddModalOpen,
  setIsAddModalOpen,
  isUpdateModalOpen,
  setIsUpdateModalOpen,
  handleAddProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleImportExcel,
  handleExport,
  isImporting,
  isExporting,
  setIsDarkMode,
  itemsPerPageOptions
}) => {
  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Product
          </button>
        </div>
      </header>

      {/* Dashboard Section */}
      <Dashboard 
        products={products}
        isDarkMode={isDarkMode}
      />

      <ImportExportButtons 
        isDarkMode={isDarkMode}
        handleImportExcel={handleImportExcel}
        handleExport={handleExport}
        isImporting={isImporting}
        isExporting={isExporting}
      />

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200'
              } border`}
            />
          </div>
          <CategoryFilter
            categories={categories}
            currentFilter={categoryFilter}
            setFilter={setCategoryFilter}
            isDarkMode={isDarkMode}
          />
          <ViewToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <PaginationLimitSelector
            type="products"
            value={paginationConfig.itemsPerPage}
            onChange={(value) => handleItemsPerPageChange(value)}
            isDarkMode={isDarkMode}
            itemsPerPageOptions={itemsPerPageOptions}
          />
          {viewMode === 'card' && (
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
                className={`sm:p-1 rounded border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="none">No sorting</option>
                <optgroup label="Category">
                  <option value="Category.name:asc">Category (A-Z)</option>
                  <option value="Category.name:desc">Category (Z-A)</option>
                </optgroup>
                <optgroup label="Brand">
                  <option value="Brand.name:asc">Brand (A-Z)</option>
                  <option value="Brand.name:desc">Brand (Z-A)</option>
                </optgroup>
                <optgroup label="Product Info">
                  <option value="tipeMotor:asc">Tipe Motor (A-Z)</option>
                  <option value="tipeMotor:desc">Tipe Motor (Z-A)</option>
                  <option value="tipeSize:asc">Tipe/Size (A-Z)</option>
                  <option value="tipeSize:desc">Tipe/Size (Z-A)</option>
                </optgroup>
                <optgroup label="Stock">
                  <option value="currentStock:asc">Stock (Low to High)</option>
                  <option value="currentStock:desc">Stock (High to Low)</option>
                  <option value="minThreshold:asc">Min Stock (Low to High)</option>
                  <option value="minThreshold:desc">Min Stock (High to Low)</option>
                </optgroup>
                <optgroup label="Price">
                  <option value="hargaBeli:asc">Harga Beli (Low to High)</option>
                  <option value="hargaBeli:desc">Harga Beli (High to Low)</option>
                  <option value="hargaJual:asc">Harga Jual (Low to High)</option>
                  <option value="hargaJual:desc">Harga Jual (High to Low)</option>
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

      {/* Product display */}
      {viewMode === 'table' ? (
        <ProductList
          products={paginatedData}
          onEdit={product => {
            setSelectedProduct(product);
            setIsUpdateModalOpen(true);
          }}
          onDelete={handleDeleteProduct}
          isDarkMode={isDarkMode}
          sortConfig={sortConfig}
          onSort={requestSort}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => {
                setSelectedProduct(product);
                setIsUpdateModalOpen(true);
              }}
              onDelete={handleDeleteProduct}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}

      {/* Product Modals */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProduct}
        product={newProduct}
        setProduct={setNewProduct}
        categories={categories}
        brands={brands}
        isDarkMode={isDarkMode}
        isAddMode={true}
      />

      <ProductModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSave={handleUpdateProduct}
        product={selectedProduct}
        setProduct={(product) => {
          if (product) setSelectedProduct(product as Product);
        }}
        categories={categories}
        brands={brands}
        isDarkMode={isDarkMode}
        isAddMode={false}
      />
    </div>
  );
};

export default ProductsTab; 