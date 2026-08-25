"use client";

import React, { useState, useEffect } from 'react';
import { useRates } from '@/hooks/useRates';
import { Sparkles, X, Lock, ArrowUpRight } from 'lucide-react';
import { getCurrencyFlag } from '@/lib/currencyMetadata';

const DEFAULT_RATES = [
  { currency: 'USD', name: 'US Dollar', rate: 83.45, flag: '🇺🇸' },
  { currency: 'EUR', name: 'Euro', rate: 90.20, flag: '🇪🇺' },
  { currency: 'GBP', name: 'British Pound', rate: 105.85, flag: '🇬🇧' },
  { currency: 'AED', name: 'UAE Dirham', rate: 22.70, flag: '🇦🇪' },
  { currency: 'SGD', name: 'Singapore Dollar', rate: 61.90, flag: '🇸🇬' },
  { currency: 'THB', name: 'Thai Baht', rate: 2.32, flag: '🇹🇭' },
  { currency: 'CAD', name: 'Canadian Dollar', rate: 61.20, flag: '🇨🇦' },
  { currency: 'AUD', name: 'Australian Dollar', rate: 54.80, flag: '🇦🇺' },
];

export default function RatesRibbon() {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data } = useRates();

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const apiRates = data
        .filter((item: any) => item.currency?.code !== 'INR' && item.currency !== 'INR')
        .map((item: any) => {
          const code = item.currency?.code || item.currency || 'USD';
          return {
            currency: code,
            name: item.currency?.name || code,
            rate: item.inrRate || item.rate || 83.50,
            flag: getCurrencyFlag(code),
          };
        });

      if (apiRates.length > 0) {
        setRates(apiRates);
      }
    }
  }, [data]);

  const topRates = rates.slice(0, 8);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 my-8 font-sans relative">
      
      {/* Live Badge */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-black shadow-xs border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="section-label text-[10px] tracking-widest text-amber-400">Live FX Rates</span>
      </div>

      {/* Infinite Marquee Strip */}
      <div className="flex-1 overflow-hidden relative max-w-[85vw] md:max-w-[70vw]">
        <div className="animate-marquee flex gap-3 py-1">
          {[...topRates, ...topRates].map((item, index) => (
            <div
              key={index}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center border border-slate-200/90 rounded-2xl px-4 py-2 bg-white/95 shadow-2xs hover:border-amber-500 hover:scale-105 transition-all cursor-pointer shrink-0 group text-slate-900"
            >
              <span className="mr-2 text-xl group-hover:scale-110 transition-transform">{item.flag}</span>
              <span className="font-extrabold text-slate-900 text-xs mr-2">{item.currency}</span>
              <span className="font-mono font-black text-amber-700 text-xs bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                ₹{item.rate.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* View All Rates Modal Trigger */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-gold px-4 py-2 rounded-full text-xs font-black shadow-2xs shrink-0 flex items-center gap-1.5"
      >
        <span>40+ Currencies</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>

      {/* 40+ Currencies Rate Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="section-label text-[10px] text-amber-600">Real-Time Foreign Exchange</span>
                <h3 className="text-xl font-display font-bold text-slate-900">All Supported 40+ Currencies</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto scrollbar-thin pr-1">
              {rates.map((curr) => (
                <div
                  key={curr.currency}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 transition-all flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{curr.flag}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900">{curr.currency}</div>
                      <div className="text-[9px] text-slate-500">{curr.name}</div>
                    </div>
                  </div>
                  <div className="font-mono font-black text-xs text-amber-700">
                    ₹{curr.rate.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-gold px-5 py-2 rounded-xl font-black text-xs"
              >
                Close Card
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
