// @ts-ignore
import { useState, useCallback } from 'react';

interface UseDataActionsProps {
  apiUrl: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onDataUpdated: () => void;
}

interface UseDataActionsResult {
  isClearDataModalOpen: boolean;
  setIsClearDataModalOpen: (isOpen: boolean) => void;
  handleClearData: () => Promise<void>;
}

/**
 * Custom hook for managing data actions like clearing data
 * @param props Configuration for the data actions
 * @returns Object containing state and handler functions for data actions
 */
export const useDataActions = ({
  apiUrl,
  onSuccess,
  onError,
  onDataUpdated
}: UseDataActionsProps): UseDataActionsResult => {
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  const handleClearData = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/products/clear-all`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

      // Refresh data
      onDataUpdated();
      setIsClearDataModalOpen(false);
      
      onSuccess('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      onError('Failed to clear data');
    }
  }, [apiUrl, onSuccess, onError, onDataUpdated]);

  return {
    isClearDataModalOpen,
    setIsClearDataModalOpen,
    handleClearData
  };
}; 