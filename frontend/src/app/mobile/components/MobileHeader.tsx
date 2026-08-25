"use client";

import React, { useState } from 'react';
import { 
  MapPin, Bell, Headphones, Search, ShieldCheck, ChevronDown, 
  Sparkles, Globe, User, Lock, TrendingUp, SlidersHorizontal, ArrowUpRight, X, CreditCard, ArrowRightLeft, Send, Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileHeaderProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
  onNavigateTab: (tab: any, state?: any) => void;
  unreadNotificationsCount?: number;
}

export function MobileHeader({
  selectedCity,
  onSelectCity,
  onOpenNotifications,
  onOpenSupport,
  onNavigateTab,
  unreadNotificationsCount = 2,
}: MobileHeaderProps) {
  const { user } = useAuth();
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Traveler';

  const cities = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

  const searchItems = [
    { title: 'USD - US Dollar Notes', type: 'CURRENCY', code: 'USD', icon: '🇺🇸' },
    { title: 'EUR - Euro Forex Card', type: 'CARD', code: 'EUR', icon: '🇪🇺' },
    { title: 'GBP - British Pound Remittance', type: 'REMITTANCE', code: 'GBP', icon: '🇬🇧' },
    { title: 'AED - UAE Dirham Notes', type: 'CURRENCY', code: 'AED', icon: '🇦🇪' },
    { title: 'CAD - Canadian Dollar GIC Transfer', type: 'REMITTANCE', code: 'CAD', icon: '🇨🇦' },
    { title: 'SGD - Singapore Dollar Card', type: 'CARD', code: 'SGD', icon: '🇸🇬' },
  ];

  const filteredSearch = searchQuery.trim() 
    ? searchItems.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 pt-3 pb-2.5 sticky top-0 z-40 shadow-xs space-y-2.5">
      
      {/* 1. Top Bar: User Profile & Brand Identity & Action Buttons */}
      <div className="flex items-center justify-between">
        
        {/* Left: User Avatar & Welcome */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 p-[2px] shadow-sm">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-black text-amber-400 text-xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'B'}
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="w-1 h-1 bg-white rounded-full animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                Forex<span className="text-amber-600">Mate</span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            </div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <span>Hi, {displayName} 👋</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">RBI FFMC</span>
            </div>
          </div>
        </div>

        {/* Right Actions: City Selector, Support, Notifications */}
        <div className="flex items-center gap-1.5">
          
          {/* City Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 hover:border-amber-500/60 text-slate-800 transition-all active:scale-95 shadow-2xs"
            >
              <MapPin className="w-3 h-3 text-amber-600" />
              <span className="text-[11px] font-black text-slate-900 max-w-[70px] truncate">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* City Dropdown Modal */}
            {showCityDropdown && (
              <div className="absolute right-0 top-10 w-44 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[9px] font-black text-slate-400 px-3 py-1 uppercase tracking-wider">Delivery Location</div>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedCity === city
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="text-slate-950 font-black">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Support */}
          <button
            onClick={onOpenSupport}
            className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
            title="Customer Support & Chat"
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

        </div>
      </div>

      {/* 2. Integrated Interactive Search Bar */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 40+ currencies (e.g. USD, EUR, Forex Card)..."
          className="w-full bg-slate-100/90 text-slate-900 font-bold text-xs rounded-2xl pl-9 pr-8 py-2 border border-slate-200/80 focus:outline-none focus:border-amber-500 focus:bg-white placeholder:text-slate-400 transition-all shadow-inner"
        />
        {searchQuery ? (
          <button onClick={() => setSearchQuery('')} className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Live Search Results Popup */}
        {filteredSearch.length > 0 && (
          <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
            <div className="text-[9px] font-black text-slate-400 px-2 py-0.5 uppercase tracking-wider">Quick Currency Results</div>
            {filteredSearch.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery('');
                  onNavigateTab('exchange', { currency: item.code });
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-100 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-900">{item.title}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Live Rate Ticker Ribbon */}
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 bg-slate-100/90 rounded-xl px-3 py-1.5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 text-emerald-700 font-extrabold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ZERO MARGIN LIVE:</span>
        </div>

        {/* Currency Rates Carousel */}
        <div className="flex items-center gap-3 font-mono font-bold text-slate-900 overflow-x-auto scrollbar-none px-2">
          <span className="flex items-center gap-1">
            🇺🇸 USD <span className="text-amber-600 font-black">₹83.45</span>
            <span className="text-[9px] text-emerald-600 font-extrabold">▲</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            🇪🇺 EUR <span className="text-amber-600 font-black">₹90.20</span>
            <span className="text-[9px] text-red-500 font-extrabold">▼</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            🇬🇧 GBP <span className="text-amber-600 font-black">₹105.85</span>
            <span className="text-[9px] text-emerald-600 font-extrabold">▲</span>
          </span>
        </div>

        {/* Rate Lock Badge */}
        <button
          onClick={() => onNavigateTab('exchange')}
          className="text-[9px] font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 shrink-0 hover:bg-amber-100 active:scale-95"
        >
          <Lock className="w-2.5 h-2.5 text-amber-600" />
          Lock
        </button>
      </div>

    </header>
  );
}
