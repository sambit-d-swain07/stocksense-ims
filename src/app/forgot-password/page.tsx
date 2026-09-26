'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loginIdOrEmail, setLoginIdOrEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdOrEmail.trim()) return;
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#141414]">
            Reset Password
          </h1>
          <p className="text-[14px] text-[#6E6E6E] mt-1">
            Enter your Login ID or registered Email to receive a recovery link.
          </p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-[20px] bg-[#FAFAFA] border border-[#E2E2E2] text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#141414] mx-auto" />
            <h3 className="text-base font-bold text-[#141414]">Recovery instructions sent</h3>
            <p className="text-xs text-[#6E6E6E] max-w-xs mx-auto">
              If an account matching <strong className="text-[#141414]">{loginIdOrEmail}</strong> exists, password reset details have been dispatched.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="primary" size="md" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Login ID or Email ID"
              placeholder="e.g. inv_admin or user@company.com"
              value={loginIdOrEmail}
              onChange={(e) => setLoginIdOrEmail(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-[14.5px] font-semibold tracking-wide"
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center text-[13.5px] text-[#6E6E6E]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-[#141414] hover:underline underline-offset-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
