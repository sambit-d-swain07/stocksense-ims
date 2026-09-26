import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white border border-surface-200/80 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50/80 border-b border-surface-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className={`px-6 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-sm">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const key = keyExtractor(item);
                const isClickable = !!onRowClick;

                return (
                  <tr
                    key={key}
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={() => onRowClick && onRowClick(item)}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    className={`transition-colors ${
                      isClickable
                        ? 'cursor-pointer hover:bg-surface-50/80 focus:outline-none focus:bg-surface-50/90'
                        : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-6 py-4 text-surface-900 ${col.className || ''}`}>
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
