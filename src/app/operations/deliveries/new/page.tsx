'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function NewDeliveryPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    if (!token) return;
    try {
      const [prodRes, locRes] = await Promise.all([
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/locations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const prodJson = await prodRes.json();
      const locJson = await locRes.json();
      if (prodRes.ok) setProducts(prodJson.data || []);
      if (locRes.ok) setLocations(locJson.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleAddItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const handleRemoveItem = (i: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!locationId) { setError('Please select a source location'); return; }
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) { setError('Add at least one product line'); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName: customerName.trim() || undefined,
          items: validItems.map((i) => ({
            productId: i.productId,
            locationId,
            quantity: Number(i.quantity),
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message || 'Failed to create delivery'); return; }
      router.push('/operations/deliveries');
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell pageTitle="New Delivery">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-2 border-b border-zinc-200/80">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create Delivery (WH/OUT)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create an outgoing delivery order. Stock is checked at validation time.
          </p>
        </div>

        {loadingData ? (
          <div className="py-20 text-center"><Spinner size="lg" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase">
                Delivery Address / Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. LPU Campus Store, Jalandhar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase">
                Source Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                required
              >
                <option value="">Select a location…</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} — {loc.warehouseName || loc.warehouse?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-zinc-100 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-700 uppercase">
                  Product Lines <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-semibold text-zinc-900 hover:underline"
                >
                  + Add Line
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].productId = e.target.value;
                      setItems(next);
                    }}
                    className="flex-1 px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                    required
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.sku}]
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].quantity = parseInt(e.target.value) || 1;
                      setItems(next);
                    }}
                    className="w-24 px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono text-right"
                    required
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-zinc-400 hover:text-rose-600 font-bold text-lg leading-none px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-400 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              ⚠ Stock availability is checked when you validate (mark DONE). Draft creation always succeeds.
            </p>

            <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/operations/deliveries')}
                className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Saving…' : 'Save Draft Delivery'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
