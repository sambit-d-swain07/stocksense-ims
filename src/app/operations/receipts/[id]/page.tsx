'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Printer, XCircle, Save, ChevronRight, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Receipt, ProductOption } from '@/types/operations';
import {
  getReceipt,
  getNextReceiptReference,
  saveReceipt,
  validateReceipt,
  cancelReceipt,
  getProducts,
  getSuppliers,
} from '@/lib/operations-api';
import { StatusStepper } from '@/components/operations/StatusStepper';
import { ProductLinesEditor } from '@/components/operations/ProductLinesEditor';
import { FormField } from '@/components/operations/FormField';
import { ConfirmDialog } from '@/components/operations/ConfirmDialog';
import { LoadingState, EmptyState } from '@/components/operations/States';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const routeId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const isNewMode = routeId === 'new';

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const [errors, setErrors] = useState<{ from?: string; lines?: string }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [prodsData, suppsData] = await Promise.all([getProducts(), getSuppliers()]);
        if (!isMounted) return;

        setProducts(prodsData);
        setSuppliers(suppsData);

        if (isNewMode) {
          const nextRef = await getNextReceiptReference();
          if (!isMounted) return;

          const defaultUser = user?.name || user?.email || 'Unassigned';
          setReceipt({
            id: '',
            reference: nextRef,
            from: '',
            to: 'Main Warehouse',
            contact: '',
            scheduleDate: new Date().toISOString().split('T')[0],
            responsible: defaultUser,
            status: 'draft',
            lines: prodsData.length > 0 ? [{ id: `line-${Date.now()}`, productId: prodsData[0].id, quantity: 1 }] : [],
          });
        } else {
          const fetched = await getReceipt(routeId);
          if (!isMounted) return;

          if (!fetched) {
            setNotFound(true);
          } else {
            setReceipt(fetched);
          }
        }
      } catch (err) {
        console.error('Error loading receipt data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [routeId, isNewMode, user]);

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState message="Loading receipt details..." />
      </AppShell>
    );
  }

  if (notFound || !receipt) {
    return (
      <AppShell>
        <div className="py-12">
          <EmptyState
            title="Receipt not found"
            description={`The receipt with reference or ID "${routeId}" could not be located.`}
            actionText="Back to receipts"
            onAction={() => router.push('/operations/receipts')}
          />
        </div>
      </AppShell>
    );
  }

  const isReadOnly = receipt.status === 'done' || receipt.status === 'canceled';
  const steps = ['Draft', 'Ready', 'Done'];

  const validateForm = (): boolean => {
    const newErrors: { from?: string; lines?: string } = {};

    if (!receipt.from.trim()) {
      newErrors.from = 'Receive From is required';
    }

    if (receipt.lines.length === 0) {
      newErrors.lines = 'At least 1 product line is required';
    } else {
      const hasInvalidLine = receipt.lines.some((l) => !l.productId || l.quantity <= 0);
      if (hasInvalidLine) {
        newErrors.lines = 'Every row must have a selected product and quantity > 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (targetStatus?: Receipt['status']): Promise<Receipt | null> => {
    if (!validateForm()) {
      setToast({ message: 'Please fix the highlighted fields', type: 'error' });
      return null;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Receipt> & { id?: string } = {
        ...receipt,
        status: targetStatus || receipt.status,
        contact: receipt.from, // default contact to supplier
      };

      const saved = await saveReceipt(payload);
      setReceipt(saved);

      if (!receipt.id) {
        // First save of a new receipt -> update URL without remounting page
        window.history.replaceState(null, '', `/operations/receipts/${saved.id}`);
      }

      let toastMsg = `${saved.reference} saved`;
      if (targetStatus === 'ready') {
        toastMsg = `${saved.reference} marked as ready`;
      } else if (targetStatus === 'done') {
        toastMsg = `${saved.reference} validated`;
      }

      setToast({ message: toastMsg, type: 'success' });
      return saved;
    } catch (err: any) {
      setToast({ message: err?.message || 'Failed to save receipt', type: 'error' });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkReady = async () => {
    await handleSave('ready');
  };

  const handleValidate = async () => {
    if (!validateForm()) {
      setToast({ message: 'Please fix the highlighted fields', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await handleSave();
      if (!saved) return;

      const validated = await validateReceipt(saved.id);
      setReceipt(validated);
      setToast({ message: `${validated.reference} validated`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err?.message || 'Failed to validate receipt', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    if (!receipt.id) {
      // Unsaved new receipt
      router.push('/operations/receipts');
      return;
    }

    if (isReadOnly) {
      router.push('/operations/receipts');
      return;
    }

    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    setShowCancelDialog(false);
    try {
      if (receipt.id) {
        await cancelReceipt(receipt.id);
      }
      router.push('/operations/receipts');
    } catch (err) {
      console.error(err);
      router.push('/operations/receipts');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalLines = receipt.lines.length;
  const totalUnits = receipt.lines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
  const isAutoFilledUser = !receipt.id && receipt.responsible === (user?.name || user?.email);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Print hiding style injection */}
        <style jsx global>{`
          @media print {
            nav,
            footer,
            [data-print-hide] {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
            .print-card {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          }
        `}</style>

        {/* Toast notifications */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}

        {/* Cancel Dialog */}
        <ConfirmDialog
          isOpen={showCancelDialog}
          title={`Cancel ${receipt.reference}?`}
          message="Are you sure you want to cancel this receipt? This action cannot be undone."
          confirmLabel="Yes, Cancel Receipt"
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowCancelDialog(false)}
        />

        {/* 1. Breadcrumb */}
        <div data-print-hide className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/operations/receipts" className="hover:text-brand-600 transition-colors">
            Receipts
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-surface-900 font-semibold">
            {receipt.reference || 'New'}
          </span>
        </div>

        {/* 2. Action Bar + Stepper Header */}
        <div
          data-print-hide
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-surface-200/80 rounded-xl shadow-sm"
        >
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isReadOnly && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleValidate}
                  isLoading={isSaving}
                  className="gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validate</span>
                </Button>

                {receipt.status === 'draft' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleMarkReady}
                    isLoading={isSaving}
                  >
                    Mark as Ready
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => handleSave()}
                  isLoading={isSaving}
                  className="gap-1.5"
                >
                  <Save className="w-4 h-4 text-slate-600" />
                  <span>Save</span>
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </Button>

            {!isReadOnly && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleCancelClick}
                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            )}
          </div>

          {/* Stepper */}
          <div className="w-full md:w-72">
            <StatusStepper steps={steps} currentStatus={receipt.status} />
          </div>
        </div>

        {/* 3. Form Card */}
        <div className="print-card bg-white border border-surface-200/80 rounded-xl shadow-sm p-6 space-y-6">
          {/* Card Header */}
          <div className="pb-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                RECEIPT
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-surface-900 mt-0.5">
                {receipt.reference || 'WH/IN/000X'}
              </h1>
            </div>

            <div className="text-right text-xs text-slate-500 font-medium">
              <span>From: <strong className="text-surface-900">{receipt.from || 'Supplier'}</strong></span>
              <span className="mx-1.5">→</span>
              <span>To: <strong className="text-surface-900">{receipt.to || 'Main Warehouse'}</strong></span>
            </div>
          </div>

          {/* 3-Column Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Receive From */}
            <FormField label="Receive From" required error={errors.from}>
              {isReadOnly ? (
                <div className="text-sm font-semibold text-surface-900 py-2">
                  {receipt.from || '—'}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    list="suppliers-datalist"
                    value={receipt.from}
                    onChange={(e) => {
                      setReceipt({ ...receipt, from: e.target.value, contact: e.target.value });
                      if (errors.from) setErrors((prev) => ({ ...prev, from: undefined }));
                    }}
                    placeholder="e.g. ABC Suppliers Ltd"
                    className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.from
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-surface-200 focus:ring-brand-500'
                    }`}
                  />
                  <datalist id="suppliers-datalist">
                    {suppliers.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              )}
            </FormField>

            {/* Schedule Date */}
            <FormField label="Schedule Date" required>
              {isReadOnly ? (
                <div className="text-sm font-medium text-surface-900 py-2">
                  {receipt.scheduleDate || '—'}
                </div>
              ) : (
                <input
                  type="date"
                  value={receipt.scheduleDate}
                  onChange={(e) => setReceipt({ ...receipt, scheduleDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900"
                />
              )}
            </FormField>

            {/* Responsible */}
            <FormField
              label="Responsible"
              helperText={isAutoFilledUser ? 'Filled from your account' : undefined}
            >
              {isReadOnly ? (
                <div className="text-sm font-medium text-surface-900 py-2">
                  {receipt.responsible || 'Unassigned'}
                </div>
              ) : (
                <input
                  type="text"
                  value={receipt.responsible}
                  onChange={(e) => setReceipt({ ...receipt, responsible: e.target.value })}
                  placeholder="Unassigned"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900"
                />
              )}
            </FormField>
          </div>

          {/* 4. Products Section */}
          <div className="space-y-4 pt-6 border-t border-surface-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Products
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {totalLines} {totalLines === 1 ? 'line' : 'lines'} · {totalUnits} {totalUnits === 1 ? 'unit' : 'units'}
              </span>
            </div>

            {errors.lines && (
              <p className="text-xs text-red-600 font-semibold">{errors.lines}</p>
            )}

            <ProductLinesEditor
              lines={receipt.lines}
              products={products}
              readOnly={isReadOnly}
              onChange={(newLines) => {
                setReceipt({ ...receipt, lines: newLines });
                if (errors.lines) setErrors((prev) => ({ ...prev, lines: undefined }));
              }}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
