'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Boxes } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (loginId.length < 6 || loginId.length > 12) {
      setGeneralError('Login ID must be between 6 and 12 characters');
      return;
    }

    if (password.length < 8) {
      setGeneralError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setGeneralError('Password must contain uppercase, lowercase, and a special character');
      return;
    }

    if (password !== confirmPassword) {
      setGeneralError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const result = await register(loginId, email, password, name);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/');
    } else {
      setGeneralError(result.error || 'Registration failed');
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8 sm:py-12">
        <div className="bg-white border border-surface-200 rounded-app shadow-float overflow-hidden grid grid-cols-1 md:grid-cols-2">
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
                Join StockSense IMS today
              </h2>
              <p className="text-white/60 text-sm mt-3 leading-relaxed">
                Take control of multi-location inventory, track movements in real time, and simplify stock management.
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
              <h1 className="text-xl font-bold text-ink tracking-tight">Create Account</h1>
              <p className="text-xs text-surface-500 mt-1">Setup your inventory manager profile</p>
            </div>

            {generalError && (
              <div className="mb-4 p-3 bg-coral-tint border border-coral/30 rounded-xl text-xs font-medium text-coral-text text-center">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1">
                  Login ID (6–12 Characters) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. manager10"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-3.5 h-10 text-xs bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400"
                  minLength={6}
                  maxLength={12}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 h-10 text-xs bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 h-10 text-xs bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1">
                  Password * (Min 8 chars, A-Z, a-z, special)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 h-10 text-xs bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 h-10 text-xs bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 text-ink placeholder:text-surface-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 text-white hover:bg-brand-700 rounded-full py-2.5 text-xs font-semibold transition-all shadow-md mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-surface-100 text-center text-xs text-surface-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-brand-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

