export type NotificationType = 'success' | 'error';

export interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

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

export interface TransactionItem {
  id?: number;
  transaction_id?: number;
  product_id: number;
  quantity: number;
  price: number;
  unit_price: number;
  product?: Product;
}

export interface Transaction {
  id: number;
  date: string;
  type: string;
  total_amount: number;
  payment_method: string;
  customer_name: string | null;
  notes: string | null;
  // For backwards compatibility
  totalAmount?: number;
  paymentMethod?: string;
  customer?: string | null;
  note?: string | null;
  items?: TransactionItem[];
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
} 