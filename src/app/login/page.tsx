'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, LoginFormData } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // If already logged in, redirect to /dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      loginId: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError(null);
    try {
      const res = await login(data.loginId.trim(), data.password);

      if (res.success) {
        router.replace('/dashboard');
        return;
      }

      if (res.fields) {
        Object.entries(res.fields).forEach(([field, msg]) => {
          if (field === 'loginId' || field === 'password') {
            setError(field, { message: msg });
          }
        });
      }

      const errMsg = res.error || 'Authentication failed. Please verify your credentials.';
      const lower = errMsg.toLowerCase();

      if (lower.includes('login') || lower.includes('user not found') || lower.includes('username')) {
        setError('loginId', { message: errMsg });
      } else if (lower.includes('password')) {
        setError('password', { message: errMsg });
      } else {
        setGeneralError(errMsg);
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'A network error occurred. Please try again.');
    }
  };

  if (!isLoading && user) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#141414] leading-tight">
            Welcome back
          </h1>
          <p className="text-[14px] text-[#6E6E6E] mt-1">
            Sign in to your StockSense account
          </p>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border-[1.5px] border-black flex items-start gap-2.5 text-xs text-[#141414]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#141414]" />
            <span className="font-medium leading-relaxed">{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Login ID"
            placeholder="e.g. inv_admin"
            autoComplete="username"
            error={errors.loginId?.message}
            {...register('loginId')}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-md text-[#6E6E6E] hover:text-[#141414] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-[14.5px] font-semibold tracking-wide"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Links below: "Forgot Password? | Sign Up" */}
        <div className="pt-2 text-center text-[13.5px] text-[#6E6E6E]">
          <Link
            href="/forgot-password"
            className="hover:text-[#141414] underline underline-offset-4 decoration-[#E2E2E2] hover:decoration-black transition-colors"
          >
            Forgot Password?
          </Link>
          <span className="mx-2.5 text-[#A9A9A9]">|</span>
          <Link
            href="/signup"
            className="font-semibold text-[#141414] hover:underline underline-offset-4"
          >
            Sign Up
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-5 p-3 rounded-2xl bg-[#F4F4F4] border border-[#E2E2E2] text-center">
          <p className="text-[11.5px] text-[#6E6E6E] leading-relaxed">
            <span className="font-semibold text-[#141414]">Demo account</span>
            {' — '}Login ID:{' '}
            <code className="font-mono text-[#141414] bg-[#E6E6E6] px-1.5 py-0.5 rounded-md">demo01</code>
            {'  ·  '}Password:{' '}
            <code className="font-mono text-[#141414] bg-[#E6E6E6] px-1.5 py-0.5 rounded-md">Demo@123</code>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
