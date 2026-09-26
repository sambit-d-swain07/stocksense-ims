'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Boxes,
  LayoutGrid,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  Package,
  ArrowLeftRight,
  History,
  Settings,
  ChevronDown,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  actionButton?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, pageTitle, actionButton }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [opsExpanded, setOpsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isOpsActive =
    pathname.startsWith('/operations/receipts') ||
    pathname.startsWith('/operations/deliveries') ||
    pathname.startsWith('/adjustments');

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, isExact: true },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/stock', label: 'Stock', icon: Boxes },
    { href: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
    { href: '/ledger', label: 'Move History', icon: History, altHref: '/move-history' },
    { href: '/settings/warehouses', label: 'Settings', icon: Settings, altHref: '/settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-3.5 text-white/80">
      {/* Top Section */}
      <div className="space-y-3">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Boxes className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white">StockSense</span>
              <span className="text-[10px] font-bold text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                IMS
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Chip */}
        <div className="bg-ink-soft rounded-inner p-2.5 border border-ink-line text-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600/20 text-brand-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 block">
              Workspace
            </span>
            <span className="font-semibold text-white truncate block text-xs">
              Main Warehouse
            </span>
          </div>
        </div>

        {/* Search Field */}
        <div className="bg-ink-soft rounded-inner px-3 py-2 border border-ink-line flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 shrink-0 text-white/40" />
            <span className="truncate">Search...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/60">
            ⌘K
          </kbd>
        </div>

        {/* Navigation List */}
        <div className="pt-2 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 mb-1.5">
            Navigation
          </div>

          {/* Dashboard Link */}
          {(() => {
            const isActive = pathname === '/' || pathname === '/dashboard';
            return (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`h-10 rounded-xl px-3 flex items-center gap-3 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-brand-400 before:rounded-r'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </Link>
            );
          })()}

          {/* Operations Expandable Group */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setOpsExpanded(!opsExpanded)}
              className={`w-full h-10 rounded-xl px-3 flex items-center justify-between text-xs font-medium transition-all ${
                isOpsActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                <span>Operations</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform text-white/50 ${
                  opsExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {opsExpanded && (
              <div className="pl-6 space-y-1 pt-0.5 border-l border-ink-line ml-5">
                <Link
                  href="/operations/receipts"
                  onClick={() => setMobileOpen(false)}
                  className={`h-9 rounded-lg px-2.5 flex items-center gap-2.5 text-xs transition-all ${
                    pathname.startsWith('/operations/receipts')
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Receipts (WH/IN)</span>
                </Link>

                <Link
                  href="/operations/deliveries"
                  onClick={() => setMobileOpen(false)}
                  className={`h-9 rounded-lg px-2.5 flex items-center gap-2.5 text-xs transition-all ${
                    pathname.startsWith('/operations/deliveries')
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5" />
                  <span>Deliveries (WH/OUT)</span>
                </Link>

                <Link
                  href="/adjustments"
                  onClick={() => setMobileOpen(false)}
                  className={`h-9 rounded-lg px-2.5 flex items-center gap-2.5 text-xs transition-all ${
                    pathname.startsWith('/adjustments')
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Adjustments</span>
                </Link>
              </div>
            )}
          </div>

          {/* Standard Navigation Items */}
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href) ||
              (item.altHref && (pathname === item.altHref || pathname.startsWith(item.altHref)));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`h-10 rounded-xl px-3 flex items-center gap-3 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-brand-400 before:rounded-r'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom User Account Section */}
      <div className="pt-4 border-t border-ink-line space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3">
          User Account
        </div>
        {user ? (
          <div className="bg-ink-soft rounded-inner p-2.5 border border-ink-line flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {(user.name || user.loginId || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white truncate block">
                  {user.name || user.loginId || 'User'}
                </span>
                <span className="text-[10px] font-mono text-white/40 truncate block">
                  {user.role || 'STAFF'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-1">
            <Link
              href="/login"
              className="flex-1 text-center py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-5 flex flex-col justify-center">
      {/* APP SURFACE */}
      <div className="max-w-[1600px] w-full mx-auto min-h-[calc(100vh-32px)] lg:h-[calc(100vh-32px)] rounded-app bg-white/80 backdrop-blur-xl border border-white/70 shadow-float flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Desktop Dark Sidebar */}
        <aside className="hidden lg:block w-64 bg-ink rounded-[22px] m-2.5 shrink-0 overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Mobile Slide-in Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-ink h-full shadow-2xl p-2 z-10 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
          {/* TOP BAR */}
          <header className="px-6 py-4 border-b border-surface-200/80 bg-white/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-surface-200 bg-white text-surface-700 shadow-sm"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                {pageTitle || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white border border-surface-200 shadow-card flex items-center justify-center text-surface-600 hover:text-surface-900 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>

              {actionButton ? (
                actionButton
              ) : (
                <Link href="/operations/receipts/new">
                  <button
                    type="button"
                    className="bg-ink hover:bg-ink-soft text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>+ New Operation</span>
                  </button>
                </Link>
              )}
            </div>
          </header>

          {/* MAIN SCROLLABLE BODY */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {children}

            {/* Footer inside scroll area */}
            <footer className="pt-8 pb-4 text-center text-xs text-surface-500 border-t border-surface-200/60 mt-12">
              StockSense IMS &bull; Inventory Management &amp; Ledger System
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};
