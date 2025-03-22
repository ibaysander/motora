import { useState, useMemo } from 'react';
import type { PaginationConfig } from '../types';

export function usePagination<T>(
  items: T[],
  defaultConfig: PaginationConfig = { currentPage: 1, itemsPerPage: 10 }
) {
  const [config, setConfig] = useState<PaginationConfig>(defaultConfig);

  const totalPages = useMemo(() => 
    Math.ceil(items.length / config.itemsPerPage),
    [items.length, config.itemsPerPage]
  );

  const paginatedItems = useMemo(() => {
    const startIndex = (config.currentPage - 1) * config.itemsPerPage;
    const endIndex = startIndex + config.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, config.currentPage, config.itemsPerPage]);

  const setPage = (page: number) => {
    setConfig((prev: PaginationConfig) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, totalPages))
    }));
  };

  const setItemsPerPage = (count: number) => {
    setConfig((prev: PaginationConfig) => ({
      ...prev,
      itemsPerPage: count,
      currentPage: 1
    }));
  };

  return {
    paginatedItems,
    currentPage: config.currentPage,
    itemsPerPage: config.itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage
  };
} 