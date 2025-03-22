import { useState, useMemo } from 'react';
import type { SortConfig } from '../types';

export function useSort<T extends Record<string, any>>(
  items: T[],
  defaultConfig: SortConfig = { key: '', direction: 'asc' }
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultConfig);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (bValue > aValue ? 1 : -1);
    });
  }, [items, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig((prevConfig: SortConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  return { sortedItems, sortConfig, requestSort };
} 