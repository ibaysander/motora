// @ts-ignore
import React, { useState, FC, useEffect } from 'react';
import { Transaction, Product } from '../../types';
import api from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showNotification } from '../../store/slices/uiSlice';
import { fetchProducts } from '../../store/slices/productsSlice';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  products: Product[];
  onSuccess?: () => void;
  isDarkMode?: boolean;
  isViewMode?: boolean;
}

interface TransactionItem {
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  productName?: string;
}

const TransactionModal: FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  products: productsFromProps,
  onSuccess,
  isDarkMode = false,
  isViewMode = false
}) => {
  const dispatch = useAppDispatch();
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  
  // Debug log for modal visibility
  useEffect(() => {
    console.log('TransactionModal isOpen:', isOpen);
    console.log('Products from props:', productsFromProps);
    console.log('Products length:', productsFromProps?.length || 0);
    console.log('Local products length:', localProducts?.length || 0);
    console.log('Transaction modal render path, isDarkMode:', isDarkMode);
  }, [isOpen, productsFromProps, localProducts, isDarkMode]);

  // Fetch products directly if none are provided from props
  useEffect(() => {
    const fetchProductsDirectly = async () => {
      try {
        console.log('Fetching products directly from API');
        const response = await api.get('/products');
        console.log('Direct API products response:', response.data);
        setLocalProducts(response.data);
      } catch (error) {
        console.error('Error fetching products directly:', error);
      }
    };

    if (isOpen) {
      // First try to use products from Redux store
      if (productsFromProps && productsFromProps.length > 0) {
        setLocalProducts(productsFromProps);
      } else {
        // If no products in Redux, fetch directly
        fetchProductsDirectly();
        // Also dispatch Redux action to update the store
        dispatch(fetchProducts());
      }
    }
  }, [isOpen, productsFromProps, dispatch]);

  // Use the combined products (from props or direct API)
  const products = localProducts.length > 0 ? localProducts : productsFromProps;

  const [type, setType] = useState<'Sale' | 'Purchase' | 'Return'>('Sale');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [customer, setCustomer] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  // For adding new items
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  
  // Initialize form when transaction is provided (view mode)
  useEffect(() => {
    if (transaction && isViewMode) {
      fetchTransactionDetails(transaction.id);
    }
  }, [transaction, isViewMode]);
  
  // Fetch transaction details for view mode
  const fetchTransactionDetails = async (id: number) => {
    try {
      const response = await api.get(`transactions/${id}`);
      setTransactionDetails(response.data);
      setType(response.data.type);
      setPaymentMethod(response.data.payment_method);
      setCustomer(response.data.customer_name || '');
      setNote(response.data.notes || '');
      setTransactionDate(new Date(response.data.date).toLocaleString());
      
      // Format items
      if (response.data.items) {
        const formattedItems = response.data.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          productName: item.product?.tipeSize || `Product #${item.productId}`
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      dispatch(showNotification({ 
        message: 'Failed to load transaction details', 
        type: 'error'
      }));
    }
  };
  
  // Add item to the transaction
  const handleAddItem = () => {
    if (!selectedProductId || selectedProductId <= 0 || quantity <= 0) {
      console.log('Invalid selection:', { selectedProductId, quantity });
      dispatch(showNotification({ 
        message: 'Please select a product and enter a valid quantity', 
        type: 'error'
      }));
      return;
    }
    
    console.log('Adding item with product ID:', selectedProductId);
    console.log('Available products:', products);
    
    const selectedProduct = products.find(p => p.id === selectedProductId);
    console.log('Selected product:', selectedProduct);
    
    if (!selectedProduct) {
      dispatch(showNotification({ 
        message: 'Selected product not found', 
        type: 'error'
      }));
      return;
    }
    
    // Use product's sell price or 0 if not available
    const itemPrice = price > 0 ? price : (selectedProduct.hargaJual || 0);
    const subtotal = quantity * itemPrice;
    
    const productName = selectedProduct.tipeSize || 
                        (selectedProduct.Brand?.name ? `${selectedProduct.Brand.name} Product` : `Product #${selectedProductId}`);
    
    const newItem: TransactionItem = {
      productId: selectedProductId,
      quantity,
      price: itemPrice,
      subtotal,
      productName
    };
    
    console.log('Adding new item to transaction:', newItem);
    
    setItems([...items, newItem]);
    setSelectedProductId(0);
    setQuantity(1);
    setPrice(0);
  };
  
  // Remove item from transaction
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Submit transaction
  const handleSubmit = async () => {
    if (items.length === 0) {
      dispatch(showNotification({ 
        message: 'Please add at least one item to the transaction', 
        type: 'error'
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log state before submission
      console.log('Current state before submit:', {
        type,
        paymentMethod,
        customer,
        note,
        items,
        totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0)
      });
      
      const transactionData = {
        type,
        paymentMethod,
        customerName: customer || null,
        notes: note || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      console.log('Submitting transaction data:', transactionData);
      
      // Log the API endpoint and method
      console.log('API call: POST transactions');
      
      const response = await api.post('transactions', transactionData);
      console.log('API response:', response.data);
      
      dispatch(showNotification({ 
        message: 'Transaction created successfully', 
        type: 'success'
      }));
      
      // Refresh products data to update stock
      dispatch(fetchProducts());
      
      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess();
      }
      
      console.log('Closing modal');
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      dispatch(showNotification({ 
        message: 'Failed to create transaction', 
        type: 'error'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (!isViewMode) {
        setType('Sale');
        setPaymentMethod('Cash');
        setCustomer('');
        setNote('');
        setItems([]);
        setSelectedProductId(0);
        setQuantity(1);
        setPrice(0);
      }
      setTransactionDetails(null);
    }
  }, [isOpen, isViewMode]);
  
  // Update price when product is selected
  useEffect(() => {
    if (selectedProductId > 0) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (selectedProduct && selectedProduct.hargaJual) {
        setPrice(selectedProduct.hargaJual);
      } else {
        setPrice(0);
      }
    }
  }, [selectedProductId, products]);
  
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div 
        className={`relative rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-xl font-semibold">
            {isViewMode ? 'Transaction Details' : 'New Transaction'}
          </h3>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Transaction Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'Sale' | 'Purchase' | 'Return')}
                disabled={isViewMode}
                className={`w-full rounded-md px-3 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } border ${isViewMode ? 'opacity-70' : ''}`}
              >
                <option value="Sale">Sale</option>
                <option value="Purchase">Purchase</option>
                <option value="Return">Return</option>
              </select>
            </div>
            
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isViewMode}
                className={`w-full rounded-md px-3 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } border ${isViewMode ? 'opacity-70' : ''}`}
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Digital Wallet">Digital Wallet</option>
              </select>
            </div>
            
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer (Optional)
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                disabled={isViewMode}
                placeholder="Customer name or ID"
                className={`w-full rounded-md px-3 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } border ${isViewMode ? 'opacity-70' : ''}`}
              />
            </div>
            
            {/* Date (view mode only) */}
            {isViewMode && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={transactionDate}
                  disabled
                  className={`w-full rounded-md px-3 py-2 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  } border opacity-70`}
                />
              </div>
            )}
            
            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isViewMode}
                placeholder="Additional notes"
                rows={2}
                className={`w-full rounded-md px-3 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } border ${isViewMode ? 'opacity-70' : ''}`}
              ></textarea>
            </div>
          </div>
          
          {/* Items Section */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Transaction Items</h4>
            
            {/* Add Item Form (only in create mode) */}
            {!isViewMode && (
              <div className={`grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 pb-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="md:col-span-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    className={`w-full rounded-md px-3 py-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    } border`}
                  >
                    <option value={0}>
                      {products && products.length > 0
                        ? `Select Product (${products.length} available)`
                        : "Loading products..."}
                    </option>
                    
                    {products && products.length > 0 ? (
                      products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.tipeSize || `Product #${product.id}`} 
                          {product.Brand ? ` - ${product.Brand.name}` : ''}
                          {product.currentStock !== undefined ? ` (Stock: ${product.currentStock})` : ''}
                          {` - Price: ${new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(product.hargaJual || 0)}`}
                        </option>
                      ))
                    ) : null}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    placeholder="Quantity"
                    className={`w-full rounded-md px-3 py-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    } border`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                      placeholder="Price"
                      className={`w-full rounded-md px-3 py-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-300'
                      } border`}
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Items Table */}
            <div className="mt-2 overflow-x-auto">
              <table className={`min-w-full ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium">Product</th>
                    <th className="px-3 py-2 text-right text-xs font-medium">Quantity</th>
                    <th className="px-3 py-2 text-right text-xs font-medium">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-medium">Subtotal</th>
                    {!isViewMode && (
                      <th className="px-3 py-2 text-center text-xs font-medium">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={index} className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                        <td className="px-3 py-2 text-left text-sm">{item.productName}</td>
                        <td className="px-3 py-2 text-right text-sm">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-sm">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(item.price)}
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(item.subtotal)}
                        </td>
                        {!isViewMode && (
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td 
                        colSpan={isViewMode ? 4 : 5} 
                        className="px-3 py-4 text-center text-sm text-gray-500"
                      >
                        No items added to this transaction
                      </td>
                    </tr>
                  )}
                  
                  {/* Total Row */}
                  <tr className={`border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <td className="px-3 py-2 text-right font-medium" colSpan={3}>Total</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(totalAmount)}
                    </td>
                    {!isViewMode && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md mr-2 ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
          
          {!isViewMode && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                ${(isSubmitting || items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Transaction'}
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default TransactionModal; 