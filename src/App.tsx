// @ts-ignore
import React, { useState, FC } from 'react';
import { Login } from './features/auth';
import { type SortConfig, type PaginationConfig } from './features/products';
import { type Category, type Brand, type Product } from './hooks/useApi';

// Import modularized components and hooks
import { 
  useApi, 
  useImportExport, 
  useDataActions,
  useSortAndPagination,
  useAuthentication
} from './hooks';
import AppLayout from './components/layout/AppLayout';
import ClearDataModal from './components/ui/ClearDataModal';
import ProductsTab from './components/tabs/ProductsTab';
import CategoriesTab from './components/tabs/CategoriesTab';
import BrandsTab from './components/tabs/BrandsTab';
import { useLayout } from './contexts/LayoutContext';
import { useNotificationContext } from './contexts/NotificationContext';
import AppProviders from './providers/AppProviders';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL: string;
    }
  }
}

// @ts-ignore
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Main application component
 */
const AppContent: FC = () => {
  // Use authentication hook
  const { isAuthenticated, handleLogin, handleLogout } = useAuthentication();
  
  // Use layout context
  const { isDarkMode, currentTab, setIsDarkMode } = useLayout();
  
  // Use notification context
  const { setNotificationMessage } = useNotificationContext();
  
  // State for products, categories, and brands management - using useApi hook
  const {
    products,
    categories,
    brands,
    fetchData,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addBrand,
    updateBrand,
    deleteBrand
  } = useApi();

  // Use the import/export hook
  const {
    isImporting,
    isExporting,
    handleImportExcel,
    handleExport
  } = useImportExport({
    apiUrl: API_URL,
    onSuccess: setNotificationMessage,
    onError: (message) => setNotificationMessage(message, 'error'),
    onDataUpdated: fetchData
  });
  
  // Use the data actions hook
  const {
    isClearDataModalOpen,
    setIsClearDataModalOpen,
    handleClearData
  } = useDataActions({
    apiUrl: API_URL,
    onSuccess: setNotificationMessage,
    onError: (message) => setNotificationMessage(message, 'error'),
    onDataUpdated: fetchData
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: '' });
  const [newBrand, setNewBrand] = useState<Partial<Brand>>({ name: '' });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [itemsPerPageOptions] = useState([10, 25, 50, 100]);

  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    categoryId: 0,
    brandId: 0,
    tipeMotor: '',
    tipeSize: '',
    hargaBeli: 0,
    hargaJual: 0,
    note: '',
    currentStock: 0,
    minThreshold: 0
  });

  // Add new state for alphabetical filter
  const [alphabeticalFilter, setAlphabeticalFilter] = useState<string | null>(null);

  // Add new state for category filter
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  // Add new state for category view mode
  const [categoryViewMode, setCategoryViewMode] = useState<'table' | 'card'>('table');
  const [brandViewMode, setBrandViewMode] = useState<'table' | 'card'>('table');

  // Fetch data when the component mounts
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCategory = async () => {
    if (!newCategory.name?.trim()) {
      setNotificationMessage('Category name cannot be empty', 'error');
      return;
    }

    try {
      const success = await addCategory({ name: newCategory.name.trim() });
      if (success) {
        setIsCategoryModalOpen(false);
        setNewCategory({ name: '' });
        setNotificationMessage('Category added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setNotificationMessage('Failed to add category', 'error');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory?.name?.trim()) {
      setNotificationMessage('Category name cannot be empty', 'error');
      return;
    }

    try {
      const success = await updateCategory({
        id: selectedCategory.id,
        name: selectedCategory.name.trim()
      });
      if (success) {
        setIsCategoryModalOpen(false);
        setSelectedCategory(null);
        setNewCategory({ name: '' });
        setNotificationMessage('Category updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setNotificationMessage('Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This will remove the category from all products.')) {
      const success = await deleteCategory(id);
      if (success) {
        setNotificationMessage('Category deleted successfully', 'success');
      } else {
        setNotificationMessage('Failed to delete category', 'error');
      }
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand.name?.trim()) {
      setNotificationMessage('Brand name cannot be empty', 'error');
      return;
    }

    try {
      const success = await addBrand({ name: newBrand.name.trim() });
      if (success) {
        setIsBrandModalOpen(false);
        setNewBrand({ name: '' });
        setNotificationMessage('Brand added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      setNotificationMessage('Failed to add brand', 'error');
    }
  };

  const handleUpdateBrand = async () => {
    if (!selectedBrand?.name?.trim()) {
      setNotificationMessage('Brand name cannot be empty', 'error');
      return;
    }

    try {
      const success = await updateBrand({
        id: selectedBrand.id,
        name: selectedBrand.name.trim()
      });
      if (success) {
        setIsBrandModalOpen(false);
        setSelectedBrand(null);
        setNewBrand({ name: '' });
        setNotificationMessage('Brand updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      setNotificationMessage('Failed to update brand', 'error');
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this brand? This will remove the brand from all products.')) {
      const success = await deleteBrand(id);
      if (success) {
        setNotificationMessage('Brand deleted successfully', 'success');
      } else {
        setNotificationMessage('Failed to delete brand', 'error');
      }
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct) {
      setNotificationMessage('Product data is invalid', 'error');
      return;
    }
    
    // Cast newProduct to the required type
    const productData = {
      categoryId: newProduct.categoryId || null,
      brandId: newProduct.brandId || null,
      tipeMotor: newProduct.tipeMotor || null,
      tipeSize: newProduct.tipeSize || null,
      hargaBeli: newProduct.hargaBeli || null,
      hargaJual: newProduct.hargaJual || null,
      note: newProduct.note || null,
      currentStock: newProduct.currentStock || 0,
      minThreshold: newProduct.minThreshold || 0
    };
    
    const success = await addProduct(productData);
    if (success) {
      setNotificationMessage('Product added successfully', 'success');
      setIsAddModalOpen(false);
      setNewProduct({
        categoryId: 0,
        brandId: 0,
        tipeMotor: '',
        tipeSize: '',
        hargaBeli: 0,
        hargaJual: 0,
        note: '',
        currentStock: 0,
        minThreshold: 0
      });
    } else {
      setNotificationMessage('Failed to add product', 'error');
    }
  };

  const handleUpdateProduct = async () => {
    if (selectedProduct) {
      const success = await updateProduct(selectedProduct);
      if (success) {
        setNotificationMessage('Product updated successfully', 'success');
        setIsUpdateModalOpen(false);
        setSelectedProduct(null);
      } else {
        setNotificationMessage('Failed to update product', 'error');
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(id);
      if (success) {
        setNotificationMessage('Product deleted successfully', 'success');
      } else {
        setNotificationMessage('Failed to delete product', 'error');
      }
    }
  };

  // Add filtered products based on search and category
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      (product.tipeMotor && product.tipeMotor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.tipeSize && product.tipeSize.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Add filtered categories based on search
  const filteredCategories = categories.filter((category: Category) =>
    searchQuery.toLowerCase() === '' ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add filtered brands based on search
  const filteredBrands = brands.filter((brand: Brand) =>
    searchQuery.toLowerCase() === '' ||
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use sortAndPagination hooks for each type
  const productSortAndPagination = useSortAndPagination({
    initialData: filteredProducts,
    initialSortConfig: { key: 'id', direction: 'asc' },
    localStorageKey: 'product'
  });

  const categorySortAndPagination = useSortAndPagination({
    initialData: filteredCategories,
    initialSortConfig: { key: 'name', direction: 'asc' },
    localStorageKey: 'category'
  });

  const brandSortAndPagination = useSortAndPagination({
    initialData: filteredBrands,
    initialSortConfig: { key: 'name', direction: 'asc' },
    localStorageKey: 'brand'
  });

  // Render content based on current tab
  const renderContent = () => {
    switch (currentTab) {
      case 'products':
        return (
          <ProductsTab
            products={products}
            categories={categories}
            brands={brands}
            isDarkMode={isDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            paginationConfig={productSortAndPagination.paginationConfig}
            sortConfig={productSortAndPagination.sortConfig}
            handleItemsPerPageChange={productSortAndPagination.handleItemsPerPageChange}
            handlePageChange={productSortAndPagination.handlePageChange}
            getSortIcon={productSortAndPagination.getSortIcon}
            requestSort={productSortAndPagination.requestSort}
            paginatedData={productSortAndPagination.paginatedData}
            totalPages={productSortAndPagination.totalPages}
            filteredProducts={filteredProducts}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            isAddModalOpen={isAddModalOpen}
            setIsAddModalOpen={setIsAddModalOpen}
            isUpdateModalOpen={isUpdateModalOpen}
            setIsUpdateModalOpen={setIsUpdateModalOpen}
            handleAddProduct={handleAddProduct}
            handleUpdateProduct={handleUpdateProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleImportExcel={handleImportExcel}
            handleExport={handleExport}
            isImporting={isImporting}
            isExporting={isExporting}
            setIsDarkMode={setIsDarkMode}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        );
      
      case 'categories':
        return (
          <CategoriesTab
            products={products}
            categories={categories}
            isDarkMode={isDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryViewMode={categoryViewMode}
            setCategoryViewMode={setCategoryViewMode}
            paginationConfig={categorySortAndPagination.paginationConfig}
            sortConfig={categorySortAndPagination.sortConfig}
            handleItemsPerPageChange={categorySortAndPagination.handleItemsPerPageChange}
            handlePageChange={categorySortAndPagination.handlePageChange}
            getSortIcon={categorySortAndPagination.getSortIcon}
            requestSort={categorySortAndPagination.requestSort}
            paginatedData={categorySortAndPagination.paginatedData}
            totalPages={categorySortAndPagination.totalPages}
            filteredCategories={filteredCategories}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isCategoryModalOpen={isCategoryModalOpen}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            handleAddCategory={handleAddCategory}
            handleUpdateCategory={handleUpdateCategory}
            handleDeleteCategory={handleDeleteCategory}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        );
      
      case 'brands':
        return (
          <BrandsTab
            products={products}
            brands={brands}
            isDarkMode={isDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            brandViewMode={brandViewMode}
            setBrandViewMode={setBrandViewMode}
            paginationConfig={brandSortAndPagination.paginationConfig}
            sortConfig={brandSortAndPagination.sortConfig}
            handleItemsPerPageChange={brandSortAndPagination.handleItemsPerPageChange}
            handlePageChange={brandSortAndPagination.handlePageChange}
            getSortIcon={brandSortAndPagination.getSortIcon}
            requestSort={brandSortAndPagination.requestSort}
            paginatedData={brandSortAndPagination.paginatedData}
            totalPages={brandSortAndPagination.totalPages}
            filteredBrands={filteredBrands}
            newBrand={newBrand}
            setNewBrand={setNewBrand}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            isBrandModalOpen={isBrandModalOpen}
            setIsBrandModalOpen={setIsBrandModalOpen}
            handleAddBrand={handleAddBrand}
            handleUpdateBrand={handleUpdateBrand}
            handleDeleteBrand={handleDeleteBrand}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-500">Coming soon...</p>
          </div>
        );
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

  return (
    <AppLayout onLogout={handleLogout}>
      {renderContent()}
      
      {/* Clear Data Modal */}
      <ClearDataModal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onConfirm={handleClearData}
        isDarkMode={isDarkMode}
      />
    </AppLayout>
  );
}

/**
 * Main app component with all context providers
 */
const App: FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;