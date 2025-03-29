export namespace ApiTypes {
  // General API response interface
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
  }

  // Motorcycle related types
  export interface Motorcycle {
    id: number;
    manufacturer: string;
    model: string | null;
  }

  export interface MotorcycleRequest {
    manufacturer: string;
    model: string | null;
  }

  export interface MotorcycleResponse extends ApiResponse<Motorcycle> {}
  export interface MotorcyclesResponse extends ApiResponse<Motorcycle[]> {}

  // Product related types
  export interface Product {
    id: number;
    categoryId: number | null;
    brandId: number | null;
    motorcycleId: number | null;
    Category?: {
      id: number;
      name: string;
    } | null;
    Brand?: {
      id: number;
      name: string;
    } | null;
    Motorcycle?: Motorcycle | null;
    tipeSize: string | null;
    currentStock: number;
    minThreshold: number;
    hargaBeli: number | null;
    hargaJual: number | null;
    note: string | null;
    sales?: number;
  }

  export interface ProductRequest {
    categoryId: number | null;
    brandId: number | null;
    motorcycleId: number | null;
    tipeSize: string | null;
    currentStock: number;
    minThreshold: number;
    hargaBeli: number | null;
    hargaJual: number | null;
    note: string | null;
  }

  export interface ProductResponse extends ApiResponse<Product> {}
  export interface ProductsResponse extends ApiResponse<Product[]> {}

  // Category related types
  export interface Category {
    id: number;
    name: string;
  }

  export interface CategoryRequest {
    name: string;
  }

  export interface CategoryResponse extends ApiResponse<Category> {}
  export interface CategoriesResponse extends ApiResponse<Category[]> {}

  // Brand related types
  export interface Brand {
    id: number;
    name: string;
  }

  export interface BrandRequest {
    name: string;
  }

  export interface BrandResponse extends ApiResponse<Brand> {}
  export interface BrandsResponse extends ApiResponse<Brand[]> {}

  // Auth related types
  export interface AuthRequest {
    username: string;
    password: string;
  }

  export interface AuthResponse extends ApiResponse<{
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
    }
  }> {}
}

// Export common types for direct import
export type Product = ApiTypes.Product;
export type Category = ApiTypes.Category;
export type Brand = ApiTypes.Brand;
export type Motorcycle = ApiTypes.Motorcycle;
export type ProductRequest = ApiTypes.ProductRequest;
export type CategoryRequest = ApiTypes.CategoryRequest;
export type BrandRequest = ApiTypes.BrandRequest;
export type MotorcycleRequest = ApiTypes.MotorcycleRequest; 