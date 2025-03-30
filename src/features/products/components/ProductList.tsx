import React, { useState, useEffect } from 'react';
import { Product, SortConfig, Motorcycle } from '../types';
import axios from 'axios';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isDarkMode?: boolean;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, isDarkMode, sortConfig, onSort }) => {
  const [productCompatibility, setProductCompatibility] = useState<{[key: number]: Motorcycle[]}>({});
  
  // Fetch product compatibility data
  useEffect(() => {
    const fetchCompatibility = async () => {
      try {
        const productIds = products.map(product => product.id);
        const response = await axios.get('/api/product-compatibilities', {
          params: { productIds: productIds.join(',') }
        });
        setProductCompatibility(response.data || {});
      } catch (error) {
        console.error('Error fetching compatibility data:', error);
        // Create an empty compatibility map object to avoid UI errors
        const emptyCompatibilityMap = products.reduce((acc, product) => {
          acc[product.id] = [];
          return acc;
        }, {} as { [key: number]: Motorcycle[] });
        
        setProductCompatibility(emptyCompatibilityMap);
      }
    };
    
    if (products.length > 0) {
      fetchCompatibility();
    }
  }, [products]);
  
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const renderSortButton = (label: string, key: string) => (
    <button
      onClick={() => onSort(key)}
      className="flex items-center gap-1 hover:bg-opacity-10 hover:bg-gray-500 px-1 py-0.5 rounded"
    >
      {label}
      <span className="text-xs">{getSortIcon(key)}</span>
    </button>
  );

  // Group motorcycles by their type (Matic or Manual)
  const getTypeClass = (type: string | null) => {
    if (type === 'Matic') return isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100';
    if (type === 'Manual') return isDarkMode ? 'bg-green-900/30' : 'bg-green-100';
    return '';
  };

  // Get a badge for the motorcycle type
  const getTypeBadge = (type: string | null) => {
    if (!type) return null;
    
    const classes = type === 'Matic'
      ? `px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-200 text-blue-800'}`
      : `px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-200 text-green-800'}`;
    
    return (
      <span className={classes}>
        {type}
      </span>
    );
  };
  
  // Function to render compatibility summary
  const renderCompatibilitySummary = (productId: number) => {
    const compatibleMotorcycles = productCompatibility[productId] || [];
    if (!compatibleMotorcycles || compatibleMotorcycles.length === 0) {
      return <span className="text-gray-400">None</span>;
    }
    
    // Group by manufacturer for display
    const manufacturers = compatibleMotorcycles.reduce((acc, moto) => {
      if (!acc[moto.manufacturer]) {
        acc[moto.manufacturer] = [];
      }
      acc[moto.manufacturer].push(moto);
      return acc;
    }, {} as {[key: string]: Motorcycle[]});
    
    return (
      <div className="max-w-xs">
        {Object.entries(manufacturers).map(([manufacturer, motos]) => (
          <div key={manufacturer} className="mb-1">
            <span className="font-medium">{manufacturer}</span>
            <span className="ml-1 text-xs">
              ({motos.length})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden">
      <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium w-12">No</th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Category', 'Category.name')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Brand', 'Brand.name')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-36">
                {renderSortButton('Compatibility', 'compatibility')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Tipe/Size', 'tipeSize')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-20">
                {renderSortButton('Current', 'currentStock')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-20">
                {renderSortButton('Min', 'minThreshold')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-24">
                {renderSortButton('Harga Beli', 'hargaBeli')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-24">
                {renderSortButton('Harga Jual', 'hargaJual')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Note', 'note')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product, index) => {
              const isLowStock = product.currentStock <= product.minThreshold;
              return (
                <tr 
                  key={product.id} 
                  className={`border-t ${
                    isDarkMode 
                      ? `border-gray-700 ${isLowStock ? 'bg-red-900/30' : 'hover:bg-gray-700/50'}`
                      : `border-gray-200 ${isLowStock ? 'bg-red-100' : 'hover:bg-gray-50'}`
                  } ${isLowStock ? 'font-medium' : ''}`}
                >
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{index + 1}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{product.Category?.name}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{product.Brand?.name}</td>
                  <td className="px-3 py-3 text-xs">
                    {renderCompatibilitySummary(product.id)}
                  </td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{product.tipeSize}</td>
                  <td className={`px-3 py-3 text-xs whitespace-nowrap ${isLowStock ? 'text-red-500 font-bold' : ''}`}>
                    {product.currentStock}
                  </td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{product.minThreshold}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">
                    {product.hargaBeli !== null ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(product.hargaBeli) : '-'}
                  </td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">
                    {product.hargaJual !== null ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(product.hargaJual) : '-'}
                  </td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{product.note}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-blue-500 hover:text-blue-600 mr-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList; 