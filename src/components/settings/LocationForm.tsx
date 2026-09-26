import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Location, Warehouse } from '@/types/operations';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/operations/FormField';

export interface LocationFormProps {
  initialData?: Location | null;
  warehouses: Warehouse[];
  onSave: (data: Partial<Location> & { id?: string }) => Promise<boolean>;
  onReset: () => void;
  isSaving: boolean;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  initialData,
  warehouses,
  onSave,
  onReset,
  isSaving,
}) => {
  const [name, setName] = useState<string>('');
  const [shortCode, setShortCode] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; shortCode?: string; warehouseId?: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setShortCode(initialData.shortCode || '');
      setWarehouseId(initialData.warehouseId || '');
    } else {
      setName('');
      setShortCode('');
      setWarehouseId(warehouses.length > 0 ? warehouses[0].id : '');
    }
    setErrors({});
  }, [initialData, warehouses]);

  if (warehouses.length === 0) {
    return (
      <Card title="New Location">
        <div className="text-center py-6 space-y-3">
          <p className="text-xs text-slate-500">
            No warehouses available. You must create a warehouse before adding locations.
          </p>
          <Link href="/settings/warehouses">
            <Button variant="outline" size="sm">
              Go to Warehouses
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId);
  const pathPreview = selectedWarehouse && shortCode.trim()
    ? `${selectedWarehouse.shortCode}/${shortCode.trim().toUpperCase()}`
    : selectedWarehouse
    ? `${selectedWarehouse.shortCode}/...`
    : '—';

  const validate = (): boolean => {
    const errs: { name?: string; shortCode?: string; warehouseId?: string } = {};

    if (!name.trim()) {
      errs.name = 'Location name is required';
    }

    const cleanedCode = shortCode.trim().toUpperCase();
    if (!cleanedCode) {
      errs.shortCode = 'Short code is required';
    }

    if (!warehouseId) {
      errs.warehouseId = 'Warehouse is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSave({
      id: initialData?.id,
      name: name.trim(),
      shortCode: shortCode.trim().toUpperCase(),
      warehouseId,
    });

    if (success && !initialData) {
      setName('');
      setShortCode('');
      setErrors({});
    }
  };

  return (
    <Card
      title={initialData ? 'Edit Location' : 'New Location'}
      subtitle={initialData ? `Editing ${initialData.shortCode}` : 'Add a location within a warehouse'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Warehouse" required error={errors.warehouseId}>
          <select
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              if (errors.warehouseId) setErrors((prev) => ({ ...prev, warehouseId: undefined }));
            }}
            className="w-full px-3 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="" disabled>Select a warehouse...</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.shortCode})
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Location Name" required error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Rack A"
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-surface-200 focus:ring-brand-500'
            }`}
          />
        </FormField>

        <FormField label="Short Code" required error={errors.shortCode}>
          <input
            type="text"
            value={shortCode}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setShortCode(val);
              if (errors.shortCode) setErrors((prev) => ({ ...prev, shortCode: undefined }));
            }}
            placeholder="e.g. RACK-A"
            className={`w-full px-3 py-2 text-sm font-mono uppercase bg-white border rounded-lg focus:outline-none focus:ring-2 ${
              errors.shortCode
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-surface-200 focus:ring-brand-500'
            }`}
          />
        </FormField>

        {/* Live path preview */}
        <div className="p-3 bg-surface-50 rounded-lg border border-surface-200/60 text-xs">
          <span className="text-slate-500 block font-medium uppercase tracking-wider mb-1">
            Full Location Path Preview
          </span>
          <span className="font-mono font-semibold text-brand-700">{pathPreview}</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setName('');
              setShortCode('');
              setErrors({});
              onReset();
            }}
          >
            {initialData ? 'Cancel' : 'Reset'}
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            {initialData ? 'Update Location' : 'Save Location'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
