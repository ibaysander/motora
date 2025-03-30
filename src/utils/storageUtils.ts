/**
 * Get an item from localStorage with proper typing and error handling
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set an item in localStorage with proper error handling
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
  }
};

/**
 * Remove an item from localStorage with proper error handling
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
  }
};

/**
 * Check if an item exists in localStorage
 */
export const hasStorageItem = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage item ${key}:`, error);
    return false;
  }
}; 