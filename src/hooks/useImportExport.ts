// @ts-ignore
import React, { useState, useCallback } from 'react';

interface UseImportExportProps {
  apiUrl: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onDataUpdated: () => void;
}

interface UseImportExportResult {
  isImporting: boolean;
  isExporting: boolean;
  handleImportExcel: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleExport: () => Promise<void>;
}

/**
 * Custom hook for handling import and export operations
 * @param props Configuration for the import/export operations
 * @returns Object containing import/export state and handler functions
 */
export const useImportExport = ({
  apiUrl,
  onSuccess,
  onError,
  onDataUpdated
}: UseImportExportProps): UseImportExportResult => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImportExcel = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    try {
      console.log('Sending import request to:', `${apiUrl}/import-excel`);
      const response = await fetch(`${apiUrl}/import-excel`, {
        method: 'POST',
        body: formData,
      });

      console.log('Import response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Import error:', errorText);
        throw new Error(`Import failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Import result:', result);
      
      // Fetch updated data after successful import
      onDataUpdated();
      
      onSuccess('Data imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      onError(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [apiUrl, onSuccess, onError, onDataUpdated]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      console.log('Sending export request to:', `${apiUrl}/export-excel`);
      const response = await fetch(`${apiUrl}/export-excel`);
      
      console.log('Export response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export error:', errorText);
        throw new Error(`Export failed: ${errorText}`);
      }

      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="?([^"]*)"?/);
      const filename = filenameMatch ? filenameMatch[1] : 'products.xlsx';

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onSuccess('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      onError(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }, [apiUrl, onSuccess, onError]);

  return {
    isImporting,
    isExporting,
    handleImportExcel,
    handleExport
  };
}; 