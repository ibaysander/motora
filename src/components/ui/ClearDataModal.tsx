import React from 'react';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

const ClearDataModal: React.FC<ClearDataModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDarkMode
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`rounded-lg p-6 w-96 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-6">Confirm Reset Data</h2>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Are you sure you want to clear all data? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearDataModal; 