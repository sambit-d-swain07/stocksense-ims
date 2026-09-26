import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SettingsNav: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { href: '/settings/warehouses', label: 'Warehouses' },
    { href: '/settings/locations', label: 'Locations' },
  ];

  return (
    <div className="space-y-4 mb-6 border-b border-surface-200 pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-surface-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure warehouses, storage locations, and system parameters.</p>
      </div>

      <nav className="flex space-x-6" aria-label="Settings navigation">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-brand-600 text-brand-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-surface-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
