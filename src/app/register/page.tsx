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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/');
    } else {
      if (result.fields) {
        setFieldErrors(result.fields);
      }
      setGeneralError(result.error || 'Failed to register account');
    }
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto py-12">
        <Card
          title="Create your account"
          subtitle="Get started with your hackathon workspace"
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
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              required
            />

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="new-password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-surface-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 underline">
              Sign in instead
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
