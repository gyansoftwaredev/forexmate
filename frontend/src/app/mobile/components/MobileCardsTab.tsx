"use client";

import React, { useState } from 'react';
import {
  CreditCard, Lock, Unlock, Zap, Shield, Sliders,
  RefreshCw, CheckCircle2, ChevronRight, AlertTriangle, Eye, EyeOff, X, Sparkles, KeyRound, ArrowDownLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileCardsTabProps {
  onReloadCard: () => void;
}

export function MobileCardsTab({ onReloadCard }: MobileCardsTabProps) {
  const { user } = useAuth();
  const [isFrozen, setIsFrozen] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showVirtualCardModal, setShowVirtualCardModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const balances = [
    { currency: 'USD', symbol: '$', amount: 3500.00, flag: '🇺🇸' },
    { currency: 'EUR', symbol: '€', amount: 1200.00, flag: '🇪🇺' },
    { currency: 'GBP', symbol: '£', amount: 850.00, flag: '🇬🇧' },
    { currency: 'AED', symbol: 'AED ', amount: 4000.00, flag: '🇦🇪' },
  ];

  const transactions = [
    { id: '1', merchant: 'Starbucks NYC Times Square', category: 'Food & Dining', currency: '$', amount: '14.50', time: 'Today, 02:15 PM' },
    { id: '2', merchant: 'Uber Trip London UK', category: 'Transport', currency: '£', amount: '22.80', time: 'Yesterday, 08:30 PM' },
    { id: '3', merchant: 'Hotel Marriott Paris Opera', category: 'Lodging', currency: '€', amount: '240.00', time: '20 Aug 2026' },
  ];

  const handleResetPin = () => {
    if (!newPin || newPin.length !== 4) return;
    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setShowPinModal(false);
      setNewPin('');
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24 scrollbar-none bg-slate-50">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">ForexMate Travel Card</h2>
          <p className="text-[11px] text-slate-500 font-medium">Zero foreign markup multi-currency card</p>
        </div>
        <button
          onClick={() => setIsFrozen(!isFrozen)}
          className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 border transition-all ${isFrozen
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
        >
          {isFrozen ? (
            <>
              <Lock className="w-3 h-3 text-rose-600" />
              <span>Card Locked</span>
            </>
          ) : (
            <>
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>Active</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Physical/Virtual Card Viewport */}
      <div className="relative h-52 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-700 p-5 shadow-xl text-white overflow-hidden flex flex-col justify-between group">
        {/* Gold metallic background shapes */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-amber-500/20 to-amber-700/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
              BM
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest uppercase text-amber-400">ForexMate Platinum</div>
              <div className="text-[9px] text-slate-400 font-semibold">Zero Markup Card</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md border border-amber-300 shadow-inner flex items-center justify-center">
              <div className="w-5 h-3 border-t border-b border-amber-600/50" />
            </div>
          </div>
        </div>

        {/* Card Number & Mask Toggle */}
        <div className="relative z-10 my-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="text-[9px] uppercase tracking-wider font-semibold">Card Number</span>
            <button
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 font-bold"
            >
              {showCardNumber ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showCardNumber ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <div className="text-base font-mono font-bold tracking-widest text-white">
            {showCardNumber ? '4829 7401 9821 9812' : '4829 •••• •••• 9812'}
          </div>
        </div>

        {/* Card Footer Row */}
        <div className="flex items-end justify-between relative z-10">
          <div>
            <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Cardholder</div>
            <div className="text-xs font-extrabold text-slate-200 uppercase tracking-tight">
              {user?.fullName || 'Alex Harrison'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Expires</div>
              <div className="text-xs font-mono font-bold text-slate-200">08/29</div>
            </div>

            <div className="flex items-center -space-x-2">
              <div className="w-6 h-6 rounded-full bg-red-500/90 shadow-md" />
              <div className="w-6 h-6 rounded-full bg-amber-500/90 shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Quick Action Grid (4 Actions) */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onReloadCard}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 text-center space-y-1 shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-[10px] font-black text-slate-900">Top Up</div>
        </button>

        <button
          onClick={() => setShowVirtualCardModal(true)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 text-center space-y-1 shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-[10px] font-black text-slate-900">Virtual Card</div>
        </button>

        <button
          onClick={() => setShowPinModal(true)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 text-center space-y-1 shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-4 h-4" />
          </div>
          <div className="text-[10px] font-black text-slate-900">Set PIN</div>
        </button>

        <button
          onClick={() => setIsFrozen(!isFrozen)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 text-center space-y-1 shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            {isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className="text-[10px] font-black text-slate-900">{isFrozen ? 'Unlock' : 'Freeze'}</div>
        </button>
      </div>

      {/* Currency Balances Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Loaded Currency Wallets</h3>

        <div className="grid grid-cols-2 gap-2.5">
          {balances.map((b) => (
            <div
              key={b.currency}
              onClick={() => setSelectedCurrency(b.currency)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedCurrency === b.currency
                  ? 'bg-white border-amber-500 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{b.flag}</span>
                <span className="text-[10px] font-black text-slate-500">{b.currency}</span>
              </div>
              <div className="text-sm font-black text-slate-900">
                {b.symbol}{b.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Card Activity Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Recent Card Transactions</h3>
          <span className="text-[10px] text-amber-600 font-extrabold">See all</span>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{tx.merchant}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{tx.time} • {tx.category}</div>
                </div>
              </div>

              <div className="text-xs font-black text-slate-900">
                -{tx.currency}{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Disposable Card Modal */}
      {showVirtualCardModal && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Virtual Disposable Card</h3>
              <button onClick={() => setShowVirtualCardModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-44 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-4 flex flex-col justify-between text-left shadow-lg">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>ForexMate Virtual</span>
                <span className="bg-purple-500/30 px-2 py-0.5 rounded text-[10px]">Disposable</span>
              </div>
              <div className="font-mono text-sm tracking-widest">5412 •••• •••• 3918</div>
              <div className="flex justify-between text-[10px]">
                <span>EXP: 12/28</span>
                <span>CVV: 841</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">Card automatically destroys after single online purchase for maximum security</p>
            <button onClick={() => setShowVirtualCardModal(false)} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl">
              Done
            </button>
          </div>
        </div>
      )}

      {/* PIN Reset Modal */}
      {showPinModal && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Set 4-Digit ATM PIN</h3>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinSuccess ? (
              <div className="py-4 bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl">
                ✓ ATM PIN Updated Successfully!
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter 4-Digit PIN"
                  className="w-full text-center tracking-widest font-mono text-xl py-2 bg-slate-100 rounded-xl border border-slate-200"
                />
                <button
                  onClick={handleResetPin}
                  disabled={newPin.length !== 4}
                  className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl disabled:opacity-50"
                >
                  Update ATM PIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
