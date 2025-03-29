import React from 'react';
import { Product, SortConfig } from '../types';

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
    <div className={`rounded-lg shadow w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full w-full table-fixed">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium w-12">No</th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Category', 'Category.name')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Brand', 'Brand.name')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Manufacturer', 'Motorcycle.manufacturer')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium w-28">
                {renderSortButton('Model', 'Motorcycle.model')}
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
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{index + 1}</td>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{product.Category?.name}</td>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{product.Brand?.name}</td>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{product.Motorcycle?.manufacturer}</td>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{product.Motorcycle?.model}</td>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{product.tipeSize}</td>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{product.currentStock}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList; 