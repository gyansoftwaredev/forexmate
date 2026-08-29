'use client';

import React from 'react';
import { KycWizard } from '@/components/kyc/KycWizard';
import { KycSidebar } from '@/components/kyc/KycSidebar';
import { useKycDocuments } from '@/features/compliance/hooks/useKyc';
import { Sparkles, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function KycPage() {
  const { data: kycStatus, isLoading } = useKycDocuments();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading statutory KYC profile...</p>
      </div>
    );
  }

  const isApproved = kycStatus?.overallStatus === 'APPROVED' || kycStatus?.overallStatus === 'VERIFIED';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-blue-500/5 border border-amber-200/90 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                RBI LRS Statutory Compliance
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                NSDL & DigiLocker Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
              Customer KYC Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Complete your statutory identity verification to unlock $250,000 USD annual RBI LRS foreign exchange limits.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>256-Bit Encrypted Vault</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isApproved ? (
            <div className="bg-white rounded-3xl border border-emerald-200/90 shadow-2xs p-10 text-center flex flex-col justify-center items-center h-full min-h-[350px]">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-2xs">
                ✅
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">You're Fully Verified!</h2>
              <p className="text-xs text-slate-500 font-medium max-w-md leading-relaxed mb-6">
                Your statutory identity documents have been verified and approved by compliance officers. You have unrestricted access to all foreign exchange products.
              </p>
              <button
                onClick={() => window.location.href = '/buy-forex'}
                className="px-6 py-3.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Book Forex Order</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          ) : (
            <KycWizard documents={kycStatus?.documents || []} />
          )}
        </div>
        <div className="lg:col-span-1">
          <KycSidebar data={kycStatus} />
        </div>
      </div>
    </div>
  );
}
