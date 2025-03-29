import React from 'react';
import { Product } from '../../hooks/useApi';

interface DashboardProps {
  products: Product[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ products, isDarkMode }) => {
  const totalStock = products.reduce((sum, product) => sum + (product.currentStock || 0), 0);
  
  const lowStockItems = products.filter(product => 
    (product.currentStock || 0) <= (product.minThreshold || 0)
  ).length;
  
  const totalHargaBeli = products.reduce((sum, product) => 
    sum + ((product.hargaBeli || 0) * (product.currentStock || 0)), 0);
  
  const totalHargaJual = products.reduce((sum, product) => 
    sum + ((product.hargaJual || 0) * (product.currentStock || 0)), 0);
    
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Products</p>
            <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
          </div>
          <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <span className="text-xl">📦</span>
          </div>
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Stock</p>
            <h3 className="text-2xl font-bold mt-1">{totalStock}</h3>
          </div>
          <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
            <span className="text-xl">📊</span>
          </div>
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low Stock Items</p>
            <h3 className="text-2xl font-bold mt-1">{lowStockItems}</h3>
          </div>
          <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
            <span className="text-xl">⚠️</span>
          </div>
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Harga Beli</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalHargaBeli)}</h3>
          </div>
          <div className={`p-3 rounded-full ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
            <span className="text-xl">💰</span>
          </div>
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Harga Jual</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalHargaJual)}</h3>
          </div>
          <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
            <span className="text-xl">💎</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 