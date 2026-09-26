import React from 'react';

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumn[];
  items: T[];
  groupOf: (item: T) => string;
  keyExtractor: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onCardClick?: (item: T) => void;
}

export function KanbanBoard<T>({
  columns,
  items,
  groupOf,
  keyExtractor,
  renderCard,
  onCardClick,
}: KanbanBoardProps<T>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {columns.map((col) => {
        const colItems = items.filter((item) => groupOf(item).toLowerCase() === col.id.toLowerCase());

        return (
          <div
            key={col.id}
            className="bg-surface-100/70 border border-surface-200/80 rounded-xl p-3 flex flex-col min-h-[300px]"
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-200/60 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                {col.title}
              </h3>
              <span className="w-5 h-5 rounded-full bg-white text-xs font-semibold text-slate-600 flex items-center justify-center border border-surface-200">
                {colItems.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[650px] pr-0.5">
              {colItems.length === 0 ? (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-surface-200 rounded-lg text-xs text-slate-400">
                  No items
                </div>
              ) : (
                colItems.map((item) => {
                  const key = keyExtractor(item);
                  const isClickable = !!onCardClick;

                  return (
                    <div
                      key={key}
                      tabIndex={isClickable ? 0 : undefined}
                      onClick={() => onCardClick && onCardClick(item)}
                      onKeyDown={(e) => {
                        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onCardClick(item);
                        }
                      }}
                      className={`bg-white border border-surface-200/90 rounded-lg p-3.5 shadow-sm transition-all ${
                        isClickable
                          ? 'cursor-pointer hover:shadow-md hover:border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500'
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
  );
}
