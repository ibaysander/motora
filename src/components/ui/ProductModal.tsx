import React from 'react';
import { Product, Category, Brand } from '../../hooks/useApi';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Partial<Product> | null;
  setProduct: (product: Partial<Product>) => void;
  categories: Category[];
  brands: Brand[];
  isDarkMode: boolean;
  isAddMode: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  setProduct,
  categories,
  brands,
  isDarkMode,
  isAddMode
}) => {
  if (!isOpen) return null;
  
  const title = isAddMode ? 'Add New Product' : 'Edit Product';
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`rounded-lg p-6 w-11/12 md:w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm">Category:</label>
            <select
              value={product?.categoryId || 0}
              onChange={(e) => setProduct({ ...product, categoryId: Number(e.target.value) })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value={0} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select Category</option>
              {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                <option key={category.id} value={category.id} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Brand:</label>
            <select
              value={product?.brandId || 0}
              onChange={(e) => setProduct({ ...product, brandId: Number(e.target.value) })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value={0} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select Brand</option>
              {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map(brand => (
                <option key={brand.id} value={brand.id} className={isDarkMode ? 'bg-gray-700 text-white' : ''}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Tipe Motor:</label>
            <input
              type="text"
              value={product?.tipeMotor || ''}
              onChange={(e) => setProduct({ ...product, tipeMotor: e.target.value })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
              placeholder="Enter tipe motor"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Tipe/Size:</label>
            <input
              type="text"
              value={product?.tipeSize || ''}
              onChange={(e) => setProduct({ ...product, tipeSize: e.target.value })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
              placeholder="Enter tipe size"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Harga Beli:</label>
            <input
              type="number"
              value={product?.hargaBeli || ''}
              onChange={(e) => setProduct({ ...product, hargaBeli: e.target.value ? Number(e.target.value) : null })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Harga Jual:</label>
            <input
              type="number"
              value={product?.hargaJual || ''}
              onChange={(e) => setProduct({ ...product, hargaJual: e.target.value ? Number(e.target.value) : null })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Note:</label>
            <input
              type="text"
              value={product?.note || ''}
              onChange={(e) => setProduct({ ...product, note: e.target.value })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Current Stock:</label>
            <input
              type="number"
              value={product?.currentStock || ''}
              onChange={(e) => setProduct({ ...product, currentStock: e.target.value ? Number(e.target.value) : 0 })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Min Stock Threshold:</label>
            <input
              type="number"
              value={product?.minThreshold || ''}
              onChange={(e) => setProduct({ ...product, minThreshold: e.target.value ? Number(e.target.value) : 0 })}
              className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            {isAddMode ? 'Save' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal; 