'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { token } = useAuth();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'WAREHOUSES' | 'LOCATIONS' | 'CATEGORIES'>('WAREHOUSES');

  // Warehouse Form
  const [whName, setWhName] = useState('');
  const [whShortCode, setWhShortCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // Location Form
  const [locName, setLocName] = useState('');
  const [locShortCode, setLocShortCode] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState('');

  // Category Form
  const [catName, setCatName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [whRes, locRes, catRes] = await Promise.all([
        fetch('/api/warehouses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/locations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const whJson = await whRes.json();
      const locJson = await locRes.json();
      const catJson = await catRes.json();

      if (whRes.ok) setWarehouses(whJson.data || []);
      if (locRes.ok) setLocations(locJson.data || []);
      if (catRes.ok) setCategories(catJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!whName.trim() || !whShortCode.trim()) {
      setFormError('Warehouse name and short code are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: whName.trim(),
          shortCode: whShortCode.trim(),
          address: whAddress.trim() || undefined,
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setFormError(json.error?.message || 'Failed to create warehouse');
        return;
      }

      setWhName('');
      setWhShortCode('');
      setWhAddress('');
      fetchData();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!locName.trim() || !locShortCode.trim() || !locWarehouseId) {
      setFormError('Location name, short code, and warehouse selection are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: locName.trim(),
          shortCode: locShortCode.trim(),
          warehouseId: locWarehouseId,
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setFormError(json.error?.message || 'Failed to create location');
        return;
      }

      setLocName('');
      setLocShortCode('');
      setLocWarehouseId('');
      fetchData();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!catName.trim()) {
      setFormError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: catName.trim(),
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setFormError(json.error?.message || 'Failed to create category');
        return;
      }

      setCatName('');
      fetchData();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            System Settings &amp; Configuration
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Configure Multi-Warehouse architecture, Stock Locations, and Product Categories
          </p>
        </div>

        {error && (
          <div className="p-3 bg-coral-tint border border-coral/30 rounded-xl text-xs font-medium text-coral-text">
            {error}
          </div>
        )}

        {/* Tab Switcher - Underline Tabs in brand-600 */}
        <div className="flex border-b border-surface-200 gap-8">
          <button
            onClick={() => setActiveTab('WAREHOUSES')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'WAREHOUSES'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-surface-500 hover:text-ink'
            }`}
          >
            Warehouses ({warehouses.length})
          </button>
          <button
            onClick={() => setActiveTab('LOCATIONS')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'LOCATIONS'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-surface-500 hover:text-ink'
            }`}
          >
            Locations ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'CATEGORIES'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-surface-500 hover:text-ink'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-coral-tint border border-coral/30 rounded-xl text-xs font-medium text-coral-text">
            {formError}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-surface-500 font-medium">Loading settings data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List Column (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-surface-200 rounded-card p-6 shadow-card">
              {activeTab === 'WAREHOUSES' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 border-b border-surface-100 pb-3">Configured Warehouses</h2>
                  {warehouses.length === 0 ? (
                    <p className="text-surface-400 text-sm py-12 text-center">No warehouses configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {warehouses.map((wh) => (
                        <div key={wh.id} className="p-4 bg-surface-50/70 rounded-inner border border-surface-200/80 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-ink text-base block">{wh.name}</span>
                            <span className="text-xs text-surface-500 font-mono">Code: {wh.shortCode}</span>
                            {wh.address && <p className="text-xs text-surface-500 mt-1">{wh.address}</p>}
                          </div>
                          <span className="px-3 py-1 bg-surface-100 text-ink rounded-full border border-surface-200 font-mono font-bold text-xs">
                            {wh.shortCode}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'LOCATIONS' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 border-b border-surface-100 pb-3">Configured Stock Locations</h2>
                  {locations.length === 0 ? (
                    <p className="text-surface-400 text-sm py-12 text-center">No locations configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {locations.map((loc) => (
                        <div key={loc.id} className="p-4 bg-surface-50/70 rounded-inner border border-surface-200/80 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-ink text-base block">{loc.name}</span>
                            <span className="text-xs text-surface-500">Parent WH: {loc.warehouseName}</span>
                          </div>
                          <span className="px-3 py-1 bg-surface-100 text-ink rounded-full border border-surface-200 font-mono font-bold text-xs">
                            {loc.shortCode}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'CATEGORIES' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 border-b border-surface-100 pb-3">Configured Product Categories</h2>
                  {categories.length === 0 ? (
                    <p className="text-surface-400 text-sm py-12 text-center">No categories configured yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <div key={cat.id} className="p-3.5 bg-surface-50/70 rounded-inner border border-surface-200/80 flex justify-between items-center text-sm">
                          <span className="font-bold text-ink">{cat.name}</span>
                          <span className="text-xs text-surface-400 font-mono">ID: {cat.id.substring(0, 8)}...</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Column (Right) */}
            <div className="bg-white border border-surface-200 rounded-card p-6 h-fit space-y-4 shadow-card">
              {activeTab === 'WAREHOUSES' && (
                <form onSubmit={handleCreateWarehouse} className="space-y-4 text-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 border-b border-surface-100 pb-3">
                    Add Warehouse
                  </h2>
                  <div>
                    <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5">Warehouse Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Central Warehouse"
                      value={whName}
                      onChange={(e) => setWhName(e.target.value)}
                      className="w-full px-3.5 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5">Short Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. WH-MAIN"
                      value={whShortCode}
                      onChange={(e) => setWhShortCode(e.target.value)}
                      className="w-full px-3.5 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink font-mono uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Industrial Area Phase 1, Jalandhar"
                      value={whAddress}
                      onChange={(e) => setWhAddress(e.target.value)}
                      className="w-full px-3.5 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full rounded-full mt-2"
                  >
                    Add Warehouse
                  </Button>
                </form>
              )}

              {activeTab === 'LOCATIONS' && (
                <form onSubmit={handleCreateLocation} className="space-y-4 text-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 border-b border-surface-100 pb-3">
                    Add Stock Location
                  </h2>
                  <div>
                    <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5">Location Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rack A1 / Shelf 2"
                      value={locName}
                      onChange={(e) => setLocName(e.target.value)}
                      className="w-full px-3.5 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5">Short Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. RACK-A1"
                      value={locShortCode}
                      onChange={(e) => setLocShortCode(e.target.value)}
                      className="w-full px-3.5 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink font-mono uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5">Warehouse *</label>
                    <select
                      value={locWarehouseId}
                      onChange={(e) => setLocWarehouseId(e.target.value)}
                      className="w-full px-3.5 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink font-medium"
                      required
                    >
                      <option value="">Select Parent Warehouse...</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} [{wh.shortCode}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full rounded-full mt-2"
                  >
                    Add Location
                  </Button>
                </form>
              )}

              {activeTab === 'CATEGORIES' && (
                <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 border-b border-surface-100 pb-3">
                    Add Product Category
                  </h2>
                  <div>
                    <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5">Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Electronics, Furniture, Raw Materials"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full px-3.5 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full rounded-full mt-2"
                  >
                    Add Category
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

