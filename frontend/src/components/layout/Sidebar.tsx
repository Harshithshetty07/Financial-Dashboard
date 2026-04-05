import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Lightbulb,
  X,
  Wallet,
} from 'lucide-react';

export type Page = 'dashboard' | 'transactions' | 'insights';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

// ─── Logo ────────────────────────────────────────────────────────────────────
const Logo: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
      <Wallet size={16} className="text-white" />
    </div>
    <span className="text-gray-900 dark:text-white font-bold text-lg tracking-tight">
      FinTrack
    </span>
  </div>
);

// ─── Nav Links ───────────────────────────────────────────────────────────────
interface NavLinksProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onClose: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ activePage, onNavigate, onClose }) => (
  <nav className="flex-1 px-4 py-6 space-y-1">
    {navItems.map((item) => {
      const Icon = item.icon;
      const isActive = activePage === item.id;

      return (
        <motion.button
          key={item.id}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onNavigate(item.id);
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
            isActive
              ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Icon size={18} />
          <span>{item.label}</span>
          {isActive && (
            <motion.span
              layoutId="activeDot"
              className="ml-auto w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
            />
          )}
        </motion.button>
      );
    })}
  </nav>
);

// ─── Sidebar Footer ──────────────────────────────────────────────────────────
const SidebarFooter: React.FC = () => (
  <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
    <p className="text-xs text-gray-400 dark:text-gray-600">FinTrack v1.0.0</p>
  </div>
);

// ─── Sidebar Component ───────────────────────────────────────────────────────
const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* ── Desktop Sidebar (always visible on lg+) ── */}
      <aside className="hidden lg:flex flex-shrink-0 w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <Logo />
        </div>
        <NavLinks
          activePage={activePage}
          onNavigate={onNavigate}
          onClose={onClose}
        />
        <SidebarFooter />
      </aside>

      {/* ── Mobile Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30 flex flex-col lg:hidden"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <Logo />
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks
              activePage={activePage}
              onNavigate={onNavigate}
              onClose={onClose}
            />
            <SidebarFooter />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;