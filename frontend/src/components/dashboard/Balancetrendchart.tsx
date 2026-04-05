import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import { MonthlyData } from '../../types';

interface BalanceTrendChartProps {
  data: MonthlyData[];
  darkMode: boolean;
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            ₹{Number(entry.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-48 gap-2">
    <p className="text-gray-400 dark:text-gray-600 text-sm">No trend data available</p>
    <p className="text-gray-300 dark:text-gray-700 text-xs">Add transactions to see your balance trend</p>
  </div>
);

// ─── BalanceTrendChart ───────────────────────────────────────────────────────
const BalanceTrendChart: React.FC<BalanceTrendChartProps> = ({ data, darkMode }) => {
  // Theme-aware colors
  const axisColor = darkMode ? '#6b7280' : '#9ca3af';
  const gridColor = darkMode ? '#1f2937' : '#f3f4f6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Balance Trend
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Monthly income vs expenses overview
        </p>
      </div>

      {/* Chart or empty state */}
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />

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

            <Tooltip content={<CustomTooltip />} />

            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            />

            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />

            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#expensesGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default BalanceTrendChart;