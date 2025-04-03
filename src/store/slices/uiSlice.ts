import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ViewMode = 'table' | 'card';
export type TabType = 'products' | 'categories' | 'brands' | 'motorcycles' | 'transactions';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  message: string;
  type: NotificationType;
  show: boolean;
}

interface ModalState {
  isAddProductOpen: boolean;
  isUpdateProductOpen: boolean;
  isCategoryModalOpen: boolean;
  isBrandModalOpen: boolean;
  isClearDataModalOpen: boolean;
}

interface UIState {
  currentTab: TabType;
  isDarkMode: boolean;
  isExpanded: boolean;
  viewModes: {
    products: ViewMode;
    categories: ViewMode;
    brands: ViewMode;
  };
  searchQuery: string;
  alphabeticalFilter: string | null;
  categoryFilter: number | null;
  notification: Notification;
  modals: ModalState;
}

const initialState: UIState = {
  currentTab: 'products',
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  isExpanded: localStorage.getItem('sidebarExpanded') !== 'false',
  viewModes: {
    products: 'table',
    categories: 'table',
    brands: 'table',
  },
  searchQuery: '',
  alphabeticalFilter: null,
  categoryFilter: null,
  notification: {
    message: '',
    type: 'info',
    show: false,
  },
  modals: {
    isAddProductOpen: false,
    isUpdateProductOpen: false,
    isCategoryModalOpen: false,
    isBrandModalOpen: false,
    isClearDataModalOpen: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Tab navigation
    setCurrentTab: (state, action: PayloadAction<TabType>) => {
      state.currentTab = action.payload;
    },
    
    // Theme
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('darkMode', action.payload.toString());
      
      // Update document class for dark mode
      if (action.payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    
    // Sidebar
    setSidebarExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
      localStorage.setItem('sidebarExpanded', action.payload.toString());
    },
    
    // View modes
    setViewMode: (state, action: PayloadAction<{ key: keyof typeof state.viewModes; mode: ViewMode }>) => {
      state.viewModes[action.payload.key] = action.payload.mode;
    },
    
    // Search and filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setAlphabeticalFilter: (state, action: PayloadAction<string | null>) => {
      state.alphabeticalFilter = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<number | null>) => {
      state.categoryFilter = action.payload;
    },
    
    // Notifications
    showNotification: (state, action: PayloadAction<{ message: string; type: NotificationType }>) => {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type,
        show: true,
      };
    },
    hideNotification: (state) => {
      state.notification.show = false;
    },
    
    // Modals
    setModal: (state, action: PayloadAction<{ modal: keyof ModalState; isOpen: boolean }>) => {
      state.modals[action.payload.modal] = action.payload.isOpen;
    },
  },
});

export const {
  setCurrentTab,
  setDarkMode,
  setSidebarExpanded,
  setViewMode,
  setSearchQuery,
  setAlphabeticalFilter,
  setCategoryFilter,
  showNotification,
  hideNotification,
  setModal,
} = uiSlice.actions;

export default uiSlice.reducer; 