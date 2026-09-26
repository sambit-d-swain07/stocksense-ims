'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function StockPage() {
  const { token } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Stock Update Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [onHand, setOnHand] = useState<number>(0);
  const [reserved, setReserved] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [stockRes, prodRes, locRes] = await Promise.all([
        fetch('/api/stock', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/locations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const stockJson = await stockRes.json();
      const prodJson = await prodRes.json();
      const locJson = await locRes.json();

      if (stockRes.ok) setStocks(stockJson.data || []);
      if (prodRes.ok) setProducts(prodJson.data || []);
      if (locRes.ok) setLocations(locJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock records');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!productId || !locationId) {
      setModalError('Product and Location are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          locationId,
          onHand: Number(onHand) || 0,
          reserved: Number(reserved) || 0,
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setModalError(json.error?.message || 'Failed to update stock');
        return;
      }

      setIsModalOpen(false);
      setProductId('');
      setLocationId('');
      setOnHand(0);
      setReserved(0);
      fetchData();
    } catch (err: any) {
      setIsSubmitting(false);
      setModalError(err.message || 'Network error');
    }
  };

  const filteredStocks = stocks.filter((s) => {
    const matchesSearch =
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.locationName.toLowerCase().includes(search.toLowerCase()) ||
      s.warehouseName.toLowerCase().includes(search.toLowerCase());
    const matchesLoc = !selectedLocation || s.locationId === selectedLocation;
    return matchesSearch && matchesLoc;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Stock Balances
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live inventory levels across warehouses, locations, and reserved quantities
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center space-x-1.5"
          >
            <span>Set / Update Stock</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search product, location, or warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <div className="w-full sm:w-64 flex items-center gap-2">
            <label className="text-xs text-zinc-500 uppercase font-semibold">Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.warehouseName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Table */}
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-xs text-zinc-500">Calculating live stock balances...</p>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 text-xs">
            No stock records present in database matching filters.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-50 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Warehouse &amp; Location</th>
                    <th className="py-3 px-4 text-right">On Hand</th>
                    <th className="py-3 px-4 text-right">Reserved</th>
                    <th className="py-3 px-4 text-right">Free To Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredStocks.map((stock) => (
                    <tr key={stock.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-900 block">{stock.productName}</span>
                        <span className="text-[10px] font-mono text-zinc-500">SKU: {stock.product?.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-zinc-800 font-medium block">{stock.locationName}</span>
                        <span className="text-[11px] text-zinc-500">{stock.warehouseName}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                        {stock.onHand}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-zinc-600">
                        {stock.reserved}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                        {stock.freeToUse}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Set / Adjust Location Stock</h3>
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

            <form onSubmit={handleUpdateStock} className="space-y-3.5 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1 uppercase">On Hand Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={onHand}
                    onChange={(e) => setOnHand(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1 uppercase">Reserved Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={reserved}
                    onChange={(e) => setReserved(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono"
                  />
                </div>
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
                  {isSubmitting ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
