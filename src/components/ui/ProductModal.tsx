import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, Brand } from '../../hooks/useApi';
import { Motorcycle } from '../../features/products/types';
import axios from 'axios';

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
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMotorcycleDropdown, setShowMotorcycleDropdown] = useState(false);
  const [isCreatingMotorcycle, setIsCreatingMotorcycle] = useState(false);
  const [newMotorcycle, setNewMotorcycle] = useState<{ manufacturer: string; model: string | null }>({
    manufacturer: '',
    model: null
  });

  // Fetch motorcycles on component mount
  useEffect(() => {
    const fetchMotorcycles = async () => {
      try {
        const response = await axios.get('/api/motorcycles');
        setMotorcycles(response.data);
      } catch (error) {
        console.error('Error fetching motorcycles:', error);
      }
    };
    
    if (isOpen) {
      fetchMotorcycles();
      
      // Set search term if product has a motorcycle
      if (product?.motorcycleId) {
        const motorcycle = motorcycles.find(m => m.id === product.motorcycleId);
        if (motorcycle) {
          setSearchTerm(`${motorcycle.manufacturer}${motorcycle.model ? ` ${motorcycle.model}` : ''}`);
        }
      } else {
        setSearchTerm('');
      }
    }
  }, [isOpen, product?.motorcycleId, motorcycles]);

  // Filter motorcycles based on search term
  const filteredMotorcycles = useMemo(() => {
    if (!searchTerm.trim()) return motorcycles;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return motorcycles.filter(
      moto => moto.manufacturer.toLowerCase().includes(lowerSearchTerm) ||
             (moto.model && moto.model.toLowerCase().includes(lowerSearchTerm))
    );
  }, [motorcycles, searchTerm]);

  // Handle motorcycle creation
  const handleCreateMotorcycle = async () => {
    if (!newMotorcycle.manufacturer.trim()) {
      alert('Manufacturer is required');
      return;
    }
    
    try {
      const response = await axios.post('/api/motorcycles', newMotorcycle);
      const createdMotorcycle = response.data;
      
      // Add to local state
      setMotorcycles(prev => [...prev, createdMotorcycle]);
      
      // Select the new motorcycle
      setProduct({ ...product, motorcycleId: createdMotorcycle.id });
      setSearchTerm(`${createdMotorcycle.manufacturer}${createdMotorcycle.model ? ` ${createdMotorcycle.model}` : ''}`);
      
      // Reset state
      setIsCreatingMotorcycle(false);
      setNewMotorcycle({ manufacturer: '', model: null });
    } catch (error) {
      console.error('Error creating motorcycle:', error);
      alert('Failed to create motorcycle');
    }
  };

  if (!isOpen) return null;
  
  const title = isAddMode ? 'Add New Product' : 'Edit Product';
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`rounded-lg p-6 w-11/12 md:w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        
        {isCreatingMotorcycle ? (
          <div className="mb-6 p-4 border rounded">
            <h3 className="text-xl mb-3">Add New Motorcycle</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-sm">Manufacturer:</label>
                <input
                  type="text"
                  value={newMotorcycle.manufacturer}
                  onChange={(e) => setNewMotorcycle({ ...newMotorcycle, manufacturer: e.target.value })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter manufacturer (e.g., Honda)"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Model (optional):</label>
                <input
                  type="text"
                  value={newMotorcycle.model || ''}
                  onChange={(e) => setNewMotorcycle({ ...newMotorcycle, model: e.target.value || null })}
                  className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  placeholder="Enter model (e.g., Supra)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsCreatingMotorcycle(false)}
                className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateMotorcycle}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save Motorcycle
              </button>
            </div>
          </div>
        ) : (
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
            <div className="col-span-2">
              <label className="block mb-1 text-sm">Motorcycle:</label>
              <div className="relative">
                <div className="flex">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowMotorcycleDropdown(true);
                      if (!e.target.value) {
                        setProduct({ ...product, motorcycleId: null });
                      }
                    }}
                    onFocus={() => setShowMotorcycleDropdown(true)}
                    className={`border rounded-lg p-3 text-sm w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                    placeholder="Search for motorcycle (e.g., Honda Supra)"
                  />
                  <button
                    onClick={() => setIsCreatingMotorcycle(true)}
                    className="ml-2 p-3 bg-blue-500 text-white rounded-lg"
                    title="Add New Motorcycle"
                  >
                    +
                  </button>
                </div>
                
                {showMotorcycleDropdown && filteredMotorcycles.length > 0 && (
                  <div 
                    className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    {filteredMotorcycles.map(motorcycle => (
                      <div 
                        key={motorcycle.id}
                        className={`p-2 cursor-pointer ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        onClick={() => {
                          setProduct({ ...product, motorcycleId: motorcycle.id });
                          setSearchTerm(`${motorcycle.manufacturer}${motorcycle.model ? ` ${motorcycle.model}` : ''}`);
                          setShowMotorcycleDropdown(false);
                        }}
                      >
                        {motorcycle.manufacturer}{motorcycle.model ? ` ${motorcycle.model}` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        )}
        
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
            disabled={isCreatingMotorcycle}
          >
            {isAddMode ? 'Save' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal; 