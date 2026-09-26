'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Plus,
  X,
  Search,
  PackageOpen,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

import { api, ApiError } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';
import { Product, Category } from '@/lib/types';

// Local form schema with a strictly-typed initialStock
const productFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(20, 'SKU cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'SKU must contain only letters, numbers, and hyphens'),
  categoryId: z.string().min(1, 'Category is required'),
  unit: z.enum(['Units', 'kg', 'g', 'Litres', 'Metres', 'Box'], {
    errorMap: () => ({ message: 'Unit of Measure is required' }),
  }),
  initialStock: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0, 'Initial stock must be ≥ 0')
    .optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusPill, getProductStockStatus } from '@/components/ui/StatusPill';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const UNIT_OPTIONS = ['Units', 'kg', 'g', 'Litres', 'Metres', 'Box'] as const;

function labelClass(optional = false) {
  return (
    <span className="block text-[13.5px] font-medium text-[#141414] mb-1.5">
      {optional ? (
        <>
          Initial Stock{' '}
          <span className="text-[#A9A9A9] font-normal">(optional)</span>
        </>
      ) : null}
    </span>
  );
}

// ─────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-[#F4F4F4] animate-pulse">
      {[40, 24, 16, 16, 20].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-3.5 bg-[#F0F0F0] rounded-full"
            style={{ width: `${w}%`, minWidth: 40 }}
          />
          {i === 0 && (
            <div className="h-2.5 bg-[#F4F4F4] rounded-full mt-2" style={{ width: '28%' }} />
          )}
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────
// Select component (inline — no extra file needed)
// ─────────────────────────────────────────────
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, children, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13.5px] font-medium text-[#141414]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            className={`w-full h-12 pl-4 pr-10 text-[14px] text-[#141414] appearance-none rounded-[14px] transition-all duration-150 focus:outline-none ${
              error
                ? 'border-[1.5px] border-black bg-[#FAFAFA] focus:ring-2 focus:ring-black/10'
                : 'border border-[#E2E2E2] bg-white focus:border-black focus:ring-2 focus:ring-black/10'
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9A9A9] pointer-events-none" />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 pt-0.5 text-xs text-[#141414] font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
SelectField.displayName = 'SelectField';

// ─────────────────────────────────────────────
// New Product Form
// ─────────────────────────────────────────────
interface NewProductFormProps {
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
}

function NewProductForm({ categories, onClose, onCreated }: NewProductFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      sku: '',
      categoryId: '',
      unit: 'Units',
      initialStock: undefined,
    },
  });

  // Auto-uppercase SKU as user types
  const skuValue = watch('sku');
  const prevSku = useRef('');
  useEffect(() => {
    if (skuValue && skuValue !== skuValue.toUpperCase()) {
      setValue('sku', skuValue.toUpperCase(), { shouldValidate: false });
    }
    prevSku.current = skuValue;
  }, [skuValue, setValue]);

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      await api.createProduct({
        name: data.name,
        sku: data.sku.toUpperCase(),
        categoryId: data.categoryId,
        unit: data.unit,
        initialStock: data.initialStock ?? 0,
      });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.field === 'sku') {
        setError('sku', { message: 'A product with this SKU already exists.' });
      } else {
        setError('name', {
          message: (err as Error)?.message || 'Failed to create product.',
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E2E2E2] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Form header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-[#141414] tracking-tight">New Product</h2>
          <p className="text-[13px] text-[#6E6E6E] mt-0.5">Fill in the details to add a product to your inventory.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-[#A9A9A9] hover:text-[#141414] hover:bg-[#F4F4F4] transition-colors"
          aria-label="Close form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <Input
              label="Product Name"
              placeholder="e.g. Steel Rods 10mm"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* SKU */}
          <Input
            label="SKU / Code"
            placeholder="e.g. RM-STL-001"
            error={errors.sku?.message}
            {...register('sku')}
          />

          {/* Category */}
          <SelectField
            label="Category"
            error={errors.categoryId?.message}
            {...register('categoryId')}
          >
            <option value="">Choose a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </SelectField>

          {/* Unit */}
          <SelectField
            label="Unit of Measure"
            error={errors.unit?.message}
            {...register('unit')}
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </SelectField>

          {/* Initial Stock */}
          <div>
            <label className="block text-[13.5px] font-medium text-[#141414] mb-1.5">
              Initial Stock{' '}
              <span className="text-[#A9A9A9] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={1}
                placeholder="0"
                className={`w-full h-12 px-4 text-[14px] text-[#141414] placeholder:text-[#A9A9A9] rounded-[14px] transition-all duration-150 focus:outline-none ${
                  errors.initialStock
                    ? 'border-[1.5px] border-black bg-[#FAFAFA] focus:ring-2 focus:ring-black/10'
                    : 'border border-[#E2E2E2] bg-white focus:border-black focus:ring-2 focus:ring-black/10'
                }`}
                {...register('initialStock')}
              />
            </div>
            {errors.initialStock && (
              <div className="flex items-center gap-1.5 pt-1 text-xs text-[#141414] font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.initialStock.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#F4F4F4]">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Save product
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────
// Products Page
// ─────────────────────────────────────────────
export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Stable fetchers (so useApiData's useCallback doesn't re-fetch on every render)
  const productFetcher = useCallback(() => api.getProducts(), []);
  const categoryFetcher = useCallback(() => api.getCategories(), []);

  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    reload: reloadProducts,
  } = useApiData<Product[]>(productFetcher);

  const { data: categories } = useApiData<Category[]>(categoryFetcher);

  // Client-side filtering (no re-fetch on search/filter changes)
  const filtered = (products ?? []).filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalCount = products?.length ?? 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#141414] leading-tight">
            Products
          </h1>
          <p className="text-[14px] text-[#6E6E6E] mt-1">
            {productsLoading
              ? 'Loading inventory…'
              : `${totalCount} product${totalCount !== 1 ? 's' : ''} in inventory`}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="flex-shrink-0 gap-2"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="w-4 h-4" />
          New Product
        </Button>
      </div>

      {/* ── Inline New Product Form ── */}
      {showForm && categories && (
        <NewProductForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onCreated={reloadProducts}
        />
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9A9A9] pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-[13.5px] text-[#141414] placeholder:text-[#A9A9A9] bg-white border border-[#E2E2E2] rounded-[14px] focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 pl-4 pr-9 text-[13.5px] text-[#141414] bg-white border border-[#E2E2E2] rounded-[14px] appearance-none focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
          >
            <option value="">All categories</option>
            {(categories ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A9A9A9] pointer-events-none" />
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-[24px] border border-[#E2E2E2] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Scrollable wrapper for mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-[#F0F0F0] bg-[#FAFAFA]">
                <th className="px-5 py-3.5 text-left text-[11.5px] font-semibold text-[#6E6E6E] uppercase tracking-wider">
                  Product
                </th>
                <th className="px-5 py-3.5 text-left text-[11.5px] font-semibold text-[#6E6E6E] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3.5 text-left text-[11.5px] font-semibold text-[#6E6E6E] uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-5 py-3.5 text-right text-[11.5px] font-semibold text-[#6E6E6E] uppercase tracking-wider">
                  On Hand
                </th>
                <th className="px-5 py-3.5 text-left text-[11.5px] font-semibold text-[#6E6E6E] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Loading: skeleton rows */}
              {productsLoading &&
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {/* Error state */}
              {!productsLoading && productsError && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F4F4F4] flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-[#A9A9A9]" />
                      </div>
                      <p className="text-[14px] font-semibold text-[#141414]">
                        Failed to load products
                      </p>
                      <p className="text-[13px] text-[#6E6E6E]">{productsError}</p>
                      <Button variant="outline" size="sm" onClick={reloadProducts}>
                        Try again
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty — no products at all */}
              {!productsLoading && !productsError && totalCount === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center">
                        <PackageOpen className="w-6 h-6 text-[#A9A9A9]" />
                      </div>
                      <p className="text-[15px] font-semibold text-[#141414]">No products yet</p>
                      <p className="text-[13px] text-[#6E6E6E]">
                        Add your first product to start managing inventory.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-1 gap-1.5"
                        onClick={() => setShowForm(true)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Product
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty — filters return nothing */}
              {!productsLoading &&
                !productsError &&
                totalCount > 0 &&
                filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#F4F4F4] flex items-center justify-center">
                          <Search className="w-5 h-5 text-[#A9A9A9]" />
                        </div>
                        <p className="text-[14px] font-semibold text-[#141414]">
                          No products match your search
                        </p>
                        <p className="text-[13px] text-[#6E6E6E]">
                          Try a different name, SKU, or category filter.
                        </p>
                        <button
                          className="mt-1 text-[13px] font-medium text-[#141414] underline underline-offset-4 hover:opacity-70 transition-opacity"
                          onClick={() => {
                            setSearch('');
                            setCategoryFilter('');
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

              {/* Product rows */}
              {!productsLoading &&
                !productsError &&
                filtered.map((product) => {
                  const status = getProductStockStatus(product.onHand);
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA] transition-colors group"
                    >
                      {/* Product name + SKU */}
                      <td className="px-5 py-4">
                        <p className="text-[14px] font-semibold text-[#141414] leading-snug">
                          {product.name}
                        </p>
                        <p className="text-[12px] text-[#A9A9A9] font-mono mt-0.5 tracking-wide">
                          {product.sku}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-[13.5px] text-[#6E6E6E]">
                        {product.categoryName || '—'}
                      </td>

                      {/* Unit */}
                      <td className="px-5 py-4 text-[13.5px] text-[#6E6E6E]">
                        {product.unit}
                      </td>

                      {/* On hand — right-aligned, tabular nums */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-[14px] font-semibold text-[#141414] tabular-nums">
                          {product.onHand.toLocaleString()}
                        </span>
                      </td>

                      {/* Status pill */}
                      <td className="px-5 py-4">
                        <StatusPill status={status} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Table footer — row count */}
        {!productsLoading && !productsError && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#F4F4F4] text-[12px] text-[#A9A9A9]">
            Showing {filtered.length} of {totalCount} product{totalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
