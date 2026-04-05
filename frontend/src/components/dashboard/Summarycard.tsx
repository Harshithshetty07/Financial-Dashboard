import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CardColor, CardTrend } from '../../types';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: CardColor;
  trend?: CardTrend;
  index?: number; // used for staggered entrance animation
}

// ─── Color map ───────────────────────────────────────────────────────────────
const colorMap: Record<
  CardColor,
  { iconBg: string; iconText: string; trendPositive: string; trendNegative: string }
> = {
  indigo: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    trendPositive: 'text-indigo-600 dark:text-indigo-400',
    trendNegative: 'text-red-500 dark:text-red-400',
  },
  green: {
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    trendPositive: 'text-green-600 dark:text-green-400',
    trendNegative: 'text-red-500 dark:text-red-400',
  },
  red: {
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    iconText: 'text-red-600 dark:text-red-400',
    trendPositive: 'text-green-600 dark:text-green-400',
    trendNegative: 'text-red-500 dark:text-red-400',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    trendPositive: 'text-green-600 dark:text-green-400',
    trendNegative: 'text-red-500 dark:text-red-400',
  },
};

// ─── SummaryCard ─────────────────────────────────────────────────────────────
const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  index = 0,
}) => {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 shadow-sm"
    >
      {/* Top row: title + icon */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
          <Icon size={18} className={colors.iconText} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {value}
        </p>

        {/* Trend badge */}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
              trend.isPositive
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Trend description */}
      {trend !== undefined && (
        <p className="text-xs text-gray-400 dark:text-gray-600 -mt-2">
          {trend.isPositive ? 'Up' : 'Down'} from last month
        </p>
      )}
    </motion.div>
  );
};

export default SummaryCard;