import React from 'react';
import Link from 'next/link';
import { Search, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from './ViewToggle';

export interface OperationsToolbarProps {
  title: string;
  description?: string;
  newHref?: string;
  newButtonText?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  view?: 'list' | 'kanban';
  onViewChange?: (view: 'list' | 'kanban') => void;
  totalRecords?: number;
  children?: React.ReactNode;
}

export const OperationsToolbar: React.FC<OperationsToolbarProps> = ({
  title,
  description,
  newHref,
  newButtonText = 'New',
  searchQuery,
  onSearchChange,
  view,
  onViewChange,
  totalRecords,
  children,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-surface-900">{title}</h1>
            {totalRecords !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-100 text-slate-600 border border-surface-200">
                {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>

        {newHref && (
          <Link href={newHref} className="self-start sm:self-auto">
            <Button variant="primary" size="md" className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>{newButtonText}</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 text-surface-900 placeholder:text-slate-400"
              aria-label="Search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {children}
        </div>

        {view && onViewChange && (
          <div className="flex justify-end">
            <ViewToggle view={view} onViewChange={onViewChange} />
          </div>
        )}
      </div>
    </div>
  );
};
