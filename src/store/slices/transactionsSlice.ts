import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Transaction } from '../../types';
import api from '../../utils/api';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp to know when data was last fetched
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
  lastFetched: null
};

// Async thunks for API operations
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { transactions: TransactionsState };
    const now = Date.now();
    
    // If data was fetched less than 5 minutes ago, don't fetch again
    if (state.transactions.lastFetched && now - state.transactions.lastFetched < 5 * 60 * 1000 && state.transactions.items.length > 0) {
      console.log('Using cached transactions data');
      return state.transactions.items;
    }
    
    try {
      console.log('Fetching transactions from API');
      const response = await api.get('/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return rejectWithValue('Failed to fetch transactions');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transaction: Partial<Transaction>, { rejectWithValue }) => {
    try {
      const response = await api.post('/transactions', transaction);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return rejectWithValue('Failed to create transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/transactions/${id}`);
      return id;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return rejectWithValue('Failed to delete transaction');
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    invalidateTransactions: (state) => {
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create transaction
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.items.push(action.payload);
      })
      
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { invalidateTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer; 