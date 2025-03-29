export interface Motorcycle {
  id: number;
  manufacturer: string;
  model: string | null;
}

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

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
} 