"use client";

import React, { useEffect, useState } from 'react';
import { getActiveBranches } from '@/lib/api-public';
import { ShieldCheck, Lock, Headphones, Award, Sparkles, Building2 } from 'lucide-react';

export default function TrustSection() {
  const [branchCount, setBranchCount] = useState(5000);

  useEffect(() => {
    getActiveBranches()
      .then(branches => {
        if (Array.isArray(branches) && branches.length > 0) {
          setBranchCount(branches.length);
        }
      })
      .catch(err => console.error("Failed to load branches count:", err));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto my-20 font-sans">
      
      <div className="text-center mb-12">
        <span className="section-label tracking-widest text-amber-600 block mb-1">RBI Regulated Trust</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
          Security, Transparency & <span className="text-amber-600 font-extrabold">Reliability</span>
        </h2>
        <div className="gold-line mx-auto mt-3" />
      </div>

      {/* Top 3 Trust Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
        <div className="glass-card p-6 flex items-start gap-4 bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">RBI-Regulated Platform</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Full FEMA compliance under Reserve Bank of India Category II License with SSL encryption on all KYC data.
            </p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4 bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Live Interbank Lock</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Real-time transaction tracking with 30-minute interbank rate lock protection against market volatility.
            </p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4 bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">24/7 Dedicated Support</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Round-the-clock personal assistance for doorstep delivery tracking, card reloads & remittance support.
            </p>
          </div>
        </div>
      </div>

      {/* Floating stats card */}
      <div 
        className="bg-slate-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between border border-amber-500/30 shadow-2xl relative overflow-hidden text-white group"
        style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.80)), url('/trust_bg.png')` }}
      >
        <div className="md:w-1/2 relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" />
            <span>India&apos;s #1 Authorized Forex Network</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            India&apos;s Most Trusted <span className="text-gold-gradient">Forex Platform</span>
          </h2>

          <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
            Order foreign cash notes, multi-currency cards, and international wire remittances online with same-day doorstep delivery in 150+ cities across India.
          </p>
        </div>

        <div className="md:w-1/2 relative z-10 flex flex-col items-end space-y-3 mt-8 md:mt-0 w-full">
          <div className="bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15 shadow-lg flex items-center self-end hover:border-amber-400 transition-all">
            <span className="text-amber-400 text-2xl mr-3">🔄</span>
            <span className="text-base font-black text-white font-mono">\$1.7+ Billion <span className="text-xs font-normal text-slate-300 ml-1">exchanged</span></span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15 shadow-lg flex items-center self-center hover:border-amber-400 transition-all">
            <span className="text-emerald-400 text-2xl mr-3">👤</span>
            <span className="text-base font-black text-white font-mono">6.5 Lakh+ <span className="text-xs font-normal text-slate-300 ml-1">happy travelers</span></span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15 shadow-lg flex items-center self-start hover:border-amber-400 transition-all">
            <Building2 className="text-amber-400 w-6 h-6 mr-3" />
            <span className="text-base font-black text-white font-mono">{branchCount}+ <span className="text-xs font-normal text-slate-300 ml-1">Live Branches & Vaults</span></span>
          </div>
        </div>

      </div>

    </div>
  );
}
