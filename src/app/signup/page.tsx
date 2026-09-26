'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { signupSchema, SignupFormData } from '@/lib/validation';

export default function SignupPage() {
  const router = useRouter();
  const { user, isLoading, register: registerAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      loginId: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  // 4 live checklist rules
  const rules = [
    { label: 'Min 8 characters', met: passwordValue.length >= 8 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'At least 1 special character', met: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: SignupFormData) => {
    setGeneralError(null);
    try {
      const res = await registerAuth(
        data.loginId.trim(),
        data.email.trim(),
        data.password
      );

      if (res.success) {
        router.replace('/dashboard');
        return;
      }

      if (res.fields) {
        Object.entries(res.fields).forEach(([field, msg]) => {
          if (
            field === 'loginId' ||
            field === 'email' ||
            field === 'password' ||
            field === 'confirmPassword'
          ) {
            setError(field as keyof SignupFormData, { message: msg });
          }
        });
      }

      const errMsg = res.error || 'Registration failed. Please review your details.';
      const lower = errMsg.toLowerCase();

      if (lower.includes('login') || lower.includes('loginid')) {
        setError('loginId', { message: errMsg });
      } else if (lower.includes('email')) {
        setError('email', { message: errMsg });
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
            Create account
          </h1>
          <p className="text-[14px] text-[#6E6E6E] mt-1">
            Set up your StockSense login
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
            placeholder="e.g. inv_admin (6–12 chars)"
            autoComplete="username"
            error={errors.loginId?.message}
            {...register('loginId')}
          />

          <Input
            label="Email ID"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-2">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
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

            {/* Live checklist of 4 rules: black check when met, gray when not */}
            <div className="p-3 rounded-[14px] bg-[#FAFAFA] border border-[#E2E2E2] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      rule.met ? 'bg-black text-white' : 'bg-[#E2E2E2] text-transparent'
                    }`}
                  >
                    <Check className={`w-2.5 h-2.5 ${rule.met ? 'text-white' : 'text-[#A9A9A9]'}`} />
                  </div>
                  <span
                    className={`text-[12px] transition-colors ${
                      rule.met ? 'text-[#141414] font-medium' : 'text-[#6E6E6E]'
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Re-Enter Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 rounded-md text-[#6E6E6E] hover:text-[#141414] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('confirmPassword')}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-[14.5px] font-semibold tracking-wide"
              isLoading={isSubmitting}
            >
              Sign Up
            </Button>
          </div>
        </form>

        <div className="pt-2 text-center text-[13.5px] text-[#6E6E6E]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#141414] hover:underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
