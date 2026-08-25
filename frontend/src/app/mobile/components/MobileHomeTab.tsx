"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, CreditCard, Send, MapPin, ShieldCheck, ShieldAlert, 
  TrendingUp, TrendingDown, Clock, Truck, CheckCircle2, ChevronRight, 
  Sparkles, RefreshCw, Zap, Lock, Building2, Star, Check, Globe, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { getCurrencyFlag } from '@/lib/currencyMetadata';

interface MobileHomeTabProps {
  onNavigateTab: (tab: 'exchange' | 'cards' | 'orders' | 'profile', subState?: any) => void;
  onOpenSupport: () => void;
  selectedCity: string;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', buyRate: 83.45, sellRate: 84.10, change: '+0.15%' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', buyRate: 90.20, sellRate: 91.05, change: '-0.08%' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buyRate: 105.85, sellRate: 106.90, change: '+0.32%' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', buyRate: 22.70, sellRate: 22.95, change: '+0.02%' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', buyRate: 61.90, sellRate: 62.50, change: '+0.12%' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', buyRate: 61.20, sellRate: 61.85, change: '-0.10%' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', buyRate: 54.80, sellRate: 55.40, change: '+0.05%' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', buyRate: 2.38, sellRate: 2.45, change: '+0.00%' },
];

export function MobileHomeTab({ onNavigateTab, onOpenSupport, selectedCity }: MobileHomeTabProps) {
  const { user } = useAuth();
  const [productType, setProductType] = useState<'CARD' | 'CASH' | 'REMITTANCE' | 'SELL'>('CARD');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState<number>(1000);
  const [ratesList, setRatesList] = useState<any[]>(CURRENCIES);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const selectedCurrObj = ratesList.find((c) => {
    const code = typeof c.currency === 'string' ? c.currency : (c.currency?.code || c.code);
    return code === currency;
  }) || ratesList[0];

  const rate = productType === 'SELL' ? Number(selectedCurrObj.sellRate || 84.10) : Number(selectedCurrObj.buyRate || 83.45);
  const totalInr = Math.round(amount * rate);

  useEffect(() => {
    fetchRatesAndSummary();
  }, []);

  const fetchRatesAndSummary = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/rates`).catch(() => null);
      if (res && res.ok) {
        const data = await apiJson(res);
        if (Array.isArray(data) && data.length > 0) {
          setRatesList(data);
        }
      }

      const summaryRes = await authFetch(`${API_URL}/dashboard/summary`).catch(() => null);
      if (summaryRes && summaryRes.ok) {
        const summary = await apiJson(summaryRes);
        const pending = summary?.recentOrders?.find((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
        if (pending) setActiveOrder(pending);
      } else {
        setActiveOrder({
          id: 'FX-98214',
          orderType: 'CARD_RELOAD',
          currency: 'USD',
          amount: 1500,
          status: 'IN_TRANSIT',
          deliveryMode: 'DOORSTEP',
        });
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    const mappedProduct = 
      productType === 'CARD' ? 'CARD_BUY' : 
      productType === 'CASH' ? 'CASH_BUY' : 
      productType === 'REMITTANCE' ? 'REMITTANCE' : 'CASH_SELL';

    onNavigateTab('exchange', { product: mappedProduct, currency });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24 scrollbar-none bg-slate-50">
      
      {/* 1. Hero BookMyForex Calculator Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-4 shadow-xl shadow-slate-200/60 space-y-4">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Tabs: Card, Cash Notes, Send Money, Sell */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          {[
            { id: 'CARD', label: 'Forex Card', icon: '💳' },
            { id: 'CASH', label: 'Cash Notes', icon: '💵' },
            { id: 'REMITTANCE', label: 'Remittance', icon: '✈️' },
            { id: 'SELL', label: 'Sell Forex', icon: '🔄' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setProductType(t.id as any)}
              className={`py-2 text-center rounded-xl transition-all ${
                productType === t.id
                  ? 'bg-slate-900 text-white font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              <div className="text-xs mb-0.5">{t.icon}</div>
              <div className="text-[9px] truncate">{t.label}</div>
            </button>
          ))}
        </div>

        {/* Currency & Amount Calculator Form */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Select Currency</span>
            <span className="text-amber-600 font-black flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              1 {currency} = ₹ {rate.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Select */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-50 text-slate-900 font-black text-sm rounded-2xl px-3 py-3 border border-slate-200 focus:outline-none focus:border-amber-500 shadow-xs"
            >
              {ratesList.slice(0, 8).map((c, idx) => {
                const code = typeof c.currency === 'string' ? c.currency : (c.currency?.code || c.code || `C-${idx}`);
                const flag = getCurrencyFlag(code);
                return (
                  <option key={code} value={code} className="bg-white text-slate-900">
                    {flag} {code}
                  </option>
                );
              })}
            </select>

            {/* Amount Input */}
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2 flex flex-col items-end shadow-xs">
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="1000"
                className="w-full bg-transparent text-right text-xl font-black text-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-bold">Total INR: ₹ {totalInr.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {[250, 500, 1000, 2500, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  amount === val
                    ? 'bg-amber-500/20 text-amber-700 border border-amber-500/40 font-black'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                + {val}
              </button>
            ))}
          </div>
        </div>

        {/* Interbank Rate Guarantee Pill */}
        <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-extrabold text-emerald-900 text-[11px]">True Interbank Rate Guarantee</div>
              <div className="text-[9px] text-emerald-700 font-semibold">0% Foreign Exchange Mark-up Fee</div>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-slate-700">In {selectedCity}</span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleBookNow}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Book Order @ Interbank Rate</span>
          <ChevronRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

      {/* 2. BookMyForex 8 Services Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">ForexMate Services</h3>
          <span className="text-[10px] text-amber-600 font-extrabold">Same Day Delivery</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Service 1 */}
          <button
            onClick={() => onNavigateTab('cards')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Forex Card</span>
          </button>

          {/* Service 2 */}
          <button
            onClick={() => onNavigateTab('exchange', { product: 'CASH_BUY' })}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Currency Notes</span>
          </button>

          {/* Service 3 */}
          <button
            onClick={() => onNavigateTab('exchange', { product: 'REMITTANCE' })}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Send Money</span>
          </button>

          {/* Service 4 */}
          <button
            onClick={() => onNavigateTab('cards')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Card Reload</span>
          </button>

          {/* Service 5 */}
          <button
            onClick={() => onNavigateTab('exchange', { product: 'CASH_SELL' })}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Unload/Sell</span>
          </button>

          {/* Service 6 */}
          <button
            onClick={() => onNavigateTab('orders')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Track Order</span>
          </button>

          {/* Service 7 */}
          <button
            onClick={onOpenSupport}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Intl SIM</span>
          </button>

          {/* Service 8 */}
          <button
            onClick={onOpenSupport}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/50 text-slate-800 transition-all active:scale-95 group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Insurance</span>
          </button>
        </div>
      </div>

      {/* 3. Active Order Status Banner if exists */}
      {activeOrder && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 space-y-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black text-slate-900">Active Order Progress</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {activeOrder.id}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-semibold">Out for Doorstep Delivery in {selectedCity}</span>
            <span className="font-black text-slate-900">{activeOrder.currency} {activeOrder.amount}</span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full w-[75%] rounded-full animate-pulse" />
          </div>

          <button
            onClick={() => onNavigateTab('orders', { selectedId: activeOrder.id })}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
          >
            <span>View Delivery Map & Handover OTP</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      )}

      {/* 4. BookMyForex Value Props Banner */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs">
            ⚡
          </div>
          <div className="text-xs font-black text-amber-950">Same Day Delivery</div>
          <div className="text-[10px] text-amber-800/80 font-medium">Order before 1 PM for 4-hour doorstep delivery</div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-xs">
            🔒
          </div>
          <div className="text-xs font-black text-emerald-950">Rate Lock for 3 Days</div>
          <div className="text-[10px] text-emerald-800/80 font-medium">Freeze live rate with just 2% advance payment</div>
        </div>
      </div>

      {/* 5. Live Market Rates Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Live Exchange Rates Table</h3>
          </div>
          <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Updated Real-time
          </span>
        </div>

        <div className="space-y-2">
          {ratesList.slice(0, 5).map((r, idx) => {
            const code = typeof r.currency === 'string' ? r.currency : (r.currency?.code || r.code || `C-${idx}`);
            const flag = getCurrencyFlag(code);
            const buyRate = Number(r.buyRate || r.inrRate || r.rate || 83.45);
            const sellRate = Number(r.sellRate || (buyRate ? buyRate * 1.01 : 84.10));

            return (
              <div
                key={code}
                className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between hover:border-amber-500/50 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{flag}</span>
                  <div>
                    <div className="text-xs font-black text-slate-900">{code}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Interbank Rate</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Buy Rate</div>
                    <div className="text-xs font-black text-emerald-700">₹ {buyRate.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Sell Rate</div>
                    <div className="text-xs font-bold text-slate-700">₹ {sellRate.toFixed(2)}</div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('exchange', { currency: code })}
                    className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] shadow-xs active:scale-95 hover:bg-amber-600"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. RBI Trust & License Footer Badge */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2 shadow-xs">
        <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-900">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>RBI Licensed FFMC Partner</span>
        </div>
        <p className="text-[10px] text-slate-500 max-w-xs mx-auto font-medium">
          ForexMate is India's 1st & largest online forex platform. Fully compliant with RBI LRS guidelines.
        </p>
        <div className="flex items-center justify-center gap-1 text-[11px] font-black text-slate-900 pt-1">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>4.8 / 5 Rating • 1,000,000+ Happy Customers</span>
        </div>
      </div>

    </div>
  );
}
