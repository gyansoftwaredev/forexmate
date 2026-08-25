"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import { 
  CreditCard, 
  ShoppingBag, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle, 
  FileText, 
  Calendar, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Download,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Truck,
  PlusCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Live Currency Watchlist Data
const LIVE_MARKET_WATCHLIST = [
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar', buyRate: 84.13, sellRate: 83.65, change: '+0.12%', isPositive: true },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro', buyRate: 91.05, sellRate: 90.40, change: '-0.08%', isPositive: false },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound', buyRate: 106.80, sellRate: 106.10, change: '+0.25%', isPositive: true },
  { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham', buyRate: 23.10, sellRate: 22.85, change: '+0.02%', isPositive: true },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar', buyRate: 61.80, sellRate: 61.20, change: '-0.15%', isPositive: false },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar', buyRate: 62.40, sellRate: 61.90, change: '+0.10%', isPositive: true },
];

export default function DashboardOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: summary, isLoading } = useDashboardSummary();

  const [cardFrozen, setCardFrozen] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  let localOrders: any[] = [];
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('local_user_orders');
      if (stored) localOrders = JSON.parse(stored);
    }
  } catch (e) {
    console.error(e);
  }

  const baseOrders = summary?.recentOrders?.length ? summary.recentOrders : [
    {
      id: 'ord_984210',
      orderNumber: 'FXM-984210',
      createdAt: new Date().toISOString(),
      items: [{ product: { name: '1,000 USD Foreign Currency Notes' } }],
      totalAmountInr: 84431,
      status: 'READY_FOR_PICKUP',
      deliveryMethod: 'BRANCH_PICKUP',
      branchName: 'Connaught Place Vault Branch, Delhi'
    },
    {
      id: 'ord_984188',
      orderNumber: 'FXM-984188',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      items: [{ product: { name: 'Multi-Currency Forex Card Load (USD 2,500)' } }],
      totalAmountInr: 210325,
      status: 'COMPLETED',
      deliveryMethod: 'HOME_DELIVERY',
    }
  ];

  const combinedOrders = [...localOrders];
  baseOrders.forEach(bo => {
    if (!combinedOrders.some(co => co.id === bo.id || co.orderNumber === bo.orderNumber)) {
      combinedOrders.push(bo);
    }
  });

  const activeSummary = {
    kycStatus: summary?.kycStatus || 'VERIFIED',
    activeForexCards: summary?.activeForexCards || 2,
    totalOrders: (summary?.totalOrders || 14) + localOrders.length,
    lrsUsage: summary?.lrsUsage || 3750000,
    pendingOrders: (summary?.pendingOrders || 1) + localOrders.length,
    completedOrders: summary?.completedOrders || 13,
    recentOrders: combinedOrders
  };

  const isKycVerified = activeSummary.kycStatus === 'VERIFIED';
  const maxLrsUsd = 250000;
  const usedLrsUsd = 45200;
  const remainingLrsUsd = maxLrsUsd - usedLrsUsd;
  const lrsPercent = Math.round((usedLrsUsd / maxLrsUsd) * 100);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* --- HERO WELCOME CARD (Crisp Light Theme with Gold Accents) --- */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50 border border-amber-200/80 p-6 sm:p-8 shadow-sm overflow-hidden">
        
        {/* Glow ambient background graphics */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* User Profile Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                GOLD EXECUTIVE MEMBER
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-black tracking-widest uppercase">
                RBI LRS COMPLIANT
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Welcome back, {user?.fullName || 'Gyan Vaibhav'} 👋
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-xl leading-relaxed">
              Manage your foreign currency notes, zero-markup multi-currency travel cards, and RBI LRS international wire transfers from your executive dashboard.
            </p>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={() => router.push('/buy-forex')}
              className="btn-gold px-6 py-3.5 rounded-xl text-xs font-black text-slate-950 shadow-md hover:scale-105 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>New Currency Order</span>
            </button>

            <button 
              onClick={() => router.push('/dashboard/invoices')}
              className="px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download Tax Statement</span>
            </button>
          </div>

        </div>

        {/* --- RBI LRS $250,000 ANNUAL ALLOWANCE TRACKER STRIP --- */}
        <div className="mt-8 pt-6 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                RBI LRS Annual Allowance Usage (FY 2024-25)
              </span>
              <span className="font-black text-amber-700 font-mono">
                ${usedLrsUsd.toLocaleString()} USD / ${maxLrsUsd.toLocaleString()} USD ({lrsPercent}%)
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-200/80 p-0.5 border border-slate-300/60 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 transition-all duration-1000 shadow-sm"
                style={{ width: `${lrsPercent}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
              <span>Utilized: ${usedLrsUsd.toLocaleString()} USD (~₹{formatCurrencyINR(activeSummary.lrsUsage)})</span>
              <span className="text-emerald-700 font-extrabold">Remaining Quota: ${remainingLrsUsd.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="md:col-span-1 bg-white/90 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">STATUTORY HEALTH</span>
              <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Fully Compliant
              </span>
            </div>
            <button 
              onClick={() => router.push('/dashboard/kyc')}
              className="text-[11px] font-extrabold text-amber-700 hover:underline flex items-center gap-1"
            >
              <span>View KYC Docs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

      {/* --- KYC ACTION REQUIRED ALERT BANNER (If not verified) --- */}
      {!isKycVerified && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-amber-900">Action Required: Complete Statutory KYC</h3>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                As per RBI guidelines, orders above $1,000 USD require uploaded PAN card & Passport identity documents.
              </p>
            </div>
          </div>

          <button 
            onClick={() => router.push('/dashboard/kyc')}
            className="btn-gold px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 shrink-0 shadow-md hover:scale-105 transition-transform"
          >
            Upload KYC Documents Now
          </button>
        </div>
      )}

      {/* --- KPI STAT CARDS GRID (Light Executive Theme) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Active Cards */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-3 hover:border-amber-400/60 transition-all shadow-2xs hover:shadow-md group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Active Forex Cards</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-slate-900">{activeSummary.activeForexCards} Cards</div>
            <p className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
              <span>● $1,250 USD Balance Loaded</span>
            </p>
          </div>
        </div>

        {/* Stat 2: Total Orders */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-3 hover:border-amber-400/60 transition-all shadow-2xs hover:shadow-md group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-slate-900">{activeSummary.totalOrders} Orders</div>
            <p className="text-xs text-amber-700 font-extrabold flex items-center gap-1">
              <span>🏬 1 Ready for Branch Pickup</span>
            </p>
          </div>
        </div>

        {/* Stat 3: LRS Quota */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-3 hover:border-amber-400/60 transition-all shadow-2xs hover:shadow-md group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">LRS Quota Utilized</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-slate-900">${usedLrsUsd.toLocaleString()} USD</div>
            <p className="text-xs text-slate-500 font-medium">
              ${remainingLrsUsd.toLocaleString()} USD remaining
            </p>
          </div>
        </div>

        {/* Stat 4: Statutory KYC Status */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-3 hover:border-amber-400/60 transition-all shadow-2xs hover:shadow-md group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">KYC Status</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-emerald-700 flex items-center gap-1.5">
              <span>VERIFIED</span>
              <span className="text-xs bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-emerald-800">RBI LRS</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Zero pending compliance holds
            </p>
          </div>
        </div>

      </div>

      {/* --- QUICK ACTION SERVICES LAUNCHER --- */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base tracking-wide flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>Quick Services Launcher</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: 'Buy Currency Notes', desc: 'Doorstep or Vault Pickup', href: '/buy-forex?tab=buy', icon: '💵', border: 'border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50/60 to-white' },
            { title: 'Multi-Currency Card', desc: 'Zero Markup Forex Card', href: '/forex-cards', icon: '💳', border: 'border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50/60 to-white' },
            { title: 'Send Money Abroad', desc: 'LRS University/Medical Wire', href: '/remittance', icon: '🌐', border: 'border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50/60 to-white' },
            { title: 'Sell Currency Notes', desc: 'Instant INR Account Credit', href: '/sell-forex', icon: '🏦', border: 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-br from-emerald-50/60 to-white' },
          ].map((srv, idx) => (
            <div
              key={idx}
              onClick={() => router.push(srv.href)}
              className={`rounded-2xl border ${srv.border} p-4.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group space-y-2 flex flex-col justify-between shadow-2xs`}
            >
              <div className="flex justify-between items-center">
                <span className="text-2xl group-hover:scale-110 transition-transform">{srv.icon}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-amber-700 transition-colors">{srv.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- TWO COLUMN MAIN CONTENT: RECENT ORDERS & FOREX CARD HUB --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2 SPAN): RECENT TRANSACTIONS & ACTIVE ORDERS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs">
            
            <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>Recent Orders & Fulfillments</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Real-time status tracking & fulfillment details</p>
              </div>

              <button 
                onClick={() => router.push('/dashboard/orders')}
                className="text-xs font-black text-amber-700 hover:underline flex items-center gap-1"
              >
                <span>View All Orders ({activeSummary.totalOrders})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Orders Table */}
            <div className="divide-y divide-slate-100">
              {activeSummary.recentOrders.map((ord: any) => (
                <div 
                  key={ord.id}
                  onClick={() => router.push(`/dashboard/orders`)}
                  className="p-5 hover:bg-amber-50/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-700 font-mono text-xs">{ord.orderNumber}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">• {formatDate(ord.createdAt)}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {ord.items && ord.items.length > 1
                        ? ord.items.map((it: any) => `${it.amount} ${it.currency?.code || it.currency || ''}`).join(' + ') + ' Notes'
                        : (ord.items?.[0]?.product?.name || 'Foreign Currency Notes')}
                    </h4>
                    {ord.deliveryMethod === 'BRANCH_PICKUP' && (
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Pickup at: <strong className="text-slate-800">{ord.branchName || 'Connaught Place Vault Branch'}</strong></span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="block text-xs font-black text-slate-900">₹{ord.totalAmountInr.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Total INR</span>
                    </div>

                    {ord.status === 'READY_FOR_PICKUP' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                        <Building2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Ready at Branch</span>
                      </span>
                    ) : ord.status === 'COMPLETED' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fulfilled</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 text-xs font-extrabold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>In Processing</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Quick FAQ & Support Banner */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                💬
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Need Help With Your Currency Order?</h4>
                <p className="text-xs text-slate-500 font-medium">Our 24/7 dedicated forex desk is available to assist you.</p>
              </div>
            </div>

            <button 
              onClick={() => router.push('/dashboard/support')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
            >
              Contact Support
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN (1 SPAN): VIRTUAL FOREX CARD & LIVE WATCHLIST */}
        <div className="space-y-6">
          
          {/* VIRTUAL FOREX CARD WIDGET */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-2xs space-y-5 relative overflow-hidden">
            
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Forexmate Executive Card</span>
              </h3>
              <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                ZERO MARKUP
              </span>
            </div>

            {/* Visual 3D Metallic Card UI */}
            <div className="relative rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border border-amber-500/30 p-5 shadow-xl space-y-4 text-left group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-6xl">
                💳
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase">VISA PLATINUM</span>
                  <div className="text-xs font-black text-white tracking-wider">FOREXMATE TRAVEL CARD</div>
                </div>

                {/* EMV Chip & Contactless Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded bg-gradient-to-tr from-yellow-400 to-amber-200 border border-yellow-500 shadow-sm" />
                  <span className="text-amber-400 text-xs font-black">📡</span>
                </div>
              </div>

              {/* Masked Card Number */}
              <div className="pt-2">
                <span className="font-mono text-sm sm:text-base font-black tracking-widest text-slate-100">
                  {showCardDetails ? '4532 9842 1098 7654' : '•••• •••• •••• 9842'}
                </span>
              </div>

              {/* Multi-Currency Balances Strip */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">USD BALANCE</span>
                  <span className="font-black text-emerald-400 text-sm">$1,250.00</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">EUR BALANCE</span>
                  <span className="font-black text-white text-sm">€850.00</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">CARD STATUS</span>
                  <span className={`font-extrabold text-[10px] ${cardFrozen ? 'text-red-400' : 'text-emerald-400'}`}>
                    {cardFrozen ? 'FROZEN' : 'ACTIVE ✓'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Action Controls */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button 
                onClick={() => setCardFrozen(!cardFrozen)}
                className={`p-2.5 rounded-xl border text-[11px] font-extrabold transition-all flex flex-col items-center gap-1 ${
                  cardFrozen ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{cardFrozen ? 'Unfreeze' : 'Freeze Card'}</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/reload')}
                className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-extrabold hover:bg-amber-100 transition-all flex flex-col items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Reload Card</span>
              </button>

              <button 
                onClick={() => setShowCardDetails(!showCardDetails)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-extrabold hover:border-slate-300 transition-all flex flex-col items-center gap-1"
              >
                {showCardDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showCardDetails ? 'Hide Info' : 'Show Details'}</span>
              </button>
            </div>

          </div>

          {/* LIVE MARKET WATCHLIST WIDGET */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-5 space-y-4 shadow-2xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Live Exchange Watchlist</span>
                </h3>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live RBI Interbank Rates
                </span>
              </div>

              <button 
                onClick={() => router.push('/rates')}
                className="text-[11px] font-extrabold text-amber-700 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {LIVE_MARKET_WATCHLIST.map((cur) => (
                <div key={cur.code} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{cur.flag}</span>
                    <div>
                      <span className="font-black text-slate-900 block leading-none">{cur.code}/INR</span>
                      <span className="text-[10px] text-slate-500 font-medium">{cur.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="font-black text-slate-900 block">₹{cur.buyRate.toFixed(2)}</span>
                      <span className={`text-[10px] font-bold ${cur.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {cur.change}
                      </span>
                    </div>

                    <button 
                      onClick={() => router.push(`/buy-forex?tab=buy&currency=${cur.code}`)}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black hover:bg-amber-400 hover:text-slate-950 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
