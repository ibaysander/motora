import React from 'react';
import { Product } from '../types';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isDarkMode?: boolean;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, isDarkMode, sortConfig, onSort }) => {
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className={`min-w-full rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Category', 'Category.name')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Brand', 'Brand.name')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Tipe Motor', 'tipeMotor')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Tipe/Size', 'tipeSize')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Current Stock', 'currentStock')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Min Stock', 'minThreshold')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Harga Beli', 'hargaBeli')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Harga Jual', 'hargaJual')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              {renderSortButton('Note', 'note')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <td className="px-6 py-4 text-sm">{index + 1}</td>
              <td className="px-6 py-4 text-sm">{product.Category?.name}</td>
              <td className="px-6 py-4 text-sm">{product.Brand?.name}</td>
              <td className="px-6 py-4 text-sm">{product.tipeMotor}</td>
              <td className="px-6 py-4 text-sm">{product.tipeSize}</td>
              <td className="px-6 py-4 text-sm">{product.currentStock}</td>
              <td className="px-6 py-4 text-sm">{product.minThreshold}</td>
              <td className="px-6 py-4 text-sm">
                {product.hargaBeli !== null ? new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(product.hargaBeli) : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                {product.hargaJual !== null ? new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(product.hargaJual) : '-'}
              </td>
              <td className="px-6 py-4 text-sm">{product.note}</td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => onEdit(product)}
                  className="text-blue-500 hover:text-blue-600 mr-4"
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList; 