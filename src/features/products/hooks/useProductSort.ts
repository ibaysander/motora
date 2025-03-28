import { useState, useMemo } from 'react';
import type { SortConfig } from '../types';

const useProductSort = <T extends Record<string, any>>(
  items: T[],
  defaultConfig: SortConfig = { key: '', direction: 'asc' }
) => {
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

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [items, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig((currentConfig: SortConfig) => ({
      key,
      direction: currentConfig.key === key && currentConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return { sortedItems, sortConfig, requestSort };
};

export default useProductSort; 