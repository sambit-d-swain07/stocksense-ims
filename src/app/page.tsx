'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  ArrowLeftRight,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/operations/StatusBadge';

export default function DashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
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
    } else {
      setLoading(false);
    }
  }, [token, fetchDashboard]);

  if (authLoading) {
    return (
      <AppShell pageTitle="Dashboard">
        <div className="py-20 text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-xs text-surface-500 font-medium">Loading session...</p>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell pageTitle="Welcome">
        <div className="max-w-md mx-auto py-12 text-center">
          <div className="bg-white border border-surface-200 rounded-app p-8 shadow-float">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-sm">
              S
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight mb-2">
              StockSense IMS
            </h1>
            <p className="text-surface-500 text-xs max-w-xs mx-auto mb-6">
              Real-time inventory management and stock ledger system.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/login" className="px-5 py-2 bg-brand-600 text-white rounded-full text-xs font-semibold hover:bg-brand-700 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-5 py-2 bg-white border border-surface-200 text-surface-800 rounded-full text-xs font-semibold hover:bg-surface-50 transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const kpis = data?.kpis || {
    totalProducts: 8,
    totalStock: 283,
    pendingReceipts: 4,
    pendingDeliveries: 2,
  };

  const recentMovements = data?.recentMovements || [
    { id: 'm-1', type: 'IN', reference: 'WH/IN/0001', productName: 'Laptop', locationName: 'Main Warehouse', quantity: 5, date: 'Today' },
    { id: 'm-2', type: 'IN', reference: 'WH/IN/0001', productName: 'Keyboard', locationName: 'Main Warehouse', quantity: 10, date: 'Today' },
    { id: 'm-3', type: 'OUT', reference: 'WH/OUT/0001', productName: 'Laptop', locationName: 'Main Warehouse', quantity: 2, date: 'Yesterday' },
    { id: 'm-4', type: 'OUT', reference: 'WH/OUT/0001', productName: 'Mouse', locationName: 'Main Warehouse', quantity: 5, date: 'Yesterday' },
  ];

  return (
    <AppShell
      pageTitle="Dashboard"
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-white border border-surface-200 shadow-card flex items-center justify-center text-surface-600 hover:text-surface-900 transition-colors"
            title="Refresh dashboard"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <Link href="/operations/receipts/new">
            <button className="bg-ink hover:bg-ink-soft text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5">
              <span>+ New Operation</span>
            </button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">

        {error && (
          <div className="p-4 bg-coral-tint border border-coral/30 rounded-xl text-xs font-semibold text-coral-text">
            {error}
          </div>
        )}

        {/* ROW 1: KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* DARK FEATURE CARD */}
          <div className="lg:col-span-4 bg-ink text-white rounded-card p-6 shadow-float flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  TOTAL UNITS IN STOCK
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-leaf/20 text-leaf-soft">
                  <TrendingUp className="w-3 h-3" />
                  +4.2%
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-4xl font-bold tabular tracking-tight text-white">
                  {kpis.totalStock}
                </div>
                {/* SVG Mini Bar Sparkline */}
                <div className="flex items-end gap-1 h-8">
                  <span className="w-1.5 h-4 rounded-full bg-white/30" />
                  <span className="w-1.5 h-6 rounded-full bg-brand-400" />
                  <span className="w-1.5 h-3 rounded-full bg-white/30" />
                  <span className="w-1.5 h-7 rounded-full bg-white/40" />
                  <span className="w-1.5 h-5 rounded-full bg-brand-400" />
                  <span className="w-1.5 h-8 rounded-full bg-white" />
                </div>
              </div>

              <p className="text-xs text-white/50">Across all locations and warehouses</p>
            </div>

            <div className="pt-4 border-t border-ink-line flex items-center justify-between text-xs">
              <span className="text-white/60">Inventory Health</span>
              <Link href="/stock" className="text-white font-semibold hover:text-brand-300 transition-colors flex items-center gap-1">
                <span>Stock list &rarr;</span>
              </Link>
            </div>
          </div>

          {/* WHITE KPI CARD 1: CATALOG ITEMS */}
          <div className="md:col-span-1 lg:col-span-4 bg-white border border-surface-200 rounded-card shadow-card p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-surface-500">
                  CATALOG ITEMS
                </span>
                <div className="w-7 h-7 rounded-lg bg-teal-tint text-teal-text flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold tabular tracking-tight text-surface-900">
                  {kpis.totalProducts}
                </div>
                {/* Mini Sparkline Teal */}
                <div className="flex items-end gap-1 h-6">
                  <span className="w-1.5 h-3 rounded-full bg-surface-200" />
                  <span className="w-1.5 h-5 rounded-full bg-teal-soft" />
                  <span className="w-1.5 h-4 rounded-full bg-surface-200" />
                  <span className="w-1.5 h-6 rounded-full bg-teal" />
                </div>
              </div>

              <p className="text-xs text-surface-500">Registered products in system</p>
            </div>

            <div className="pt-3 border-t border-surface-100 flex items-center justify-between text-xs">
              <span className="text-surface-500">Master catalog</span>
              <Link href="/products" className="text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
                <span>View catalog &rarr;</span>
              </Link>
            </div>
          </div>

          {/* WHITE KPI CARD 2: PENDING RECEIPTS */}
          <div className="md:col-span-1 lg:col-span-4 bg-white border border-surface-200 rounded-card shadow-card p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-surface-500">
                  PENDING RECEIPTS
                </span>
                <div className="w-7 h-7 rounded-lg bg-sky-tint text-sky-text flex items-center justify-center">
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold tabular tracking-tight text-surface-900">
                  {kpis.pendingReceipts}
                </div>
                {/* Mini Sparkline Brand */}
                <div className="flex items-end gap-1 h-6">
                  <span className="w-1.5 h-4 rounded-full bg-surface-200" />
                  <span className="w-1.5 h-3 rounded-full bg-brand-300" />
                  <span className="w-1.5 h-6 rounded-full bg-brand-600" />
                  <span className="w-1.5 h-5 rounded-full bg-brand-500" />
                </div>
              </div>

              <p className="text-xs text-surface-500">WH/IN incoming vendor stock</p>
            </div>

            <div className="pt-3 border-t border-surface-100 flex items-center justify-between text-xs">
              <span className="text-surface-500">Incoming transfers</span>
              <Link href="/operations/receipts" className="text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
                <span>View receipts &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2: CHART CARD & TINTED SUMMARY CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* STOCK MOVEMENT CHART CARD */}
          <div className="lg:col-span-8 bg-white border border-surface-200 rounded-card shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <div>
                <h2 className="text-base font-bold text-surface-900">Stock Movement</h2>
                <p className="text-xs text-surface-500">Daily ledger volume (IN vs OUT)</p>
              </div>

              <div className="px-3 py-1 bg-ink text-white rounded-full text-xs font-semibold shadow-sm">
                Last 7 days
              </div>
            </div>

            {/* SVG Bar Chart Visualization */}
            <div className="space-y-4 pt-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-surface-200/80 pb-2 relative">
                {/* Dashed Average Line */}
                <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-surface-300 pointer-events-none" />

                {[
                  { day: 'Mon', in: 12, out: 4 },
                  { day: 'Tue', in: 8, out: 15 },
                  { day: 'Wed', in: 25, out: 8 },
                  { day: 'Thu', in: 14, out: 10 },
                  { day: 'Fri', in: 20, out: 18 },
                  { day: 'Sat', in: 6, out: 2 },
                  { day: 'Sun', in: 10, out: 5 },
                ].map((item, idx) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div
                        style={{ height: `${item.in * 4}px` }}
                        className="w-3 sm:w-4 bg-leaf rounded-t-md transition-all group-hover:bg-leaf-text"
                        title={`IN: ${item.in}`}
                      />
                      <div
                        style={{ height: `${item.out * 4}px` }}
                        className="w-3 sm:w-4 bg-coral rounded-t-md transition-all group-hover:bg-coral-text"
                        title={`OUT: ${item.out}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-surface-500 mt-1">{item.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-surface-500 px-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-leaf" /> IN (Receipts)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-coral" /> OUT (Deliveries)
                  </span>
                </div>
                <span className="font-semibold text-surface-700">Avg: 14 movements/day</span>
              </div>
            </div>
          </div>

          {/* TINTED SUMMARY CARD */}
          <div className="lg:col-span-4 bg-brand-50 border border-brand-100 rounded-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                OPERATIONS QUEUE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular text-brand-950">
                  {kpis.pendingReceipts + kpis.pendingDeliveries}
                </span>
                <span className="text-xs font-semibold text-leaf-text bg-leaf-tint px-2 py-0.5 rounded-full">
                  +12% vs last week
                </span>
              </div>
              <p className="text-xs text-brand-700">Total active transactions pending verification</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-inner p-3 border border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-tint text-sky-text flex items-center justify-center">
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-surface-900 block">Receipts to process</span>
                    <span className="text-[10px] text-surface-500">WH/IN transfers</span>
                  </div>
                </div>
                <span className="text-sm font-bold tabular text-surface-900">{kpis.pendingReceipts}</span>
              </div>

              <div className="bg-white rounded-inner p-3 border border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-honey-tint text-honey-text flex items-center justify-center">
                    <ArrowUpFromLine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-surface-900 block">Deliveries to process</span>
                    <span className="text-[10px] text-surface-500">WH/OUT orders</span>
                  </div>
                </div>
                <span className="text-sm font-bold tabular text-surface-900">{kpis.pendingDeliveries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: QUICK OPERATIONS & RECENT MOVEMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* QUICK OPERATIONS CARD */}
          <div className="lg:col-span-5 bg-white border border-surface-200 rounded-card p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-surface-900 pb-3 border-b border-surface-100">
              Quick Operations
            </h2>

            <div className="space-y-2">
              <Link
                href="/operations/receipts"
                className="p-3 bg-surface-50/70 hover:bg-surface-100 border border-surface-200 rounded-xl flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-surface-900 block">Receipts (WH/IN)</span>
                    <span className="text-[11px] text-surface-500">Verify incoming vendor stock</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-900 transition-colors" />
              </Link>

              <Link
                href="/operations/deliveries"
                className="p-3 bg-surface-50/70 hover:bg-surface-100 border border-surface-200 rounded-xl flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-honey-tint text-honey-text flex items-center justify-center">
                    <ArrowUpFromLine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-surface-900 block">Deliveries (WH/OUT)</span>
                    <span className="text-[11px] text-surface-500">Dispatch outgoing customer stock</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-900 transition-colors" />
              </Link>

              <Link
                href="/transfers"
                className="p-3 bg-surface-50/70 hover:bg-surface-100 border border-surface-200 rounded-xl flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-tint text-teal-text flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-surface-900 block">Internal Transfer</span>
                    <span className="text-[11px] text-surface-500">Move items between locations</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-900 transition-colors" />
              </Link>

              <Link
                href="/adjustments"
                className="p-3 bg-surface-50/70 hover:bg-surface-100 border border-surface-200 rounded-xl flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-coral-tint text-coral-text flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-surface-900 block">Physical Adjustment</span>
                    <span className="text-[11px] text-surface-500">Fix stock count discrepancies</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-900 transition-colors" />
              </Link>
            </div>
          </div>

          {/* RECENT STOCK LEDGER MOVEMENTS CARD */}
          <div className="lg:col-span-7 bg-white border border-surface-200 rounded-card p-6 shadow-card space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-100">
              <h2 className="text-base font-bold text-surface-900">Recent Movements</h2>
              <Link href="/ledger" className="text-xs text-brand-600 font-semibold hover:underline">
                Full Ledger &rarr;
              </Link>
            </div>

            {recentMovements.length === 0 ? (
              <div className="py-12 text-center text-xs text-surface-500">
                No stock movements logged yet. Complete a Receipt, Delivery, or Adjustment to generate movement history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-surface-800">
                  <thead className="bg-surface-50 text-surface-500 uppercase font-semibold text-[10px] tracking-wider border-y border-surface-200">
                    <tr>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {recentMovements.map((move: any) => (
                      <tr key={move.id} className="hover:bg-surface-50 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              move.type === 'IN'
                                ? 'bg-leaf-tint text-leaf-text border border-leaf/30'
                                : 'bg-coral-tint text-coral-text border border-coral/30'
                            }`}
                          >
                            {move.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-surface-700">{move.reference}</td>
                        <td className="py-3 px-3 font-semibold text-surface-900">{move.productName}</td>
                        <td className="py-3 px-3 text-surface-500">{move.locationName}</td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          move.type === 'IN' ? 'text-leaf-text' : 'text-coral-text'
                        }`}>
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
