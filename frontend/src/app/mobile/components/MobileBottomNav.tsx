"use client";

import React from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, ShoppingBag, User 
} from 'lucide-react';

export type MobileTabType = 'home' | 'exchange' | 'cards' | 'orders' | 'profile';

interface MobileBottomNavProps {
  activeTab: MobileTabType;
  onChangeTab: (tab: MobileTabType) => void;
  activeOrdersCount?: number;
}

export function MobileBottomNav({
  activeTab,
  onChangeTab,
  activeOrdersCount = 0,
}: MobileBottomNavProps) {
  const tabs: { id: MobileTabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'exchange', label: 'Exchange', icon: ArrowRightLeft },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 px-3 py-2 flex items-center justify-around sticky bottom-0 z-40 select-none shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all duration-200 ${
              isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {/* Active glow indicator pill background */}
            {isActive && (
              <div className="absolute inset-0 bg-amber-500/10 border border-amber-500/30 rounded-2xl transition-all duration-300" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-amber-600' : ''}`} />
              
              {/* Badge for active orders */}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {tab.badge}
                </span>
              ) : null}
            </div>

            <span className={`text-[11px] font-extrabold mt-1 tracking-tight ${isActive ? 'text-amber-600' : 'text-slate-500'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
