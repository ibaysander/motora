// @ts-ignore
import React, { FC, useState, useEffect } from 'react';
import { Transaction, SortConfig, PaginationConfig } from '../../types';
import { PaginationLimitSelector, PaginationButtons } from '../ui/Pagination';
import { useAppSelector, useAppDispatch } from '../../store';
import api from '../../utils/api';
import { showNotification } from '../../store/slices/uiSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchTransactions, deleteTransaction, invalidateTransactions } from '../../store/slices/transactionsSlice';
import TransactionModal from '../ui/TransactionModal';

interface TransactionsTabProps {
  isDarkMode: boolean;
}

const TransactionsTab: FC<TransactionsTabProps> = ({ isDarkMode }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({ currentPage: 1, itemsPerPage: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Get data from Redux store
  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products.productsList);
  const { items: transactions, loading } = useAppSelector(state => state.transactions);
  
  // Fetch transactions and products on component mount
  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchProducts());
    console.log('Dispatched fetchTransactions and fetchProducts actions');
  }, [dispatch]);
  
  // Add a useEffect to log transactions when they change
  useEffect(() => {
    console.log('Transactions from Redux store:', transactions);
    console.log('Transactions count:', transactions?.length || 0);
  }, [transactions]);
  
  // If date range changes, invalidate transactions and fetch again
  useEffect(() => {
    if (startDate && endDate) {
      dispatch(invalidateTransactions());
      fetchFilteredTransactions();
    }
  }, [startDate, endDate, dispatch]);

  // Fetch transactions with date filter
  const fetchFilteredTransactions = async () => {
    try {
      let url = '/transactions';
      
      // Apply date filter if dates are set
      if (startDate && endDate) {
        url = `/transactions/filter/date?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get(url);
      // Update redux state (we don't call setTransactions directly anymore)
      dispatch({ type: 'transactions/fetchTransactions/fulfilled', payload: response.data });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      dispatch(showNotification({ 
        message: 'Failed to load transactions', 
        type: 'error'
      }));
    }
  };
  
  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    return searchQuery === '' || 
      (transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.customer?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      transaction.id.toString().includes(searchQuery) ||
      (transaction.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  
  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (sortConfig.key === 'total_amount') {
      const aAmount = a.total_amount || a.totalAmount || 0;
      const bAmount = b.total_amount || b.totalAmount || 0;
      return sortConfig.direction === 'asc' 
        ? aAmount - bAmount 
        : bAmount - aAmount;
    }

    // Safely compare values that might be undefined
    const aValue = a[sortConfig.key as keyof Transaction];
    const bValue = b[sortConfig.key as keyof Transaction];
    
    // Handle undefined or null values
    if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
    
    // Compare string values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Fallback to direct comparison if types match
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    
    return 0;
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / paginationConfig.itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage,
    paginationConfig.currentPage * paginationConfig.itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setPaginationConfig({ ...paginationConfig, currentPage: page });
  };
  
  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPaginationConfig({ currentPage: 1, itemsPerPage });
  };
  
  // Handle sort
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      key = '';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Get sort icon
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  
  // Render sort button with consistent styling
  const renderSortButton = (label: string, key: string) => (
    <button
      onClick={() => requestSort(key)}
      className="flex items-center gap-1 hover:bg-opacity-10 hover:bg-gray-500 px-1 py-0.5 rounded"
    >
      {label}
      <span className="text-xs">{getSortIcon(key)}</span>
    </button>
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Format currency for display
  const formatCurrency = (amount: number | undefined | null) => {
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
  
  // Get transaction type badge color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Sale':
      case 'sale':
        return 'bg-blue-100 text-blue-800';
      case 'Purchase':
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'Return':
      case 'return':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Generate receipt for a transaction
  const handleGenerateReceipt = (id: number) => {
    // Implementation for generating receipt will go here
    console.log(`Generate receipt for transaction ${id}`);
  };

  // Add new transaction
  const handleAddTransaction = () => {
    console.log('Opening add transaction modal - previous state:', isAddModalOpen);
    setIsAddModalOpen(true);
    console.log('Set isAddModalOpen to true');
    
    // Force a re-render with a timeout
    setTimeout(() => {
      console.log('Modal should be open now, isAddModalOpen:', isAddModalOpen);
    }, 100);
  };

  // Handle transaction success
  const handleTransactionSuccess = () => {
    // Invalidate transactions to force a refresh
    dispatch(invalidateTransactions());
    dispatch(fetchTransactions());
    dispatch(fetchProducts()); // Refresh product stock
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Use the Redux action instead of direct API call
      await dispatch(deleteTransaction(id)).unwrap();
      
      dispatch(showNotification({ 
        message: 'Transaction deleted successfully', 
        type: 'success'
      }));
      
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
  
  // View transaction details
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };
  
  // Apply filters when date range changes
  const applyFilters = () => {
    if (startDate && endDate) {
      fetchFilteredTransactions();
    }
  };
  
  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddTransaction}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            New Transaction
          </button>
        </div>
      </header>
      
      {/* Filter and Search Section */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-200'
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-200'
              }`}
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200'
              } border`}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <PaginationLimitSelector
            type="transactions"
            value={paginationConfig.itemsPerPage}
            onChange={handleItemsPerPageChange}
            isDarkMode={isDarkMode}
            itemsPerPageOptions={[10, 25, 50, 100]}
          />
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
      
      {/* Transactions Table */}
      <div className={`rounded-lg shadow w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full table-fixed">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium w-12">
                  {renderSortButton('ID', 'id')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium w-36">
                  {renderSortButton('Date', 'date')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium w-24">
                  {renderSortButton('Type', 'type')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium w-32">
                  {renderSortButton('Total Amount', 'total_amount')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium w-32">
                  {renderSortButton('Payment Method', 'payment_method')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium w-32">
                  {renderSortButton('Customer', 'customer_name')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center">
                    Loading transactions...
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction, index) => {
                  console.log('Transaction data:', transaction);
                  return (
                    <tr 
                      key={transaction.id}
                      className={`border-t ${
                        isDarkMode 
                          ? 'border-gray-700 hover:bg-gray-700/50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-3 py-3 text-xs whitespace-nowrap">{transaction.id}</td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap text-right">
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
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        {transaction.payment_method || transaction.paymentMethod || '-'}
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        {transaction.customer_name || transaction.customer || '-'}
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        <button
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-blue-500 hover:text-blue-600 mr-2"
                          title="View Details"
                        >
                          📃
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td 
                    colSpan={7} 
                    className={`px-3 py-3 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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