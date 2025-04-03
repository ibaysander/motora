import React, { useState, useEffect } from 'react';
import { Transaction, Product } from '../types';
import api from '../utils/api';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts } from '../store/slices/productsSlice';
import { showNotification } from '../store/slices/uiSlice';
import TransactionModal from './ui/TransactionModal';

interface TransactionsTabProps {
  isDarkMode: boolean;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ isDarkMode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{startDate: string; endDate: string}>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products.productsList);
  
  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = 'transactions';
      
      // Apply date filter if dates are set
      if (dateRange.startDate && dateRange.endDate) {
        url = `transactions/filter/date?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      
      const response = await api.get(url);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      dispatch(showNotification({ 
        message: 'Failed to load transactions', 
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };
  
  // Handle date range change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    fetchTransactions();
  };
  
  // View transaction details
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };
  
  // Delete transaction
  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`transactions/${id}`);
      
      dispatch(showNotification({ 
        message: 'Transaction deleted successfully', 
        type: 'success'
      }));
      
      // Refresh transactions
      fetchTransactions();
      
      // Refresh products to update stock
      dispatch(fetchProducts());
    } catch (error) {
      console.error('Error deleting transaction:', error);
      dispatch(showNotification({ 
        message: 'Failed to delete transaction', 
        type: 'error'
      }));
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Format currency for display
  const formatCurrency = (amount: number | undefined | null) => {
    console.log('Amount to format:', amount, typeof amount);
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return 'Rp0';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount));
  };
  
  // Handle transaction success
  const handleTransactionSuccess = () => {
    fetchTransactions();
  };
  
  // Get transaction type badge color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Sale':
        return 'bg-blue-100 text-blue-800';
      case 'Purchase':
        return 'bg-green-100 text-green-800';
      case 'Return':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Add Transaction
  const handleAddTransaction = () => {
    console.log('Opening add transaction modal - previous state:', isAddModalOpen);
    setIsAddModalOpen(true);
    console.log('Set isAddModalOpen to true');
    
    // Force a re-render with a timeout
    setTimeout(() => {
      console.log('Modal should be open now, isAddModalOpen:', isAddModalOpen);
    }, 100);
  };
  
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        
        <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0">
          {/* Filter Dropdown */}
          <div>
            <select
              value={filter}
              onChange={handleFilterChange}
              className={`rounded-md border px-3 py-1.5 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Transactions</option>
              <option value="date">Date Range</option>
            </select>
          </div>
          
          {/* Date Range Inputs */}
          {filter === 'date' && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className={`rounded-md border px-3 py-1.5 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              />
              <span>to</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className={`rounded-md border px-3 py-1.5 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          )}
          
          <button
            onClick={handleAddTransaction}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Transaction
          </button>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className={`min-w-full border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Total Amount</th>
              <th className="px-4 py-2 text-left">Payment Method</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map(transaction => {
                console.log('Transaction data:', transaction);
                return (
                  <tr 
                    key={transaction.id}
                    className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}
                  >
                    <td className="px-4 py-3">{transaction.id}</td>
                    <td className="px-4 py-3">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(() => {
                        // Try to get a number from either field
                        const amount = transaction.total_amount || transaction.totalAmount; 
                        
                        // Ensure it's a valid number
                        if (amount === undefined || amount === null || isNaN(Number(amount))) {
                          return 'Rp0';
                        }
                        
                        // Format the number as currency
                        return new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Number(amount));
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.payment_method || transaction.paymentMethod || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.customer_name || transaction.customer || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewTransaction(transaction)}
                        className={`text-blue-500 hover:text-blue-700 mr-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-1 rounded`}
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className={`text-red-500 hover:text-red-700 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-1 rounded`}
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Transaction Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        products={products}
        onSuccess={handleTransactionSuccess}
        isDarkMode={isDarkMode}
      />
      
      <TransactionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        transaction={selectedTransaction}
        products={products}
        isDarkMode={isDarkMode}
        isViewMode={true}
      />
    </div>
  );
};

export default TransactionsTab; 