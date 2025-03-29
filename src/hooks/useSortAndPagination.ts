// @ts-ignore
import { useState, useCallback, useEffect } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
}

interface UseSortAndPaginationProps<T> {
  initialData: T[];
  initialSortConfig?: SortConfig;
  initialPaginationConfig?: PaginationConfig;
  localStorageKey?: string;
}

interface UseSortAndPaginationResult<T> {
  sortedData: T[];
  paginatedData: T[];
  sortConfig: SortConfig;
  paginationConfig: PaginationConfig;
  totalPages: number;
  requestSort: (key: string) => void;
  getSortIcon: (key: string) => string;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (itemsPerPage: number) => void;
  jumpToPage: string;
  setJumpToPage: (page: string) => void;
  handleJumpToPage: () => void;
}

/**
 * Custom hook for managing sorting and pagination
 * @param props Configuration for sorting and pagination
 * @returns Object containing state and handler functions for sorting and pagination
 */
export const useSortAndPagination = <T extends Record<string, any>>({
  initialData,
  initialSortConfig = { key: '', direction: 'asc' },
  initialPaginationConfig = { currentPage: 1, itemsPerPage: 10 },
  localStorageKey
}: UseSortAndPaginationProps<T>): UseSortAndPaginationResult<T> => {
  // Initialize pagination configs with localStorage values if provided
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>(() => {
    if (localStorageKey) {
      const saved = localStorage.getItem(`${localStorageKey}Pagination`);
      return saved ? JSON.parse(saved) : initialPaginationConfig;
    }
    return initialPaginationConfig;
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);
  const [jumpToPage, setJumpToPage] = useState<string>('');

  // Save pagination settings to localStorage whenever they change
  useEffect(() => {
    if (localStorageKey) {
      localStorage.setItem(`${localStorageKey}Pagination`, JSON.stringify(paginationConfig));
    }
  }, [paginationConfig, localStorageKey]);

  const sortData = useCallback((data: T[]): T[] => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      // Handle nested properties (e.g., 'category.name')
      const getValue = (obj: any, path: string) => {
        const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
        return value === undefined || value === null ? null : value;
      };

      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      // Handle null/undefined values - always sort them to the end
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Handle numeric values (including string numbers)
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        const numA = Number(aValue);
        const numB = Number(bValue);
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
          : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
      }
      
      // Fallback for other types
      return sortConfig.direction === 'asc'
        ? aValue > bValue ? 1 : -1
        : bValue > aValue ? 1 : -1;
    });
  }, [sortConfig]);

  const requestSort = useCallback((key: string) => {
    setSortConfig((prevConfig: SortConfig) => {
      if (prevConfig.key === key) {
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return { key: '', direction: 'asc' }; // Reset sorting
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const getSortIcon = useCallback((key: string): string => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  }, [sortConfig]);

  const paginateData = useCallback((data: T[]): T[] => {
    const startIndex = (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage;
    const endIndex = startIndex + paginationConfig.itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [paginationConfig]);

  const getTotalPages = useCallback((totalItems: number): number => {
    return Math.ceil(totalItems / paginationConfig.itemsPerPage);
  }, [paginationConfig.itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setPaginationConfig((prev: PaginationConfig) => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    setPaginationConfig((prev: PaginationConfig) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1
    }));
  }, []);

  const handleJumpToPage = useCallback(() => {
    const page = parseInt(jumpToPage);
    const totalPages = getTotalPages(initialData.length);

    if (page > 0 && page <= totalPages) {
      handlePageChange(page);
      setJumpToPage('');
    }
  }, [jumpToPage, initialData.length, getTotalPages, handlePageChange]);

  const sortedData = sortData(initialData);
  const paginatedData = paginateData(sortedData);
  const totalPages = getTotalPages(sortedData.length);

  return {
    sortedData,
    paginatedData,
    sortConfig,
    paginationConfig,
    totalPages,
    requestSort,
    getSortIcon,
    handlePageChange,
    handleItemsPerPageChange,
    jumpToPage,
    setJumpToPage,
    handleJumpToPage
  };
}; 