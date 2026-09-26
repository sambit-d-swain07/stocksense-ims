'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Search, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getLocations, saveLocation, deleteLocation, getWarehouses } from '@/lib/settings-api';
import { useAsyncData } from '@/hooks/useAsyncData';
import { Location, Warehouse } from '@/types/operations';
import { matchesSearch } from '@/lib/operations-utils';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { LocationForm } from '@/components/settings/LocationForm';
import { DataTable, Column } from '@/components/operations/DataTable';
import { LoadingState, EmptyState, ErrorState } from '@/components/operations/States';
import { ConfirmDialog } from '@/components/operations/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function LocationsPage() {
  const { data: rawLocations, isLoading: loadingL, error: errorL, reload: reloadL } = useAsyncData(getLocations, []);
  const { data: rawWarehouses, isLoading: loadingW, error: errorW, reload: reloadW } = useAsyncData(getWarehouses, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('ALL');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const locations = rawLocations || [];
  const warehouses = rawWarehouses || [];

  const warehouseMap = useMemo(() => {
    const map = new Map<string, Warehouse>();
    warehouses.forEach((w) => map.set(w.id, w));
    return map;
  }, [warehouses]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesW = selectedWarehouseFilter === 'ALL' || loc.warehouseId === selectedWarehouseFilter;
      const matchesQ = matchesSearch(searchQuery, loc.name, loc.shortCode, loc.warehouseName);
      return matchesW && matchesQ;
    });
  }, [locations, selectedWarehouseFilter, searchQuery]);

  const handleSave = async (data: Partial<Location> & { id?: string }): Promise<boolean> => {
    setIsSaving(true);
    try {
      const saved = await saveLocation(data);
      await reloadL();
      setEditingLocation(null);
      setToast({
        message: `Location ${saved.name} saved successfully`,
        type: 'success',
      });
      return true;
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to save location',
        type: 'error',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    const targetId = deletingId;
    setDeletingId(null);
    try {
      await deleteLocation(targetId);
      await reloadL();
      setToast({ message: 'Location deleted', type: 'success' });
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to delete location',
        type: 'error',
      });
    }
  };

  const columns: Column<Location>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (loc) => <span className="font-semibold text-surface-900">{loc.name}</span>,
    },
    {
      key: 'shortCode',
      header: 'Short Code',
      render: (loc) => (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-surface-100 text-slate-700 border border-surface-200">
          {loc.shortCode}
        </span>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (loc) => (
        <span className="text-slate-600 text-xs font-medium">
          {loc.warehouseName || warehouseMap.get(loc.warehouseId)?.name || '—'}
        </span>
      ),
    },
    {
      key: 'fullPath',
      header: 'Full Path',
      render: (loc) => {
        const wh = warehouseMap.get(loc.warehouseId);
        const path = wh ? `${wh.shortCode}/${loc.shortCode}` : loc.shortCode;
        return <span className="font-mono text-xs font-semibold text-brand-700">{path}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (loc) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingLocation(loc);
              // Scroll form into view on mobile
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label={`Edit ${loc.name}`}
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeletingId(loc.id)}
            aria-label={`Delete ${loc.name}`}
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
          title="Delete Location"
          message="Are you sure you want to delete this location? This action cannot be undone."
          confirmLabel="Yes, Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingId(null)}
        />

        <SettingsNav />

        {loadingL || loadingW ? (
          <LoadingState message="Loading locations..." />
        ) : errorL || errorW ? (
          <ErrorState message={errorL || errorW || 'Failed to load settings data'} onRetry={() => { reloadL(); reloadW(); }} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Table List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locations by name, code..."
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900 placeholder:text-slate-400"
                    aria-label="Search locations"
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

                <div className="w-full sm:w-48">
                  <select
                    value={selectedWarehouseFilter}
                    onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                    aria-label="Filter by warehouse"
                  >
                    <option value="ALL">All Warehouses</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredLocations.length === 0 ? (
                <EmptyState
                  title={searchQuery || selectedWarehouseFilter !== 'ALL' ? 'No locations match your filter' : 'No locations found'}
                  description={
                    searchQuery || selectedWarehouseFilter !== 'ALL'
                      ? 'Try adjusting your warehouse filter or search terms.'
                      : 'Use the form on the right to create your first storage location.'
                  }
                  actionText={searchQuery || selectedWarehouseFilter !== 'ALL' ? 'Clear filters' : undefined}
                  onAction={() => {
                    setSearchQuery('');
                    setSelectedWarehouseFilter('ALL');
                  }}
                />
              ) : (
                <DataTable columns={columns} data={filteredLocations} />
              )}
            </div>

            {/* Right 1 Column: Form Card */}
            <div className="lg:col-span-1">
              <LocationForm
                initialData={editingLocation}
                warehouses={warehouses}
                onSave={handleSave}
                onReset={() => setEditingLocation(null)}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
