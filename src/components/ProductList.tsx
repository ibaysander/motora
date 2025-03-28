import React from 'react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, isDarkMode }) => {
  return (
    <div className="flex flex-col gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className={`flex items-center justify-between p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              {/* Product image or placeholder */}
              <span className="text-2xl">🛵</span>
            </div>
            <div>
              <h3 className="font-medium">{product.tipeMotor || 'N/A'}</h3>
              <p className="text-sm text-gray-500">ID: {product.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium">
                {product.hargaJual
                  ? `Rp ${product.hargaJual.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className={`font-medium ${
                product.currentStock <= (product.minThreshold || 0)
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}>
                {product.currentStock}
              </p>
            </div>

            <div className="w-32">
              <p className="text-sm text-gray-500">Sales</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${Math.min((product.sales / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{product.sales}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList; 