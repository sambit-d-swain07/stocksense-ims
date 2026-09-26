'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package2,
  LayoutDashboard,
  Boxes,
  Warehouse,
  MapPin,
  ArrowLeftRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Boxes },
  { href: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/movements', label: 'Movements', icon: ArrowLeftRight },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#E2E2E2] flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center flex-shrink-0">
          <Package2 className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <span className="text-[14px] font-bold tracking-tight text-[#141414] block leading-none">
            StockSense
          </span>
          <span className="text-[10px] text-[#A9A9A9] tracking-wide uppercase font-medium">
            IMS
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#1C1C1C] text-white'
                  : 'text-[#6E6E6E] hover:bg-[#F4F4F4] hover:text-[#141414]'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-[#A9A9A9] group-hover:text-[#6E6E6E]'
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-2 border-t border-[#E2E2E2] flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-[#F4F4F4] border border-[#E2E2E2] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-[#141414]">
              {(user?.name || user?.loginId || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#141414] truncate leading-none">
              {user?.name || user?.loginId || 'User'}
            </p>
            <p className="text-[11px] text-[#A9A9A9] truncate mt-0.5">{user?.role || 'STAFF'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#A9A9A9] hover:text-[#141414] hover:bg-[#F4F4F4] transition-colors flex-shrink-0"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white border-r border-[#E2E2E2] fixed top-0 left-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-white border-r border-[#E2E2E2] z-50 transition-transform duration-200 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-14 px-4 bg-white/80 backdrop-blur-md border-b border-[#E2E2E2]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#6E6E6E] hover:bg-[#F4F4F4] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1C1C1C] flex items-center justify-center">
              <Package2 className="w-3 h-3 text-white" />
            </div>
            <span className="text-[14px] font-bold tracking-tight text-[#141414]">StockSense</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
