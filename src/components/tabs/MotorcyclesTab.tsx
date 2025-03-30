import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Motorcycle, Product, SortConfig, PaginationConfig } from '../../features/products/types';
import { MotorcycleCard } from '../../features/motorcycles';
import { MotorcycleViewToggle } from '../ui/ViewToggles';
import { PaginationLimitSelector, PaginationButtons } from '../ui/Pagination';
import { AlphabeticalFilter } from '../ui/Filters';

interface MotorcyclesTabProps {
  isDarkMode: boolean;
  alphabeticalFilter: string | null;
  setAlphabeticalFilter: (filter: string | null) => void;
  products?: Product[];
  motorcycles?: Motorcycle[];
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  motorcycleViewMode?: 'table' | 'card';
  setMotorcycleViewMode?: (mode: 'table' | 'card') => void;
  paginationConfig?: PaginationConfig;
  sortConfig?: SortConfig;
  handleItemsPerPageChange?: (itemsPerPage: number) => void;
  handlePageChange?: (page: number) => void;
  getSortIcon?: (key: string) => string;
  requestSort?: (key: string) => void;
  paginatedData?: Motorcycle[];
  totalPages?: number;
  filteredMotorcycles?: Motorcycle[];
  newMotorcycle?: Partial<Motorcycle>;
  setNewMotorcycle?: (motorcycle: Partial<Motorcycle>) => void;
  selectedMotorcycle?: Motorcycle | null;
  setSelectedMotorcycle?: (motorcycle: Motorcycle | null) => void;
  isMotorcycleModalOpen?: boolean;
  setIsMotorcycleModalOpen?: (isOpen: boolean) => void;
  handleAddMotorcycle?: () => void;
  handleUpdateMotorcycle?: () => void;
  handleDeleteMotorcycle?: (id: number) => void;
  itemsPerPageOptions?: number[];
}

const MotorcyclesTab: React.FC<MotorcyclesTabProps> = ({
  motorcycles: propMotorcycles,
  isDarkMode,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
  motorcycleViewMode: propMotorcycleViewMode,
  setMotorcycleViewMode: propSetMotorcycleViewMode,
  paginationConfig: propPaginationConfig,
  sortConfig: propSortConfig,
  handleItemsPerPageChange: propHandleItemsPerPageChange,
  handlePageChange: propHandlePageChange,
  getSortIcon: propGetSortIcon,
  requestSort: propRequestSort,
  paginatedData: propPaginatedData,
  totalPages: propTotalPages,
  filteredMotorcycles: propFilteredMotorcycles,
  newMotorcycle: propNewMotorcycle,
  setNewMotorcycle: propSetNewMotorcycle,
  selectedMotorcycle: propSelectedMotorcycle,
  setSelectedMotorcycle: propSetSelectedMotorcycle,
  isMotorcycleModalOpen: propIsMotorcycleModalOpen,
  setIsMotorcycleModalOpen: propSetIsMotorcycleModalOpen,
  handleAddMotorcycle: propHandleAddMotorcycle,
  handleUpdateMotorcycle: propHandleUpdateMotorcycle,
  handleDeleteMotorcycle: propHandleDeleteMotorcycle,
  itemsPerPageOptions: propItemsPerPageOptions,
  alphabeticalFilter,
  setAlphabeticalFilter,
  products
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // Local state to handle when props aren't provided
  const [localMotorcycles, setLocalMotorcycles] = useState<Motorcycle[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localViewMode, setLocalViewMode] = useState<'table' | 'card'>('table');
  const [localPaginationConfig, setLocalPaginationConfig] = useState<PaginationConfig>({
    currentPage: 1,
    itemsPerPage: 10
  });
  const [localSortConfig, setLocalSortConfig] = useState<SortConfig>({
    key: 'manufacturer',
    direction: 'asc'
  });
  const [localNewMotorcycle, setLocalNewMotorcycle] = useState<Partial<Motorcycle>>({
    manufacturer: '',
    model: ''
  });
  const [localSelectedMotorcycle, setLocalSelectedMotorcycle] = useState<Motorcycle | null>(null);
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  
  const localItemsPerPageOptions = [5, 10, 20, 50];
  
  // Use provided props or local state
  const motorcycles = propMotorcycles || localMotorcycles;
  const searchQuery = propSearchQuery || localSearchQuery;
  const setSearchQuery = propSetSearchQuery || setLocalSearchQuery;
  const motorcycleViewMode = propMotorcycleViewMode || localViewMode;
  const setMotorcycleViewMode = propSetMotorcycleViewMode || setLocalViewMode;
  const paginationConfig = propPaginationConfig || localPaginationConfig;
  const sortConfig = propSortConfig || localSortConfig;
  const newMotorcycle = propNewMotorcycle || localNewMotorcycle;
  const setNewMotorcycle = propSetNewMotorcycle || setLocalNewMotorcycle;
  const selectedMotorcycle = propSelectedMotorcycle || localSelectedMotorcycle;
  const setSelectedMotorcycle = propSetSelectedMotorcycle || setLocalSelectedMotorcycle;
  const isMotorcycleModalOpen = propIsMotorcycleModalOpen !== undefined ? propIsMotorcycleModalOpen : localIsModalOpen;
  const setIsMotorcycleModalOpen = propSetIsMotorcycleModalOpen || setLocalIsModalOpen;
  const itemsPerPageOptions = propItemsPerPageOptions || localItemsPerPageOptions;
  
  // Fetch motorcycles on component mount
  useEffect(() => {
    fetchMotorcycles();
  }, []);

  // Local handlers
  const handleLocalItemsPerPageChange = (itemsPerPage: number) => {
    setLocalPaginationConfig({
      currentPage: 1,
      itemsPerPage
    });
  };
  
  const handleLocalPageChange = (page: number) => {
    setLocalPaginationConfig({
      ...localPaginationConfig,
      currentPage: page
    });
  };
  
  const localGetSortIcon = (key: string) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  
  const localRequestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (localSortConfig.key === key && localSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setLocalSortConfig({ key, direction });
  };
  
  // Filtering and sorting
  const alphabeticallyFilteredMotorcycles = motorcycles?.filter(motorcycle => {
    if (!alphabeticalFilter) return true;
    return motorcycle.manufacturer.toUpperCase().startsWith(alphabeticalFilter);
  }) || [];
  
  const searchFilteredMotorcycles = alphabeticallyFilteredMotorcycles.filter(motorcycle => {
    if (!searchQuery) return true;
    return (
      motorcycle.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (motorcycle.model && motorcycle.model.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  // Sorting function
  const sortedMotorcycles = [...searchFilteredMotorcycles].sort((a, b) => {
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
  const calculatedTotalPages = Math.ceil(sortedMotorcycles.length / paginationConfig.itemsPerPage);
  const calculatedPaginatedData = sortedMotorcycles.slice(
    (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage,
    paginationConfig.currentPage * paginationConfig.itemsPerPage
  );
  
  // Final values
  const filteredMotorcycles = propFilteredMotorcycles || searchFilteredMotorcycles;
  const paginatedData = propPaginatedData || calculatedPaginatedData;
  const totalPages = propTotalPages || calculatedTotalPages;
  const handleItemsPerPageChange = propHandleItemsPerPageChange || handleLocalItemsPerPageChange;
  const handlePageChange = propHandlePageChange || handleLocalPageChange;
  const getSortIcon = propGetSortIcon || localGetSortIcon;
  const requestSort = propRequestSort || localRequestSort;

  // Fetch motorcycles from the API
  const fetchMotorcycles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/motorcycles');
      if (propMotorcycles === undefined) {
        setLocalMotorcycles(response.data);
      }
    } catch (error) {
      console.error('Error fetching motorcycles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Local handlers
  const handleAddMotorcycle = async () => {
    if (propHandleAddMotorcycle) {
      propHandleAddMotorcycle();
      return;
    }
    
    if (!newMotorcycle.manufacturer) {
      alert('Manufacturer is required');
      return;
    }

    try {
      if (selectedMotorcycle && selectedMotorcycle.id) {
        // Update existing motorcycle
        await axios.put(`/api/motorcycles/${selectedMotorcycle.id}`, newMotorcycle);
      } else {
        // Add new motorcycle
        await axios.post('/api/motorcycles', newMotorcycle);
      }
      
      // Reset form and refresh data
      setNewMotorcycle({ manufacturer: '', model: '' });
      setIsMotorcycleModalOpen(false);
      setSelectedMotorcycle(null);
      fetchMotorcycles();
    } catch (error) {
      console.error('Error saving motorcycle:', error);
    }
  };

  const handleUpdateMotorcycle = async () => {
    if (propHandleUpdateMotorcycle) {
      propHandleUpdateMotorcycle();
      return;
    }
    
    handleAddMotorcycle();
  };

  const handleDeleteMotorcycle = async (id: number) => {
    if (propHandleDeleteMotorcycle) {
      propHandleDeleteMotorcycle(id);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this motorcycle?')) {
      try {
        await axios.delete(`/api/motorcycles/${id}`);
        fetchMotorcycles();
      } catch (error) {
        console.error('Error deleting motorcycle:', error);
      }
    }
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

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Motorcycles</h1>
        <div className="flex items-center gap-4">
          <MotorcycleViewToggle
            viewMode={motorcycleViewMode}
            setViewMode={setMotorcycleViewMode}
            isDarkMode={isDarkMode}
          />
          <button
            onClick={() => {
              setNewMotorcycle({ manufacturer: '', model: '' });
              setIsMotorcycleModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Motorcycle
          </button>
        </div>
      </header>

      <div className="mb-6">
        {/* Alphabetical Filter */}
        <AlphabeticalFilter
          currentFilter={alphabeticalFilter}
          setFilter={setAlphabeticalFilter}
          isDarkMode={isDarkMode}
          type="motorcycles"
        />
        
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
          {motorcycleViewMode === 'card' && (
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
        motorcycleViewMode === 'table' ? (
          <div className="w-full overflow-hidden">
            <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className="min-w-full divide-y divide-gray-200">
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
                    <th className="px-6 py-3 text-left text-xs font-medium">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((motorcycle, index) => (
                    <tr key={motorcycle.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(motorcycle.id)}
                          onChange={() => toggleSelectItem(motorcycle.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {((paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage) + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {motorcycle.manufacturer}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {motorcycle.model || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {products?.filter(p => p.motorcycleId === motorcycle.id).length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => setSelectedMotorcycle(motorcycle)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedItems.length > 0 && (
              <div className="col-span-full mb-4 flex flex-wrap gap-2">
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
            {paginatedData.map(motorcycle => (
              <div key={motorcycle.id} className={`relative ${selectedItems.includes(motorcycle.id) ? 'ring-2 ring-blue-500' : ''}`}>
                {motorcycleViewMode === 'card' && (
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
                  onEdit={setSelectedMotorcycle}
                  onDelete={handleDeleteMotorcycle}
                  isDarkMode={isDarkMode}
                  productsCount={products?.filter(p => p.motorcycleId === motorcycle.id).length || 0}
                />
              </div>
            ))}
          </div>
        )
      )}

      {/* Motorcycle Modal */}
      {isMotorcycleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-11/12 max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">{selectedMotorcycle ? 'Edit Motorcycle' : 'Add Motorcycle'}</h2>
            
            <div className="mb-4">
              <label className="block mb-1 text-sm">Manufacturer:</label>
              <input
                type="text"
                value={newMotorcycle.manufacturer || ''}
                onChange={(e) => setNewMotorcycle({...newMotorcycle, manufacturer: e.target.value})}
                className={`border rounded-lg p-2 w-full ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div className="mb-6">
              <label className="block mb-1 text-sm">Model:</label>
              <input
                type="text"
                value={newMotorcycle.model || ''}
                onChange={(e) => setNewMotorcycle({...newMotorcycle, model: e.target.value || null})}
                className={`border rounded-lg p-2 w-full ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsMotorcycleModalOpen(false);
                  setNewMotorcycle({ manufacturer: '', model: '' });
                  setSelectedMotorcycle(null);
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={selectedMotorcycle ? handleUpdateMotorcycle : handleAddMotorcycle}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {selectedMotorcycle ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotorcyclesTab; 