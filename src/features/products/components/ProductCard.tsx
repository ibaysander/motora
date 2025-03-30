import React from 'react';
import { Product, Motorcycle } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
  compatibleMotorcycles?: Motorcycle[];
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  isDarkMode,
  compatibleMotorcycles = []
}) => {
  // Get a badge for the motorcycle type
  const getTypeBadge = (type: string | null) => {
    if (!type) return null;
    
    const classes = type === 'Matic'
      ? `px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-200 text-blue-800'}`
      : `px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-200 text-green-800'}`;
    
    return (
      <span className={classes}>
        {type}
      </span>
    );
  };

  // Group motorcycles by manufacturer
  const groupedCompatibility = compatibleMotorcycles.reduce((groups, motorcycle) => {
    const manufacturer = motorcycle.manufacturer;
    if (!groups[manufacturer]) {
      groups[manufacturer] = [];
    }
    groups[manufacturer].push(motorcycle);
    return groups;
  }, {} as Record<string, Motorcycle[]>);

  // Check if we have any compatibility data
  const hasCompatibilityData = Object.keys(groupedCompatibility).length > 0;
  
  // Check if stock is low
  const isLowStock = product.currentStock <= product.minThreshold;

  return (
    <div 
      className={`rounded-lg shadow-lg p-4 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border ${
        isLowStock 
          ? isDarkMode ? 'bg-red-900/30 border-red-800/50' : 'bg-red-100 border-red-300'
          : product.Motorcycle?.type === 'Matic' 
            ? isDarkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50 border-blue-200' 
            : product.Motorcycle?.type === 'Manual' 
              ? isDarkMode ? 'bg-green-900/10 border-green-800/30' : 'bg-green-50 border-green-200'
              : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.Motorcycle ? 
              `${product.Motorcycle.manufacturer || ''} ${product.Motorcycle.model || ''}`.trim() 
              : `${product.Category?.name || ''} ${product.Brand?.name || ''}`.trim() || 'No Data'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {product.Motorcycle?.type && getTypeBadge(product.Motorcycle.type)}
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {product.tipeSize || 'N/A'}
            </p>
          </div>
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
            isLowStock
              ? 'text-red-500 font-bold'
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

      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
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

      {/* Compatibility Section */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-3 mt-2`}>
        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Compatible With:</p>
        
        {!hasCompatibilityData ? (
          <p className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            None
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {Object.entries(groupedCompatibility).map(([manufacturer, motorcycles]) => (
              <div 
                key={manufacturer}
                className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode 
                    ? 'bg-blue-900/30 text-blue-100' 
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {manufacturer} ({motorcycles.length})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 