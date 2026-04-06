import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { CategoryData } from '../../types';

interface SpendingBreakdownChartProps {
  data: CategoryData[];
}

// ─── Custom tooltip payload shape ─────────────────────────────────────────────
interface TooltipPayloadItem {
  payload: CategoryData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {item.category}
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 pl-[18px]">
        ₹{item.amount.toLocaleString('en-IN')}
        <span className="ml-1 text-gray-400 dark:text-gray-500">
          ({item.percentage.toFixed(1)}%)
        </span>
      </p>
    </div>
  );
};

// ─── Legend Item ──────────────────────────────────────────────────────────────
interface LegendItemProps {
  item: CategoryData;
  isActive: boolean;
  onHover: (category: string | null) => void;
}

const LegendItem: React.FC<LegendItemProps> = ({ item, isActive, onHover }) => (
  <motion.div
    whileHover={{ x: 2 }}
    onMouseEnter={() => onHover(item.category)}
    onMouseLeave={() => onHover(null)}
    className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-default transition-colors ${
      isActive ? 'bg-gray-50 dark:bg-gray-800' : ''
    }`}
  >
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: item.color }}
      />
      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {item.category}
      </span>
    </div>
    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        ₹{item.amount.toLocaleString('en-IN')}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-600 w-10 text-right">
        {item.percentage.toFixed(0)}%
      </span>
    </div>
  </motion.div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-48 gap-2">
    <p className="text-gray-400 dark:text-gray-600 text-sm">No spending data available</p>
    <p className="text-gray-300 dark:text-gray-700 text-xs">
      Add expense transactions to see the breakdown
    </p>
  </div>
);

// ─── SpendingBreakdownChart ───────────────────────────────────────────────────
const SpendingBreakdownChart: React.FC<SpendingBreakdownChartProps> = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const activeIndex = activeCategory
    ? data.findIndex((d) => d.category === activeCategory)
    : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Spending Breakdown
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Expenses by category this month
        </p>
      </div>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut chart */}
          <div className="relative w-44 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="amount"
                  onMouseEnter={(_, index) =>
                    setActiveCategory(data[index].category)
                  }
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={entry.color}
                      opacity={
                        activeIndex === -1 || activeIndex === index ? 1 : 0.45
                      }
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
              <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                ₹{(total / 1000).toFixed(1)}k
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-0.5">
            {data.map((item) => (
              <LegendItem
                key={item.category}
                item={item}
                isActive={activeCategory === item.category}
                onHover={setActiveCategory}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SpendingBreakdownChart;