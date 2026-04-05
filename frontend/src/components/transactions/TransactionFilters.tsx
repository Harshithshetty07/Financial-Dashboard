import React from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import {
  TransactionFilters as FiltersType,
  TransactionType,
  SortField,
  SortOrder,
} from '../../types';

interface TransactionFiltersProps {
  filters: FiltersType;
  categories: string[];
  onChange: (updated: FiltersType) => void;
}

// ─── Type filter tabs ─────────────────────────────────────────────────────────
const TYPE_OPTIONS: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

// ─── Sort field options ───────────────────────────────────────────────────────
const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: 'Date', value: 'date' },
  { label: 'Amount', value: 'amount' },
  { label: 'Category', value: 'category' },
];

// ─── TransactionFilters ───────────────────────────────────────────────────────
const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  categories,
  onChange,
}) => {
  // Helper to update a single field
  const update = <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSortOrder = () => {
    update('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.category !== '';

  const clearAll = () => {
    onChange({
      search: '',
      type: 'all',
      category: '',
      sortField: 'date',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3 shadow-sm">
      {/* Row 1 — Search + Clear */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => update('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Row 2 — Type tabs + Category + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('type', opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filters.type === opt.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Sort field */}
        <select
          value={filters.sortField}
          onChange={(e) => update('sortField', e.target.value as SortField)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort by {opt.label}
            </option>
          ))}
        </select>

        {/* Sort order toggle */}
        <button
          onClick={toggleSortOrder}
          title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {filters.sortOrder === 'asc' ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
          {filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>
    </div>
  );
};

export default TransactionFilters;