import { useEffect, useState } from 'react';
import {
  Transaction,
  MonthlyData,
  CategoryData,
  TransactionFilters,
  CardTrend,
} from '../types';

// ─── Currency formatter ───────────────────────────────────────────────────────
export const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ─── Date formatter ───────────────────────────────────────────────────────────
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// ─── Generate a unique ID ─────────────────────────────────────────────────────
export const generateId = (): string =>
  `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── useDarkMode hook ─────────────────────────────────────────────────────────
// Observes the `dark` class on <html> so components react to Layout's toggle
export const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

// ─── Get unique categories from transactions ──────────────────────────────────
export const getUniqueCategories = (transactions: Transaction[]): string[] => {
  const set = new Set(transactions.map((t) => t.category));
  return Array.from(set).sort();
};

// ─── Apply filters and sorting ────────────────────────────────────────────────
export const applyFilters = (
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] => {
  let result = [...transactions];

  // Search filter (description or category)
  if (filters.search.trim()) {
    const query = filters.search.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filters.type !== 'all') {
    result = result.filter((t) => t.type === filters.type);
  }

  // Category filter
  if (filters.category) {
    result = result.filter((t) => t.category === filters.category);
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return result;
};

// ─── Compute monthly data (last 6 months) ────────────────────────────────────
export const computeMonthlyData = (transactions: Transaction[]): MonthlyData[] => {
  const now = new Date();
  const months: MonthlyData[] = [];

  for (let i = 5; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const targetMonth = target.getMonth();
    const targetYear = target.getFullYear();

    const monthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    const income = monthTxns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTxns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    months.push({
      month: target.toLocaleString('en-IN', { month: 'short' }),
      income,
      expenses,
      balance: income - expenses,
    });
  }

  return months;
};

// ─── Category color palette ───────────────────────────────────────────────────
const CATEGORY_COLORS: string[] = [
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
];

// ─── Compute category breakdown (expenses only) ───────────────────────────────
export const computeCategoryData = (transactions: Transaction[]): CategoryData[] => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);

  if (total === 0) return [];

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
  });

  return Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // top 8 categories max
    .map(([category, amount], index) => ({
      category,
      amount,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percentage: (amount / total) * 100,
    }));
};

// ─── Summary types ────────────────────────────────────────────────────────────
export interface Summary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  balanceTrend: CardTrend | undefined;
  incomeTrend: CardTrend | undefined;
  expenseTrend: CardTrend | undefined;
}

// ─── Compute summary stats with month-over-month trends ──────────────────────
export const computeSummary = (transactions: Transaction[]): Summary => {
  const now = new Date();
  const currMonth = now.getMonth();
  const currYear = now.getFullYear();

  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prev.getMonth();
  const prevYear = prev.getFullYear();

  const isThisMonth = (t: Transaction): boolean => {
    const d = new Date(t.date);
    return d.getMonth() === currMonth && d.getFullYear() === currYear;
  };

  const isLastMonth = (t: Transaction): boolean => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  };

  // All time totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // This month
  const currIncome = transactions
    .filter((t) => t.type === 'income' && isThisMonth(t))
    .reduce((sum, t) => sum + t.amount, 0);

  const currExpenses = transactions
    .filter((t) => t.type === 'expense' && isThisMonth(t))
    .reduce((sum, t) => sum + t.amount, 0);

  // Last month
  const prevIncome = transactions
    .filter((t) => t.type === 'income' && isLastMonth(t))
    .reduce((sum, t) => sum + t.amount, 0);

  const prevExpenses = transactions
    .filter((t) => t.type === 'expense' && isLastMonth(t))
    .reduce((sum, t) => sum + t.amount, 0);

  // Trend helpers
  const makeTrend = (curr: number, prev: number): CardTrend | undefined => {
    if (prev === 0) return undefined;
    const value = ((curr - prev) / prev) * 100;
    return { value: Math.abs(value), isPositive: value >= 0 };
  };

  const currBalance = currIncome - currExpenses;
  const prevBalance = prevIncome - prevExpenses;

  return {
    totalBalance: totalIncome - totalExpenses,
    totalIncome,
    totalExpenses,
    balanceTrend: makeTrend(currBalance, prevBalance),
    incomeTrend: makeTrend(currIncome, prevIncome),
    expenseTrend: makeTrend(currExpenses, prevExpenses),
  };
};