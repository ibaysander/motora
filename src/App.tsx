import React, { useState, ChangeEvent, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Product {
  id: number;
  categoryId: number;
  brandId: number;
  tipeMotor: string | null;
  tipeSize: string | null;
  hargaBeli: number | null;
  hargaJual: number | null;
  note: string | null;
  currentStock: number;
  minThreshold: number;
  Category?: {
    id: number;
    name: string;
  };
  Brand?: {
    id: number;
    name: string;
  };
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'products' | 'categories' | 'brands'>('products');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
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

  // Save dark mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
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
  const handleJumpToPage = (type: 'products' | 'categories' | 'brands') => {
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

  // Modify the filteredProducts to include category filtering
  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      product.Category?.name.toLowerCase().includes(searchLower) ||
      product.Brand?.name.toLowerCase().includes(searchLower) ||
      (product.tipeMotor?.toLowerCase().includes(searchLower) ?? false);
    
    if (alphabeticalFilter) {
      const firstLetter = product.Category?.name.charAt(0).toUpperCase() || '';
      if (!matchesSearch || firstLetter !== alphabeticalFilter) return false;
    }
    
    if (categoryFilter) {
      if (product.categoryId !== categoryFilter) return false;
    }
    
    return matchesSearch;
  });

  // Add filteredCategories and filteredBrands variables
  const filteredCategories = categories.filter(category => {
    if (alphabeticalFilter) {
      const firstLetter = category.name.charAt(0).toUpperCase();
      return firstLetter === alphabeticalFilter;
    }
    return true;
  });

  const filteredBrands = brands.filter(brand => {
    if (alphabeticalFilter) {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      return firstLetter === alphabeticalFilter;
    }
    return true;
  });

  const sortData = <T extends Record<string, any>>(
    data: T[],
    config: SortConfig
  ): T[] => {
    return [...data].sort((a, b) => {
      // Handle nested properties (e.g., 'category.name')
      const getValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
      };

      const aValue = getValue(a, config.key);
      const bValue = getValue(b, config.key);

      if (aValue === null) return 1;
      if (bValue === null) return -1;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return config.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return config.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
  };

  const requestSort = (key: string, type: 'products' | 'categories' | 'brands') => {
    let direction: 'asc' | 'desc' = 'asc';
    
    switch (type) {
      case 'products':
        if (productSortConfig.key === key && productSortConfig.direction === 'asc') {
          direction = 'desc';
        }
        setProductSortConfig({ key, direction });
        break;
      case 'categories':
        if (categorySortConfig.key === key && categorySortConfig.direction === 'asc') {
          direction = 'desc';
        }
        setCategorySortConfig({ key, direction });
        break;
      case 'brands':
        if (brandSortConfig.key === key && brandSortConfig.direction === 'asc') {
          direction = 'desc';
        }
        setBrandSortConfig({ key, direction });
        break;
    }
  };

  const getSortIcon = (key: string, type: 'products' | 'categories' | 'brands') => {
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
        return null;
    }
    
    if (config.key === key) {
      return config.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
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

  const handlePageChange = (page: number, type: 'products' | 'categories' | 'brands') => {
    switch (type) {
      case 'products':
        setProductPagination(prev => {
          const newConfig = { ...prev, currentPage: page };
          localStorage.setItem('productPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'categories':
        setCategoryPagination(prev => {
          const newConfig = { ...prev, currentPage: page };
          localStorage.setItem('categoryPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'brands':
        setBrandPagination(prev => {
          const newConfig = { ...prev, currentPage: page };
          localStorage.setItem('brandPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
    }
  };

  const handleItemsPerPageChange = (itemsPerPage: number, type: 'products' | 'categories' | 'brands') => {
    switch (type) {
      case 'products':
        setProductPagination(prev => {
          const newConfig = { ...prev, itemsPerPage, currentPage: 1 };
          localStorage.setItem('productPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'categories':
        setCategoryPagination(prev => {
          const newConfig = { ...prev, itemsPerPage, currentPage: 1 };
          localStorage.setItem('categoryPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
      case 'brands':
        setBrandPagination(prev => {
          const newConfig = { ...prev, itemsPerPage, currentPage: 1 };
          localStorage.setItem('brandPagination', JSON.stringify(newConfig));
          return newConfig;
        });
        break;
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected for import');
      return;
    }

    console.log('Starting Excel import process...');
    console.log('File details:', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending import request to:', `${API_URL}/import-excel`);
      const response = await fetch(`${API_URL}/import-excel`, {
        method: 'POST',
        body: formData,
      });

      console.log('Import response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Import failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Import failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Import successful. Response data:', data);
      
      setNotificationMessage('Data imported successfully');
      setNotificationType('success');
      setShowNotification(true);
      fetchData();
    } catch (error) {
      console.error('Error during import process:', error);
      setNotificationMessage('Failed to import data');
      setNotificationType('error');
      setShowNotification(true);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/export-excel`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotificationMessage('Data exported successfully');
      setNotificationType('success');
      setShowNotification(true);
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotificationMessage('Failed to export data');
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
    <div className="flex gap-4 mb-4">
        <div className="relative">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleImportExcel}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer px-4 py-2 rounded-lg ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white flex items-center gap-2`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Import Excel
        </label>
      </div>
          <button
        onClick={handleExport}
        className={`px-4 py-2 rounded-lg ${
          isDarkMode
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-green-500 hover:bg-green-600'
        } text-white flex items-center gap-2`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM13.707 6.707a1 1 0 010-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 5.414V13a1 1 0 102 0V5.414l1.293 1.293a1 1 0 001.414 0z" clipRule="evenodd" />
            </svg>
        Export Excel
          </button>
    </div>
  );

  const getPaginationButtons = (currentPage: number, totalPages: number, type: 'products' | 'categories' | 'brands') => {
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
  const AlphabeticalFilter = ({ type }: { type: 'products' | 'categories' | 'brands' }) => {
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

  // Add CategoryFilter component
  const CategoryFilter = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">Category:</span>
        <select
          value={categoryFilter || ''}
          onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
          className={`border rounded-lg p-2 text-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-800'} text-white`}>
        <h1 className="text-2xl font-bold">Motorcycle Parts Management</h1>
              <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
      </header>
      
      {/* Navigation Tabs */}
      <nav className={`flex space-x-4 p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <button
          className={`px-4 py-2 text-lg font-semibold ${currentTab === 'products' ? 'text-blue-500 border-b-2 border-blue-500' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600'}`}
          onClick={() => setCurrentTab('products')}
        >
          Products
        </button>
        <button
          className={`px-4 py-2 text-lg font-semibold ${currentTab === 'categories' ? 'text-blue-500 border-b-2 border-blue-500' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600'}`}
          onClick={() => setCurrentTab('categories')}
        >
          Categories
        </button>
        <button
          className={`px-4 py-2 text-lg font-semibold ${currentTab === 'brands' ? 'text-blue-500 border-b-2 border-blue-500' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600'}`}
          onClick={() => setCurrentTab('brands')}
        >
          Brands
        </button>
      </nav>

      <main className="p-4">
        {currentTab === 'products' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-semibold mb-2">Total Products</h3>
                <p className="text-3xl">{products.length} Products</p>
              </div>
              <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-semibold mb-2">Total Stock</h3>
                <p className="text-3xl">{products.reduce((sum, product) => sum + product.currentStock, 0)} Items</p>
              </div>
              <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-semibold mb-2">Low Stock Items</h3>
                <p className="text-3xl text-red-500">
                  {products.filter(p => p.currentStock <= p.minThreshold).length} Products
                </p>
              </div>
              <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-semibold mb-2">Total Harga Beli</h3>
                <p className="text-3xl text-blue-500">
                  Rp {products.reduce((sum, product) => sum + (product.hargaBeli || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-semibold mb-2">Total Harga Jual</h3>
                <p className="text-3xl text-green-500">
                  Rp {products.reduce((sum, product) => sum + (product.hargaJual || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Add Alphabetical Filter */}
            <AlphabeticalFilter type="products" />
            
            {/* Search, Category Filter and Add Button */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`border rounded-lg p-3 text-lg w-64 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <CategoryFilter />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
              >
                Add New Product
              </button>
            </div>

            {/* Products Table */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-lg">Items per page:</span>
                  <select
                    value={productPagination.itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value), 'products')}
                    className={`border rounded-lg p-2 text-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className={`min-w-full rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-lg font-semibold">No</th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('Category.name', 'products')}
                      >
                        Category {getSortIcon('Category.name', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('Brand.name', 'products')}
                      >
                        Brand {getSortIcon('Brand.name', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('tipeMotor', 'products')}
                      >
                        Tipe Motor {getSortIcon('tipeMotor', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('tipeSize', 'products')}
                      >
                        Tipe/Size {getSortIcon('tipeSize', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('currentStock', 'products')}
                      >
                        Stock {getSortIcon('currentStock', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('minThreshold', 'products')}
                      >
                        Min Stock {getSortIcon('minThreshold', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('hargaBeli', 'products')}
                      >
                        Harga Beli {getSortIcon('hargaBeli', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('hargaJual', 'products')}
                      >
                        Harga Jual {getSortIcon('hargaJual', 'products')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('note', 'products')}
                      >
                        Note {getSortIcon('note', 'products')}
                      </th>
                      <th className="px-6 py-4 text-left text-lg font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateData(sortData(filteredProducts, productSortConfig), productPagination).map((product, index) => (
                      <tr key={product.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${product.currentStock <= product.minThreshold ? isDarkMode ? 'bg-red-900/20' : 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4 text-lg">{index + 1}</td>
                        <td className="px-6 py-4 text-lg">{product.Category?.name}</td>
                        <td className="px-6 py-4 text-lg">{product.Brand?.name}</td>
                        <td className="px-6 py-4 text-lg">{product.tipeMotor}</td>
                        <td className="px-6 py-4 text-lg">{product.tipeSize}</td>
                        <td className={`px-6 py-4 text-lg font-semibold ${product.currentStock <= product.minThreshold ? 'text-red-500' : 'text-green-500'}`}>
                          {product.currentStock}
                        </td>
                        <td className="px-6 py-4 text-lg">{product.minThreshold}</td>
                        <td className="px-6 py-4 text-lg">Rp {product.hargaBeli?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-lg">Rp {product.hargaJual?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-lg">{product.note}</td>
                        <td className="px-6 py-4 text-lg">
              <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsUpdateModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-600 mr-4"
                            title="Edit"
                          >
                            ✏️
              </button>
              <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete"
              >
                            🗑️
              </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  Showing {((productPagination.currentPage - 1) * productPagination.itemsPerPage) + 1} to{' '}
                  {Math.min(productPagination.currentPage * productPagination.itemsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(productPagination.currentPage - 1, 'products')}
                    disabled={productPagination.currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {getPaginationButtons(productPagination.currentPage, getTotalPages(filteredProducts.length, productPagination.itemsPerPage), 'products')}
                  <button
                    onClick={() => handlePageChange(productPagination.currentPage + 1, 'products')}
                    disabled={productPagination.currentPage === getTotalPages(filteredProducts.length, productPagination.itemsPerPage)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'categories' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Categories</h2>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add New Category
              </button>
            </div>

            {/* Add Alphabetical Filter */}
            <AlphabeticalFilter type="categories" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span>Items per page:</span>
              <select
                    value={categoryPagination.itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value), 'categories')}
                    className={`border rounded-lg p-2 text-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value={5} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>5</option>
                    <option value={10} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>10</option>
                    <option value={20} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>20</option>
                    <option value={50} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>50</option>
              </select>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className={`min-w-full rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-lg font-semibold">No</th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('name', 'categories')}
                      >
                        Category Name {getSortIcon('name', 'categories')}
                      </th>
                      <th className="px-6 py-4 text-left text-lg font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateData(sortData(filteredCategories, categorySortConfig), categoryPagination).map((category, index) => (
                      <tr key={category.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 text-lg">{((categoryPagination.currentPage - 1) * categoryPagination.itemsPerPage) + index + 1}</td>
                        <td className="px-6 py-4 text-lg">{category.name}</td>
                        <td className="px-6 py-4 text-lg">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsCategoryModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-600 mr-4"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  Showing {((categoryPagination.currentPage - 1) * categoryPagination.itemsPerPage) + 1} to{' '}
                  {Math.min(categoryPagination.currentPage * categoryPagination.itemsPerPage, filteredCategories.length)} of{' '}
                  {filteredCategories.length} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(categoryPagination.currentPage - 1, 'categories')}
                    disabled={categoryPagination.currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {getPaginationButtons(categoryPagination.currentPage, getTotalPages(filteredCategories.length, categoryPagination.itemsPerPage), 'categories')}
                  <button
                    onClick={() => handlePageChange(categoryPagination.currentPage + 1, 'categories')}
                    disabled={categoryPagination.currentPage === getTotalPages(filteredCategories.length, categoryPagination.itemsPerPage)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'brands' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Brands</h2>
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add New Brand
              </button>
            </div>

            {/* Add Alphabetical Filter */}
            <AlphabeticalFilter type="brands" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span>Items per page:</span>
              <select
                    value={brandPagination.itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value), 'brands')}
                    className={`border rounded-lg p-2 text-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value={5} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>5</option>
                    <option value={10} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>10</option>
                    <option value={20} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>20</option>
                    <option value={50} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>50</option>
              </select>
            </div>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className={`min-w-full rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-lg font-semibold">No</th>
                      <th 
                        className="px-6 py-4 text-left text-lg font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('name', 'brands')}
                      >
                        Brand Name {getSortIcon('name', 'brands')}
                      </th>
                      <th className="px-6 py-4 text-left text-lg font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {paginateData(sortData(filteredBrands, brandSortConfig), brandPagination).map((brand, index) => (
                      <tr key={brand.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 text-lg">{((brandPagination.currentPage - 1) * brandPagination.itemsPerPage) + index + 1}</td>
                        <td className="px-6 py-4 text-lg">{brand.name}</td>
                        <td className="px-6 py-4 text-lg">
                        <button
                            onClick={() => {
                              setSelectedBrand(brand);
                              setIsBrandModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-600 mr-4"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete"
                          >
                            🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  Showing {((brandPagination.currentPage - 1) * brandPagination.itemsPerPage) + 1} to{' '}
                  {Math.min(brandPagination.currentPage * brandPagination.itemsPerPage, filteredBrands.length)} of{' '}
                  {filteredBrands.length} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(brandPagination.currentPage - 1, 'brands')}
                    disabled={brandPagination.currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {getPaginationButtons(brandPagination.currentPage, getTotalPages(filteredBrands.length, brandPagination.itemsPerPage), 'brands')}
                  <button
                    onClick={() => handlePageChange(brandPagination.currentPage + 1, 'brands')}
                    disabled={brandPagination.currentPage === getTotalPages(filteredBrands.length, brandPagination.itemsPerPage)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`rounded-lg p-6 w-96 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">
              {selectedCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Category Name:</label>
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
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
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
                className={`px-6 py-3 rounded-lg text-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={selectedCategory ? handleUpdateCategory : handleAddCategory}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
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
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Brand Name:</label>
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
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
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
                className={`px-6 py-3 rounded-lg text-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={selectedBrand ? handleUpdateBrand : handleAddBrand}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
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
                <label className="block mb-1 text-lg">Category:</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
                <label className="block mb-1 text-lg">Brand:</label>
                <select
                  value={newProduct.brandId}
                  onChange={(e) => setNewProduct({ ...newProduct, brandId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
                <label className="block mb-1 text-lg">Tipe Motor:</label>
              <input
                type="text"
                  value={newProduct.tipeMotor}
                  onChange={(e) => setNewProduct({ ...newProduct, tipeMotor: e.target.value })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter tipe motor"
              />
            </div>
              <div>
                <label className="block mb-1 text-lg">Tipe/Size:</label>
              <input
                type="text"
                  value={newProduct.tipeSize}
                  onChange={(e) => setNewProduct({ ...newProduct, tipeSize: e.target.value })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter tipe size"
              />
            </div>
              <div>
                <label className="block mb-1 text-lg">Harga Beli:</label>
                <input
                  type="number"
                  value={newProduct.hargaBeli}
                  onChange={(e) => setNewProduct({ ...newProduct, hargaBeli: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-lg">Harga Jual:</label>
                <input
                  type="number"
                  value={newProduct.hargaJual}
                  onChange={(e) => setNewProduct({ ...newProduct, hargaJual: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-lg">Note:</label>
                <input
                  type="text"
                  value={newProduct.note}
                  onChange={(e) => setNewProduct({ ...newProduct, note: e.target.value })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-lg">Current Stock:</label>
                <input
                  type="number"
                  value={newProduct.currentStock}
                  onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block mb-1 text-lg">Min Stock Threshold:</label>
                <input
                  type="number"
                  value={newProduct.minThreshold}
                  onChange={(e) => setNewProduct({ ...newProduct, minThreshold: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`px-6 py-3 rounded-lg text-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
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
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Category:</label>
              <select
                  value={selectedProduct.categoryId}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, categoryId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Brand:</label>
                <select
                  value={selectedProduct.brandId}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, brandId: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Tipe Motor:</label>
                <input
                  type="text"
                  value={selectedProduct.tipeMotor || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, tipeMotor: e.target.value })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Tipe/Size:</label>
                <input
                  type="text"
                  value={selectedProduct.tipeSize || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, tipeSize: e.target.value })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Harga Beli:</label>
                <input
                  type="number"
                  value={selectedProduct.hargaBeli || 0}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, hargaBeli: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Harga Jual:</label>
                <input
                  type="number"
                  value={selectedProduct.hargaJual || 0}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, hargaJual: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Note:</label>
                <input
                  type="text"
                  value={selectedProduct.note || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, note: e.target.value })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
            </div>
              <div>
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Current Stock:</label>
                <input
                  type="number"
                  value={selectedProduct.currentStock}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, currentStock: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Min Stock Threshold:</label>
                <input
                  type="number"
                  value={selectedProduct.minThreshold}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, minThreshold: Number(e.target.value) })}
                  className={`border rounded-lg p-3 text-lg w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => { setIsUpdateModalOpen(false); setSelectedProduct(null); }}
                className={`px-6 py-3 rounded-lg text-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ImportExportButtons />
      <Notification />
    </div>
  );
}