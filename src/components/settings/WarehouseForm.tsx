import React, { useState, useEffect } from 'react';
import { Warehouse } from '@/types/operations';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/operations/FormField';

export interface WarehouseFormProps {
  initialData?: Warehouse | null;
  onSave: (data: Partial<Warehouse> & { id?: string }) => Promise<boolean>;
  onReset: () => void;
  isSaving: boolean;
}

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
  initialData,
  onSave,
  onReset,
  isSaving,
}) => {
  const [name, setName] = useState<string>('');
  const [shortCode, setShortCode] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; shortCode?: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setShortCode(initialData.shortCode || '');
      setAddress(initialData.address || '');
    } else {
      setName('');
      setShortCode('');
      setAddress('');
    }
    setErrors({});
  }, [initialData]);

  const validate = (): boolean => {
    const errs: { name?: string; shortCode?: string } = {};

    if (!name.trim()) {
      errs.name = 'Warehouse name is required';
    }

    const cleanedCode = shortCode.trim().toUpperCase();
    if (!cleanedCode) {
      errs.shortCode = 'Short code is required';
    } else if (cleanedCode.length < 2 || cleanedCode.length > 5) {
      errs.shortCode = 'Must be 2 to 5 characters';
    } else if (!/^[A-Z0-9]+$/.test(cleanedCode)) {
      errs.shortCode = 'Letters and numbers only';
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
      address: address.trim() || null,
    });

    if (success && !initialData) {
      setName('');
      setShortCode('');
      setAddress('');
      setErrors({});
    }
  };

  return (
    <Card
      title={initialData ? 'Edit Warehouse' : 'New Warehouse'}
      subtitle={initialData ? `Editing ${initialData.shortCode}` : 'Add a new warehouse facility'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Warehouse Name" required error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Main Warehouse"
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-surface-200 focus:ring-brand-500'
            }`}
          />
        </FormField>

        <FormField
          label="Short Code"
          required
          error={errors.shortCode}
          helperText="2–5 uppercase characters (e.g. WH, WH2)"
        >
          <input
            type="text"
            maxLength={5}
            value={shortCode}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              setShortCode(val);
              if (errors.shortCode) setErrors((prev) => ({ ...prev, shortCode: undefined }));
            }}
            placeholder="e.g. WH"
            className={`w-full px-3 py-2 text-sm font-mono uppercase bg-white border rounded-lg focus:outline-none focus:ring-2 ${
              errors.shortCode
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-surface-200 focus:ring-brand-500'
            }`}
          />
        </FormField>

        <FormField label="Address">
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, city, area..."
            className="w-full px-3 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setName('');
              setShortCode('');
              setAddress('');
              setErrors({});
              onReset();
            }}
          >
            {initialData ? 'Cancel' : 'Reset'}
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            {initialData ? 'Update Warehouse' : 'Save Warehouse'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
