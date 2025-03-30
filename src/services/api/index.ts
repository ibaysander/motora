import axiosClient from './axios-client';
import { ApiTypes, Product, Category, Brand, ProductRequest, CategoryRequest, BrandRequest } from './types';

export * from './types';

/**
 * API endpoints for the application
 */
export const apis = {
  // Product APIs
  getProducts: () => 
    axiosClient.get<Product[]>('/products'),
  
  getProduct: (id: number) => 
    axiosClient.get<Product>(`/products/${id}`),
  
  createProduct: (product: ProductRequest) => 
    axiosClient.post<Product>('/products', product),
  
  updateProduct: (id: number, product: ProductRequest) => 
    axiosClient.put<Product>(`/products/${id}`, product),
  
  deleteProduct: (id: number) => 
    axiosClient.delete(`/products/${id}`),

  // Category APIs
  getCategories: () => 
    axiosClient.get<Category[]>('/categories'),
  
  getCategory: (id: number) => 
    axiosClient.get<Category>(`/categories/${id}`),
  
  createCategory: (category: CategoryRequest) => 
    axiosClient.post<Category>('/categories', category),
  
  updateCategory: (id: number, category: CategoryRequest) => 
    axiosClient.put<Category>(`/categories/${id}`, category),
  
  deleteCategory: (id: number) => 
    axiosClient.delete(`/categories/${id}`),

  // Brand APIs
  getBrands: () => 
    axiosClient.get<Brand[]>('/brands'),
  
  getBrand: (id: number) => 
    axiosClient.get<Brand>(`/brands/${id}`),
  
  createBrand: (brand: BrandRequest) => 
    axiosClient.post<Brand>('/brands', brand),
  
  updateBrand: (id: number, brand: BrandRequest) => 
    axiosClient.put<Brand>(`/brands/${id}`, brand),
  
  deleteBrand: (id: number) => 
    axiosClient.delete(`/brands/${id}`),

  // Auth APIs
  login: (credentials: ApiTypes.AuthRequest) => 
    axiosClient.post<ApiTypes.AuthResponse>('/auth/login', credentials),
  
  logout: () => 
    axiosClient.post<ApiTypes.ApiResponse<null>>('/auth/logout'),
}; 