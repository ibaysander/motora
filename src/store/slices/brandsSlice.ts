import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Brand } from '../../types';

interface BrandsState {
  items: Brand[];
  loading: boolean;
  error: string | null;
}

const initialState: BrandsState = {
  items: [],
  loading: false,
  error: null,
};

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Async thunks for API operations
export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/brands`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const addBrandAsync = createAsyncThunk(
  'brands/addBrand',
  async (brand: Partial<Brand>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/brands`, brand);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateBrandAsync = createAsyncThunk(
  'brands/updateBrand',
  async (brand: Brand, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/brands/${brand.id}`, brand);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const deleteBrandAsync = createAsyncThunk(
  'brands/deleteBrand',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/brands/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    // Synchronous actions if needed
    resetBrands: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action: PayloadAction<Brand[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add brand
      .addCase(addBrandAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBrandAsync.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addBrandAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update brand
      .addCase(updateBrandAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrandAsync.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateBrandAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete brand
      .addCase(deleteBrandAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrandAsync.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteBrandAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetBrands } = brandsSlice.actions;
export default brandsSlice.reducer; 