import React, { useState, ChangeEvent } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Part {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minThreshold: number;
}

const initialParts: Part[] = [
  { id: 1, name: 'Chain 12', sku: 'CH12', category: 'Engine', currentStock: 15, minThreshold: 5 },
  { id: 2, name: 'Brake Pad', sku: 'BP34', category: 'Brakes', currentStock: 3, minThreshold: 5 },
  { id: 3, name: 'Headlight', sku: 'HL56', category: 'Electronics', currentStock: 0, minThreshold: 2 }
];

const chartData = [
  { name: 'Mon', parts: 200 },
  { name: 'Tue', parts: 220 },
  { name: 'Wed', parts: 180 },
  { name: 'Thu', parts: 260 },
  { name: 'Fri', parts: 210 }
];

const categories = ['Engine', 'Brakes', 'Electronics'];
const stockReasons = ['Restock', 'Sale', 'Damage'];

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'partsList'>('dashboard');
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stockStatus, setStockStatus] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [updatedStock, setUpdatedStock] = useState(0);
  const [updateReason, setUpdateReason] = useState(stockReasons[0]);

  // New Part Form State
  const [newPart, setNewPart] = useState({
    name: '',
    sku: '',
    category: categories[0],
    currentStock: 0,
    minThreshold: 0
  });

  const totalParts = parts.length;
  const lowStockCount = parts.filter(part => part.currentStock < part.minThreshold && part.currentStock > 0).length;
  const outOfStockCount = parts.filter(part => part.currentStock === 0).length;

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) || part.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? part.category === selectedCategory : true;
    const matchesStockStatus = stockStatus === 'Low'
      ? part.currentStock < part.minThreshold && part.currentStock > 0
      : stockStatus === 'In Stock'
      ? part.currentStock >= part.minThreshold
      : stockStatus === 'Out'
      ? part.currentStock === 0
      : true;
    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const openUpdateModal = (part: Part) => {
    setSelectedPart(part);
    setUpdatedStock(part.currentStock);
    setUpdateReason(stockReasons[0]);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStock = () => {
    if (selectedPart) {
      setParts(prev => prev.map(part => part.id === selectedPart.id ? { ...part, currentStock: updatedStock } : part));
      setIsUpdateModalOpen(false);
      setSelectedPart(null);
    }
  };

  const handleAddNewPart = () => {
    const newId = parts.length ? Math.max(...parts.map(p => p.id)) + 1 : 1;
    setParts(prev => [...prev, { id: newId, ...newPart }]);
    setIsAddModalOpen(false);
    setNewPart({ name: '', sku: '', category: categories[0], currentStock: 0, minThreshold: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">Motorcycle Parts Stock Management</h1>
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="relative focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {(lowStockCount > 0) && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>
          {showNotification && (
            <div className="absolute right-0 mt-2 w-64 bg-white bg-red-100 text-red-700 rounded-md shadow-lg p-4">
              <h2 className="font-bold mb-2">Low Stock Alerts</h2>
              {parts.filter(p => p.currentStock < p.minThreshold && p.currentStock > 0).map(part => (
                <p key={part.id} className="text-sm mb-1">{part.name}: {part.currentStock} left</p>
              ))}
              {parts.filter(p => p.currentStock < p.minThreshold && p.currentStock > 0).length === 0 && <p className="text-sm">No alerts</p>}
              <button
                onClick={() => { setCurrentTab('partsList'); setShowNotification(false); }}
                className="mt-2 text-blue-600 text-sm underline"
              >
                View All
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <nav className="flex justify-center space-x-4 border-b border-gray-300 p-4">
        <button
          className={`px-4 py-2 font-semibold ${currentTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 font-semibold ${currentTab === 'partsList' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setCurrentTab('partsList')}
        >
          Parts List
        </button>
      </nav>

      <main className="p-4">
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Total Parts</h3>
                <p className="text-2xl">{totalParts} Parts</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
                <p className="text-2xl">{lowStockCount} Alerts</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Out-of-Stock</h3>
                <p className="text-2xl">{outOfStockCount} Parts</p>
              </div>
            </div>
            
            {/* Stock Trend Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Stock Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="parts" stroke="#3B82F6" strokeWidth={2} />
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add New Part
              </button>
              <button
                onClick={() => setCurrentTab('partsList')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                View All Alerts
              </button>
            </div>
          </div>
        )}

        {currentTab === 'partsList' && (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
              <input
                type="text"
                placeholder="Search by name or SKU"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded p-2 flex-1"
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded p-2"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={stockStatus}
                onChange={e => setStockStatus(e.target.value)}
                className="border border-gray-300 rounded p-2"
              >
                <option value="">All Stock Status</option>
                <option value="Low">Low</option>
                <option value="In Stock">In Stock</option>
                <option value="Out">Out</option>
              </select>
            </div>
            
            {/* Parts Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2">Thumbnail</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Current Stock</th>
                    <th className="px-4 py-2">Min Threshold</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map(part => (
                    <tr key={part.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      </td>
                      <td className="px-4 py-2">{part.name}</td>
                      <td className="px-4 py-2">{part.sku}</td>
                      <td className="px-4 py-2">{part.category}</td>
                      <td className={`px-4 py-2 font-semibold ${part.currentStock < part.minThreshold ? 'text-red-600' : 'text-green-600'}`}>{part.currentStock}</td>
                      <td className="px-4 py-2">{part.minThreshold}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => openUpdateModal(part)}
                          className="text-blue-600 hover:underline"
                        >
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Update Stock Modal */}
      {isUpdateModalOpen && selectedPart && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Update Stock: {selectedPart.name}</h2>
            <p className="mb-2">Current Stock: {selectedPart.currentStock}</p>
            <div className="flex items-center mb-4">
              <button
                onClick={() => setUpdatedStock(prev => Math.max(prev - 1, 0))}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                -
              </button>
              <input
                type="number"
                value={updatedStock}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUpdatedStock(Number(e.target.value))}
                className="mx-2 border border-gray-300 rounded p-1 w-16 text-center"
              />
              <button
                onClick={() => setUpdatedStock(prev => prev + 1)}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                +
              </button>
            </div>
            <div className="mb-4">
              <label className="mr-2">Reason:</label>
              <select
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                className="border border-gray-300 rounded p-1"
              >
                {stockReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setIsUpdateModalOpen(false); setSelectedPart(null); }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Part</h2>
            <div className="mb-4">
              <label className="block mb-1">Image Upload:</label>
              <input type="file" className="border border-gray-300 p-1 rounded w-full" />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">SKU:</label>
              <input
                type="text"
                value={newPart.sku}
                onChange={(e) => setNewPart({ ...newPart, sku: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Category:</label>
              <select
                value={newPart.category}
                onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Initial Stock:</label>
                <input
                  type="number"
                  value={newPart.currentStock}
                  onChange={(e) => setNewPart({ ...newPart, currentStock: Number(e.target.value) })}
                  className="border border-gray-300 p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Min Threshold:</label>
                <input
                  type="number"
                  value={newPart.minThreshold}
                  onChange={(e) => setNewPart({ ...newPart, minThreshold: Number(e.target.value) })}
                  className="border border-gray-300 p-2 rounded w-full"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewPart}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}