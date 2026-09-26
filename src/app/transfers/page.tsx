'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function TransfersPage() {
  const { token } = useAuth();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [responsible, setResponsible] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [transRes, prodRes, locRes] = await Promise.all([
        fetch('/api/transfers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/locations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const transJson = await transRes.json();
      const prodJson = await prodRes.json();
      const locJson = await locRes.json();

      if (transRes.ok) setTransfers(transJson.data || []);
      if (prodRes.ok) setProducts(prodJson.data || []);
      if (locRes.ok) setLocations(locJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch internal transfers');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!productId || !fromLocationId || !toLocationId) {
      setModalError('Product, Source location, and Destination location are required');
      return;
    }

    if (fromLocationId === toLocationId) {
      setModalError('Source and Destination locations must be different');
      return;
    }

    if (quantity <= 0) {
      setModalError('Quantity must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          fromLocationId,
          toLocationId,
          quantity: Number(quantity),
          responsible: responsible.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setModalError(json.error?.message || 'Failed to process internal transfer');
        return;
      }

      setIsModalOpen(false);
      setProductId('');
      setFromLocationId('');
      setToLocationId('');
      setQuantity(1);
      setResponsible('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      setIsSubmitting(false);
      setModalError(err.message || 'Network error');
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.reference.toLowerCase().includes(search.toLowerCase()) ||
      (t.productName && t.productName.toLowerCase().includes(search.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Internal Stock Transfers
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Move stock between warehouses &amp; racks. Total company stock remains invariant.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center space-x-1.5"
          >
            <span>New Internal Transfer</span>
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
            placeholder="Search transfer reference, product, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-xs text-zinc-500">Loading internal stock transfers...</p>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 text-xs">
            No internal transfer records found.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-50 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Source Location</th>
                    <th className="py-3 px-4">Destination Location</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTransfers.map((tr) => (
                    <tr key={tr.id || tr.reference} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{tr.reference}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-900">{tr.productName}</td>
                      <td className="py-3 px-4 text-zinc-700 font-medium">
                        {tr.fromLocationName || 'Multiple'}
                      </td>
                      <td className="py-3 px-4 text-zinc-700 font-medium">
                        {tr.toLocationName || 'Multiple'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                        {tr.quantity}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500">
                        {new Date(tr.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New Internal Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">New Internal Transfer</h3>
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

            <form onSubmit={handleCreateTransfer} className="space-y-3.5 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1 uppercase">From (Source) *</label>
                  <select
                    value={fromLocationId}
                    onChange={(e) => setFromLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                    required
                  >
                    <option value="">Source Location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.warehouseName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1 uppercase">To (Destination) *</label>
                  <select
                    value={toLocationId}
                    onChange={(e) => setToLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                    required
                  >
                    <option value="">Destination...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.warehouseName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Transfer Quantity *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Responsible Staff Member</label>
                <input
                  type="text"
                  placeholder="e.g. John Staff"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Notes / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Moving stock to rack B"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  {isSubmitting ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
