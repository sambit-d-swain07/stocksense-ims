'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Package2, LogOut, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-xl border border-white/80 rounded-[32px] p-8 text-center shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6E6E6E]">Verifying session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-[800px] bg-white/60 backdrop-blur-xl border border-white/80 rounded-[32px] p-8 sm:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#E2E2E2]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center shadow-sm">
              <Package2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#141414]">
                Hi, {user.loginId}!
              </h1>
              <p className="text-xs text-[#6E6E6E]">
                Authenticated StockSense Session
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="highlight">
            <span className="text-[11px] uppercase tracking-wider text-[#A9A9A9] font-medium block">
              Active User
            </span>
            <span className="text-xl font-bold text-white block mt-1">
              {user.loginId}
            </span>
            <span className="text-xs text-[#A9A9A9] block mt-0.5">
              {user.email}
            </span>
          </Card>

          <Card variant="default">
            <span className="text-[11px] uppercase tracking-wider text-[#6E6E6E] font-medium block">
              Session Role
            </span>
            <span className="text-xl font-bold text-[#141414] block mt-1">
              {user.role || 'MANAGER'}
            </span>
            <span className="text-xs text-[#6E6E6E] block mt-0.5">
              Ready for Step 2: Full App Layout + Dashboard KPIs
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}
