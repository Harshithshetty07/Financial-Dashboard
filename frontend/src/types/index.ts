// ─── Role ────────────────────────────────────────────────────────────────────
export type Role = 'admin' | 'viewer';

// ─── Page ────────────────────────────────────────────────────────────────────
export type Page = 'dashboard' | 'transactions' | 'insights';

// ─── Transaction ─────────────────────────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;          // ISO date string e.g. "2024-03-15"
  description: string;
  amount: number;        // always positive; use `type` to determine sign
  category: string;
  type: TransactionType;
}

// ─── Summary Card ────────────────────────────────────────────────────────────
export type CardColor = 'indigo' | 'green' | 'red' | 'amber';

export interface CardTrend {
  value: number;         // percentage change e.g. 12.5
  isPositive: boolean;
}

// ─── Chart Data ──────────────────────────────────────────────────────────────
export interface MonthlyData {
  month: string;         // e.g. "Jan", "Feb"
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  color: string;         // hex color e.g. "#6366f1"
  percentage: number;
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export type SortField = 'date' | 'amount' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  category: string;      // empty string = all categories
  sortField: SortField;
  sortOrder: SortOrder;
}