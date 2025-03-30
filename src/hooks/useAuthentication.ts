// @ts-ignore
import { useState, useEffect, useCallback } from 'react';

interface UseAuthenticationResult {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  handleLogin: () => void;
  handleLogout: () => void;
}

/**
 * Custom hook for managing authentication state
 * @returns Object containing authentication state and handler functions
 */
export const useAuthentication = (): UseAuthenticationResult => {
  // Initialize with value from localStorage or default to not authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });
  
  // Update localStorage whenever authentication state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);
  
  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);
  
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  }, []);
  
  return {
    isAuthenticated,
    setIsAuthenticated,
    handleLogin,
    handleLogout
  };
}; 