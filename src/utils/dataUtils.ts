// Define types for sorting and pagination
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
}

/**
 * Sort an array of objects based on a configuration
 * @param data The data array to sort
 * @param config The sort configuration (key and direction)
 * @returns Sorted array
 */
export const sortData = <T extends Record<string, any>>(
  data: T[],
  config: SortConfig
): T[] => {
  if (!config.key) return data;

  return [...data].sort((a, b) => {
    // Handle nested properties (e.g., 'category.name')
    const getValue = (obj: any, path: string) => {
      const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
      return value === undefined || value === null ? null : value;
    };

    const aValue = getValue(a, config.key);
    const bValue = getValue(b, config.key);

    // Handle null/undefined values - always sort them to the end
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    // Handle numeric values (including string numbers)
    if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
      const numA = Number(aValue);
      const numB = Number(bValue);
      return config.direction === 'asc' ? numA - numB : numB - numA;
    }
    
    // Handle string values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return config.direction === 'asc'
        ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
        : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
    }
    
    // Fallback for other types
    return config.direction === 'asc'
      ? aValue > bValue ? 1 : -1
      : bValue > aValue ? 1 : -1;
  });
};

/**
 * Get a sort icon based on the current sort state
 * @param key The column key
 * @param config The current sort configuration
 * @returns Icon to display
 */
export const getSortIcon = (key: string, config: SortConfig): string => {
  if (config.key !== key) return '↕';
  return config.direction === 'asc' ? '↑' : '↓';
};

/**
 * Paginate an array of data based on configuration
 * @param data The data array to paginate
 * @param config The pagination configuration
 * @returns Paginated array
 */
export const paginateData = <T extends Record<string, any>>(
  data: T[],
  config: PaginationConfig
): T[] => {
  const startIndex = (config.currentPage - 1) * config.itemsPerPage;
  const endIndex = startIndex + config.itemsPerPage;
  return data.slice(startIndex, endIndex);
};

/**
 * Calculate the total number of pages
 * @param totalItems Total number of items
 * @param itemsPerPage Number of items per page
 * @returns Total number of pages
 */
export const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

/**
 * Filter data based on a search query
 * @param data The data to filter
 * @param query The search query
 * @param fields The fields to search in
 * @returns Filtered data
 */
export const filterBySearch = <T extends Record<string, any>>(
  data: T[],
  searchQuery: string,
  fields: string[]
): T[] => {
  if (!searchQuery) return data;
  
  const lowercasedQuery = searchQuery.toLowerCase();
  
  return data.filter(item => {
    return fields.some(field => {
      const pathParts = field.split('.');
      let value = item as any;
      
      // Navigate through nested properties
      for (const part of pathParts) {
        if (value === null || value === undefined) return false;
        value = value[part];
      }
      
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowercasedQuery);
    });
  });
}; 