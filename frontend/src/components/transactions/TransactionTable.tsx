import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
} from 'lucide-react';
import { Transaction, Role } from '../../types';

interface TransactionTableProps {
  transactions: Transaction[];
  role: Role;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

// ─── Category badge colors (cycles through a palette) ─────────────────────────
const CATEGORY_COLORS: string[] = [
  'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
];

const getCategoryColor = (category: string): string => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
};

// ─── Format date ──────────────────────────────────────────────────────────────
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Format amount ────────────────────────────────────────────────────────────
const formatAmount = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <ReceiptText size={22} className="text-gray-400 dark:text-gray-600" />
    </div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      No transactions found
    </p>
    <p className="text-xs text-gray-400 dark:text-gray-600">
      Try adjusting your filters or add a new transaction
    </p>
  </div>
);

// ─── Delete confirm button (inline) ──────────────────────────────────────────
interface DeleteButtonProps {
  onDelete: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            onDelete();
            setConfirming(false);
          }}
          className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Delete transaction"
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  );
};

// ─── TransactionTable ─────────────────────────────────────────────────────────
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  role,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isAdmin = role === 'admin';

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedRows = transactions.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Reset to page 1 when transactions change (e.g. new filter applied)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Amount
                  </th>
                  {isAdmin && (
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {paginatedRows.map((txn, i) => (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                        {formatDate(txn.date)}
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200 max-w-[180px] truncate">
                        {txn.description}
                      </td>

                      {/* Category badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryColor(txn.category)}`}
                        >
                          {txn.category}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            txn.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-500 dark:text-red-400'
                          }`}
                        >
                          {txn.type === 'income' ? (
                            <ArrowUpRight size={13} />
                          ) : (
                            <ArrowDownLeft size={13} />
                          )}
                          {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`px-5 py-4 text-right font-semibold whitespace-nowrap ${
                          txn.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {txn.type === 'income' ? '+' : '-'}
                        {formatAmount(txn.amount)}
                      </td>

                      {/* Admin actions */}
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEdit(txn)}
                              title="Edit transaction"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <DeleteButton onDelete={() => onDelete(txn.id)} />
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence initial={false}>
              {paginatedRows.map((txn, i) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-4"
                >
                  {/* Type icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      txn.type === 'income'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    {txn.type === 'income' ? (
                      <ArrowUpRight size={16} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownLeft size={16} className="text-red-500 dark:text-red-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {txn.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-lg font-medium ${getCategoryColor(txn.category)}`}
                      >
                        {txn.category}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-600">
                        {formatDate(txn.date)}
                      </span>
                    </div>
                  </div>

                  {/* Amount + actions */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-sm font-semibold ${
                        txn.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      {txn.type === 'income' ? '+' : '-'}
                      {formatAmount(txn.amount)}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(txn)}
                          className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <DeleteButton onDelete={() => onDelete(txn.id)} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Showing{' '}
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, transactions.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {transactions.length}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={goToNext}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionTable;