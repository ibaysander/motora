import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, isDarkMode }) => {
  return (
    <div 
      className={`rounded-lg shadow-lg p-4 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.Motorcycle ? 
              `${product.Motorcycle.manufacturer || ''} ${product.Motorcycle.model || ''}`.trim() 
              : 'N/A'}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {product.tipeSize || 'N/A'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="text-blue-500 hover:text-blue-600"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-500 hover:text-red-600"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</p>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.Category?.name || 'N/A'}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Brand</p>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.Brand?.name || 'N/A'}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock</p>
          <p className={`text-sm font-medium ${
            product.currentStock <= product.minThreshold
              ? 'text-red-500'
              : isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {product.currentStock} / {product.minThreshold}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sales</p>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.sales || 0}
          </p>
        </div>
      </div>

      <div className="border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Buy Price</p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Rp {product.hargaBeli?.toLocaleString() || 'N/A'}
            </p>
          </div>
          <div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sell Price</p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Rp {product.hargaJual?.toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>
        {product.note && (
          <div className="mt-2">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Note</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.note}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 