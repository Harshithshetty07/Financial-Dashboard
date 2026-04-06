import './App.css'
import React, { useState, useCallback, useMemo } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

import { store, RootState, AppDispatch } from './app/store';
import Layout from './components/layout/Layout';
import { Role } from './components/layout/Header';
import { Page } from './components/layout/Sidebar';

import SummaryCard from './components/dashboard/Summarycard';
import BalanceTrendChart from './components/dashboard/Balancetrendchart';
import SpendingBreakdownChart from './components/dashboard/Spendingbreakdownchart';

import TransactionFilters from './components/transactions/TransactionFilters';
import TransactionTable from './components/transactions/TransactionTable';
import AddTransactionModal from './components/transactions/AddTransactionModal';

import InsightsPanel from './components/insights/InsightsPanel';

import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from './features/transactions/transactionsSlice';
import { setFilters } from './features/filters/filtersSlice';
import { setRole } from './features/role/roleSlice';

import {
  computeSummary,
  computeMonthlyData,
  computeCategoryData,
  applyFilters,
  getUniqueCategories,
  formatCurrency,
  generateId,
  useDarkMode,
} from './utils/helpers';

import { Transaction, TransactionFilters as FiltersType } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const transactions = useSelector((s: RootState) => s.transactions.items);
  const darkMode = useDarkMode();

  const summary = useMemo(() => computeSummary(transactions), [transactions]);
  const monthlyData = useMemo(() => computeMonthlyData(transactions), [transactions]);
  const categoryData = useMemo(() => computeCategoryData(transactions), [transactions]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(summary.totalBalance)}
          icon={Wallet}
          color="indigo"
          trend={summary.balanceTrend}
          index={0}
        />
        <SummaryCard
          title="Total Income"
          value={formatCurrency(summary.totalIncome)}
          icon={TrendingUp}
          color="green"
          trend={summary.incomeTrend}
          index={1}
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={TrendingDown}
          color="red"
          trend={summary.expenseTrend}
          index={2}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BalanceTrendChart data={monthlyData} darkMode={darkMode} />
        <SpendingBreakdownChart data={categoryData} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Transactions Page
// ─────────────────────────────────────────────────────────────────────────────
const TransactionsPage: React.FC = () => {
  const transactions = useSelector((s: RootState) => s.transactions.items);
  const filters = useSelector((s: RootState) => s.filters);
  const role = useSelector((s: RootState) => s.role.current);
  const dispatch = useDispatch<AppDispatch>();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  const isAdmin = role === 'admin';

  const categories = useMemo(() => getUniqueCategories(transactions), [transactions]);

  const filtered = useMemo(
    () => applyFilters(transactions, filters),
    [transactions, filters]
  );

  const handleFilterChange = useCallback(
    (updated: FiltersType) => {
      dispatch(setFilters(updated));
    },
    [dispatch]
  );

  const handleAdd = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((txn: Transaction) => {
    setEditTarget(txn);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(deleteTransaction(id));
    },
    [dispatch]
  );

  const handleModalSubmit = useCallback(
    (data: Omit<Transaction, 'id'>) => {
      if (editTarget) {
        dispatch(updateTransaction({ ...data, id: editTarget.id }));
      } else {
        dispatch(addTransaction({ ...data, id: generateId() }));
      }
    },
    [dispatch, editTarget]
  );

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Add button — admin only */}
        {isAdmin && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Transaction
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={handleFilterChange}
      />

      {/* Table */}
      <TransactionTable
        transactions={filtered}
        role={role}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit Modal — admin only */}
      {isAdmin && (
        <AddTransactionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          editTransaction={editTarget}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Insights Page
// ─────────────────────────────────────────────────────────────────────────────
const InsightsPage: React.FC = () => {
  const transactions = useSelector((s: RootState) => s.transactions.items);
  const darkMode = useDarkMode();

  const monthlyData = useMemo(() => computeMonthlyData(transactions), [transactions]);

  return (
    <InsightsPanel
      transactions={transactions}
      monthlyData={monthlyData}
      darkMode={darkMode}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page router
// ─────────────────────────────────────────────────────────────────────────────
const renderPage = (page: Page): React.ReactNode => {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />;
    case 'transactions':
      return <TransactionsPage />;
    case 'insights':
      return <InsightsPage />;
    default:
      return <DashboardPage />;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AppContent — syncs role dropdown in Header with Redux roleSlice
// ─────────────────────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const role = useSelector((s: RootState) => s.role.current);
  const dispatch = useDispatch<AppDispatch>();

  const handleRoleChange = useCallback(
    (newRole: Role) => {
      dispatch(setRole(newRole));
    },
    [dispatch]
  );

  return (
    <Layout onRoleChange={handleRoleChange} role={role}>
      {(activePage) => renderPage(activePage)}
    </Layout>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;