import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionFilters, SortField, SortOrder, TransactionType } from '../../types';

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState: TransactionFilters = {
  search: '',
  type: 'all',
  category: '',
  sortField: 'date',
  sortOrder: 'desc',
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Replace all filters at once
    setFilters(_state, action: PayloadAction<TransactionFilters>) {
      return action.payload;
    },

    // Update individual fields
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    setType(state, action: PayloadAction<TransactionType | 'all'>) {
      state.type = action.payload;
    },

    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
    },

    setSortField(state, action: PayloadAction<SortField>) {
      state.sortField = action.payload;
    },

    setSortOrder(state, action: PayloadAction<SortOrder>) {
      state.sortOrder = action.payload;
    },

    // Reset everything back to defaults
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setFilters,
  setSearch,
  setType,
  setCategory,
  setSortField,
  setSortOrder,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;