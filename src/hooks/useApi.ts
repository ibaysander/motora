// @ts-ignore
import { useState, useCallback } from 'react';
import { SortConfig } from '../utils/dataUtils';

// Define the base types
export interface Product {
  id: number;
  categoryId: number | null;
  brandId: number | null;
  Category?: {
    id: number;
    name: string;
  } | null;
  Brand?: {
    id: number;
    name: string;
  } | null;
  tipeMotor: string | null;
  tipeSize: string | null;
  currentStock: number;
  minThreshold: number;
  hargaBeli: number | null;
  hargaJual: number | null;
  note: string | null;
  sales?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

// New product without ID
export type NewProduct = Omit<Product, 'id' | 'Category' | 'Brand' | 'sales'>;

// Set API URL
// @ts-ignore
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export function useApi() {
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Product operations
  const addProduct = useCallback(async (product: NewProduct) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const updateProduct = useCallback(async (product: Product) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const deleteProduct = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  // Category operations
  const addCategory = useCallback(async (category: { name: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const updateCategory = useCallback(async (category: Category) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const deleteCategory = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  // Brand operations
  const addBrand = useCallback(async (brand: { name: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brand),
      });

      if (!response.ok) {
        throw new Error('Failed to add brand');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding brand:', error);
      setError('Failed to add brand');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const updateBrand = useCallback(async (brand: Brand) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/brands/${brand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brand),
      });

      if (!response.ok) {
        throw new Error('Failed to update brand');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating brand:', error);
      setError('Failed to update brand');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const deleteBrand = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/brands/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting brand:', error);
      setError('Failed to delete brand');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  return {
    // Data
    products,
    categories,
    brands,
    
    // Status
    isLoading,
    error,
    
    // Operations
    fetchData,
    
    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Brand operations
    addBrand,
    updateBrand,
    deleteBrand
  };
} 