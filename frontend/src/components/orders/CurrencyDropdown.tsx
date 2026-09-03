"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Sparkles } from 'lucide-react';
import { ALL_CURRENCIES_LIST, getCurrencyInfo } from '@/lib/currencyMetadata';

interface CurrencyDropdownProps {
  value: string;
  onChange: (currencyCode: string) => void;
  ratesData?: any[];
  rateType?: 'buy' | 'sell' | 'remittance' | 'card';
  label?: string;
  className?: string;
  darkMode?: boolean;
}

export function CurrencyDropdown({
  value,
  onChange,
  ratesData,
  rateType = 'buy',
  label = 'Select Currency',
  className = '',
  darkMode = false,
}: CurrencyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedMeta = getCurrencyInfo(value);

  // Helper to compute rate for any currency
  const getComputedRate = (code: string): number => {
    let baseRate = 83.50;
    if (Array.isArray(ratesData) && ratesData.length > 0) {
      const found = ratesData.find((r: any) => r.currency?.code === code || r.currency === code);
      if (found && (found.inrRate || found.rate)) {
        baseRate = Number(found.inrRate || found.rate);
      }
    }

    if (rateType === 'buy') return Math.round((baseRate + 0.63) * 100) / 100;
    if (rateType === 'sell') return Math.round((baseRate - 0.63) * 100) / 100;
    if (rateType === 'remittance') return Math.round((baseRate + 0.10) * 100) / 100;
    return Math.round(baseRate * 100) / 100;
  };

  const currentRate = getComputedRate(value);

  // Filter currencies based on search query
  const filteredCurrencies = ALL_CURRENCIES_LIST.filter((curr) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      curr.code.toLowerCase().includes(q) ||
      curr.name.toLowerCase().includes(q) ||
      curr.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`relative ${isOpen ? 'z-[120]' : 'z-10'} ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 flex items-center justify-between ${
          darkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
          <span>{label}</span>
          <span className={`text-[10px] font-bold normal-case px-2 py-0.5 rounded-full border ${
            darkMode 
              ? 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' 
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}>
            {rateType === 'sell' ? 'Buyback Rate' : 'Live Rate'}: ₹{currentRate.toFixed(2)}
          </span>
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer shadow-2xs text-left ${
          darkMode
            ? isOpen 
              ? 'bg-[#151e2e]/90 border-cyan-500/70 ring-1 ring-cyan-500/30 text-white' 
              : 'bg-[#101724]/75 hover:bg-[#151e2e]/85 border-white/[0.09] hover:border-white/[0.18] text-white'
            : isOpen
              ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-md text-gray-900'
              : 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-xs text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0 select-none">{selectedMeta.flag}</span>
          <div className="min-w-0">
            <div className={`text-sm font-black flex items-center gap-1.5 truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span>{selectedMeta.code}</span>
              <span className={`text-xs font-semibold truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>• {selectedMeta.name}</span>
            </div>
            <div className={`text-[11px] font-extrabold flex items-center gap-1 ${darkMode ? 'text-cyan-400' : 'text-amber-700'}`}>
              <span>1 {selectedMeta.code} = ₹{currentRate.toFixed(2)} INR</span>
            </div>
          </div>
        </div>

        <div className={`p-1.5 rounded-lg border transition-transform duration-200 shrink-0 ml-2 ${
          darkMode 
            ? isOpen ? 'rotate-180 text-cyan-400 bg-cyan-950/60 border-cyan-500/40' : 'text-slate-400 bg-white/[0.06] border-white/[0.08]'
            : isOpen ? 'rotate-180 text-amber-600 bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 text-gray-400'
        }`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Luxury Custom Popover Dropdown */}
      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl z-[150] p-3 animate-in fade-in zoom-in-95 duration-150 border ${
          darkMode 
            ? 'bg-[#0d131f]/95 backdrop-blur-2xl border-white/[0.12] text-white ring-1 ring-black/40' 
            : 'bg-white border-gray-200/90 text-gray-900 ring-1 ring-black/10'
        }`}>
          
          {/* Search Header */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ currencies (e.g. USD, EUR, GBP)..."
              className={`w-full rounded-xl py-2 pl-9 pr-3 text-xs font-bold transition-all border ${
                darkMode
                  ? 'bg-slate-800/80 border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Currencies Scroll List */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1 pr-1">
            {filteredCurrencies.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">
                No currencies found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCurrencies.map((curr) => {
                const isSelected = curr.code === value;
                const rate = getComputedRate(curr.code);

                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      onChange(curr.code);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : darkMode
                          ? 'hover:bg-white/10 text-slate-200'
                          : 'hover:bg-amber-50/70 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0 select-none">{curr.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black truncate flex items-center gap-1.5">
                          <span>{curr.code}</span>
                          <span className={`text-[11px] truncate font-normal ${
                            isSelected 
                              ? 'text-slate-900' 
                              : darkMode 
                                ? 'text-slate-400' 
                                : 'text-gray-500'
                          }`}>
                            - {curr.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2 flex items-center gap-2">
                      <div className="font-mono font-extrabold text-xs">
                        ₹{rate.toFixed(2)}
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Footer Info */}
          <div className={`pt-2 mt-1.5 border-t flex items-center justify-between text-[10px] px-1 font-bold ${
            darkMode ? 'border-white/10 text-slate-400' : 'border-gray-100 text-gray-400'
          }`}>
            <span>40+ Currencies Available</span>
            <span>Live Interbank Linked</span>
          </div>
        </div>
      )}
    </div>
  );
}
