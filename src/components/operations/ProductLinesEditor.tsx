import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { OperationLine, ProductOption } from '@/types/operations';
import { Button } from '@/components/ui/Button';

export interface ProductLinesEditorProps {
  lines: OperationLine[];
  onChange: (lines: OperationLine[]) => void;
  products: ProductOption[];
  readOnly?: boolean;
  errors?: Record<string, string>;
  stock?: Record<string, number>;
}

export const ProductLinesEditor: React.FC<ProductLinesEditorProps> = ({
  lines,
  onChange,
  products,
  readOnly = false,
  errors = {},
}) => {
  const selectedProductIds = lines.map((l) => l.productId).filter(Boolean);

  const handleAddLine = () => {
    // Pick first product not yet selected
    const unselected = products.find((p) => !selectedProductIds.includes(p.id)) || products[0];
    const newLine: OperationLine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: unselected ? unselected.id : '',
      quantity: 1,
    };
    onChange([...lines, newLine]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    const updated = [...lines];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], productId: newProductId };
    onChange(updated);
  };

  const handleQuantityChange = (index: number, newQtyStr: string) => {
    const qty = parseInt(newQtyStr, 10);
    const updated = [...lines];
    updated[index] = { ...updated[index], quantity: isNaN(qty) ? 0 : qty };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-inner border border-surface-200 bg-surface-50/50 p-1">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-surface-100/70 border-b border-surface-200 text-[11px] font-bold text-surface-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-1/2 rounded-l-lg">Product</th>
              <th className="px-4 py-3 w-1/3 text-right">Quantity</th>
              {!readOnly && <th className="px-4 py-3 w-16 text-center rounded-r-lg">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200/60 text-sm">
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 2 : 3}
                  className="px-4 py-6 text-center text-xs text-surface-400"
                >
                  No product lines added yet.
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => {
                const selectedProd = products.find((p) => p.id === line.productId);
                const lineError = errors[`line_${idx}`] || errors[`line_${line.id}`];

                return (
                  <tr key={line.id || idx} className="hover:bg-white/60 transition-colors">
                    {/* Product Selection */}
                    <td className="px-4 py-3 align-top">
                      {readOnly ? (
                        <div>
                          <span className="font-semibold text-ink">
                            {selectedProd ? (
                              <>
                                {selectedProd.name} · <span className="font-mono text-surface-500">{selectedProd.sku}</span>
                              </>
                            ) : (
                              line.productId
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <select
                            value={line.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                              lineError
                                ? 'border-coral focus:ring-coral/20'
                                : 'border-surface-200 focus:ring-brand-600/20 focus:border-brand-600'
                            }`}
                          >
                            <option value="">Select a product...</option>
                            {products.map((p) => {
                              const isSelectedElsewhere =
                                p.id !== line.productId && selectedProductIds.includes(p.id);
                              return (
                                <option key={p.id} value={p.id} disabled={isSelectedElsewhere}>
                                  {p.name} · {p.sku} {isSelectedElsewhere ? ' (Selected)' : ''}
                                </option>
                              );
                            })}
                          </select>
                          {lineError && (
                            <p className="text-xs text-coral-text font-medium">{lineError}</p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-3 align-top text-right">
                      {readOnly ? (
                        <div className="font-mono tabular font-semibold text-ink">
                          {line.quantity} <span className="text-xs text-surface-500 font-normal">{selectedProd?.unit || 'Units'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity || ''}
                            onChange={(e) => handleQuantityChange(idx, e.target.value)}
                            className="w-24 px-3 py-2 text-sm font-mono tabular text-right rounded-xl border border-surface-200 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                          />
                          <span className="text-xs text-surface-500 min-w-[32px] text-left">
                            {selectedProd?.unit || 'Units'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Remove Action */}
                    {!readOnly && (
                      <td className="px-4 py-3 align-top text-center">
                        <button
                          type="button"
                          disabled={lines.length <= 1}
                          onClick={() => handleRemoveLine(idx)}
                          className="p-2 text-surface-400 hover:text-coral-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-coral-tint/50"
                          aria-label="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddLine}
          className="gap-2 border-dashed text-brand-600 border-brand-300 hover:bg-brand-50 rounded-full px-4 font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Button>
      )}
    </div>
  );
};

