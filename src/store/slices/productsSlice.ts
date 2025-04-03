import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Product } from '../../types';
import api from '../../utils/api';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  productsList: Product[]; // Alias for items, for backward compatibility
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  get productsList() { return this.items; } // Alias getter
};

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Async thunks for API operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching products from API...');
      console.log('API URL:', API_URL);
      
      const response = await api.get(`/products`);
      
      console.log('Products API response:', response);
      console.log('Products data:', response.data);
      console.log('Number of products received:', response.data?.length || 0);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
        return rejectWithValue(error.response?.data || error.message);
      }
      console.error('Unknown error fetching products');
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const addProductAsync = createAsyncThunk(
  'products/addProduct',
  async (product: Partial<Product>, { rejectWithValue }) => {
    try {
      const response = await api.post(`/products`, product);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'products/updateProduct',
  async (product: Product, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${product.id}`, product);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const deleteProductAsync = createAsyncThunk(
  'products/deleteProduct',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Synchronous actions if needed
    resetProducts: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add product
      .addCase(addProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductAsync.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update product
      .addCase(updateProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductAsync.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete product
      .addCase(deleteProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProducts } = productsSlice.actions;
export default productsSlice.reducer; 