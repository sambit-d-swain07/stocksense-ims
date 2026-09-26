'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Boxes } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!identifier) {
      setGeneralError('Please enter your Login ID or Email Address');
      return;
    }
    if (!password) {
      setGeneralError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/');
    } else {
      setGeneralError(result.error || 'Invalid credentials');
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8 sm:py-12">
        <div className="bg-white border border-surface-200 rounded-app shadow-float overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
          {/* Left Ink Panel */}
          <div className="bg-ink text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                  <Boxes className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">StockSense</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-brand-200 border border-white/10">IMS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Welcome back to your workspace
              </h2>
              <p className="text-white/60 text-sm mt-3 leading-relaxed">
                Streamline receipts, track stock movements, and manage internal logistics effortlessly.
              </p>
            </div>
            <div className="relative z-10 pt-8 border-t border-ink-line">
              <p className="text-brand-300 font-semibold text-sm">Every movement, accounted for.</p>
              <p className="text-white/40 text-xs mt-1">StockSense Inventory Management & Ledger</p>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-ink tracking-tight">Sign In</h1>
              <p className="text-xs text-surface-500 mt-1">Enter your credentials to access your account</p>
            </div>

            {generalError && (
              <div className="mb-4 p-3 bg-coral-tint border border-coral/30 rounded-xl text-xs font-medium text-coral-text text-center">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                  Login ID or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. adminuser or admin@stocksense.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400 shadow-sm"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-surface-500">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-brand-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 h-11 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400 shadow-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 text-white hover:bg-brand-700 rounded-full py-3 text-sm font-semibold transition-all shadow-md mt-4 disabled:opacity-50"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-surface-100 text-center text-xs text-surface-500">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="font-semibold text-brand-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

