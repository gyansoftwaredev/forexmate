"use client";

import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { OrderWizard } from '@/components/orders/OrderWizard';
import { Send, ShieldCheck, Zap } from 'lucide-react';

export default function RemittancePage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 flex flex-col relative bg-[#071426] overflow-x-hidden">
      
      {/* Background Travel Image Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(7, 20, 38, 0.85) 0%, rgba(13, 27, 42, 0.70) 50%, rgba(7, 20, 38, 0.95) 100%), url('/full_travel_bg.png')` 
        }}
      />

      <Navbar />

      {/* Hero Header Section */}
      <section className="relative z-10 text-white pt-10 pb-6 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
            Send Money Abroad <span className="text-amber-400 font-extrabold">Paperless Wire</span>
          </h1>
          <p className="text-slate-200 max-w-2xl mx-auto text-sm md:text-base font-medium drop-shadow-xs">
            Transfer funds internationally for university tuition, medical expenses, or family support at live interbank rates.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-100 pt-2">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
              <Send className="w-3.5 h-3.5 text-blue-400" /> Same-Day SWIFT Wire MT103
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Lowest Transfer Charges
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% RBI LRS Compliant
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Full Remittance Order Engine */}
      <main className="flex-grow px-4 md:px-6 relative pb-16">
        <div className="max-w-4xl mx-auto text-left shadow-2xl rounded-3xl overflow-visible bg-white border border-white/20 ring-1 ring-black/10">
          <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500">Loading Remittance Engine...</div>}>
            <OrderWizard />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
