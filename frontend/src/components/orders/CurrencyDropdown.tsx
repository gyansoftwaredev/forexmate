"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check } from 'lucide-react';
import { ALL_CURRENCIES_LIST, getCurrencyInfo } from '@/lib/currencyMetadata';

interface CurrencyDropdownProps {
  value: string;
  onChange: (currencyCode: string) => void;
  ratesData?: any[];
  rateType?: 'buy' | 'sell' | 'remittance' | 'card';
  label?: string;
  className?: string;
  darkMode?: boolean;
  hideRateBadge?: boolean;
}

export function CurrencyDropdown({
  value,
  onChange,
  ratesData,
  rateType = 'buy',
  label = 'Select Currency',
  className = '',
  darkMode = false,
  hideRateBadge = false,
}: CurrencyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [isPositionAbove, setIsPositionAbove] = useState(false);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mount check for portal
  useEffect(() => { setMounted(true); }, []);

  // Calculate dropdown position from trigger button synchronously
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 320 && rect.top > 320;
    const width = Math.max(rect.width, 320);

    let left = Math.max(8, rect.left);
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }

    return {
      top: showAbove ? Math.max(10, rect.top - 330) : rect.bottom + 6,
      left,
      width,
      showAbove,
    };
  }, []);

  const updatePosition = useCallback(() => {
    const pos = calculatePosition();
    if (pos) {
      setDropdownPos({ top: pos.top, left: pos.left, width: pos.width });
      setIsPositionAbove(pos.showAbove);
    }
  }, [calculatePosition]);

  const toggleDropdown = () => {
    if (!isOpen) {
      const pos = calculatePosition();
      if (pos) {
        setDropdownPos({ top: pos.top, left: pos.left, width: pos.width });
        setIsPositionAbove(pos.showAbove);
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Open / close + position
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, updatePosition]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); setSearchQuery(''); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedMeta = getCurrencyInfo(value);

  const getComputedRate = (code: string): number => {
    let baseRate = 83.50;
    if (Array.isArray(ratesData) && ratesData.length > 0) {
      const found = ratesData.find((r: any) => r.currency?.code === code || r.currency === code);
      if (found && (found.inrRate || found.rate)) {
        baseRate = Number(found.inrRate || found.rate);
      }
    }
    if (rateType === 'sell') return Math.round((baseRate - 0.63) * 100) / 100;
    if (rateType === 'remittance') return Math.round((baseRate + 0.10) * 100) / 100;
    return Math.round((baseRate + 0.63) * 100) / 100;
  };

  const currentRate = getComputedRate(value);

  const filteredCurrencies = ALL_CURRENCIES_LIST.filter((curr) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      curr.code.toLowerCase().includes(q) ||
      curr.name.toLowerCase().includes(q) ||
      curr.country.toLowerCase().includes(q)
    );
  });

  // Portal dropdown panel - only rendered when width > 0 to prevent 0,0 top-left flash
  const dropdownPanel = mounted && isOpen && dropdownPos.width > 0 ? createPortal(
    <div
      ref={dropdownRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${dropdownPos.top}px`,
        left: `${dropdownPos.left}px`,
        width: `${dropdownPos.width}px`,
        zIndex: 999999,
        transformOrigin: isPositionAbove ? 'bottom center' : 'top center',
      }}
      className={`rounded-2xl shadow-2xl p-3 border animate-in fade-in zoom-in-95 duration-150 ${
        isPositionAbove ? 'origin-bottom' : 'origin-top'
      } ${
        darkMode
          ? 'bg-[#0e1626] border-white/[0.18] text-white shadow-black/80'
          : 'bg-white border-gray-200/90 text-gray-900 ring-1 ring-black/10'
      }`}
    >
      {/* Search */}
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
              ? 'bg-white/[0.08] border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500'
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

      {/* List */}
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
                onMouseDown={(e) => e.stopPropagation()}
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
                        isSelected ? 'text-slate-900' : darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        - {curr.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2 flex items-center gap-2">
                  <div className="font-mono font-extrabold text-xs">₹{rate.toFixed(2)}</div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={`pt-2 mt-1.5 border-t flex items-center justify-between text-[10px] px-1 font-bold ${
        darkMode ? 'border-white/10 text-slate-400' : 'border-gray-100 text-gray-400'
      }`}>
        <span>40+ Currencies Available</span>
        <span>Live Interbank Linked</span>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 flex items-center justify-between ${
          darkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
          <span>{label}</span>
          {!hideRateBadge && (
            <span className={`text-[10px] font-bold normal-case px-2 py-0.5 rounded-full border ${
              darkMode
                ? 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}>
              {rateType === 'sell' ? 'Buyback Rate' : 'Live Rate'}: ₹{currentRate.toFixed(2)}
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        className={`w-full border rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer text-left ${
          darkMode
            ? isOpen
              ? 'bg-white/[0.08] backdrop-blur-sm border-cyan-500/70 ring-1 ring-cyan-500/30 text-white'
              : 'bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] border-white/[0.09] hover:border-white/[0.18] text-white'
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

      {dropdownPanel}
    </div>
  );
}
