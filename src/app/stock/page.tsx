'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getStockItems, updateStockOnHand } from '@/lib/operations-api';
import { useAsyncData } from '@/hooks/useAsyncData';
import { StockItem } from '@/types/operations';
import { matchesSearch } from '@/lib/operations-utils';
import { OperationsToolbar } from '@/components/operations/OperationsToolbar';
import { StockRow } from '@/components/operations/StockRow';
import { LoadingState, EmptyState, ErrorState } from '@/components/operations/States';
import { Toast } from '@/components/ui/Toast';

export default function StockListPage() {
  const { data: stockItems, isLoading, error, reload } = useAsyncData(getStockItems, []);
  const [items, setItems] = useState<StockItem[] | null>(null);

  // Sync loaded items into local state for immediate optimistic update
  React.useEffect(() => {
    if (stockItems) {
      setItems(stockItems);
    }
  }, [stockItems]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) =>
      matchesSearch(searchQuery, item.productName, item.sku)
    );
  }, [items, searchQuery]);

  const totalOnHand = useMemo(() => {
    return filteredItems.reduce((acc, item) => acc + item.onHand, 0);
  }, [filteredItems]);

  const handleSaveOnHand = async (id: string, newOnHand: number): Promise<boolean> => {
    setSavingId(id);
    try {
      const updated = await updateStockOnHand(id, newOnHand);

      // Update local state
      setItems((prev) =>
        prev ? prev.map((item) => (item.id === id ? updated : item)) : null
      );

      setEditingId(null);
      setRecentlyUpdatedId(id);
      setToast({
        message: `${updated.productName} stock updated to ${updated.onHand}`,
        type: 'success',
      });

      // Clear highlight after 1.5s
      setTimeout(() => {
        setRecentlyUpdatedId((curr) => (curr === id ? null : curr));
      }, 1500);

      return true;
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to update stock quantity',
        type: 'error',
      });
      return false;
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <OperationsToolbar
          title="Stock"
          description="On-hand quantity per product. Update counts directly from here."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalRecords={filteredItems.length}
        />

        {isLoading ? (
          <LoadingState message="Loading stock inventory..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No products match your search' : 'No stock items found'}
            description={
              searchQuery
                ? `No stock items found matching "${searchQuery}".`
                : 'There are no stock records available.'
            }
            actionText={searchQuery ? 'Clear search' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <div className="space-y-3">
            <div className="w-full bg-white border border-surface-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-surface-50 border-b border-surface-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3.5 text-left">Product</th>
                      <th className="px-6 py-3.5 text-right">Per Unit Cost</th>
                      <th className="px-6 py-3.5 text-right">On Hand</th>
                      <th className="px-6 py-3.5 text-right">Free to Use</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {filteredItems.map((item) => (
                      <StockRow
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        onStartEdit={() => setEditingId(item.id)}
                        onSave={handleSaveOnHand}
                        onCancel={() => setEditingId(null)}
                        isSaving={savingId === item.id}
                        recentlyUpdated={recentlyUpdatedId === item.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer summary line */}
            <div className="px-2 text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>
                {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'} · total on hand{' '}
                <span className="font-semibold text-slate-700">{totalOnHand}</span> units
              </span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
