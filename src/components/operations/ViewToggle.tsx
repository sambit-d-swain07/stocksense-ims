import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

export interface ViewToggleProps {
  view: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div
      className="inline-flex rounded-full border border-surface-200 p-1 bg-surface-100/80"
      role="group"
      aria-label="View mode toggle"
    >
      <button
        type="button"
        onClick={() => onViewChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          view === 'list'
            ? 'bg-white text-ink shadow-sm font-semibold'
            : 'text-surface-600 hover:text-ink'
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
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          view === 'kanban'
            ? 'bg-white text-ink shadow-sm font-semibold'
            : 'text-surface-600 hover:text-ink'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Kanban</span>
      </button>
    </div>
  );
};

