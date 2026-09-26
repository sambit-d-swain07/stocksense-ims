'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';

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
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              S
            </div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              StockSense IMS
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Sign in with your Login ID or Email</p>
          </div>

          {generalError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 text-center">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                Login ID or Email
              </label>
              <input
                type="text"
                placeholder="e.g. adminuser or admin@stocksense.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase text-zinc-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-zinc-900 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg py-2.5 text-xs font-semibold transition-colors mt-2"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-zinc-900 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
