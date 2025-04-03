// @ts-ignore
import React, { FC, useState, useEffect } from 'react';
import { Transaction, SortConfig, PaginationConfig } from '../../types';
import { PaginationLimitSelector, PaginationButtons } from '../ui/Pagination';
import { useAppSelector, useAppDispatch } from '../../store';
import api from '../../utils/api';
import { showNotification } from '../../store/slices/uiSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import TransactionModal from '../ui/TransactionModal';

interface TransactionsTabProps {
  isDarkMode: boolean;
}

const TransactionsTab: FC<TransactionsTabProps> = ({ isDarkMode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({ currentPage: 1, itemsPerPage: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products.productsList);
  
  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
    dispatch(fetchProducts()); // Explicitly fetch products
    console.log('Dispatched fetchProducts action');
  }, []);

  // Add a useEffect to log products when they change
  useEffect(() => {
    console.log('Products in TransactionsTab:', products);
    console.log('Products count:', products?.length || 0);
  }, [products]);
  
  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/transactions';
      
      // Apply date filter if dates are set
      if (startDate && endDate) {
        url = `/transactions/filter/date?startDate=${startDate}&endDate=${endDate}`;
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
  
  // Apply filters when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchTransactions();
    }
  }, [startDate, endDate]);
  
  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    return searchQuery === '' || 
      transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toString().includes(searchQuery) ||
      transaction.payment_method.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (sortConfig.key === 'total_amount') {
      return sortConfig.direction === 'asc' 
        ? a.total_amount - b.total_amount 
        : b.total_amount - a.total_amount;
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
    console.log('Opening add transaction modal');
    setIsAddModalOpen(true);
  };

  // Handle transaction success
  const handleTransactionSuccess = () => {
    fetchTransactions();
    dispatch(fetchProducts()); // Refresh product stock
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/transactions/${id}`);
      
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
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction, index) => (
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
                      <span className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">
                      {formatCurrency(transaction.total_amount)}
                    </td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">{transaction.payment_method}</td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">{transaction.customer_name || '-'}</td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">
                      <button
                        onClick={() => handleGenerateReceipt(transaction.id)}
                        className="text-blue-500 hover:text-blue-600 mr-2"
                      >
                        📃
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
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