"use client";

import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { OrderWizard } from '@/components/orders/OrderWizard';
import { Send, ShieldCheck, Globe } from 'lucide-react';

export default function TransferMoneyPage() {
  return (
    <div className="min-h-screen font-sans text-slate-100 flex flex-col relative bg-[#070a10] overflow-x-hidden">
      
      {/* Background Travel Image with Neutral Smoked Twilight Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 16, 0.45) 0%, rgba(9, 13, 22, 0.55) 50%, rgba(7, 10, 16, 0.80) 100%), url('/full_travel_bg.png')` 
        }}
      />

      <Navbar />

      {/* Embedded Full Remittance Order Engine (Full Width Dashboard) */}
      <main className="flex-grow px-2 sm:px-4 lg:px-8 relative pb-16 pt-2">
        <div className="max-w-[1700px] mx-auto text-left overflow-visible w-full">
          <Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">Loading Order Engine...</div>}>
            <OrderWizard />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
