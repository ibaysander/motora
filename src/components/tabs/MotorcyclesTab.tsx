import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Motorcycle, Product, SortConfig, PaginationConfig } from '../../features/products/types';
import { MotorcycleCard } from '../../features/motorcycles';
import { MotorcycleViewToggle } from '../ui/ViewToggles';
import { PaginationLimitSelector, PaginationButtons } from '../ui/Pagination';

interface MotorcyclesTabProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  products: Product[];
}

const MotorcyclesTab: React.FC<MotorcyclesTabProps> = ({
  isDarkMode,
  setIsDarkMode,
  products
}) => {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMotorcycle, setCurrentMotorcycle] = useState<Partial<Motorcycle>>({
    manufacturer: '',
    model: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // Pagination and Sorting
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
    currentPage: 1,
    itemsPerPage: 10
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'manufacturer',
    direction: 'asc'
  });
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fetch motorcycles on component mount
  useEffect(() => {
    fetchMotorcycles();
  }, []);

  // Fetch motorcycles from the API
  const fetchMotorcycles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/motorcycles');
      setMotorcycles(response.data);
    } catch (error) {
      console.error('Error fetching motorcycles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter motorcycles based on search query
  const filteredMotorcycles = motorcycles.filter(motorcycle => 
    motorcycle.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (motorcycle.model && motorcycle.model.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sorting function
  const sortedMotorcycles = [...filteredMotorcycles].sort((a, b) => {
    if (sortConfig.key === 'manufacturer') {
      return sortConfig.direction === 'asc'
        ? a.manufacturer.localeCompare(b.manufacturer)
        : b.manufacturer.localeCompare(a.manufacturer);
    } else if (sortConfig.key === 'model') {
      const modelA = a.model || '';
      const modelB = b.model || '';
      return sortConfig.direction === 'asc'
        ? modelA.localeCompare(modelB)
        : modelB.localeCompare(modelA);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedMotorcycles.length / paginationConfig.itemsPerPage);
  const paginatedData = sortedMotorcycles.slice(
    (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage,
    paginationConfig.currentPage * paginationConfig.itemsPerPage
  );

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setPaginationConfig({ ...paginationConfig, currentPage: page });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPaginationConfig({
      currentPage: 1,
      itemsPerPage: itemsPerPage
    });
  };

  // Handle sort
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map(motorcycle => motorcycle.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected motorcycles?`)) {
      setIsLoading(true);
      try {
        // Sequential deletion to avoid overwhelming the server
        for (const id of selectedItems) {
          await axios.delete(`/api/motorcycles/${id}`);
        }
        
        // Clear selection and refresh data
        setSelectedItems([]);
        fetchMotorcycles();
      } catch (error) {
        console.error('Error during bulk deletion:', error);
        alert('An error occurred during bulk deletion. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle adding a new motorcycle
  const handleAddMotorcycle = async () => {
    if (!currentMotorcycle.manufacturer) {
      alert('Manufacturer is required');
      return;
    }

    try {
      if (isEditing && currentMotorcycle.id) {
        // Update existing motorcycle
        await axios.put(`/api/motorcycles/${currentMotorcycle.id}`, currentMotorcycle);
      } else {
        // Add new motorcycle
        await axios.post('/api/motorcycles', currentMotorcycle);
      }
      
      // Reset form and refresh data
      setCurrentMotorcycle({ manufacturer: '', model: '' });
      setIsModalOpen(false);
      setIsEditing(false);
      fetchMotorcycles();
    } catch (error) {
      console.error('Error saving motorcycle:', error);
    }
  };

  // Handle editing a motorcycle
  const handleEditMotorcycle = (motorcycle: Motorcycle) => {
    setCurrentMotorcycle(motorcycle);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Handle deleting a motorcycle
  const handleDeleteMotorcycle = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this motorcycle?')) {
      try {
        await axios.delete(`/api/motorcycles/${id}`);
        fetchMotorcycles();
      } catch (error) {
        console.error('Error deleting motorcycle:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Motorcycles</h1>
        <div className="flex items-center gap-4">
          <MotorcycleViewToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            isDarkMode={isDarkMode}
          />
          <button
            onClick={() => {
              setCurrentMotorcycle({ manufacturer: '', model: '' });
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Motorcycle
          </button>
        </div>
      </header>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search motorcycles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200'
              } border`}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <PaginationLimitSelector
              type="motorcycles"
              value={paginationConfig.itemsPerPage}
              onChange={handleItemsPerPageChange}
              isDarkMode={isDarkMode}
              itemsPerPageOptions={itemsPerPageOptions}
            />
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>
          {viewMode === 'card' && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <select
                value={`${sortConfig.key}:${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split(':');
                  if (key === 'none') {
                    requestSort('');
                  } else {
                    requestSort(key);
                  }
                }}
                className={`border rounded-lg p-2 text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="none">No sorting</option>
                <optgroup label="Manufacturer">
                  <option value="manufacturer:asc">Manufacturer (A-Z)</option>
                  <option value="manufacturer:desc">Manufacturer (Z-A)</option>
                </optgroup>
                <optgroup label="Model">
                  <option value="model:asc">Model (A-Z)</option>
                  <option value="model:desc">Model (Z-A)</option>
                </optgroup>
              </select>
            </div>
          )}
          <div className="flex items-center gap-4">
            <PaginationButtons
              currentPage={paginationConfig.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Motorcycles display */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        viewMode === 'table' ? (
          <div className="w-full overflow-hidden">
            <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className="min-w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium w-8">
                      <input
                        type="checkbox"
                        checked={paginatedData.length > 0 && selectedItems.length === paginatedData.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">
                      <button
                        onClick={() => requestSort('manufacturer')}
                        className="flex items-center gap-1 hover:bg-opacity-10 hover:bg-gray-500 px-1 py-0.5 rounded"
                      >
                        Manufacturer
                        <span className="text-xs">{getSortIcon('manufacturer')}</span>
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium">
                      <button
                        onClick={() => requestSort('model')}
                        className="flex items-center gap-1 hover:bg-opacity-10 hover:bg-gray-500 px-1 py-0.5 rounded"
                      >
                        Model
                        <span className="text-xs">{getSortIcon('model')}</span>
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">No motorcycles found</td>
                    </tr>
                  ) : (
                    paginatedData.map((motorcycle, index) => (
                      <tr key={motorcycle.id} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                        <td className="px-3 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(motorcycle.id)}
                            onChange={() => toggleSelectItem(motorcycle.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {((paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage) + index + 1}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {motorcycle.manufacturer}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {motorcycle.model || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleEditMotorcycle(motorcycle)}
                            className="text-blue-500 hover:text-blue-700 mr-4"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteMotorcycle(motorcycle.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {selectedItems.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {paginatedData.map(motorcycle => (
                  <label key={motorcycle.id} className={`flex items-center p-2 rounded ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  } ${selectedItems.includes(motorcycle.id) ? 'border-2 border-blue-500' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(motorcycle.id)}
                      onChange={() => toggleSelectItem(motorcycle.id)}
                      className="mr-2 rounded"
                    />
                    <span>{motorcycle.manufacturer} {motorcycle.model}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map(motorcycle => (
                <div key={motorcycle.id} className={`relative ${selectedItems.includes(motorcycle.id) ? 'ring-2 ring-blue-500' : ''}`}>
                  {viewMode === 'card' && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(motorcycle.id)}
                        onChange={() => toggleSelectItem(motorcycle.id)}
                        className="rounded"
                      />
                    </div>
                  )}
                  <MotorcycleCard
                    motorcycle={motorcycle}
                    onEdit={handleEditMotorcycle}
                    onDelete={handleDeleteMotorcycle}
                    isDarkMode={isDarkMode}
                    productsCount={products.filter(p => p.motorcycleId === motorcycle.id).length}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Motorcycle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-11/12 max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Motorcycle' : 'Add Motorcycle'}</h2>
            
            <div className="mb-4">
              <label className="block mb-1 text-sm">Manufacturer:</label>
              <input
                type="text"
                value={currentMotorcycle.manufacturer || ''}
                onChange={(e) => setCurrentMotorcycle({...currentMotorcycle, manufacturer: e.target.value})}
                className={`border rounded-lg p-2 w-full ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="e.g., Honda"
              />
            </div>
            
            <div className="mb-6">
              <label className="block mb-1 text-sm">Model (optional):</label>
              <input
                type="text"
                value={currentMotorcycle.model || ''}
                onChange={(e) => setCurrentMotorcycle({...currentMotorcycle, model: e.target.value || null})}
                className={`border rounded-lg p-2 w-full ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="e.g., Supra"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentMotorcycle({ manufacturer: '', model: '' });
                  setIsEditing(false);
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMotorcycle}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {isEditing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotorcyclesTab; 