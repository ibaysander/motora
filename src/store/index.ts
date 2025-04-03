import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import reducers
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import brandsReducer from './slices/brandsSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import transactionsReducer from './slices/transactionsSlice';

// Create the store
const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    ui: uiReducer,
    auth: authReducer,
    transactions: transactionsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export the store as default and named export
export { store };
export default store; 