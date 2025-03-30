// @ts-ignore
import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storageUtils';

/**
 * Custom hook for managing localStorage values with proper typing
 * @param key The localStorage key
 * @param initialValue The initial value if nothing exists in storage
 * @returns [storedValue, setValue] tuple similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get the stored value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStorageItem<T>(key, initialValue);
  });

  // Update localStorage whenever the stored value changes
  useEffect(() => {
    setStorageItem(key, storedValue);
  }, [key, storedValue]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save to state
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage value for ${key}:`, error);
    }
  };

  return [storedValue, setValue];
} 