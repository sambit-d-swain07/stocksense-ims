'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!identifier.trim()) {
      setError('Please enter your Login ID or Email Address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginIdOrEmail: identifier.trim() }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setError(json.error?.message || 'Failed to send OTP');
        return;
      }

      setMessage(json.data.message);
      setMaskedEmail(json.data.email);
      setOtpInfo(json.data.otpDeliveryInfo);
      setStep('VERIFY');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Network error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, and a special character');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginIdOrEmail: identifier.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setError(json.error?.message || 'Password reset failed');
        return;
      }

      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Network error');
    }
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">
              S
            </div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Password Reset
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {step === 'REQUEST' ? 'Step 1: Request verification code' : 'Step 2: Enter OTP & New Password'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 text-center">
              {message}
              {otpInfo && <p className="text-[10px] text-zinc-500 mt-1">{otpInfo}</p>}
            </div>
          )}

          {step === 'REQUEST' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                  Login ID or Email Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. manager10 or user@stocksense.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg py-2.5 text-xs font-semibold transition-colors mt-2"
              >
                {isSubmitting ? 'Sending Code...' : 'Send OTP Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-700">
                OTP sent for: <span className="font-mono font-semibold text-zinc-900">{maskedEmail || identifier}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono text-center tracking-widest text-base font-bold"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                  New Password (Min 8 chars, A-Z, a-z, special)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                  Confirm New Password
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
                {isSubmitting ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
            Remembered your password?{' '}
            <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
