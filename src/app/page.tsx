'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function HomePage() {
  const { user, isLoading, logout } = useAuth();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-surface-500">Checking authentication state...</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-2xl p-8 shadow-lg">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
                Logged In Session
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Welcome back, {user.name || user.email}! 👋
              </h1>
              <p className="mt-2 text-brand-100 text-sm">
                Your hackathon authentication foundation is live and ready for domain features.
              </p>
            </div>

            <Card title="User Profile Summary" subtitle="Verified JWT session details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200/60">
                  <span className="text-xs text-surface-500 block uppercase font-medium">User ID</span>
                  <span className="font-mono text-surface-800 font-semibold">{user.id}</span>
                </div>
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200/60">
                  <span className="text-xs text-surface-500 block uppercase font-medium">Email Address</span>
                  <span className="font-medium text-surface-800">{user.email}</span>
                </div>
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200/60">
                  <span className="text-xs text-surface-500 block uppercase font-medium">Display Name</span>
                  <span className="font-medium text-surface-800">{user.name || 'Not provided'}</span>
                </div>
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200/60">
                  <span className="text-xs text-surface-500 block uppercase font-medium">Joined At</span>
                  <span className="font-medium text-surface-800">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between">
                <p className="text-xs text-surface-500">
                  Ready to attach models & CRUD routes when problem statement drops.
                </p>
                <Button variant="danger" size="sm" onClick={logout}>
                  Log Out
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              🚀
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 sm:text-5xl">
              Odoo Hackathon Starter
            </h1>
            <p className="mt-4 text-base text-surface-600 max-w-xl mx-auto">
              Unified Next.js 14 App Router foundation with Prisma, JWT Auth, Zod Validation, and Tailwind design tokens.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/login">
                <Button variant="primary" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <Card title="Unified Next.js">
                <p className="text-xs text-surface-500">App Router pages & route handlers in a single repository.</p>
              </Card>
              <Card title="Prisma & Postgres">
                <p className="text-xs text-surface-500">Clean User model & singleton instance ready for Neon database.</p>
              </Card>
              <Card title="JWT & Zod">
                <p className="text-xs text-surface-500">Full auth flow with localStorage token persistence & Zod validation.</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
