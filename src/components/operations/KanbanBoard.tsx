import React from 'react';

export interface KanbanColumn {
  key: string;
  label: string;
  dotColor?: string;
}

export interface KanbanBoardProps<T extends { id: string }> {
  columns: KanbanColumn[];
  items: T[];
  groupOf: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onCardClick?: (item: T) => void;
}

export function KanbanBoard<T extends { id: string }>({
  columns,
  items,
  groupOf,
  renderCard,
  onCardClick,
}: KanbanBoardProps<T>) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[800px] md:min-w-0 md:grid md:grid-cols-4 items-start">
        {columns.map((col) => {
          const colItems = items.filter((item) => groupOf(item).toLowerCase() === col.key.toLowerCase());

          return (
            <div
              key={col.key}
              className="flex-1 bg-surface-100/80 border border-surface-200 rounded-inner p-4 flex flex-col min-h-[360px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-200/80 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      col.dotColor || 'bg-surface-400'
                    }`}
                  />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-surface-600">
                    {col.label}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-xs font-bold text-surface-600 border border-surface-200 shadow-sm">
                  {colItems.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-0.5">
                {colItems.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border border-dashed border-surface-200 rounded-xl text-xs text-surface-400 font-medium bg-white/40">
                    No items
                  </div>
                ) : (
                  colItems.map((item) => {
                    const isClickable = !!onCardClick;

                    return (
                      <div
                        key={item.id}
                        tabIndex={isClickable ? 0 : undefined}
                        onClick={() => onCardClick && onCardClick(item)}
                        onKeyDown={(e) => {
                          if (isClickable && e.key === 'Enter') {
                            e.preventDefault();
                            onCardClick(item);
                          }
                        }}
                        className={`bg-white border border-surface-200 rounded-card p-4 shadow-card transition-all ${
                          isClickable
                            ? 'cursor-pointer hover:shadow-pop hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20'
                            : ''
                        }`}
                      >
                        {renderCard(item)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

