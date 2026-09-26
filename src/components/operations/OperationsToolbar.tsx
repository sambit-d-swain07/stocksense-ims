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
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Title + New Button Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">{title}</h1>
            {totalRecords !== undefined && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-100 text-surface-600 border border-surface-200">
                {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          {description && <p className="text-sm text-surface-500 mt-1">{description}</p>}
        </div>

        {newHref && (
          <Link href={newHref} className="self-start sm:self-auto">
            <Button variant="primary" size="md" className="gap-2 shadow-sm rounded-full px-5">
              <Plus className="w-4 h-4" />
              <span>{newButtonText}</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Search & View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-10 pr-9 h-11 text-sm bg-white border border-surface-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-surface-900 placeholder:text-surface-400 shadow-sm transition-all"
            aria-label="Search records"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-surface-400 hover:text-surface-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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

