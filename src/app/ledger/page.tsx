'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowDownLeft, ArrowUpRight, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Stock Move History / Audit Ledger
            </h1>
            <p className="text-sm text-surface-500 mt-1">
              Complete historical record of all IN and OUT stock movements across all operations.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="rounded-full px-4 gap-2 border-surface-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-coral-tint border border-coral/30 rounded-xl text-xs font-medium text-coral-text">
            {error}
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white border border-surface-200 rounded-card p-4 shadow-card flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search reference, product, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-xs bg-white border border-surface-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400"
            />
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-surface-500 uppercase font-bold">Move Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 text-ink font-medium"
              >
                <option value="">All Types (IN &amp; OUT)</option>
                <option value="IN">IN (Incoming)</option>
                <option value="OUT">OUT (Outgoing)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-surface-500 uppercase font-bold">Product:</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 text-ink font-medium"
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
            <p className="mt-3 text-sm text-surface-500 font-medium">Fetching audit ledger logs...</p>
          </div>
        ) : filteredMoves.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-card p-12 text-center text-surface-500 text-sm shadow-card">
            No movement ledger entries found matching criteria.
          </div>
        ) : (
          <div className="bg-white border border-surface-200 rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-50/80 border-b border-surface-200 text-[12px] font-semibold text-surface-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Direction</th>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Target Location</th>
                    <th className="px-6 py-4 text-right">Quantity</th>
                    <th className="px-6 py-4">Notes / Operation Description</th>
                    <th className="px-6 py-4 text-right">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 text-sm">
                  {filteredMoves.map((m) => {
                    const isIN = m.type === 'IN';
                    return (
                      <tr key={m.id} className="h-[56px] hover:bg-surface-50 transition-colors">
                        <td className="px-6 py-3.5 align-middle">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isIN
                                ? 'bg-leaf-tint text-leaf-text border-leaf/30'
                                : 'bg-coral-tint text-coral-text border-coral/30'
                            }`}
                          >
                            {isIN ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            <span>{m.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-3.5 align-middle font-mono text-ink font-semibold">{m.reference}</td>
                        <td className="px-6 py-3.5 align-middle font-semibold text-ink">
                          {m.productName}
                          <span className="text-xs font-mono text-surface-400 block font-normal">[{m.productSku}]</span>
                        </td>
                        <td className="px-6 py-3.5 align-middle text-surface-700">
                          {m.locationName} <span className="text-xs text-surface-400">({m.warehouseName})</span>
                        </td>
                        <td className="px-6 py-3.5 align-middle text-right font-mono tabular font-bold">
                          <span className={isIN ? 'text-leaf-text' : 'text-coral-text'}>
                            {isIN ? `+${m.quantity}` : `−${m.quantity}`}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 align-middle text-surface-500 italic text-xs">{m.notes || 'N/A'}</td>
                        <td className="px-6 py-3.5 align-middle text-right text-surface-400 font-mono text-xs tabular">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

