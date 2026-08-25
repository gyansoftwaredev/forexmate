"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRates } from '@/hooks/useRates';
import { 
  Banknote, TrendingUp, Send, Globe, ChevronDown, Lock, Sparkles, CheckCircle2, ArrowRight, RefreshCw
} from 'lucide-react';
import { CitySelectorModal } from './orders/CitySelectorModal';
import { SameDayDeliveryModal } from './orders/SameDayDeliveryModal';
import { CashbackOfferModal } from './orders/CashbackOfferModal';

import { ALL_CURRENCIES_MAP, ALL_CURRENCIES_LIST, getCurrencyInfo } from '@/lib/currencyMetadata';

const REMITTANCE_PURPOSES = [
  { id: 'EDUCATION', label: '🎓 Overseas Education', tcs: '0.5% TCS over ₹7L' },
  { id: 'FAMILY', label: '👨‍👩‍👧‍👦 Family Maintenance', tcs: '20% TCS over ₹7L' },
  { id: 'MEDICAL', label: '🏥 Medical Treatment', tcs: '5% TCS over ₹7L' },
  { id: 'GIFT', label: '🎁 Gift & Emigration', tcs: '20% TCS over ₹7L' },
];

export default function HeroForm({ defaultTab = 'buy' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'remittance' | 'card'>(defaultTab as any);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [foreignAmount, setForeignAmount] = useState<string>('1000');
  
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isDeliveryPolicyOpen, setIsDeliveryPolicyOpen] = useState(false);
  const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false);

  // Live products configuration status from admin catalog
  const [productsStatus, setProductsStatus] = useState<Record<string, boolean>>({
    CASH: true,
    CASH_SELL: true,
    REMITTANCE: true,
    FOREX_CARD: true,
  });

  // Fulfillment mode for Buy, Sell & Card
  const [fulfillmentMode, setFulfillmentMode] = useState<'DOORSTEP' | 'BRANCH'>('DOORSTEP');

  // Remittance-specific state
  const [remittancePurpose, setRemittancePurpose] = useState<string>('EDUCATION');

  const router = useRouter();
  const { data: apiRatesData } = useRates();

  React.useEffect(() => {
    const fetchPublicProducts = async () => {
      try {
        const res = await fetch('/api/v1/public/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const map: Record<string, boolean> = {};
            data.forEach((p: any) => {
              map[p.code] = p.isActive;
            });
            setProductsStatus(prev => ({ ...prev, ...map }));
          }
        }
      } catch (e) {
        // Fallback to active
      }
    };
    fetchPublicProducts();

    const handleSync = () => fetchPublicProducts();
    if (typeof window !== 'undefined') {
      window.addEventListener('forexmate-sync', handleSync);
      return () => window.removeEventListener('forexmate-sync', handleSync);
    }
  }, []);

  const isBuyActive = productsStatus.CASH !== false;
  const isSellActive = productsStatus.CASH_SELL !== false;
  const isRemittanceActive = productsStatus.REMITTANCE !== false;
  const isCardActive = productsStatus.FOREX_CARD !== false;

  const isCurrentTabActive = 
    activeTab === 'buy' ? isBuyActive :
    activeTab === 'sell' ? isSellActive :
    activeTab === 'remittance' ? isRemittanceActive : isCardActive;

  // Helper to extract base interbank rate from API or fallback
  const getBaseInterbankRate = (code: string): number => {
    if (Array.isArray(apiRatesData) && apiRatesData.length > 0) {
      const found = apiRatesData.find((r: any) => r.currency?.code === code || r.currency === code);
      if (found && (found.inrRate || found.rate)) {
        return Number(found.inrRate || found.rate);
      }
    }
    return ALL_CURRENCIES_MAP[code]?.fallbackRate || 83.50;
  };

  // Calculate product-adjusted rate matching ProductCalculatorStep.tsx EXACTLY
  const baseRate = getBaseInterbankRate(currencyCode);
  let appliedRate = baseRate;
  if (activeTab === 'buy') {
    appliedRate = Math.round((baseRate + 0.63) * 100) / 100; // 83.50 + 0.63 = 84.13
  } else if (activeTab === 'sell') {
    appliedRate = Math.round((baseRate - 0.63) * 100) / 100; // 83.50 - 0.63 = 82.87
  } else if (activeTab === 'remittance') {
    appliedRate = Math.round((baseRate + 0.10) * 100) / 100; // 83.50 + 0.10 = 83.60
  } else if (activeTab === 'card') {
    appliedRate = Math.round(baseRate * 100) / 100; // 83.50
  }

  const selectedCurrMeta = getCurrencyInfo(currencyCode);

  const numForeign = parseFloat(foreignAmount) || 0;
  const computedInr = Math.round(numForeign * appliedRate);

  const bankRate = appliedRate * 1.035;
  const bankTotal = Math.round(numForeign * bankRate);
  const totalSavings = Math.max(0, bankTotal - computedInr);

  const handleActionSubmit = () => {
    if (!isCurrentTabActive) {
      alert('This product is temporarily disabled by administrator.');
      return;
    }

    // Clear any previous completed/stuck session from localStorage
    try {
      if (typeof window !== 'undefined') {
        const rawStorage = localStorage.getItem('forexmate-transaction-storage');
        if (rawStorage) {
          const parsed = JSON.parse(rawStorage);
          if (parsed?.state?.draftState) {
            parsed.state.draftState.checkoutStep = 1;
            parsed.state.draftState.status = 'CREATED';
            localStorage.setItem('forexmate-transaction-storage', JSON.stringify(parsed));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (activeTab === 'buy') {
      router.push(`/buy-forex?tab=buy&currency=${currencyCode}&amount=${foreignAmount}`);
    } else if (activeTab === 'sell') {
      router.push(`/sell-forex?tab=sell&currency=${currencyCode}&amount=${foreignAmount}`);
    } else if (activeTab === 'remittance') {
      router.push(`/remittance?tab=remittance&currency=${currencyCode}&amount=${foreignAmount}`);
    } else if (activeTab === 'card') {
      router.push(`/forex-cards?tab=card&type=card&currency=${currencyCode}&amount=${foreignAmount}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 z-20 relative">
      
      {/* Dynamic Headline Based on Active Tab */}
      <div className="text-center mb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-black tracking-widest uppercase shadow-md backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>
            {activeTab === 'buy' && 'Buy Currency Cash • Doorstep Delivery'}
            {activeTab === 'sell' && 'Sell Foreign Notes • Instant Bank Credit'}
            {activeTab === 'remittance' && 'International SWIFT Wire Transfer'}
            {activeTab === 'card' && 'Prepaid Multi-Currency Travel Card'}
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
          {activeTab === 'buy' && (
            <>Exchange Foreign Currency at <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 font-black drop-shadow">True Zero Margin</span> Rates</>
          )}
          {activeTab === 'sell' && (
            <>Convert Leftover Foreign Cash to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 font-black drop-shadow">INR Instantly</span></>
          )}
          {activeTab === 'remittance' && (
            <>Send Money Abroad via <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 font-black drop-shadow">Paperless SWIFT Wire</span></>
          )}
          {activeTab === 'card' && (
            <>Get Platinum Forex Card with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-amber-300 font-black drop-shadow">Zero ATM Markup</span></>
          )}
        </h1>

        <p className="text-sm md:text-base text-slate-200/95 max-w-2xl mx-auto font-medium drop-shadow-sm leading-relaxed">
          {activeTab === 'buy' && 'Doorstep delivery in 2 hours across 150+ cities. Lock live interbank rates instantly.'}
          {activeTab === 'sell' && 'Highest buyback rates guaranteed. Free doorstep cash pickup or instant branch payout.'}
          {activeTab === 'remittance' && 'University fees, family maintenance & medical transfers to 150+ countries with MT103 proof.'}
          {activeTab === 'card' && 'Load up to 15 currencies on 1 card. Accepted worldwide at 35M+ VISA locations.'}
        </p>
      </div>

      {/* Main Glass Calculator Widget Container */}
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 md:p-7 shadow-2xl shadow-slate-300/60 relative z-30">
        
        {/* Subtle ambient light glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Tab Navigation Bar */}
        <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 mb-4">
          <button
            onClick={() => setActiveTab('buy')}
            className={`py-3 px-3 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'buy'
                ? 'btn-gold shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-bold'
            } ${!isBuyActive ? 'opacity-40 grayscale' : ''}`}
          >
            <Banknote className="w-4 h-4" />
            <span>Buy Forex {!isBuyActive && '(Disabled)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sell')}
            className={`py-3 px-3 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sell'
                ? 'btn-gold shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-bold'
            } ${!isSellActive ? 'opacity-40 grayscale' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sell Forex {!isSellActive && '(Disabled)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('remittance')}
            className={`py-3 px-3 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'remittance'
                ? 'btn-gold shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-bold'
            } ${!isRemittanceActive ? 'opacity-40 grayscale' : ''}`}
          >
            <Send className="w-4 h-4" />
            <span>Send Remittance {!isRemittanceActive && '(Disabled)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`py-3 px-3 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'btn-gold shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-bold'
            } ${!isCardActive ? 'opacity-40 grayscale' : ''}`}
          >
            <Globe className="w-4 h-4" />
            <span>Forex Card {!isCardActive && '(Disabled)'}</span>
          </button>
        </div>

        {/* Top Doorstep Delivery & Cashback Strip inside the Widget Box (BUY TAB ONLY) */}
        {activeTab === 'buy' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 px-4 mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-800 font-medium shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-amber-600">🛵</span>
              <span>Doorstep Delivery by <strong className="text-slate-900">Tomorrow, 9:00 PM in</strong></span>
              <button 
                onClick={() => setIsCityModalOpen(true)}
                className="font-extrabold text-amber-800 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs flex items-center gap-1 hover:bg-amber-50 transition-colors"
              >
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-amber-600" />
              </button>
              <button 
                onClick={() => setIsDeliveryPolicyOpen(true)}
                className="text-sm cursor-pointer hover:scale-110 transition-transform ml-0.5"
                title="Click for Same-Day Delivery Policy"
              >
                👈
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCashbackModalOpen(true)}
              className="flex items-center gap-1 text-emerald-800 font-extrabold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-xl border border-emerald-200 shrink-0 text-[11px] transition-all hover:scale-105 cursor-pointer shadow-2xs"
            >
              <span>Upto ₹7,500 Cashback</span>
              <span className="text-emerald-600 text-[11px] font-black">ⓘ</span>
            </button>
          </div>
        )}

        {/* 2. Main Dynamic Converter Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Field 1: Currency Selector (5 cols) */}
          <div className="md:col-span-5 relative">
            <label className="text-[10px] font-black tracking-widest text-amber-700 uppercase mb-1 block">
              {activeTab === 'sell' ? 'Currency to Encash' : activeTab === 'remittance' ? 'Remittance Currency' : 'Select Currency'}
            </label>
            
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-900 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedCurrMeta.flag}</span>
                <div className="text-left">
                  <div className="text-sm font-black tracking-tight flex items-center gap-1.5 text-slate-900">
                    <span>{currencyCode}</span>
                    <span className="text-slate-500 text-xs font-semibold">• {selectedCurrMeta.name}</span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-extrabold">
                    {activeTab === 'buy' && `Live Rate: 1 ${currencyCode} = ₹ ${appliedRate.toFixed(2)}`}
                    {activeTab === 'sell' && `Buyback Rate: 1 ${currencyCode} = ₹ ${appliedRate.toFixed(2)}`}
                    {activeTab === 'remittance' && `SWIFT Rate: 1 ${currencyCode} = ₹ ${appliedRate.toFixed(2)}`}
                    {activeTab === 'card' && `Zero Fee Rate: 1 ${currencyCode} = ₹ ${appliedRate.toFixed(2)}`}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Currency Options Modal */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute left-0 right-0 top-18 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto scrollbar-thin space-y-1">
                  {ALL_CURRENCIES_LIST.map((meta) => {
                    const code = meta.code;
                    const bRate = getBaseInterbankRate(code);
                    let calcRate = bRate;
                    if (activeTab === 'buy') calcRate = Math.round((bRate + 0.63) * 100) / 100;
                    if (activeTab === 'sell') calcRate = Math.round((bRate - 0.63) * 100) / 100;
                    if (activeTab === 'remittance') calcRate = Math.round((bRate + 0.10) * 100) / 100;
                    if (activeTab === 'card') calcRate = Math.round(bRate * 100) / 100;

                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrencyCode(code);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                          currencyCode === code
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{meta.flag}</span>
                          <span>{code} - {meta.name}</span>
                        </div>
                        <span className="font-mono font-bold">₹ {calcRate.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Field 2: Foreign Amount Input (4 cols) */}
          <div className="md:col-span-4">
            <label className="text-[10px] font-black tracking-widest text-amber-700 uppercase mb-1 block">
              {activeTab === 'sell' ? 'Foreign Notes Amount' : activeTab === 'remittance' ? 'Wire Transfer Amount' : 'Foreign Currency Amount'}
            </label>
            <div className="bg-slate-50 border border-slate-200 focus-within:border-amber-500 rounded-2xl p-2.5 px-3.5 flex items-center justify-between shadow-2xs">
              <span className="text-base font-black text-amber-600 font-mono">{currencyCode}</span>
              <input
                type="number"
                value={foreignAmount}
                onChange={(e) => setForeignAmount(e.target.value)}
                placeholder="1000"
                className="w-full text-right bg-transparent text-xl font-black text-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Field 3: Fulfillment Mode for Buy, Sell & Card / Purpose for Remittance (3 cols) */}
          <div className="md:col-span-3">
            {activeTab === 'remittance' ? (
              <div>
                <label className="text-[10px] font-black tracking-widest text-amber-700 uppercase mb-1 block">
                  Purpose of Transfer
                </label>
                <select
                  value={remittancePurpose}
                  onChange={(e) => setRemittancePurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-900 font-bold text-xs rounded-2xl p-3.5 focus:outline-none shadow-2xs"
                >
                  {REMITTANCE_PURPOSES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-black tracking-widest text-amber-700 uppercase mb-1 block">
                  Fulfillment Mode
                </label>
                <select
                  value={fulfillmentMode}
                  onChange={(e) => setFulfillmentMode(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-900 font-bold text-xs rounded-2xl p-3.5 focus:outline-none shadow-2xs"
                >
                  <option value="DOORSTEP">🏠 Doorstep Delivery</option>
                  <option value="BRANCH">🏢 Branch Pickup</option>
                </select>
              </div>
            )}
          </div>

        </div>

        {/* 3. Live Price & Summary Breakdown Ribbon */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                {activeTab === 'sell' ? 'You Receive INR:' : activeTab === 'remittance' ? 'Total Transfer INR:' : 'Net Payable INR:'}
              </span>
              <span className="text-xl font-black text-slate-900 font-mono">₹ {computedInr.toLocaleString()}</span>
            </div>

            {activeTab !== 'sell' && (
              <>
                <div className="h-8 w-px bg-slate-200 hidden md:block" />

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Bank Rate Comparison:</span>
                  <span className="line-through text-slate-400 font-mono">₹ {bankTotal.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Dynamic Benefit Badge */}
          {activeTab === 'sell' ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Instant Bank Account NEFT Payout</span>
            </div>
          ) : activeTab === 'remittance' ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Same-Day SWIFT Wire MT103 Guarantee</span>
            </div>
          ) : totalSavings > 0 ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You Save ₹ {totalSavings.toLocaleString()} vs Banks!</span>
            </div>
          ) : null}

          {/* Dynamic Action Button */}
          <button
            onClick={handleActionSubmit}
            className="w-full md:w-auto btn-gold px-7 py-3 rounded-xl font-black text-sm text-slate-950 flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {activeTab === 'buy' && (
              <>
                <Lock className="w-4 h-4 text-slate-950" />
                <span>Book Order @ Live Rate</span>
              </>
            )}

            {activeTab === 'sell' && (
              <>
                <TrendingUp className="w-4 h-4 text-slate-950" />
                <span>Sell Cash & Get Paid 🔄</span>
              </>
            )}

            {activeTab === 'remittance' && (
              <>
                <Send className="w-4 h-4 text-slate-950" />
                <span>Proceed to Wire Remittance ✈️</span>
              </>
            )}

            {activeTab === 'card' && (
              <>
                <Globe className="w-4 h-4 text-slate-950" />
                <span>Get Platinum Forex Card 💳</span>
              </>
            )}
            
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </div>

      {/* City Selector Modal */}
      {isCityModalOpen && (
        <CitySelectorModal
          isOpen={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          onSelectCity={(city) => {
            setSelectedCity(city);
            setIsCityModalOpen(false);
          }}
        />
      )}

      {/* Same Day Delivery Policy Modal */}
      <SameDayDeliveryModal 
        isOpen={isDeliveryPolicyOpen} 
        onClose={() => setIsDeliveryPolicyOpen(false)} 
      />

      {/* Cashback Slabs Offer Modal */}
      <CashbackOfferModal
        isOpen={isCashbackModalOpen}
        onClose={() => setIsCashbackModalOpen(false)}
        onApply={() => {
          setIsCashbackModalOpen(false);
        }}
      />

    </div>
  );
}
