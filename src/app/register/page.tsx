'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';

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
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              S
            </div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Create StockSense Account
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Setup your inventory manager profile</p>
          </div>

          {generalError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 text-center">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                Login ID (6–12 Characters) *
              </label>
              <input
                type="text"
                placeholder="e.g. manager10"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                minLength={6}
                maxLength={12}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                Password * (Min 8 chars, A-Z, a-z, special)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg py-2.5 text-xs font-semibold transition-colors mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
