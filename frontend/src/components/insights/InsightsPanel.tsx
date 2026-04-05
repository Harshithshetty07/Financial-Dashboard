import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  PiggyBank,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Minus,
} from 'lucide-react';
import { Transaction, MonthlyData } from '../../types';

interface InsightsPanelProps {
  transactions: Transaction[];
  monthlyData: MonthlyData[];
  darkMode: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatAmount = (n: number): string =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const getCurrentMonthName = (): string =>
  new Date().toLocaleString('en-IN', { month: 'long' });

const getPrevMonthName = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleString('en-IN', { month: 'long' });
};

// ─── Derive insights from transactions ────────────────────────────────────────
const deriveInsights = (transactions: Transaction[]) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const income = transactions.filter((t) => t.type === 'income');

  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Top spending category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  // Largest single expense
  const largestExpense = expenses.reduce<Transaction | null>(
    (max, t) => (!max || t.amount > max.amount ? t : max),
    null
  );

  // Average expense
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  // Current vs previous month comparison
  const now = new Date();
  const currMonth = now.getMonth();
  const currYear = now.getFullYear();

  const prevDate = new Date(currYear, currMonth - 1, 1);
  const prevMonth = prevDate.getMonth();
  const prevYear = prevDate.getFullYear();

  const isCurrentMonth = (t: Transaction) => {
    const d = new Date(t.date);
    return d.getMonth() === currMonth && d.getFullYear() === currYear;
  };
  const isPrevMonth = (t: Transaction) => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  };

  const currExpenses = expenses.filter(isCurrentMonth).reduce((s, t) => s + t.amount, 0);
  const prevExpenses = expenses.filter(isPrevMonth).reduce((s, t) => s + t.amount, 0);
  const currIncome = income.filter(isCurrentMonth).reduce((s, t) => s + t.amount, 0);
  const prevIncome = income.filter(isPrevMonth).reduce((s, t) => s + t.amount, 0);

  const expenseChange =
    prevExpenses > 0 ? ((currExpenses - prevExpenses) / prevExpenses) * 100 : null;
  const incomeChange =
    prevIncome > 0 ? ((currIncome - prevIncome) / prevIncome) * 100 : null;

  return {
    totalIncome,
    totalExpenses,
    savingsRate,
    topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    largestExpense,
    avgExpense,
    currExpenses,
    prevExpenses,
    currIncome,
    prevIncome,
    expenseChange,
    incomeChange,
  };
};

// ─── Insight Card ─────────────────────────────────────────────────────────────
interface InsightCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: { label: string; positive: boolean } | null;
  index: number;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
  >
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {title}
      </p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={16} className={iconColor} />
      </div>
    </div>
    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    {subtitle && (
      <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{subtitle}</p>
    )}
    {badge && (
      <div
        className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-xs font-medium ${
          badge.positive
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
        }`}
      >
        {badge.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {badge.label}
      </div>
    )}
  </motion.div>
);

// ─── Monthly comparison tooltip ───────────────────────────────────────────────
const MonthlyTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            ₹{Number(entry.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <Zap size={22} className="text-gray-400 dark:text-gray-600" />
    </div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No insights yet</p>
    <p className="text-xs text-gray-400 dark:text-gray-600 text-center max-w-xs">
      Add some transactions to start seeing insights about your spending patterns.
    </p>
  </div>
);

// ─── InsightsPanel ────────────────────────────────────────────────────────────
const InsightsPanel: React.FC<InsightsPanelProps> = ({
  transactions,
  monthlyData,
  darkMode,
}) => {
  if (transactions.length === 0) return <EmptyState />;

  const ins = deriveInsights(transactions);
  const axisColor = darkMode ? '#6b7280' : '#9ca3af';
  const gridColor = darkMode ? '#1f2937' : '#f3f4f6';

  // Monthly comparison data (last 2 months)
  const comparisonData = monthlyData.slice(-6);

  return (
    <div className="space-y-6">
      {/* ── Insight cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top spending category */}
        <InsightCard
          index={0}
          title="Top Spending Category"
          value={ins.topCategory ? ins.topCategory.name : '—'}
          subtitle={ins.topCategory ? `${formatAmount(ins.topCategory.amount)} spent` : undefined}
          icon={Award}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
          badge={null}
        />

        {/* Savings rate */}
        <InsightCard
          index={1}
          title="Savings Rate"
          value={`${ins.savingsRate.toFixed(1)}%`}
          subtitle={`${formatAmount(ins.totalIncome - ins.totalExpenses)} saved overall`}
          icon={PiggyBank}
          iconBg="bg-green-50 dark:bg-green-900/20"
          iconColor="text-green-600 dark:text-green-400"
          badge={
            ins.savingsRate >= 0
              ? { label: ins.savingsRate >= 20 ? 'Healthy' : 'Low', positive: ins.savingsRate >= 20 }
              : { label: 'Negative', positive: false }
          }
        />

        {/* Largest expense */}
        <InsightCard
          index={2}
          title="Largest Expense"
          value={ins.largestExpense ? formatAmount(ins.largestExpense.amount) : '—'}
          subtitle={ins.largestExpense?.description}
          icon={Zap}
          iconBg="bg-red-50 dark:bg-red-900/20"
          iconColor="text-red-500 dark:text-red-400"
          badge={null}
        />

        {/* This month expenses vs last month */}
        <InsightCard
          index={3}
          title={`${getCurrentMonthName()} Expenses`}
          value={formatAmount(ins.currExpenses)}
          subtitle={`vs ${formatAmount(ins.prevExpenses)} in ${getPrevMonthName()}`}
          icon={ArrowDownLeft}
          iconBg="bg-rose-50 dark:bg-rose-900/20"
          iconColor="text-rose-500 dark:text-rose-400"
          badge={
            ins.expenseChange !== null
              ? {
                  label: `${Math.abs(ins.expenseChange).toFixed(1)}% ${ins.expenseChange > 0 ? 'more' : 'less'}`,
                  positive: ins.expenseChange <= 0,
                }
              : null
          }
        />

        {/* This month income vs last month */}
        <InsightCard
          index={4}
          title={`${getCurrentMonthName()} Income`}
          value={formatAmount(ins.currIncome)}
          subtitle={`vs ${formatAmount(ins.prevIncome)} in ${getPrevMonthName()}`}
          icon={ArrowUpRight}
          iconBg="bg-indigo-50 dark:bg-indigo-900/20"
          iconColor="text-indigo-600 dark:text-indigo-400"
          badge={
            ins.incomeChange !== null
              ? {
                  label: `${Math.abs(ins.incomeChange).toFixed(1)}% ${ins.incomeChange > 0 ? 'more' : 'less'}`,
                  positive: ins.incomeChange >= 0,
                }
              : null
          }
        />

        {/* Average expense */}
        <InsightCard
          index={5}
          title="Avg. Transaction Size"
          value={formatAmount(Math.round(ins.avgExpense))}
          subtitle="Per expense transaction"
          icon={Minus}
          iconBg="bg-sky-50 dark:bg-sky-900/20"
          iconColor="text-sky-600 dark:text-sky-400"
          badge={null}
        />
      </div>

      {/* ── Monthly comparison bar chart ── */}
      {comparisonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Monthly Comparison
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Income vs expenses over the last {comparisonData.length} months
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={comparisonData}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                }
              />
              <Tooltip content={<MonthlyTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              />
              <Bar dataKey="income" name="Income" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default InsightsPanel;