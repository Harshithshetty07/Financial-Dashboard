import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../types';
import { MOCK_TRANSACTIONS } from '../../data/mockData';

interface TransactionsState {
  items: Transaction[];
}

// ─── Load from localStorage, fall back to mock data ──────────────────────────
const loadInitialTransactions = (): Transaction[] => {
  try {
    const saved = localStorage.getItem('fintrack_transactions');
    if (saved) {
      const parsed = JSON.parse(saved) as Transaction[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return MOCK_TRANSACTIONS;
};

const initialState: TransactionsState = {
  items: loadInitialTransactions(),
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.items.unshift(action.payload); // newest first
    },

    updateTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    deleteTransaction(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },

    // Replace all items (e.g. for a full reset)
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.items = action.payload;
    },
  },
});

export const {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setTransactions,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;