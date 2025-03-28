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
  sales: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
} 