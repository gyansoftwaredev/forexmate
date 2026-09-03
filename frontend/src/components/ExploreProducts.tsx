"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Banknote, CreditCard, Send, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function ExploreProducts() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="w-full max-w-6xl mx-auto my-20 font-sans">
      
      {/* Travel Destinations Banner Background */}
      <div 
        className="w-full rounded-3xl p-8 md:p-12 mb-16 text-white bg-cover bg-center relative overflow-hidden shadow-2xl border border-white/20 group transition-all duration-500 hover:shadow-amber-500/10"
        style={{ backgroundImage: `linear-gradient(to right, rgba(7, 20, 38, 0.92), rgba(7, 20, 38, 0.70)), url('/destinations_bg.png')` }}
      >
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="section-label bg-amber-500/20 backdrop-blur-md text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block border border-amber-500/30">
            ✈️ Global Destination Coverage
          </span>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight text-white">
            Exchange Foreign Currency for <span className="text-gold-gradient">65+ Countries</span> Worldwide
          </h2>
          
          <p className="text-slate-200 text-xs md:text-sm font-medium leading-relaxed">
            Get instant multi-currency cards & genuine cash delivered same-day before your international flight. Zero markup interbank rates guaranteed.
          </p>

          <div className="pt-2">
            <Link 
              href="/buy-forex" 
              className="btn-gold px-6 py-3 rounded-xl font-black text-xs shadow-xl flex items-center gap-2 inline-flex"
            >
              <span>Order Forex Now</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Offers Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <span className="section-label text-amber-600 block mb-1">Curated Forex Products</span>
          <h2 className="font-display text-3xl font-bold text-slate-900">Explore Cards, Cash & Wire Remittance</h2>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            All Products
          </button>

          <button 
            onClick={() => setFilter('card')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'card' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Forex Card
          </button>

          <button 
            onClick={() => setFilter('notes')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'notes' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Currency Notes
          </button>
        </div>
      </div>

      {/* 3 Core Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Notes */}
        <div className="glass-card overflow-hidden flex flex-col justify-between group bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400">
          <div>
            <div className="h-48 w-full bg-gradient-to-br from-amber-500/10 via-slate-100 to-amber-50/20 relative overflow-hidden flex justify-center items-center">
              <div className="w-44 h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 shadow-2xl flex items-center justify-center text-slate-950 font-black text-lg border border-amber-300 group-hover:scale-105 transition-transform">
                💵 Currency Notes
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                Foreign Currency Cash
              </h3>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  40+ major currencies in stock
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  RBI Category II verified genuine notes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Doorstep delivery & pay on delivery
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 pt-0">
            <Link 
              href="/buy-forex" 
              className="w-full bg-slate-900 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Order Cash Notes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Multi Currency Card */}
        <div className="glass-card overflow-hidden flex flex-col justify-between group bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400">
          <div>
            <div className="h-48 w-full bg-gradient-to-br from-purple-500/10 via-slate-100 to-indigo-50/20 relative overflow-hidden flex justify-center items-center">
              <div className="w-48 h-28 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-800 to-slate-900 shadow-2xl flex flex-col justify-between p-3 border border-purple-400/30 group-hover:scale-105 transition-transform text-white">
                <div className="text-[10px] font-black tracking-widest text-amber-400">FOREXMATE PLATINUM</div>
                <div className="text-xs font-mono font-bold">4829 •••• •••• 9812</div>
                <div className="flex justify-between text-[9px] text-slate-300 font-bold">
                  <span>ZERO MARKUP</span>
                  <span>VISA</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                Prepaid Travel Forex Card
              </h3>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Load up to 15 currencies on 1 card
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Zero foreign ATM transaction fee
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Free emergency replacement abroad
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 pt-0">
            <Link 
              href="/forex-cards" 
              className="w-full bg-slate-900 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Get Forex Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 3: Outward Remittance */}
        <div className="glass-card overflow-hidden flex flex-col justify-between group bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400">
          <div>
            <div className="h-48 w-full bg-gradient-to-br from-blue-500/10 via-slate-100 to-sky-50/20 relative overflow-hidden flex justify-center items-center">
              <div className="w-44 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-800 shadow-2xl flex items-center justify-center text-white font-black text-lg border border-blue-300/40 group-hover:scale-105 transition-transform">
                ✈️ Outward Wire
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                Outward International Remittance
              </h3>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  University tuition & living expenses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  100% RBI LRS \$250k compliance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Same-day SWIFT wire dispatch
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 pt-0">
            <Link 
              href="/remittance" 
              className="w-full bg-slate-900 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Send Money Abroad</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
