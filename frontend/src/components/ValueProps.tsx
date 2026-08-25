"use client";

import React from 'react';
import { Zap, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ValueProps() {
  return (
    <div className="w-full max-w-6xl mx-auto my-16 font-sans">
      
      <div className="text-center mb-10">
        <span className="section-label tracking-widest text-amber-500 block mb-1">Unmatched Luxury Standards</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
          Why Travelers Choose <span className="text-gold-gradient">ForexMate</span>
        </h2>
        <div className="gold-line mx-auto mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="glass-card p-7 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg shadow-amber-500/20 mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-slate-950" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
              Zero Margin Live Interbank Rates
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Transparent live interbank exchange rates with 0% margin guaranteed. Zero hidden bank markup fees.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-amber-600">
            <span>Interbank Rate Lock Guarantee</span>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="glass-card p-7 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center text-xl font-black shadow-lg mb-5 group-hover:scale-110 transition-transform border border-white/10">
              <Truck className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
              2-Hour Same-Day Doorstep Express
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Guaranteed doorstep cash & travel card delivery across 150+ major Indian cities with live agent tracking.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-amber-600">
            <span>150+ Cities Covered</span>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="glass-card p-7 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-emerald-500/20 mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
              100% RBI Authorized Security
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Full Reserve Bank of India (RBI) Category II License compliance. Guaranteed genuine currency notes & verified card security.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-600">
            <span>RBI FFMC Compliant</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
}
