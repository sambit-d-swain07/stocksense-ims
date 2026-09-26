'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Search, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getWarehouses, saveWarehouse, deleteWarehouse, getLocations } from '@/lib/settings-api';
import { useAsyncData } from '@/hooks/useAsyncData';
import { Warehouse, Location } from '@/types/operations';
import { matchesSearch } from '@/lib/operations-utils';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { WarehouseForm } from '@/components/settings/WarehouseForm';
import { DataTable, Column } from '@/components/operations/DataTable';
import { LoadingState, EmptyState, ErrorState } from '@/components/operations/States';
import { ConfirmDialog } from '@/components/operations/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function WarehousesPage() {
  const { data: rawWarehouses, isLoading: loadingW, error: errorW, reload: reloadW } = useAsyncData(getWarehouses, []);
  const { data: rawLocations, reload: reloadL } = useAsyncData(getLocations, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const warehouses = rawWarehouses || [];
  const locations = rawLocations || [];

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => matchesSearch(searchQuery, w.name, w.shortCode, w.address));
  }, [warehouses, searchQuery]);

  const handleSave = async (data: Partial<Warehouse> & { id?: string }): Promise<boolean> => {
    setIsSaving(true);
    try {
      const saved = await saveWarehouse(data);
      await Promise.all([reloadW(), reloadL()]);
      setEditingWarehouse(null);
      setToast({
        message: `Warehouse ${saved.shortCode} saved`,
        type: 'success',
      });
      return true;
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to save warehouse',
        type: 'error',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    // Check location count first
    const hasLocations = locations.some((loc) => loc.warehouseId === deletingId);
    if (hasLocations) {
      setDeletingId(null);
      setToast({
        message: 'Remove its locations first',
        type: 'error',
      });
      return;
    }

    const targetId = deletingId;
    setDeletingId(null);
    try {
      await deleteWarehouse(targetId);
      await Promise.all([reloadW(), reloadL()]);
      setToast({ message: 'Warehouse deleted', type: 'success' });
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to delete warehouse',
        type: 'error',
      });
    }
  };

  const columns: Column<Warehouse>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (w) => <span className="font-semibold text-surface-900">{w.name}</span>,
    },
    {
      key: 'shortCode',
      header: 'Short Code',
      render: (w) => (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-surface-100 text-slate-700 border border-surface-200">
          {w.shortCode}
        </span>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (w) => <span className="text-slate-600 text-xs">{w.address || '—'}</span>,
    },
    {
      key: 'locations',
      header: 'Locations',
      render: (w) => {
        const count = locations.filter((loc) => loc.warehouseId === w.id).length;
        return (
          <span className="text-xs font-medium text-slate-600">
            {count} {count === 1 ? 'location' : 'locations'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (w) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingWarehouse(w);
              // Scroll form into view on mobile
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label={`Edit ${w.name}`}
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeletingId(w.id)}
            aria-label={`Delete ${w.name}`}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <ConfirmDialog
          isOpen={!!deletingId}
          title="Delete Warehouse"
          message="Are you sure you want to delete this warehouse? This action cannot be undone."
          confirmLabel="Yes, Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingId(null)}
        />

        <SettingsNav />

        {loadingW ? (
          <LoadingState message="Loading warehouses..." />
        ) : errorW ? (
          <ErrorState message={errorW} onRetry={reloadW} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Table List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search warehouses by name, short code, or address..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900 placeholder:text-slate-400"
                  aria-label="Search warehouses"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filteredWarehouses.length === 0 ? (
                <EmptyState
                  title={searchQuery ? 'No warehouses match your search' : 'No warehouses found'}
                  description={
                    searchQuery
                      ? `No warehouses matching "${searchQuery}".`
                      : 'Use the form on the right to create your first warehouse.'
                  }
                  actionText={searchQuery ? 'Clear search' : undefined}
                  onAction={searchQuery ? () => setSearchQuery('') : undefined}
                />
              ) : (
                <DataTable columns={columns} data={filteredWarehouses} />
              )}
            </div>

            {/* Right 1 Column: Form Card */}
            <div className="lg:col-span-1">
              <WarehouseForm
                initialData={editingWarehouse}
                onSave={handleSave}
                onReset={() => setEditingWarehouse(null)}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
