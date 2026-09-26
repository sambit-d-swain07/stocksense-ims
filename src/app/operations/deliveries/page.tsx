'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function DeliveriesPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/deliveries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setDeliveries(json.data || []);
      else setError(json.error?.message || 'Failed to load deliveries');
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const fetchDeliveryDetails = async (deliveryId: string) => {
    setDetailLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setSelectedDelivery(json.data);
      else setActionError(json.error?.message || 'Failed to load delivery details');
    } catch (e: any) {
      setActionError(e.message || 'Network error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: 'READY' | 'DONE') => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      setActionLoading(false);
      if (!res.ok) {
        setActionError(json.error?.message || 'Failed to update status');
        return;
      }
      // Refresh detail view
      fetchDeliveryDetails(deliveryId);
      fetchDeliveries();
    } catch (e: any) {
      setActionLoading(false);
      setActionError(e.message || 'Network error');
    }
  };

  const filtered = deliveries.filter((d) => {
    const matchesSearch =
      d.reference.toLowerCase().includes(search.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    if (status === 'DONE') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'READY') return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (status === 'WAITING') return 'bg-rose-50 text-rose-700 border border-rose-200';
    return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  };

  return (
    <AppShell pageTitle="Deliveries (WH/OUT)">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Deliveries (WH/OUT)</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Outgoing orders. Real-time stock check prevents negative inventory.
            </p>
          </div>
          <Link
            href="/operations/deliveries/new"
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            + Create Delivery
          </Link>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by reference or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500 font-semibold uppercase whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
            >
              <option value="">All</option>
              <option value="DRAFT">DRAFT</option>
              <option value="WAITING">WAITING</option>
              <option value="READY">READY</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-24 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-zinc-500">Loading deliveries…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center">
            <p className="text-sm text-zinc-500 mb-4">No delivery orders found.</p>
            <Link
              href="/operations/deliveries/new"
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Create your first delivery
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Lines</th>
                    <th className="py-3 px-4 text-right">Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((del) => (
                    <tr key={del.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{del.reference}</td>
                      <td className="py-3 px-4 text-zinc-700">{del.customerName || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge(del.status)}`}>
                          {del.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{del.items?.length || 0}</td>
                      <td className="py-3 px-4 text-right text-zinc-500">
                        {new Date(del.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => fetchDeliveryDetails(del.id)}
                          className="px-3 py-1 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          View / Validate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail & Validate Modal */}
      {(selectedDelivery || detailLoading) && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="py-12 text-center"><Spinner size="lg" /></div>
            ) : selectedDelivery ? (
              <>
                <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">{selectedDelivery.reference}</h3>
                    <p className="text-xs text-zinc-500">Customer: {selectedDelivery.customerName || 'Unspecified'}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedDelivery(null); setActionError(null); }}
                    className="text-zinc-400 hover:text-zinc-600 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                {actionError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                    {actionError}
                  </div>
                )}

                {/* Workflow bar */}
                <div className="flex items-center gap-2">
                  {['DRAFT', 'WAITING', 'READY', 'DONE'].map((s, i, arr) => (
                    <React.Fragment key={s}>
                      <div className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-semibold border ${
                        selectedDelivery.status === s
                          ? s === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s === 'WAITING' ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                      }`}>
                        {s}
                      </div>
                      {i < arr.length - 1 && <span className="text-zinc-300 text-xs">→</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Items with stock check */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                    Line Items & Stock Availability
                  </h4>
                  <div className="space-y-2">
                    {selectedDelivery.items?.map((item: any) => {
                      const outOfStock = item.isOutOfStock || (item.availableStock < item.quantity);
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
                            outOfStock
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-zinc-50 border-zinc-200'
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
                            <span className="text-[11px] text-zinc-500 block font-mono">
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
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                  <button
                    onClick={() => { setSelectedDelivery(null); setActionError(null); }}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <div className="flex gap-2">
                    {selectedDelivery.status === 'DRAFT' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedDelivery.id, 'READY')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? '…' : 'Check & Mark READY'}
                      </button>
                    )}
                    {selectedDelivery.status !== 'DONE' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedDelivery.id, 'DONE')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? 'Validating…' : 'Validate & Deliver'}
                      </button>
                    )}
                    {selectedDelivery.status === 'DONE' && (
                      <span className="text-xs text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                        ✓ Stock Deducted
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </AppShell>
  );
}
