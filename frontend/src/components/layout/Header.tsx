import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Page } from './Sidebar';

export type Role = 'admin' | 'viewer';

interface HeaderProps {
  activePage: Page;
  role: Role;
  onRoleChange: (role: Role) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  onMenuClick: () => void;
}

// ─── Page title map ──────────────────────────────────────────────────────────
const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Welcome back! Here is your financial overview.',
  },
  transactions: {
    title: 'Transactions',
    subtitle: 'View and manage your transaction history.',
  },
  insights: {
    title: 'Insights',
    subtitle: 'Understand your spending patterns.',
  },
};

// ─── Role config ─────────────────────────────────────────────────────────────
const roleConfig: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    color: 'text-gray-500 dark:text-gray-400',
  },
};

// ─── Role Dropdown ───────────────────────────────────────────────────────────
interface RoleDropdownProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({ role, onRoleChange }) => {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = roleConfig[role];
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CurrentIcon size={15} className={current.color} />
        <span className="text-gray-700 dark:text-gray-200">{current.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50"
          >
            {(Object.keys(roleConfig) as Role[]).map((r) => {
              const cfg = roleConfig[r];
              const Icon = cfg.icon;
              const isSelected = role === r;

              return (
                <li key={r}>
                  <button
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onRoleChange(r);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={14} />
                    {cfg.label}
                    {isSelected && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Dark Mode Toggle ────────────────────────────────────────────────────────
interface DarkToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

const DarkToggle: React.FC<DarkToggleProps> = ({ darkMode, onToggle }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onToggle}
    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    aria-label="Toggle dark mode"
  >
    <AnimatePresence mode="wait" initial={false}>
      {darkMode ? (
        <motion.span
          key="sun"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Sun size={16} className="text-yellow-500" />
        </motion.span>
      ) : (
        <motion.span
          key="moon"
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Moon size={16} className="text-gray-500 dark:text-gray-400" />
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

// ─── Header Component ────────────────────────────────────────────────────────
const Header: React.FC<HeaderProps> = ({
  activePage,
  role,
  onRoleChange,
  darkMode,
  onToggleDark,
  onMenuClick,
}) => {
  const { title, subtitle } = pageTitles[activePage];

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left: Hamburger (mobile) + Page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block mt-0.5">
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Right: Role switcher + Dark mode toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <RoleDropdown role={role} onRoleChange={onRoleChange} />
          <DarkToggle darkMode={darkMode} onToggle={onToggleDark} />
        </div>
      </div>
    </header>
  );
};

export default Header;