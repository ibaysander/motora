import React, { useState, ChangeEvent, useEffect, FC } from 'react';
import Login from './components/Login';
import { Product, Category, Brand, SortConfig, PaginationConfig } from './types';
import ProductList from './components/ProductList';
import ProductCard from './components/ProductCard';
import CategoryCard from './components/CategoryCard';
import BrandCard from './components/BrandCard';

interface AppProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL: string;
    }
  }
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface SidebarProps {
  currentTab: 'products' | 'categories' | 'brands';
  setCurrentTab: (tab: 'products' | 'categories' | 'brands') => void;
  isDarkMode: boolean;
}

interface Tab {
  id: 'products' | 'categories' | 'brands';
  icon: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'products', icon: '📦', label: 'Products' },
  { id: 'categories', icon: '📁', label: 'Categories' },
  { id: 'brands', icon: '🏢', label: 'Brands' }
];

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, isDarkMode }) => {
  return (
    <div className={`w-20 min-h-screen fixed left-0 top-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center py-6">
        <div className="mb-8">
          <span className="text-2xl">🏍️</span>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as 'products' | 'categories' | 'brands')}
            className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center text-lg
              ${currentTab === tab.id 
                ? isDarkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

const App: FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  });
  const [currentTab, setCurrentTab] = useState<'products' | 'categories' | 'brands'>('products');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [itemsPerPageOptions] = useState([10, 25, 50, 100]);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
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

  const [productSortConfig, setProductSortConfig] = useState<SortConfig>({ key: 'id', direction: 'asc' });
  const [categorySortConfig, setCategorySortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [brandSortConfig, setBrandSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  // Initialize pagination states with localStorage values
  const [productPagination, setProductPagination] = useState<PaginationConfig>(() => {
    const saved = localStorage.getItem('productPagination');
    return saved ? JSON.parse(saved) : { currentPage: 1, itemsPerPage: 10 };
  });
  
  const [categoryPagination, setCategoryPagination] = useState<PaginationConfig>(() => {
    const saved = localStorage.getItem('categoryPagination');
    return saved ? JSON.parse(saved) : { currentPage: 1, itemsPerPage: 10 };
  });
  
  const [brandPagination, setBrandPagination] = useState<PaginationConfig>(() => {
    const saved = localStorage.getItem('brandPagination');
    return saved ? JSON.parse(saved) : { currentPage: 1, itemsPerPage: 10 };
  });

  // Add new state for alphabetical filter
  const [alphabeticalFilter, setAlphabeticalFilter] = useState<string | null>(null);

  // Add new state for jump to page
  const [jumpToPage, setJumpToPage] = useState<string>('');

  // Add new state for category filter
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  // Add new state for category view mode
  const [categoryViewMode, setCategoryViewMode] = useState<'table' | 'card'>('table');
  const [brandViewMode, setBrandViewMode] = useState<'table' | 'card'>('table');

  // Save dark mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save pagination settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('productPagination', JSON.stringify(productPagination));
  }, [productPagination]);

  useEffect(() => {
    localStorage.setItem('categoryPagination', JSON.stringify(categoryPagination));
  }, [categoryPagination]);

  useEffect(() => {
    localStorage.setItem('brandPagination', JSON.stringify(brandPagination));
  }, [brandPagination]);

  // Update useEffect for authentication
  useEffect(() => {
    // Save authentication state to localStorage whenever it changes
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  // Add this useEffect for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/brands`),
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !brandsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [productsData, categoriesData, brandsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        brandsRes.json(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotificationMessage('Failed to fetch data');
      setNotificationType('error');
      setShowNotification(true);
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        await fetchData();
        setIsCategoryModalOpen(false);
        setNewCategory({ name: '' });
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (selectedCategory) {
      try {
        const response = await fetch(`${API_URL}/categories/${selectedCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedCategory),
        });

        if (response.ok) {
          await fetchData();
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error('Error updating category:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`${API_URL}/categories/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleAddBrand = async () => {
    try {
      const response = await fetch(`${API_URL}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBrand),
      });

      if (response.ok) {
        await fetchData();
        setIsBrandModalOpen(false);
        setNewBrand({ name: '' });
      }
    } catch (error) {
      console.error('Error adding brand:', error);
    }
  };

  const handleUpdateBrand = async () => {
    if (selectedBrand) {
      try {
        const response = await fetch(`${API_URL}/brands/${selectedBrand.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedBrand),
        });

        if (response.ok) {
          await fetchData();
          setIsBrandModalOpen(false);
          setSelectedBrand(null);
        }
      } catch (error) {
        console.error('Error updating brand:', error);
      }
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const response = await fetch(`${API_URL}/brands/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        await fetchData();
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
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    if (selectedProduct) {
      try {
        const response = await fetch(`${API_URL}/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedProduct),
        });

        if (response.ok) {
          await fetchData();
          setIsUpdateModalOpen(false);
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Add function to handle jump to page
  const handleJumpToPage = (type: string) => {
    const page = parseInt(jumpToPage);
    const totalPages = type === 'products' 
      ? getTotalPages(filteredProducts.length, productPagination.itemsPerPage)
      : type === 'categories'
      ? getTotalPages(categories.length, categoryPagination.itemsPerPage)
      : getTotalPages(brands.length, brandPagination.itemsPerPage);

    if (page > 0 && page <= totalPages) {
      handlePageChange(page, type);
      setJumpToPage('');
    }
  };

  // Add filtered products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      (product.tipeMotor && product.tipeMotor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.tipeSize && product.tipeSize.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Add filtered categories based on search
  const filteredCategories = categories.filter(category =>
    searchQuery.toLowerCase() === '' ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add filtered brands based on search
  const filteredBrands = brands.filter(brand =>
    searchQuery.toLowerCase() === '' ||
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortData = <T extends Record<string, any>>(
    data: T[],
    config: SortConfig
  ): T[] => {
    if (!config.key) return data;

    return [...data].sort((a, b) => {
      // Handle nested properties (e.g., 'category.name')
      const getValue = (obj: any, path: string) => {
        const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
        return value === undefined || value === null ? null : value;
      };

      const aValue = getValue(a, config.key);
      const bValue = getValue(b, config.key);

      // Handle null/undefined values - always sort them to the end
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Handle numeric values (including string numbers)
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        const numA = Number(aValue);
        const numB = Number(bValue);
        return config.direction === 'asc' ? numA - numB : numB - numA;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return config.direction === 'asc'
          ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
          : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
      }
      
      // Fallback for other types
      return config.direction === 'asc'
        ? aValue > bValue ? 1 : -1
        : bValue > aValue ? 1 : -1;
    });
  };

  const requestSort = (key: string, type: string) => {
    let newConfig: SortConfig;
    
    switch (type) {
      case 'products':
        newConfig = productSortConfig.key === key
          ? productSortConfig.direction === 'asc'
            ? { key, direction: 'desc' }
            : { key: '', direction: 'asc' }  // Reset sorting
          : { key, direction: 'asc' };
        setProductSortConfig(newConfig);
        break;
      case 'categories':
        newConfig = categorySortConfig.key === key
          ? categorySortConfig.direction === 'asc'
            ? { key, direction: 'desc' }
            : { key: '', direction: 'asc' }  // Reset sorting
          : { key, direction: 'asc' };
        setCategorySortConfig(newConfig);
        break;
      case 'brands':
        newConfig = brandSortConfig.key === key
          ? brandSortConfig.direction === 'asc'
            ? { key, direction: 'desc' }
            : { key: '', direction: 'asc' }  // Reset sorting
          : { key, direction: 'asc' };
        setBrandSortConfig(newConfig);
        break;
    }
  };

  const getSortIcon = (key: string, type: string) => {
    let config: SortConfig;
    switch (type) {
      case 'products':
        config = productSortConfig;
        break;
      case 'categories':
        config = categorySortConfig;
        break;
      case 'brands':
        config = brandSortConfig;
        break;
      default:
        return '↕';
    }
    
    if (config.key !== key) return '↕';
    return config.direction === 'asc' ? '↑' : '↓';
  };

  const paginateData = <T extends Record<string, any>>(
    data: T[],
    config: PaginationConfig
  ): T[] => {
    const startIndex = (config.currentPage - 1) * config.itemsPerPage;
    const endIndex = startIndex + config.itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Update pagination handlers with proper types
  const handlePageChange = (page: number, type: string) => {
    switch (type) {
      case 'products':
        setProductPagination((prev: PaginationConfig) => {
          const newConfig = { ...prev, currentPage: page };
          localStorage.setItem('productPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'categories':
        setCategoryPagination((prev: PaginationConfig) => {
          const newConfig = { ...prev, currentPage: page };
          localStorage.setItem('categoryPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'brands':
        setBrandPagination((prev: PaginationConfig) => {
          const newConfig = { ...prev, currentPage: page };
          localStorage.setItem('brandPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
    }
  };

  const handleItemsPerPageChange = (itemsPerPage: number, type: string) => {
    switch (type) {
      case 'products':
        setProductPagination((prev: PaginationConfig) => {
          const newConfig = { ...prev, itemsPerPage, currentPage: 1 };
          localStorage.setItem('productPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'categories':
        setCategoryPagination((prev: PaginationConfig) => {
          const newConfig = { ...prev, itemsPerPage, currentPage: 1 };
          localStorage.setItem('categoryPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'brands':
        setBrandPagination((prev: PaginationConfig) => {
          const newConfig = { ...prev, itemsPerPage, currentPage: 1 };
          localStorage.setItem('brandPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    try {
      console.log('Sending import request to:', `${API_URL}/import-excel`);
      const response = await fetch(`${API_URL}/import-excel`, {
        method: 'POST',
        body: formData,
      });

      console.log('Import response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Import error:', errorText);
        throw new Error(`Import failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Import result:', result);
      
      // Fetch updated data after successful import
      await fetchData();
      
      setNotificationMessage('Data imported successfully!');
      setNotificationType('success');
      setShowNotification(true);
    } catch (error) {
      console.error('Import error:', error);
      setNotificationMessage(error instanceof Error ? error.message : 'Failed to import data');
      setNotificationType('error');
      setShowNotification(true);
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      console.log('Sending export request to:', `${API_URL}/export-excel`);
      const response = await fetch(`${API_URL}/export-excel`);
      
      console.log('Export response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export error:', errorText);
        throw new Error(`Export failed: ${errorText}`);
      }

      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="?([^"]*)"?/);
      const filename = filenameMatch ? filenameMatch[1] : 'products.xlsx';

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setNotificationMessage('Data exported successfully!');
      setNotificationType('success');
      setShowNotification(true);
    } catch (error) {
      console.error('Export error:', error);
      setNotificationMessage(error instanceof Error ? error.message : 'Failed to export data');
      setNotificationType('error');
      setShowNotification(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    try {
      const response = await fetch(`${API_URL}/products/clear-all`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

      // Refresh data
      fetchData();
      setIsClearDataModalOpen(false);
      
      setNotificationMessage('All data cleared successfully');
      setNotificationType('success');
      setShowNotification(true);
    } catch (error) {
      console.error('Error clearing data:', error);
      setNotificationMessage('Failed to clear data');
      setNotificationType('error');
      setShowNotification(true);
    }
  };

  // Add notification component
  const Notification = () => {
    useEffect(() => {
      if (!showNotification) return;
      
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }, [showNotification]);

    if (!showNotification) return null;

    return (
      <div
        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}
      >
        {notificationMessage}
      </div>
    );
  };

  // Add these buttons in your JSX where appropriate
  const ImportExportButtons = () => (
    <div className="flex gap-2 mb-4">
      <div className="relative">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleImportExcel}
          className="hidden"
          id="file-upload"
          disabled={isImporting}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm ${
            isDarkMode
              ? isImporting 
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              : isImporting
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
          } text-white flex items-center gap-1.5`}
        >
          {isImporting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Importing...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>Import Excel</span>
            </>
          )}
        </label>
      </div>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`px-3 py-1.5 rounded-lg text-sm ${
          isDarkMode
            ? isExporting
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
            : isExporting
              ? 'bg-green-300 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
        } text-white flex items-center gap-1.5`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM13.707 6.707a1 1 0 010-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 5.414V13a1 1 0 102 0V5.414l1.293 1.293a1 1 0 001.414 0z" clipRule="evenodd" />
        </svg>
            <span>Export Excel</span>
          </>
        )}
      </button>
    </div>
  );

  const getPaginationButtons = (currentPage: number, totalPages: number, type: string) => {
    const buttons = [];
    
    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => handlePageChange(1, type)}
        className={`px-3 py-1 border rounded ${
          currentPage === 1 ? 'bg-blue-600 text-white' : ''
        }`}
      >
        1
      </button>
    );

    // Add ellipsis and pages around current page
    if (currentPage > 3) {
      buttons.push(
        <span key="ellipsis1" className="px-2">...</span>
      );
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i, type)}
          className={`px-3 py-1 border rounded ${
            currentPage === i ? 'bg-blue-600 text-white' : ''
          }`}
        >
          {i}
        </button>
      );
    }

    // Add ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="ellipsis2" className="px-2">...</span>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages, type)}
          className={`px-3 py-1 border rounded ${
            currentPage === totalPages ? 'bg-blue-600 text-white' : ''
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Add AlphabeticalFilter component
  const AlphabeticalFilter = ({ type }: { type: string }) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setAlphabeticalFilter(null)}
          className={`px-3 py-1 rounded ${
            alphabeticalFilter === null 
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
            onClick={() => setAlphabeticalFilter(letter)}
            className={`px-3 py-1 rounded ${
              alphabeticalFilter === letter 
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

  // Update CategoryFilter with proper types
  const CategoryFilter: React.FC = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm">Category:</span>
        <select
          value={categoryFilter || ''}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
          className={`border rounded-lg p-2 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        >
          <option value="">All Categories</option>
          {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Add pagination limit selector component
  const PaginationLimitSelector = ({ type, value, onChange }: { type: string; value: number; onChange: (value: number) => void }) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Show:</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`border rounded-lg p-2 text-sm ${
          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
        }`}
      >
        {itemsPerPageOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <span className="text-sm">entries</span>
    </div>
  );

  // Add view toggle component
  const ViewToggle = () => (
    <div className="flex items-center space-x-2">
          <button
        onClick={() => setViewMode('table')}
        className={`p-2 rounded-lg ${
          viewMode === 'table'
            ? isDarkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        📋 Table
          </button>
          <button
        onClick={() => setViewMode('card')}
        className={`p-2 rounded-lg ${
          viewMode === 'card'
            ? isDarkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        🗂️ Cards
          </button>
        </div>
  );
      
  // Add category view toggle component
  const CategoryViewToggle = () => (
    <div className="flex items-center space-x-2">
        <button
        onClick={() => setCategoryViewMode('table')}
        className={`p-2 rounded-lg ${
          categoryViewMode === 'table'
            ? isDarkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        📋 Table
        </button>
        <button
        onClick={() => setCategoryViewMode('card')}
        className={`p-2 rounded-lg ${
          categoryViewMode === 'card'
            ? isDarkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        🗂️ Cards
        </button>
    </div>
  );

  // Add brand view toggle component
  const BrandViewToggle = () => (
    <div className="flex items-center space-x-2">
        <button
        onClick={() => setBrandViewMode('table')}
        className={`p-2 rounded-lg ${
          brandViewMode === 'table'
            ? isDarkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        📋 Table
        </button>
      <button
        onClick={() => setBrandViewMode('card')}
        className={`p-2 rounded-lg ${
          brandViewMode === 'card'
            ? isDarkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        🗂️ Cards
      </button>
    </div>
  );

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  // Render content based on current tab
  const renderContent = () => {
    switch (currentTab) {
      case 'products':
        return (
          <>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Products</p>
                    <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
              </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    <span className="text-xl">📦</span>
              </div>
              </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Stock</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {products.reduce((sum, product) => sum + (product.currentStock || 0), 0)}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                    <span className="text-xl">📊</span>
                  </div>
              </div>
            </div>
            
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low Stock Items</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {products.filter(product => 
                        (product.currentStock || 0) <= (product.minThreshold || 0)
                      ).length}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
                    <span className="text-xl">⚠️</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Harga Beli</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(products.reduce((sum, product) => sum + ((product.hargaBeli || 0) * (product.currentStock || 0)), 0))}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                    <span className="text-xl">💰</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Harga Jual</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(products.reduce((sum, product) => sum + ((product.hargaJual || 0) * (product.currentStock || 0)), 0))}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                    <span className="text-xl">💎</span>
                  </div>
                </div>
              </div>
            </div>

            <ImportExportButtons />

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
                <select
                  value={categoryFilter || ''}
                  onChange={e => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-200'
                  } border`}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ViewToggle />
            </div>

              <div className="flex justify-between items-center mb-4">
                <PaginationLimitSelector
                  type="products"
                  value={productPagination.itemsPerPage}
                  onChange={(value) => handleItemsPerPageChange(value, 'products')}
                />
                {viewMode === 'card' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Sort by:</span>
                    <select
                      value={`${productSortConfig.key}:${productSortConfig.direction}`}
                      onChange={(e) => {
                        const [key, direction] = e.target.value.split(':');
                        if (key === 'none') {
                          setProductSortConfig({ key: '', direction: 'asc' });
                        } else {
                          setProductSortConfig({ key, direction: direction as 'asc' | 'desc' });
                        }
                      }}
                      className={`border rounded-lg p-2 text-sm ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
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
                  {getPaginationButtons(productPagination.currentPage, getTotalPages(filteredProducts.length, productPagination.itemsPerPage), 'products')}
                </div>
              </div>
            </div>

            {viewMode === 'table' ? (
              <ProductList
                products={paginateData(sortData(filteredProducts, productSortConfig), productPagination)}
                onEdit={product => {
                              setSelectedProduct(product);
                              setIsUpdateModalOpen(true);
                            }}
                onDelete={handleDeleteProduct}
                isDarkMode={isDarkMode}
                sortConfig={productSortConfig}
                onSort={(key) => requestSort(key, 'products')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginateData(sortData(filteredProducts, productSortConfig), productPagination).map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={product => {
                      setSelectedProduct(product);
                      setIsUpdateModalOpen(true);
                    }}
                    onDelete={handleDeleteProduct}
                    isDarkMode={isDarkMode}
                  />
                ))}
          </div>
        )}
          </>
        );

      case 'categories':
        return (
          <>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Categories</h1>
              <div className="flex items-center gap-4">
                <CategoryViewToggle />
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
                  value={categoryPagination.itemsPerPage}
                  onChange={(value) => handleItemsPerPageChange(value, 'categories')}
                />
                {categoryViewMode === 'card' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Sort by:</span>
                    <select
                      value={`${categorySortConfig.key}:${categorySortConfig.direction}`}
                      onChange={(e) => {
                        const [key, direction] = e.target.value.split(':');
                        if (key === 'none') {
                          setCategorySortConfig({ key: '', direction: 'asc' });
                        } else {
                          setCategorySortConfig({ key, direction: direction as 'asc' | 'desc' });
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
                  {getPaginationButtons(categoryPagination.currentPage, getTotalPages(filteredCategories.length, categoryPagination.itemsPerPage), 'categories')}
                </div>
              </div>
            </div>

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
                    {paginateData(sortData(filteredCategories, categorySortConfig), categoryPagination).map((category, index) => (
                      <tr key={category.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm">{((categoryPagination.currentPage - 1) * categoryPagination.itemsPerPage) + index + 1}</td>
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
                {paginateData(sortData(filteredCategories, categorySortConfig), categoryPagination).map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={(category) => {
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
          </>
        );

      case 'brands':
        return (
          <>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Brands</h1>
              <div className="flex items-center gap-4">
                <BrandViewToggle />
              <button
                onClick={() => setIsBrandModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                  Add Brand
              </button>
            </div>
            </header>

            <div className="mb-6">
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
                <PaginationLimitSelector
                  type="brands"
                  value={brandPagination.itemsPerPage}
                  onChange={(value) => handleItemsPerPageChange(value, 'brands')}
                />
                {brandViewMode === 'card' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Sort by:</span>
                    <select
                      value={`${brandSortConfig.key}:${brandSortConfig.direction}`}
                      onChange={(e) => {
                        const [key, direction] = e.target.value.split(':');
                        if (key === 'none') {
                          setBrandSortConfig({ key: '', direction: 'asc' });
                        } else {
                          setBrandSortConfig({ key, direction: direction as 'asc' | 'desc' });
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
                  {getPaginationButtons(brandPagination.currentPage, getTotalPages(filteredBrands.length, brandPagination.itemsPerPage), 'brands')}
                </div>
              </div>
            </div>

            {brandViewMode === 'table' ? (
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
                    {paginateData(sortData(filteredBrands, brandSortConfig), brandPagination).map((brand, index) => (
                      <tr key={brand.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm">{((brandPagination.currentPage - 1) * brandPagination.itemsPerPage) + index + 1}</td>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginateData(sortData(filteredBrands, brandSortConfig), brandPagination).map(brand => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    onEdit={(brand) => {
                      setSelectedBrand(brand);
                      setIsBrandModalOpen(true);
                    }}
                    onDelete={handleDeleteBrand}
                    isDarkMode={isDarkMode}
                    productsCount={products.filter(p => p.brandId === brand.id).length}
                  />
                ))}
                </div>
            )}
          </>
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
    return <Login onLogin={() => setIsAuthenticated(true)} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="flex">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} isDarkMode={isDarkMode} />
        
        <div className="ml-20 w-full p-8">
          {renderContent()}
              </div>
            </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`rounded-lg p-6 w-96 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">
              {selectedCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Category Name:</label>
                <input
                  type="text"
                  value={selectedCategory ? selectedCategory.name : newCategory.name}
                  onChange={(e) => {
                    if (selectedCategory) {
                      setSelectedCategory({ ...selectedCategory, name: e.target.value });
                    } else {
                      setNewCategory({ name: e.target.value });
                    }
                  }}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setSelectedCategory(null);
                  setNewCategory({ name: '' });
                }}
                className={`px-6 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={selectedCategory ? handleUpdateCategory : handleAddCategory}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                {selectedCategory ? 'Save Changes' : 'Save'}
              </button>
            </div>
            </div>
        </div>
      )}

      {/* Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`rounded-lg p-6 w-96 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">
              {selectedBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Brand Name:</label>
                <input
                  type="text"
                  value={selectedBrand ? selectedBrand.name : newBrand.name}
                  onChange={(e) => {
                    if (selectedBrand) {
                      setSelectedBrand({ ...selectedBrand, name: e.target.value });
                    } else {
                      setNewBrand({ name: e.target.value });
                    }
                  }}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter brand name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setIsBrandModalOpen(false);
                  setSelectedBrand(null);
                  setNewBrand({ name: '' });
                }}
                className={`px-6 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={selectedBrand ? handleUpdateBrand : handleAddBrand}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                {selectedBrand ? 'Save Changes' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`rounded-lg p-6 w-11/12 md:w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm">Category:</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value={0} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select Category</option>
                  {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                    <option key={category.id} value={category.id} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>
                      {category.name}
                    </option>
                  ))}
                </select>
            </div>
              <div>
                <label className="block mb-1 text-sm">Brand:</label>
                <select
                  value={newProduct.brandId}
                  onChange={(e) => setNewProduct({ ...newProduct, brandId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value={0} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select Brand</option>
                  {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map(brand => (
                    <option key={brand.id} value={brand.id} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">Tipe Motor:</label>
              <input
                type="text"
                  value={newProduct.tipeMotor}
                  onChange={(e) => setNewProduct({ ...newProduct, tipeMotor: e.target.value })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter tipe motor"
              />
            </div>
              <div>
                <label className="block mb-1 text-sm">Tipe/Size:</label>
              <input
                type="text"
                  value={newProduct.tipeSize}
                  onChange={(e) => setNewProduct({ ...newProduct, tipeSize: e.target.value })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter tipe size"
              />
            </div>
              <div>
                <label className="block mb-1 text-sm">Harga Beli:</label>
                <input
                  type="number"
                  value={newProduct.hargaBeli}
                  onChange={(e) => setNewProduct({ ...newProduct, hargaBeli: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Harga Jual:</label>
                <input
                  type="number"
                  value={newProduct.hargaJual}
                  onChange={(e) => setNewProduct({ ...newProduct, hargaJual: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Note:</label>
                <input
                  type="text"
                  value={newProduct.note}
                  onChange={(e) => setNewProduct({ ...newProduct, note: e.target.value })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Current Stock:</label>
                <input
                  type="number"
                  value={newProduct.currentStock}
                  onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Min Stock Threshold:</label>
                <input
                  type="number"
                  value={newProduct.minThreshold}
                  onChange={(e) => setNewProduct({ ...newProduct, minThreshold: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`px-6 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Product Modal */}
      {isUpdateModalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`rounded-lg p-6 w-11/12 md:w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Category:</label>
              <select
                  value={selectedProduct.categoryId ?? 0}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, categoryId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value={0} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select Category</option>
                  {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                    <option key={category.id} value={category.id} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>
                      {category.name}
                    </option>
                ))}
              </select>
            </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Brand:</label>
                <select
                  value={selectedProduct.brandId ?? 0}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, brandId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value={0} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select Brand</option>
                  {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map(brand => (
                    <option key={brand.id} value={brand.id} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Tipe Motor:</label>
                <input
                  type="text"
                  value={selectedProduct.tipeMotor || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, tipeMotor: e.target.value })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Tipe/Size:</label>
                <input
                  type="text"
                  value={selectedProduct.tipeSize || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, tipeSize: e.target.value })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Harga Beli:</label>
                <input
                  type="number"
                  value={selectedProduct.hargaBeli || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, hargaBeli: e.target.value ? Number(e.target.value) : null })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Harga Jual:</label>
                <input
                  type="number"
                  value={selectedProduct.hargaJual || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, hargaJual: e.target.value ? Number(e.target.value) : null })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Note:</label>
                <input
                  type="text"
                  value={selectedProduct.note || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, note: e.target.value })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
            </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Current Stock:</label>
                <input
                  type="number"
                  value={selectedProduct.currentStock || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, currentStock: e.target.value ? Number(e.target.value) : 0 })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Min Stock Threshold:</label>
                <input
                  type="number"
                  value={selectedProduct.minThreshold || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, minThreshold: e.target.value ? Number(e.target.value) : 0 })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className={`px-6 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Component */}
      <Notification />
    </div>
  );
}

export default App;