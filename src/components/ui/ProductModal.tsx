import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Motorcycle, Product } from '../../features/products/types';
import { Category } from '../../features/categories/types';
import { Brand } from '../../features/brands/types';

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
  const [isCreatingMotorcycle, setIsCreatingMotorcycle] = useState(false);
  const [newMotorcycle, setNewMotorcycle] = useState<{ manufacturer: string; model: string | null; type: 'Matic' | 'Manual' | '' }>({
    manufacturer: '',
    model: null,
    type: ''
  });
  const [compatibleMotorcycles, setCompatibleMotorcycles] = useState<Motorcycle[]>([]);
  const [selectedCompatibilityIds, setSelectedCompatibilityIds] = useState<number[]>([]);
  const [isLoadingCompatibility, setIsLoadingCompatibility] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    }
  }, [isOpen]);

  // Group motorcycles by type
  const groupedMotorcycles = useMemo(() => {
    const grouped = {
      'Matic': [] as Motorcycle[],
      'Manual': [] as Motorcycle[],
      'Other': [] as Motorcycle[]
    };

    motorcycles.forEach(moto => {
      if (moto.type === 'Matic') {
        grouped.Matic.push(moto);
      } else if (moto.type === 'Manual') {
        grouped.Manual.push(moto);
      } else {
        grouped.Other.push(moto);
      }
    });

    return grouped;
  }, [motorcycles]);

  // Handle motorcycle creation
  const handleCreateMotorcycle = async () => {
    if (!newMotorcycle.manufacturer.trim()) {
      alert('Manufacturer is required');
      return;
    }

    if (!newMotorcycle.type) {
      alert('Type (Matic/Manual) is required');
      return;
    }
    
    try {
      const response = await axios.post('/api/motorcycles', newMotorcycle);
      const createdMotorcycle = response.data;
      
      // Add to local state
      setMotorcycles(prev => [...prev, createdMotorcycle]);
      
      // Reset state
      setIsCreatingMotorcycle(false);
      setNewMotorcycle({ manufacturer: '', model: null, type: '' });
    } catch (error) {
      console.error('Error creating motorcycle:', error);
      alert('Failed to create motorcycle');
    }
  };

  // Add this useEffect to fetch compatible motorcycles when the product ID changes
  useEffect(() => {
    const fetchCompatibleMotorcycles = async () => {
      if (!product?.id) return;
      
      setIsLoadingCompatibility(true);
      try {
        const response = await axios.get(`/api/products/${product.id}/compatible-motorcycles`);
        const compatibleMotorcycles = response.data;
        setCompatibleMotorcycles(compatibleMotorcycles);
        setSelectedCompatibilityIds(compatibleMotorcycles.map((m: Motorcycle) => m.id));
      } catch (error) {
        console.error('Error fetching compatible motorcycles:', error);
      } finally {
        setIsLoadingCompatibility(false);
      }
    };
    
    if (product?.id && !isAddMode) {
      fetchCompatibleMotorcycles();
    } else {
      setCompatibleMotorcycles([]);
      setSelectedCompatibilityIds([]);
    }
  }, [product?.id, isAddMode]);

  // Add this function to handle saving the compatibility data
  const saveCompatibility = async () => {
    if (!product?.id) return;
    
    try {
      await axios.post(`/api/products/${product.id}/motorcycles`, {
        motorcycleIds: selectedCompatibilityIds
      });
    } catch (error) {
      console.error('Error saving compatibility:', error);
    }
  };

  // Modify the existing onSave function to also save compatibility
  const handleSave = async () => {
    onSave();
    if (!isAddMode && product?.id) {
      await saveCompatibility();
    }
  };

  // Add a function to toggle motorcycle selection
  const toggleMotorcycleSelection = (motorcycleId: number) => {
    if (selectedCompatibilityIds.includes(motorcycleId)) {
      setSelectedCompatibilityIds(selectedCompatibilityIds.filter(id => id !== motorcycleId));
    } else {
      setSelectedCompatibilityIds([...selectedCompatibilityIds, motorcycleId]);
    }
  };

  // Add a function to select all motorcycles of a given type
  const selectAllOfType = (type: string) => {
    const typeMotorcycles = type === 'Matic' ? groupedMotorcycles.Matic :
                            type === 'Manual' ? groupedMotorcycles.Manual :
                            groupedMotorcycles.Other;
    
    const typeMotorcycleIds = typeMotorcycles.map(m => m.id);
    
    // Add all of this type that aren't already selected
    const combined: number[] = [...selectedCompatibilityIds];
    typeMotorcycleIds.forEach(id => {
      if (!combined.includes(id)) {
        combined.push(id);
      }
    });
    
    setSelectedCompatibilityIds(combined);
  };

  // Add a function to deselect all motorcycles of a given type
  const deselectAllOfType = (type: string) => {
    const typeMotorcycles = type === 'Matic' ? groupedMotorcycles.Matic :
                            type === 'Manual' ? groupedMotorcycles.Manual :
                            groupedMotorcycles.Other;
    
    const typeMotorcycleIds = typeMotorcycles.map(m => m.id);
    
    // Remove all of this type from currently selected
    setSelectedCompatibilityIds(
      selectedCompatibilityIds.filter(id => !typeMotorcycleIds.includes(id))
    );
  };

  if (!isOpen) return null;
  
  const title = isAddMode ? 'Add Product' : 'Edit Product';
  
  return (
    <div
      className={`fixed inset-0 z-50 overflow-auto ${
        isOpen ? 'flex items-center justify-center' : 'hidden'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className={`relative rounded-lg shadow-xl p-6 mx-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className={`absolute top-3 right-3 p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          aria-label="Close"
        >
          ✕
        </button>
        
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
              <div className="col-span-2">
                <label className="block mb-1 text-sm">Type:</label>
                <div className="flex gap-4">
                  <label className={`flex items-center p-3 border rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${newMotorcycle.type === 'Matic' ? 'bg-blue-500 text-white' : ''}`}>
                    <input
                      type="radio"
                      name="motorcycleType"
                      checked={newMotorcycle.type === 'Matic'}
                      onChange={() => setNewMotorcycle({ ...newMotorcycle, type: 'Matic' })}
                      className="mr-2 hidden"
                    />
                    <span>Matic</span>
                  </label>
                  <label className={`flex items-center p-3 border rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${newMotorcycle.type === 'Manual' ? 'bg-blue-500 text-white' : ''}`}>
                    <input
                      type="radio"
                      name="motorcycleType"
                      checked={newMotorcycle.type === 'Manual'}
                      onChange={() => setNewMotorcycle({ ...newMotorcycle, type: 'Manual' })}
                      className="mr-2 hidden"
                    />
                    <span>Manual</span>
                  </label>
                </div>
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
            
            <div className="col-span-2 mt-4">
              <button
                type="button"
                onClick={() => setIsCreatingMotorcycle(true)}
                className={`px-4 py-2 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded`}
              >
                Add New Motorcycle
              </button>
            </div>
          </div>
        )}
        
        {!isCreatingMotorcycle && (
          <div className="col-span-2 mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Compatible Motorcycle Models</h3>
            <p className="text-sm mb-4">Select all motorcycle models that are compatible with this product</p>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search motorcycles..."
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="max-h-72 overflow-y-auto pr-2">
              {Object.entries(groupedMotorcycles).map(([type, typedMotorcycles]) => {
                const filteredTypedMotorcycles = typedMotorcycles.filter(motorcycle => {
                  if (!searchQuery) return true;
                  const searchLower = searchQuery.toLowerCase();
                  return (
                    motorcycle.manufacturer.toLowerCase().includes(searchLower) ||
                    (motorcycle.model && motorcycle.model.toLowerCase().includes(searchLower))
                  );
                });

                return filteredTypedMotorcycles.length > 0 && (
                  <div key={type} className="mb-4">
                    <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded flex justify-between items-center sticky top-0 z-10`}>
                      <span className="font-semibold">{type}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => selectAllOfType(type)}
                          className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'}`}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => deselectAllOfType(type)}
                          className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                  
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {filteredTypedMotorcycles.map(motorcycle => (
                        <div
                          key={motorcycle.id}
                          className={`p-2 rounded cursor-pointer border ${
                            selectedCompatibilityIds.includes(motorcycle.id)
                              ? isDarkMode 
                                ? 'bg-blue-900/30 border-blue-700' 
                                : 'bg-blue-50 border-blue-300'
                              : isDarkMode
                                ? 'border-gray-700'
                                : 'border-gray-200'
                          }`}
                          onClick={() => toggleMotorcycleSelection(motorcycle.id)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedCompatibilityIds.includes(motorcycle.id)}
                              onChange={() => toggleMotorcycleSelection(motorcycle.id)}
                              className="form-checkbox"
                            />
                            <span>
                              {motorcycle.manufacturer}
                              {motorcycle.model ? ` ${motorcycle.model}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
            onClick={handleSave}
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