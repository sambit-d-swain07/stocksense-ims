'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function DeliveriesPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Detail / Action Modal
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [delRes, prodRes, locRes] = await Promise.all([
        fetch('/api/deliveries', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/locations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const delJson = await delRes.json();
      const prodJson = await prodRes.json();
      const locJson = await locRes.json();

      if (delRes.ok) setDeliveries(delJson.data || []);
      if (prodRes.ok) setProducts(prodJson.data || []);
      if (locRes.ok) setLocations(locJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchDeliveryDetails = async (deliveryId: string) => {
    setDetailLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedDelivery(json.data);
      } else {
        setActionError(json.error?.message || 'Failed to fetch delivery details');
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!locationId) {
      setModalError('Source location is required');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setModalError('Please add at least one valid product line with quantity > 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedItems = validItems.map((i) => ({
        productId: i.productId,
        locationId,
        quantity: Number(i.quantity),
      }));

      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: customerName.trim() || undefined,
          items: formattedItems,
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setModalError(json.error?.message || 'Failed to create delivery order');
        return;
      }

      setIsModalOpen(false);
      setCustomerName('');
      setLocationId('');
      setItems([{ productId: '', quantity: 1 }]);
      fetchData();
    } catch (err: any) {
      setIsSubmitting(false);
      setModalError(err.message || 'Network error');
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: 'WAITING' | 'READY' | 'DONE') => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      setActionLoading(false);

      if (!res.ok) {
        setActionError(json.error?.message || 'Failed to update delivery status');
        return;
      }

      // Refresh single view and list
      fetchDeliveryDetails(deliveryId);
      fetchData();
    } catch (err: any) {
      setActionLoading(false);
      setActionError(err.message || 'Network error');
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesRef =
      d.reference.toLowerCase().includes(search.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesRef && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Deliveries (WH/OUT)
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Outgoing customer orders. Real-time stock availability check &amp; negative stock prevention.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center space-x-1.5"
          >
            <span>Create New Delivery Order</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search reference or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <div className="w-full sm:w-64 flex items-center gap-2">
            <label className="text-xs text-zinc-500 uppercase font-semibold">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="WAITING">WAITING</option>
              <option value="READY">READY</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-xs text-zinc-500">Loading delivery orders...</p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 text-xs">
            No delivery orders found matching filter criteria.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-50 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Delivery Address (Customer)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Item Lines</th>
                    <th className="py-3 px-4 text-right">Created Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredDeliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{del.reference}</td>
                      <td className="py-3 px-4 text-zinc-700">{del.customerName || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                            del.status === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : del.status === 'READY'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : del.status === 'WAITING'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
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

      {/* Create Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Create Outgoing Delivery (WH/OUT)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-sm font-bold">
                &times;
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Delivery Address / Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. LPU Campus Store, Jalandhar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 uppercase">Source Location *</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  required
                >
                  <option value="">Select Source Location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.warehouseName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product lines */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <label className="block text-zinc-700 font-semibold uppercase">Product Lines *</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-zinc-900 font-semibold hover:underline"
                  >
                    + Add Line Item
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
                      className="flex-1 px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                      required
                    >
                      <option value="">Select Product...</option>
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
                      className="w-24 px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono text-right"
                      required
                    />

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-zinc-400 hover:text-zinc-600 font-bold text-xs px-1.5"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
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
                  {isSubmitting ? 'Creating...' : 'Save Draft Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Live Stock Warning Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Delivery {selectedDelivery.reference}</h3>
                <p className="text-xs text-zinc-500">Customer: {selectedDelivery.customerName || 'Unspecified'}</p>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {actionError}
              </div>
            )}

            {/* Workflow steps bar */}
            <div className="flex items-center justify-around p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
              <span className={`font-semibold ${selectedDelivery.status === 'DRAFT' ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                1. DRAFT
              </span>
              <span className="text-zinc-300">&rarr;</span>
              <span className={`font-semibold ${selectedDelivery.status === 'WAITING' ? 'text-rose-700 font-bold' : 'text-zinc-400'}`}>
                2. WAITING
              </span>
              <span className="text-zinc-300">&rarr;</span>
              <span className={`font-semibold ${selectedDelivery.status === 'READY' ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                3. READY
              </span>
              <span className="text-zinc-300">&rarr;</span>
              <span className={`font-semibold ${selectedDelivery.status === 'DONE' ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                4. DONE
              </span>
            </div>

            {/* Item list with Live Stock Check & RED Highlight */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Delivery Line Items &amp; Stock Availability</h4>
              {detailLoading ? (
                <div className="py-4 text-center"><Spinner size="sm" /></div>
              ) : (
                <div className="space-y-2">
                  {selectedDelivery.items?.map((item: any) => {
                    const isOutOfStock = item.isOutOfStock || (item.availableStock < item.quantity);
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
                          isOutOfStock
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : 'bg-zinc-50/60 border-zinc-200 text-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-900">{item.productName || item.product?.name}</span>
                            {isOutOfStock && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-semibold text-[9px] uppercase tracking-wider">
                                OUT OF STOCK
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500 block font-mono">
                            Location: {item.locationName || item.location?.name} | Available: {item.availableStock ?? 0}
                          </span>
                        </div>
                        <span className={`font-mono font-bold ${isOutOfStock ? 'text-rose-700' : 'text-zinc-900'}`}>
                          -{item.quantity} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Workflow Action Buttons */}
            <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>

              <div className="flex gap-2">
                {selectedDelivery.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedDelivery.id, 'READY')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Check &amp; Mark READY
                  </button>
                )}

                {selectedDelivery.status !== 'DONE' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedDelivery.id, 'DONE')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Validate &amp; Deliver (DONE)
                  </button>
                )}

                {selectedDelivery.status === 'DONE' && (
                  <span className="text-xs text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    Delivered &amp; Stock Deducted
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
