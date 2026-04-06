import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { Page } from './Sidebar';
import Header, { Role } from './Header';

interface LayoutProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  children: (activePage: Page) => React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ role, onRoleChange, children }) => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // ── Persist dark mode to localStorage ────────────────────────────────────
  useEffect(() => {
    const savedDark = localStorage.getItem('fintrack_dark');
    if (savedDark === 'true') setDarkMode(true);
  }, []);

  // ── Apply / remove `dark` class on <html> ────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('fintrack_dark', String(darkMode));
  }, [darkMode]);

  // ── Close sidebar when resizing to desktop ────────────────────────────────
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setSidebarOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const handleToggleDark = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const handleNavigate = useCallback((page: Page) => {
    setActivePage(page);
  }, []);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          activePage={activePage}
          role={role}
          onRoleChange={onRoleChange}
          darkMode={darkMode}
          onToggleDark={handleToggleDark}
          onMenuClick={handleMenuClick}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {children(activePage)}
        </main>
      </div>
    </div>
  );
};

export default Layout;