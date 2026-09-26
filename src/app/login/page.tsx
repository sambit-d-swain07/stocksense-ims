'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/');
    } else {
      if (result.fields) {
        setFieldErrors(result.fields);
      }
      setGeneralError(result.error || 'Failed to login');
    }
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto py-12">
        <Card
          title="Sign in to your account"
          subtitle="Enter your credentials to access your dashboard"
        >
          {generalError && (
            <Toast
              type="error"
              message={generalError}
              onClose={() => setGeneralError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-surface-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700 underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
