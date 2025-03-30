import React from 'react';

interface ImportExportButtonsProps {
  isDarkMode: boolean;
  handleImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExport: () => void;
  isImporting: boolean;
  isExporting: boolean;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  isDarkMode,
  handleImportExcel,
  handleExport,
  isImporting,
  isExporting
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <div className="relative">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleImportExcel}
          className="hidden"
          id="file-upload"
          disabled={isImporting}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm ${
            isDarkMode
              ? isImporting 
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              : isImporting
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
          } text-white flex items-center gap-1.5`}
        >
          {isImporting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Importing...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>Import Excel</span>
            </>
          )}
        </label>
      </div>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`px-3 py-1.5 rounded-lg text-sm ${
          isDarkMode
            ? isExporting
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
            : isExporting
              ? 'bg-green-300 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
        } text-white flex items-center gap-1.5`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM13.707 6.707a1 1 0 010-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 5.414V13a1 1 0 102 0V5.414l1.293 1.293a1 1 0 001.414 0z" clipRule="evenodd" />
            </svg>
            <span>Export Excel</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ImportExportButtons; 