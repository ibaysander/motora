import { useState, useCallback, useEffect } from 'react';
import { apis } from '../services/api';
import { Product, Category, Brand, ProductRequest, CategoryRequest, BrandRequest, Motorcycle } from '../services/api/types';

export type { Product, Category, Brand, ProductRequest, CategoryRequest, BrandRequest, Motorcycle };

// Type for product without ID
export type NewProduct = Omit<Product, 'id' | 'Category' | 'Brand' | 'sales'>;

/**
 * Custom hook for API operations
 */
export function useApi() {
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        apis.getProducts(),
        apis.getCategories(),
        apis.getBrands()
      ]);
      
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
      return { products: productsRes.data, categories: categoriesRes.data, brands: brandsRes.data };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch data';
      console.error('Error fetching data:', err);
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Product operations
  const addProduct = useCallback(async (product: NewProduct) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apis.createProduct(product);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add product';
      console.error('Error adding product:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  const updateProduct = useCallback(async (product: Product) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { id, Category, Brand, sales, ...productData } = product;
      await apis.updateProduct(id, productData);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update product';
      console.error('Error updating product:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  const deleteProduct = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apis.deleteProduct(id);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete product';
      console.error('Error deleting product:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  // Category operations
  const addCategory = useCallback(async (category: CategoryRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apis.createCategory(category);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add category';
      console.error('Error adding category:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  const updateCategory = useCallback(async (category: Category) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { id, ...categoryData } = category;
      await apis.updateCategory(id, categoryData);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update category';
      console.error('Error updating category:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  const deleteCategory = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apis.deleteCategory(id);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete category';
      console.error('Error deleting category:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  // Brand operations
  const addBrand = useCallback(async (brand: BrandRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apis.createBrand(brand);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add brand';
      console.error('Error adding brand:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  const updateBrand = useCallback(async (brand: Brand) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { id, ...brandData } = brand;
      await apis.updateBrand(id, brandData);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update brand';
      console.error('Error updating brand:', err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  const deleteBrand = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apis.deleteBrand(id);
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete brand';
      console.error('Error deleting brand:', err);
      setError(errorMsg);
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