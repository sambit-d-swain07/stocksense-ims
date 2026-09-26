'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Package2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Fast check: if auth state is determined
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
      return;
    }

    // Safety fallback: max 1 second on the splash card, then redirect accordingly
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [mounted, user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none">
      <div className="w-full max-w-[460px] bg-white/70 backdrop-blur-xl border border-white/80 rounded-[32px] p-8 sm:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.06)] text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Package2 className="w-8 h-8 text-white" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#141414] tracking-wide mb-3">
          STOCKSENSE IMS
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-[#141414]">
          StockSense
        </h1>
        <p className="mt-1 text-xs text-[#6E6E6E]">
          Inventory Management System
        </p>

        <div className="mt-8 flex items-center justify-center gap-2.5 text-xs text-[#6E6E6E]">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>Checking session state...</span>
        </div>
      </div>
    </div>
  );
}
