'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function DeliveryDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [delivery, setDelivery] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDelivery = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setDelivery(json.data);
      else setError(json.error?.message || 'Delivery not found');
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  const handleUpdateStatus = async (newStatus: 'READY' | 'DONE') => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error?.message || 'Failed to update');
        return;
      }
      setDelivery(json.data);
      if (newStatus === 'DONE') setActionSuccess('Delivery validated! Stock has been deducted and ledger updated.');
      else setActionSuccess(`Status updated to ${newStatus}`);
    } catch (e: any) {
      setActionError(e.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'DONE') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'READY') return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (status === 'WAITING') return 'bg-rose-50 text-rose-700 border border-rose-200';
    return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  };

  return (
    <AppShell pageTitle={delivery ? `Delivery ${delivery.reference}` : 'Delivery Detail'}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {delivery ? delivery.reference : 'Delivery Detail'}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">View, track and validate this outgoing delivery.</p>
          </div>
          <button
            onClick={() => router.push('/operations/deliveries')}
            className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{error}</div>
        ) : delivery ? (
          <div className="space-y-5">
            {/* Meta card */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 uppercase font-semibold">Reference</span>
                <p className="font-mono font-bold text-zinc-900 mt-0.5">{delivery.reference}</p>
              </div>
              <div>
                <span className="text-zinc-500 uppercase font-semibold">Status</span>
                <p className="mt-0.5">
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${statusBadge(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-zinc-500 uppercase font-semibold">Customer</span>
                <p className="text-zinc-900 mt-0.5">{delivery.customerName || '—'}</p>
              </div>
              <div>
                <span className="text-zinc-500 uppercase font-semibold">Created</span>
                <p className="text-zinc-900 mt-0.5">{new Date(delivery.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Workflow bar */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-3">Workflow Progress</p>
              <div className="flex items-center gap-1.5">
                {['DRAFT', 'WAITING', 'READY', 'DONE'].map((s, i, arr) => (
                  <React.Fragment key={s}>
                    <div
                      className={`flex-1 text-center py-2 rounded-lg text-[10px] font-semibold border ${
                        delivery.status === s
                          ? s === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s === 'WAITING' ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                      }`}
                    >
                      {s}
                    </div>
                    {i < arr.length - 1 && <span className="text-zinc-300 text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Line items with stock check */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
                Line Items &amp; Stock Availability
              </h3>
              {delivery.items?.length === 0 ? (
                <p className="text-xs text-zinc-400">No items on this delivery.</p>
              ) : (
                <div className="space-y-2">
                  {delivery.items?.map((item: any) => {
                    const outOfStock = item.isOutOfStock || (item.availableStock < item.quantity);
                    return (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center p-3 rounded-lg border text-xs ${
                          outOfStock ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-900">
                              {item.productName || item.product?.name}
                            </span>
                            {outOfStock && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] uppercase">
                                OUT OF STOCK
                              </span>
                            )}
                          </div>
                          <span className="block text-zinc-500 font-mono mt-0.5">
                            From: {item.locationName || item.location?.name} | Available: {item.availableStock ?? 0}
                          </span>
                        </div>
                        <span className={`font-mono font-bold ${outOfStock ? 'text-rose-700' : 'text-zinc-900'}`}>
                          -{item.quantity} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Messages */}
            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
                ✓ {actionSuccess}
              </div>
            )}

            {/* Actions */}
            {delivery.status !== 'DONE' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-4 flex justify-end gap-3">
                {delivery.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus('READY')}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating…' : 'Check & Mark READY'}
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus('DONE')}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Validating…' : 'Validate & Deliver (DONE)'}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
