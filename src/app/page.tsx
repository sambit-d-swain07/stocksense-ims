'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Failed to fetch dashboard statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token, fetchDashboard]);

  if (authLoading) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-xs text-zinc-500">Loading session...</p>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto py-16 text-center">
          <div className="bg-white border border-zinc-200 rounded-2xl p-10">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
              S
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
              StockSense IMS
            </h1>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-8">
              Real-time Inventory Management &amp; Ledger System powered by Neon PostgreSQL.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/login" className="px-5 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-800 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors">
                Register Account
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const kpis = data?.kpis || {
    totalProducts: 0,
    totalStock: 0,
    totalWarehouses: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  const lowStockProducts = data?.lowStockProducts || [];
  const outOfStockProducts = data?.outOfStockProducts || [];
  const recentMovements = data?.recentMovements || [];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live inventory overview and ledger activity log
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="px-3.5 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <svg className={`w-3.5 h-3.5 text-zinc-500 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              <span>Total Products</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{kpis.totalProducts}</div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">Catalog Items</span>
              <Link href="/products" className="text-zinc-900 font-semibold hover:underline">
                View catalog &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              <span>Total Units in Stock</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{kpis.totalStock}</div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">Across all locations</span>
              <Link href="/stock" className="text-zinc-900 font-semibold hover:underline">
                Stock list &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              <span>Pending Receipts</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{kpis.pendingReceipts}</div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">WH/IN Incoming</span>
              <Link href="/receipts" className="text-zinc-900 font-semibold hover:underline">
                View receipts &rarr;
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              <span>Pending Deliveries</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{kpis.pendingDeliveries}</div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">WH/OUT Outgoing</span>
              <Link href="/deliveries" className="text-zinc-900 font-semibold hover:underline">
                View deliveries &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Low Stock & Out of Stock Alerts (if any) */}
        {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {outOfStockProducts.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <h2 className="text-sm font-bold text-zinc-900">
                      Out of Stock ({outOfStockProducts.length})
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-500">Requires restock</span>
                </div>
                <div className="space-y-2">
                  {outOfStockProducts.map((p: any) => (
                    <div key={p.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-zinc-900">{p.name}</span>
                        <span className="text-zinc-500 font-mono ml-2">SKU: {p.sku}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[11px]">
                        0 {p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lowStockProducts.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <h2 className="text-sm font-bold text-zinc-900">
                      Low Stock Threshold ({lowStockProducts.length})
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-500">Below reorder point</span>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.map((p: any) => (
                    <div key={p.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-zinc-900">{p.name}</span>
                        <span className="text-zinc-500 font-mono ml-2">Reorder: {p.reorderPoint}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold text-[11px]">
                        {p.currentStock} {p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Operations & Recent Stock Ledger Movements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Operations Panel */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Quick Operations
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/receipts"
                className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs font-semibold text-zinc-900 transition-colors"
              >
                <span>Receipts (WH/IN)</span>
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/deliveries"
                className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs font-semibold text-zinc-900 transition-colors"
              >
                <span>Deliveries (WH/OUT)</span>
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/transfers"
                className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs font-semibold text-zinc-900 transition-colors"
              >
                <span>Internal Transfer</span>
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/adjustments"
                className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs font-semibold text-zinc-900 transition-colors"
              >
                <span>Physical Adjustment</span>
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Recent Stock Ledger Movements Table */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">
                Recent Stock Ledger Movements
              </h2>
              <Link href="/ledger" className="text-xs text-zinc-700 font-semibold hover:underline">
                Full Ledger &rarr;
              </Link>
            </div>

            {recentMovements.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No stock movements logged yet. Complete a Receipt, Delivery, or Adjustment to generate movement history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-800">
                  <thead className="bg-zinc-50 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider border-y border-zinc-100">
                    <tr>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentMovements.map((move: any) => (
                      <tr key={move.id} className="hover:bg-zinc-50/60">
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              move.type === 'IN'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            }`}
                          >
                            {move.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-700">{move.reference}</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-900">{move.productName}</td>
                        <td className="py-2.5 px-3 text-zinc-500">{move.locationName}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                          {move.type === 'IN' ? `+${move.quantity}` : `-${move.quantity}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
