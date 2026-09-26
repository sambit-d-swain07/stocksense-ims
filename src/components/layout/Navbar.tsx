'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [opsOpen, setOpsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isOpsActive =
    pathname.startsWith('/receipts') ||
    pathname.startsWith('/deliveries') ||
    pathname.startsWith('/adjustments');

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-base">
                S
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-bold tracking-tight text-zinc-900">
                  StockSense
                </span>
                <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                  IMS
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    pathname === '/'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Operations Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpsOpen(!opsOpen)}
                    onBlur={() => setTimeout(() => setOpsOpen(false), 200)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center space-x-1 ${
                      isOpsActive
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <span>Operations</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {opsOpen && (
                    <div className="absolute left-0 mt-1.5 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-50">
                      <Link
                        href="/receipts"
                        className="block px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        Receipts (WH/IN)
                      </Link>
                      <Link
                        href="/deliveries"
                        className="block px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        Deliveries (WH/OUT)
                      </Link>
                      <Link
                        href="/adjustments"
                        className="block px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        Physical Adjustments
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/products"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    pathname.startsWith('/products')
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Products
                </Link>

                <Link
                  href="/stock"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    pathname.startsWith('/stock')
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Stock
                </Link>

                <Link
                  href="/transfers"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    pathname.startsWith('/transfers')
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Transfers
                </Link>

                <Link
                  href="/ledger"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    pathname.startsWith('/ledger')
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Move History
                </Link>

                <Link
                  href="/settings"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    pathname.startsWith('/settings')
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-zinc-900">{user.name || user.loginId || 'User'}</p>
                  <p className="text-[11px] text-zinc-500 font-mono">{user.role} &bull; {user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
