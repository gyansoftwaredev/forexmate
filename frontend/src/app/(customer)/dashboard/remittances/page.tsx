'use client';

import React from 'react';
import { useMyRemittances } from '@/features/remittance/hooks/useRemittance';
import { RemittanceList } from '@/features/remittance/components/RemittanceList';
import { Sparkles, ShieldCheck, Send, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RemittancesPage() {
  const router = useRouter();
  const { data: remittances, isLoading, error } = useMyRemittances();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading outward wire transfers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-xs font-bold text-center">
        Failed to load remittances. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-blue-500/5 border border-amber-200/90 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                RBI LRS Outward Wire Gateway
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                SWIFT / IBAN Real-Time Tracking
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
              International Wire Transfers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Track statutory outward remittances for university fees, family maintenance, and international business wires.
            </p>
          </div>

          <button
            onClick={() => router.push('/remittance')}
            className="px-5 py-3.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>Send Money Abroad</span>
          </button>
        </div>
      </div>

      <RemittanceList remittances={remittances ?? []} />
    </div>
  );
}
