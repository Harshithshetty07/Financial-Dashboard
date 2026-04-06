import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from '../features/transactions/transactionsSlice';
import filtersReducer from '../features/filters/filtersSlice';
import roleReducer from '../features/role/roleSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    filters: filtersReducer,
    role: roleReducer,
  },
});

// ─── Typed helpers ────────────────────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;