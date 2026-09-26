'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function AdjustmentsPage() {
  const { token } = useAuth();
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');

  // Create Adjustment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [countedQty, setCountedQty] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [adjRes, prodRes, locRes] = await Promise.all([
        fetch('/api/adjustments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/locations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const adjJson = await adjRes.json();
      const prodJson = await prodRes.json();
      const locJson = await locRes.json();

      if (adjRes.ok) setAdjustments(adjJson.data || []);
      if (prodRes.ok) setProducts(prodJson.data || []);
      if (locRes.ok) setLocations(locJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory adjustments');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!productId || !locationId) {
      setModalError('Product and Location are required');
      return;
    }

    if (countedQty < 0) {
      setModalError('Counted quantity cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          locationId,
          countedQty: Number(countedQty),
          reason: reason.trim() || undefined,
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setModalError(json.error?.message || 'Failed to record adjustment');
        return;
      }

      setIsModalOpen(false);
      setProductId('');
      setLocationId('');
      setCountedQty(0);
      setReason('');
      fetchData();
    } catch (err: any) {
      setIsSubmitting(false);
      setModalError(err.message || 'Network error');
    }
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    const matchesSearch =
      adj.reference.toLowerCase().includes(search.toLowerCase()) ||
      adj.productName.toLowerCase().includes(search.toLowerCase()) ||
      adj.locationName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Physical Inventory Adjustments
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Reconcile physical stock counts with system recorded balances. System auto-calculates difference and logs stock movement.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center space-x-1.5"
          >
            <span>Record Stock Count Adjustment</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <input
            type="text"
            placeholder="Search adjustment reference, product, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-xs text-zinc-500">Loading stock count adjustments...</p>
          </div>
        ) : filteredAdjustments.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 text-xs">
            No physical adjustment records found in database.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-50 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">System Qty</th>
                    <th className="py-3 px-4 text-right">Counted Qty</th>
                    <th className="py-3 px-4 text-right">Difference</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredAdjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{adj.reference}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-900">{adj.productName}</td>
                      <td className="py-3 px-4 text-zinc-700">{adj.locationName} ({adj.warehouseName})</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-500">{adj.systemQty}</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-900 font-bold">{adj.countedQty}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            adj.difference > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : adj.difference < 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 italic">{adj.reason || 'Annual Audit'}</td>
                      <td className="py-3 px-4 text-right text-zinc-500">
                        {new Date(adj.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Physical Stock Count Adjustment</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateAdjustment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Select Product *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  required
                >
                  <option value="">Select Product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.sku}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Select Location *</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  required
                >
                  <option value="">Select Location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.warehouseName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Physical Counted Quantity *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter actual physical count"
                  value={countedQty}
                  onChange={(e) => setCountedQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono text-right font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Reason for Discrepancy</label>
                <input
                  type="text"
                  placeholder="e.g. Damaged goods, Stock audit discrepancy"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  {isSubmitting ? 'Recording...' : 'Record Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
