import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { StockItem } from '@/types/operations';
import { Button } from '@/components/ui/Button';

export interface StockRowProps {
  item: StockItem;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (id: string, newOnHand: number) => Promise<boolean>;
  onCancel: () => void;
  isSaving: boolean;
  recentlyUpdated: boolean;
}

const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const StockRow: React.FC<StockRowProps> = ({
  item,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  isSaving,
  recentlyUpdated,
}) => {
  const [val, setVal] = useState<string>(String(item.onHand));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync val with item.onHand when editing starts or item changes
  useEffect(() => {
    if (isEditing) {
      setVal(String(item.onHand));
      setError(null);
      // Autofocus & select text
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isEditing, item.onHand]);

  const handleSaveSubmit = async () => {
    const num = parseInt(val, 10);

    if (isNaN(num) || num < 0) {
      setError("Must be a whole number ≥ 0");
      return;
    }

    if (num < item.reserved) {
      setError(`Can't be below reserved (${item.reserved})`);
      return;
    }

    setError(null);
    const success = await onSave(item.id, num);
    if (!success) {
      // Keep in edit mode on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const freeToUse = item.onHand - item.reserved;

  return (
    <tr
      className={`transition-colors text-sm ${
        recentlyUpdated
          ? 'bg-emerald-50 transition-colors duration-1000'
          : isEditing
          ? 'bg-brand-50/40'
          : 'hover:bg-surface-50'
      }`}
    >
      {/* Product */}
      <td className="px-6 py-4 align-top text-left">
        <div className="font-semibold text-surface-900">{item.productName}</div>
        <div className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</div>
      </td>

      {/* Per Unit Cost */}
      <td className="px-6 py-4 align-top text-right font-mono tabular-nums text-surface-900">
        {formatCurrencyINR(item.costPerUnit)}
      </td>

      {/* On Hand */}
      <td className="px-6 py-4 align-top text-right">
        {isEditing ? (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center justify-end gap-1.5">
              <input
                ref={inputRef}
                type="number"
                min="0"
                disabled={isSaving}
                value={val}
                onChange={(e) => {
                  setVal(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                className={`w-24 px-2.5 py-1 text-sm font-mono text-right rounded-md border focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-200 focus:border-red-500'
                    : 'border-surface-300 bg-white text-surface-900 focus:ring-brand-500 focus:border-brand-500'
                }`}
              />
              <span className="text-xs text-slate-500">{item.unit}</span>
            </div>
            {error && (
              <p className="text-xs text-red-600 font-medium text-right mt-0.5">{error}</p>
            )}
          </div>
        ) : (
          <div className="font-mono tabular-nums text-surface-900">
            {item.onHand} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
          </div>
        )}
      </td>

      {/* Free to Use */}
      <td className="px-6 py-4 align-top text-right">
        <div
          className={`font-mono tabular-nums ${
            freeToUse <= 0 ? 'text-amber-700 font-semibold' : 'text-surface-900'
          }`}
        >
          {freeToUse} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 align-top text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveSubmit}
              aria-label="Save quantity"
            >
              {!isSaving && <Check className="w-3.5 h-3.5" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onClick={onCancel}
              aria-label="Cancel editing"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStartEdit}
            className="gap-1 text-xs"
            aria-label={`Update stock for ${item.productName}`}
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>Update</span>
          </Button>
        )}
      </td>
    </tr>
  );
};
