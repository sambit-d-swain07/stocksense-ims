'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function LedgerPage() {
  const { token } = useAuth();
  const [moves, setMoves] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (typeFilter) queryParams.set('type', typeFilter);
      if (selectedProduct) queryParams.set('productId', selectedProduct);

      const [ledgerRes, prodRes] = await Promise.all([
        fetch(`/api/ledger?${queryParams.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const ledgerJson = await ledgerRes.json();
      const prodJson = await prodRes.json();

      if (ledgerRes.ok) setMoves(ledgerJson.data || []);
      if (prodRes.ok) setProducts(prodJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ledger history');
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter, selectedProduct]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMoves = moves.filter((m) => {
    const matchesSearch =
      m.reference.toLowerCase().includes(search.toLowerCase()) ||
      (m.productName && m.productName.toLowerCase().includes(search.toLowerCase())) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Stock Move History / Audit Ledger
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Complete historical record of all IN and OUT stock movements across all operations.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <span>Refresh Ledger</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search reference, product, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500 uppercase font-semibold">Move Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
              >
                <option value="">All Types (IN &amp; OUT)</option>
                <option value="IN">IN (Incoming)</option>
                <option value="OUT">OUT (Outgoing)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500 uppercase font-semibold">Product:</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-xs text-zinc-500">Fetching audit ledger logs...</p>
          </div>
        ) : filteredMoves.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 text-xs">
            No movement ledger entries found matching criteria.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-50 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Move Type</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Target Location</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4">Notes / Operation Description</th>
                    <th className="py-3 px-4 text-right">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredMoves.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                            m.type === 'IN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{m.reference}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-900">
                        {m.productName}
                        <span className="text-[10px] font-mono text-zinc-500 block">[{m.productSku}]</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        {m.locationName} <span className="text-[11px] text-zinc-500">({m.warehouseName})</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                        {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 italic">{m.notes || 'N/A'}</td>
                      <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
