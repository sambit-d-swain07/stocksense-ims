'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function ReceiptsPage() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/receipts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setReceipts(json.data || []);
      else setError(json.error?.message || 'Failed to load receipts');
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleUpdateStatus = async (receiptId: string, newStatus: 'READY' | 'DONE') => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
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
      setSelectedReceipt(null);
      fetchReceipts();
    } catch (e: any) {
      setActionLoading(false);
      setActionError(e.message || 'Network error');
    }
  };

  const filtered = receipts.filter((r) => {
    const matchesSearch =
      r.reference.toLowerCase().includes(search.toLowerCase()) ||
      (r.supplierName && r.supplierName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    if (status === 'DONE')
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'READY')
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  };

  return (
    <AppShell pageTitle="Receipts (WH/IN)">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Receipts (WH/IN)</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Incoming stock operations. Validate to increase inventory &amp; update ledger.
            </p>
          </div>
          <Link
            href="/operations/receipts/new"
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            + Create Receipt
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
            placeholder="Search by reference or supplier…"
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
              <option value="READY">READY</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-24 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-zinc-500">Loading receipts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center">
            <p className="text-sm text-zinc-500 mb-4">No receipts found.</p>
            <Link
              href="/operations/receipts/new"
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Create your first receipt
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Lines</th>
                    <th className="py-3 px-4 text-right">Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((rec) => (
                    <tr key={rec.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{rec.reference}</td>
                      <td className="py-3 px-4 text-zinc-700">{rec.supplierName || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge(rec.status)}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{rec.items?.length || 0}</td>
                      <td className="py-3 px-4 text-right text-zinc-500">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedReceipt(rec)}
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
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900">{selectedReceipt.reference}</h3>
                <p className="text-xs text-zinc-500">Supplier: {selectedReceipt.supplierName || 'Unspecified'}</p>
              </div>
              <button
                onClick={() => { setSelectedReceipt(null); setActionError(null); }}
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
            <div className="flex items-center justify-around p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
              {['DRAFT', 'READY', 'DONE'].map((s, i, arr) => (
                <React.Fragment key={s}>
                  <span className={`font-semibold ${selectedReceipt.status === s ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {i + 1}. {s}
                  </span>
                  {i < arr.length - 1 && <span className="text-zinc-300">→</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Line Items</h4>
              <div className="space-y-1.5">
                {selectedReceipt.items?.map((item: any) => (
                  <div key={item.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-zinc-900">{item.productName || item.product?.name}</span>
                      <span className="text-[11px] text-zinc-500 block font-mono">
                        Location: {item.locationName || item.location?.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">+{item.quantity} units</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
              <button
                onClick={() => { setSelectedReceipt(null); setActionError(null); }}
                className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <div className="flex gap-2">
                {selectedReceipt.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReceipt.id, 'READY')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating…' : 'Mark READY'}
                  </button>
                )}
                {(selectedReceipt.status === 'DRAFT' || selectedReceipt.status === 'READY') && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReceipt.id, 'DONE')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Validating…' : 'Validate & Mark DONE'}
                  </button>
                )}
                {selectedReceipt.status === 'DONE' && (
                  <span className="text-xs text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    ✓ Stock Updated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
