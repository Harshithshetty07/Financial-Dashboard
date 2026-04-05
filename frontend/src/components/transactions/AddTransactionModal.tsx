import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, AlertCircle } from 'lucide-react';
import { Transaction, TransactionType } from '../../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction?: Transaction | null;
}

// ─── Available categories ─────────────────────────────────────────────────────
const CATEGORIES: string[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Housing',
  'Education',
  'Utilities',
  'Travel',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

// ─── Form state shape ─────────────────────────────────────────────────────────
interface FormState {
  description: string;
  amount: string;
  category: string;
  date: string;
  type: TransactionType;
}

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

const DEFAULT_FORM: FormState = {
  description: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  type: 'expense',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};

  if (!form.description.trim()) {
    errors.description = 'Description is required.';
  } else if (form.description.trim().length < 2) {
    errors.description = 'Description must be at least 2 characters.';
  }

  const parsed = parseFloat(form.amount);
  if (!form.amount) {
    errors.amount = 'Amount is required.';
  } else if (isNaN(parsed) || parsed <= 0) {
    errors.amount = 'Amount must be a positive number.';
  } else if (parsed > 10_000_000) {
    errors.amount = 'Amount is too large.';
  }

  if (!form.category) {
    errors.category = 'Please select a category.';
  }

  if (!form.date) {
    errors.date = 'Date is required.';
  }

  return errors;
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
);

// ─── Input class helper ───────────────────────────────────────────────────────
const inputClass = (hasError: boolean): string =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-400 dark:border-red-600 focus:ring-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600'
  }`;

// ─── AddTransactionModal ──────────────────────────────────────────────────────
const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editTransaction,
}) => {
  const isEditing = Boolean(editTransaction);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<boolean>(false);

  // Populate form when editing
  useEffect(() => {
    if (editTransaction) {
      setForm({
        description: editTransaction.description,
        amount: String(editTransaction.amount),
        category: editTransaction.category,
        date: editTransaction.date,
        type: editTransaction.type,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
    setTouched(false);
  }, [editTransaction, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        if (touched) setErrors(validate(next));
        return next;
      });
    },
    [touched]
  );

  const handleSubmit = () => {
    setTouched(true);
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
      type: form.type,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    {isEditing ? (
                      <Pencil size={15} className="text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Plus size={15} className="text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Transaction' : 'Add Transaction'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Transaction type toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  {(['expense', 'income'] as TransactionType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateField('type', t)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                        form.type === t
                          ? t === 'income'
                            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                            : 'bg-white dark:bg-gray-700 text-red-500 dark:text-red-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <Field label="Description" error={errors.description}>
                  <input
                    type="text"
                    placeholder="e.g. Grocery shopping"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className={inputClass(Boolean(errors.description))}
                    maxLength={80}
                  />
                </Field>

                {/* Amount */}
                <Field label="Amount (₹)" error={errors.amount}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    min="0"
                    step="0.01"
                    className={inputClass(Boolean(errors.amount))}
                  />
                </Field>

                {/* Category */}
                <Field label="Category" error={errors.category}>
                  <select
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={inputClass(Boolean(errors.category))}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Date */}
                <Field label="Date" error={errors.date}>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={inputClass(Boolean(errors.date))}
                  />
                </Field>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
                >
                  {isEditing ? 'Save Changes' : 'Add Transaction'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;