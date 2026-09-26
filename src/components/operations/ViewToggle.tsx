import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

export interface ViewToggleProps {
  view: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-surface-200 p-0.5 bg-surface-100/60" role="group" aria-label="View switch">
      <button
        type="button"
        onClick={() => onViewChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'list'
            ? 'bg-white text-surface-900 shadow-sm font-semibold'
            : 'text-slate-600 hover:text-surface-900 hover:bg-white/50'
        }`}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('kanban')}
        aria-label="Kanban view"
        aria-pressed={view === 'kanban'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'kanban'
            ? 'bg-white text-surface-900 shadow-sm font-semibold'
            : 'text-slate-600 hover:text-surface-900 hover:bg-white/50'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Kanban</span>
      </button>
    </div>
  );
};
