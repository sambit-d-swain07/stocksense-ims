'use client';

import React from 'react';
import { Package2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Frosted glass frame: rgba(255,255,255,0.45), backdrop blur, radius 32px */}
      <div className="w-full max-w-[1080px] min-h-[640px] bg-white/45 backdrop-blur-xl border border-white/80 rounded-[32px] p-3 sm:p-4 shadow-[0_16px_50px_rgba(0,0,0,0.06)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left (~45%): dark #1C1C1C panel, radius 24px, subtle grid lines */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#1C1C1C] text-white rounded-[24px] p-9 flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle grid lines background */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Logo mark + STOCKSENSE + Inventory Management System */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#1C1C1C] flex items-center justify-center font-extrabold shadow-sm">
              <Package2 className="w-5 h-5 text-[#1C1C1C]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                STOCKSENSE
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[#A9A9A9] mt-1 block">
                Inventory Management System
              </span>
            </div>
          </div>

          {/* Headline "Know your stock." with a gray second line "Move smarter." + 4-tile snapshot */}
          <div className="relative z-10 my-8">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Know your stock. <br />
              <span className="text-[#A9A9A9] font-normal">Move smarter.</span>
            </h2>

            {/* Minimal 4-tile inventory snapshot: Products, Warehouses, Units in stock, Movements */}
            <div className="grid grid-cols-2 gap-3 mt-7">
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <span className="text-[11px] uppercase tracking-wider text-[#A9A9A9] font-medium block">
                  Products
                </span>
                <span className="text-xl font-bold text-white tracking-tight block mt-1 tabular-nums">
                  1,480
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <span className="text-[11px] uppercase tracking-wider text-[#A9A9A9] font-medium block">
                  Warehouses
                </span>
                <span className="text-xl font-bold text-white tracking-tight block mt-1 tabular-nums">
                  2 Hubs
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <span className="text-[11px] uppercase tracking-wider text-[#A9A9A9] font-medium block">
                  Units in stock
                </span>
                <span className="text-xl font-bold text-white tracking-tight block mt-1 tabular-nums">
                  84,210
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <span className="text-[11px] uppercase tracking-wider text-[#A9A9A9] font-medium block">
                  Movements
                </span>
                <span className="text-xl font-bold text-white tracking-tight block mt-1 tabular-nums">
                  142 today
                </span>
              </div>
            </div>
          </div>

          {/* Footer: "Inventory visibility, simplified." */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-[#A9A9A9]">
            <span>Inventory visibility, simplified.</span>
          </div>
        </div>

        {/* Right (~55%): white panel, form max-width 420px, vertically centred */}
        <div className="lg:col-span-7 bg-white rounded-[24px] lg:rounded-l-none lg:rounded-r-[24px] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center">
          {/* Mobile small logo above the form */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center font-bold mb-2 shadow-sm">
              <Package2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#141414]">
              STOCKSENSE
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase text-[#6E6E6E]">
              Inventory Management System
            </span>
          </div>

          <div className="w-full max-w-[420px] mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
