export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Product {
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
  Category?: Category;
  Brand?: Brand;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
}

export type NotificationType = 'success' | 'error';

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
} 