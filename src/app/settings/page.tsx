'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

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
        <div className="pb-2 border-b border-zinc-200/80">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            System Settings &amp; Configuration
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure Multi-Warehouse architecture, Stock Locations, and Product Categories
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 space-x-1">
          <button
            onClick={() => setActiveTab('WAREHOUSES')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'WAREHOUSES'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Warehouses ({warehouses.length})
          </button>
          <button
            onClick={() => setActiveTab('LOCATIONS')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'LOCATIONS'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Locations ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'CATEGORIES'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
            {formError}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-xs text-zinc-500">Loading settings data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 h-fit space-y-4">
              {activeTab === 'WAREHOUSES' && (
                <form onSubmit={handleCreateWarehouse} className="space-y-3.5 text-xs">
                  <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                    Add Warehouse
                  </h2>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1 uppercase">Warehouse Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Central Warehouse"
                      value={whName}
                      onChange={(e) => setWhName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1 uppercase">Short Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. WH-MAIN"
                      value={whShortCode}
                      onChange={(e) => setWhShortCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1 uppercase">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Industrial Area Phase 1, Jalandhar"
                      value={whAddress}
                      onChange={(e) => setWhAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors mt-2"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Warehouse'}
                  </button>
                </form>
              )}

              {activeTab === 'LOCATIONS' && (
                <form onSubmit={handleCreateLocation} className="space-y-3.5 text-xs">
                  <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                    Add Stock Location
                  </h2>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1 uppercase">Location Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rack A1 / Shelf 2"
                      value={locName}
                      onChange={(e) => setLocName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1 uppercase">Short Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. RACK-A1"
                      value={locShortCode}
                      onChange={(e) => setLocShortCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1 uppercase">Warehouse *</label>
                    <select
                      value={locWarehouseId}
                      onChange={(e) => setLocWarehouseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
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
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors mt-2"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Location'}
                  </button>
                </form>
              )}

              {activeTab === 'CATEGORIES' && (
                <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
                  <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                    Add Product Category
                  </h2>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1 uppercase">Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Electronics, Furniture, Raw Materials"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors mt-2"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Category'}
                  </button>
                </form>
              )}
            </div>

            {/* List Column */}
            <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6">
              {activeTab === 'WAREHOUSES' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Configured Warehouses</h2>
                  {warehouses.length === 0 ? (
                    <p className="text-zinc-500 text-xs py-8 text-center">No warehouses configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {warehouses.map((wh) => (
                        <div key={wh.id} className="p-4 bg-zinc-50/60 rounded-lg border border-zinc-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-zinc-900 text-sm block">{wh.name}</span>
                            <span className="text-zinc-500 font-mono">Code: {wh.shortCode}</span>
                            {wh.address && <p className="text-zinc-500 text-[11px] mt-1">{wh.address}</p>}
                          </div>
                          <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded border border-zinc-200 font-mono font-bold">
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
                  <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Configured Stock Locations</h2>
                  {locations.length === 0 ? (
                    <p className="text-zinc-500 text-xs py-8 text-center">No locations configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {locations.map((loc) => (
                        <div key={loc.id} className="p-4 bg-zinc-50/60 rounded-lg border border-zinc-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-zinc-900 text-sm block">{loc.name}</span>
                            <span className="text-zinc-500 text-[11px]">Parent WH: {loc.warehouseName}</span>
                          </div>
                          <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded border border-zinc-200 font-mono font-bold">
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
                  <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Configured Product Categories</h2>
                  {categories.length === 0 ? (
                    <p className="text-zinc-500 text-xs py-8 text-center">No categories configured yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <div key={cat.id} className="p-3 bg-zinc-50/60 rounded-lg border border-zinc-200 flex justify-between items-center text-xs">
                          <span className="font-bold text-zinc-900">{cat.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">ID: {cat.id.substring(0, 8)}...</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
