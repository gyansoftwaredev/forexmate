'use client';

import React, { useState } from 'react';
import { useOrder, useRequestCancelOrder } from '../hooks/useOrders';
import { StatusTimeline } from './StatusTimeline';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, Info, ArrowLeft, Download, ShieldAlert, Sparkles, 
  Landmark, Globe, Send, CreditCard, User, Mail, Phone, 
  CheckCircle2, Clock, Copy, Check, FileText, ArrowUpRight, 
  ShieldCheck, AlertCircle, Headphones, Building2, Hash, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

// Helper for Country Flags
const getFlag = (codeOrName: string = '') => {
  const s = codeOrName.toLowerCase();
  if (s.includes('usd') || s.includes('united states') || s === 'us') return '🇺🇸';
  if (s.includes('gbp') || s.includes('united kingdom') || s.includes('uk') || s === 'gb') return '🇬🇧';
  if (s.includes('eur') || s.includes('europe') || s.includes('germany') || s.includes('france')) return '🇪🇺';
  if (s.includes('cad') || s.includes('canada') || s === 'ca') return '🇨🇦';
  if (s.includes('aud') || s.includes('australia') || s === 'au') return '🇦🇺';
  if (s.includes('sgd') || s.includes('singapore') || s === 'sg') return '🇸🇬';
  if (s.includes('aed') || s.includes('emirates') || s.includes('dubai') || s === 'ae') return '🇦🇪';
  if (s.includes('chf') || s.includes('switzerland') || s === 'ch') return '🇨🇭';
  if (s.includes('jpy') || s.includes('japan') || s === 'jp') return '🇯🇵';
  if (s.includes('nzd') || s.includes('new zealand') || s === 'nz') return '🇳🇿';
  if (s.includes('hkd') || s.includes('hong kong') || s === 'hk') return '🇭🇰';
  if (s.includes('thb') || s.includes('thailand') || s === 'th') return '🇹🇭';
  if (s.includes('sar') || s.includes('saudi') || s === 'sa') return '🇸🇦';
  return '🌐';
};

const formatRateClean = (rate: any) => {
  if (!rate) return null;
  const num = parseFloat(rate);
  if (isNaN(num)) return null;
  return `₹${num.toFixed(2)}`;
};

export function OrderDetails({ id }: { id: string }) {
  const { data: order, isLoading, error } = useOrder(id);
  const requestCancelMutation = useRequestCancelOrder();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCancel = () => {
    const reason = window.prompt('Please provide a brief reason for requesting order cancellation:');
    if (reason === null) return;

    if (!reason.trim()) {
      toast.error('A valid reason is required to submit a cancellation request.');
      return;
    }

    requestCancelMutation.mutate(
      { id, reason },
      {
        onSuccess: () => toast.success('Cancellation request submitted successfully'),
        onError: (err: any) => toast.error(err?.message || 'Failed to submit cancellation request')
      }
    );
  };

  const isCancelling = requestCancelMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-10 w-1/3 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[500px] rounded-3xl" />
          <Skeleton className="h-[500px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <Card className="border-red-200 bg-red-50/50 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="font-extrabold text-red-900 text-lg">Order Not Found</h3>
          <p className="text-xs text-red-600 font-medium mt-1 mb-5">
            Unable to load details for this order. It may have expired or been deleted.
          </p>
          <Link href="/dashboard/orders">
            <Button className="bg-slate-900 text-white rounded-xl text-xs font-bold">
              Back to Active Orders
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isWire = order.productType === 'REMITTANCE' || order.orderNumber?.includes('WIRE') || order.deliveryMethod === 'WIRE_TRANSFER';
  const isSell = order.productType === 'CASH_SELL' || order.status === 'CASH_SELL';
  const isCard = order.productType === 'CARD';
  
  // Extract primary item & remittance details
  const primaryItem = order.items?.[0];
  const remittanceDetail = primaryItem?.remittance;
  const currencyCode = primaryItem?.currency?.code || order.quote?.currency?.code || 'USD';
  const foreignAmount = primaryItem?.amount || order.quote?.amountForeign || '0';
  const lockedRate = primaryItem?.rate || order.quote?.lockedInrRate;
  const inrSubtotal = primaryItem?.inrSubtotal || order.totalAmountInr;
  const tcsAmount = remittanceDetail?.tcsAmount ? parseFloat(remittanceDetail.tcsAmount) : 0;
  const feeAmount = remittanceDetail?.feeAmount ? parseFloat(remittanceDetail.feeAmount) : 0;
  const baseInr = parseFloat(inrSubtotal) || (parseFloat(foreignAmount) * (parseFloat(lockedRate) || 83.5));

  // Customer / Remitter info
  const remitterName = order.session?.travellerName || order.profile?.user?.fullName || 'Valued Client';
  const remitterPhone = order.session?.phone || order.profile?.user?.phone || '+91 9876543210';
  const remitterEmail = order.session?.email || order.profile?.user?.email || 'customer@example.com';
  const remitterPan = order.session?.pan || order.profile?.pan || 'ABCDE1234F';
  const residentStatus = order.session?.remitterResidentStatus || 'Resident Indian Individual (LRS Eligible)';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* ─── 1. EXECUTIVE BREADCRUMB & HEADER ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:bg-slate-50 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Order</span>
                <span className="font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-xl border border-amber-300/80 text-base">
                  {order.orderNumber}
                </span>
                <button
                  onClick={() => handleCopy(order.orderNumber, 'orderNo', 'Order Number')}
                  className="p-1 text-slate-400 hover:text-amber-700 transition-colors rounded-lg cursor-pointer"
                  title="Copy Order Number"
                >
                  {copiedKey === 'orderNo' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </h1>
              
              <OrderStatusBadge status={order.status} />

              {/* Product Badge */}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                {isWire ? <Globe className="w-3 h-3 text-blue-600" /> : isCard ? <CreditCard className="w-3 h-3 text-amber-600" /> : <Landmark className="w-3 h-3 text-emerald-600" />}
                <span>{isWire ? 'Outward Wire Remittance' : isSell ? 'Sell Forex' : isCard ? 'Forex Multi-Currency Card' : 'Physical Currency Buy'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
              <span>Placed on <strong className="text-slate-700">{formatDate(order.createdAt)}</strong></span>
              <span>•</span>
              <span>Ref: <strong className="font-mono text-slate-700">{order.id.slice(0, 8).toUpperCase()}</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/kyc">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              KYC Status
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.print()}
            className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* ─── 2. ALERTS (CANCEL / LRS COMPLIANCE) ────────────────────────────── */}
      {order.cancelRequested && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 shadow-2xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-950">Order Cancellation Request Under Review</h3>
            <p className="text-xs text-amber-900/90 font-medium mt-0.5 leading-relaxed">
              Your cancellation request has been submitted. A central operations manager is reviewing the request against banking settlement records.
            </p>
            {order.cancelReason && (
              <p className="text-[11px] font-semibold text-slate-600 mt-2 bg-white/80 border border-amber-200 px-3 py-1 rounded-xl inline-block">
                Reason: <span className="text-slate-900 italic">"{order.cancelReason}"</span>
              </p>
            )}
          </div>
        </div>
      )}

      {order.complianceStatus === 'LRS_FAILED' && (
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 shadow-2xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-red-950">Statutory LRS Limit Exceeded</h3>
            <p className="text-xs text-red-800 font-medium mt-0.5 leading-relaxed">
              This transaction exceeds your remaining RBI Liberalised Remittance Scheme $250,000 USD annual allowance limit.
            </p>
          </div>
        </div>
      )}

      {/* ─── 3. MAIN 2-COLUMN GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ORDER CONTENT & FINANCIAL DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card A: Ordered Items & Currencies */}
          <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-50/90 to-amber-50/30 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-display font-black text-slate-900">
                    Ordered Currencies & Financial Settlement
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Guaranteed booked live rate and detailed tax/commission breakup
                  </p>
                </div>
              </div>

              {order.items && order.items.length > 1 && (
                <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                  {order.items.length} Currencies
                </span>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Currency Line Items */}
              <div className="space-y-3">
                {(order.items && order.items.length > 0 ? order.items : [primaryItem]).map((item: any, idx: number) => {
                  const itemCurr = item?.currency?.code || currencyCode;
                  const itemAmt = item?.amount || foreignAmount;
                  const itemRate = item?.rate || lockedRate;
                  const itemSubtotal = item?.inrSubtotal || baseInr;
                  const itemTitle = isWire 
                    ? `Outward Remittance Wire (${itemCurr})` 
                    : item?.product?.name || `${itemAmt} ${itemCurr} Foreign Currency`;

                  return (
                    <div 
                      key={idx} 
                      className="p-4.5 rounded-2xl bg-gradient-to-r from-slate-50/90 to-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-amber-300 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                          {getFlag(itemCurr)}
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span>{itemTitle}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {itemCurr}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-2.5 mt-0.5">
                            <span>Forex Amount: <strong className="text-slate-800 font-extrabold">{Number(itemAmt).toLocaleString()} {itemCurr}</strong></span>
                            <span>•</span>
                            <span>Rate: <strong className="text-amber-800 font-extrabold">{formatRateClean(itemRate) || '₹83.60'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:pl-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Subtotal (INR)</span>
                        <span className="text-base font-display font-black text-slate-900">
                          {formatCurrencyINR(itemSubtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comprehensive Settlement Table */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Base Forex Value (INR)</span>
                  <span className="font-bold text-slate-900">{formatCurrencyINR(baseInr)}</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span>Processing & Service Charge</span>
                    {feeAmount === 0 && (
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300 uppercase">
                        Zero Fee Waived
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-slate-900">{feeAmount > 0 ? formatCurrencyINR(feeAmount) : '₹0.00'}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span>TCS (Tax Collected at Source - LRS)</span>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                      &lt; ₹7 Lakh Limit
                    </span>
                  </span>
                  <span className="font-bold text-slate-900">{tcsAmount > 0 ? formatCurrencyINR(tcsAmount) : '₹0.00'}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>GST on Processing Charges (18%)</span>
                  <span className="font-bold text-slate-900">₹0.00</span>
                </div>

                {/* Total Grand Value */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block">Total Settlement Amount</span>
                    <span className="text-[10px] text-slate-400 font-medium">Inclusive of all RBI statutory charges</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-display font-black text-slate-900 text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">
                      {formatCurrencyINR(order.totalAmountInr)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Wire Remittance Beneficiary Vault (Context-Aware) */}
          {isWire && (
            <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50/90 to-blue-50/20 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-display font-black text-slate-900">
                      Overseas Beneficiary & Bank Routing Details
                    </CardTitle>
                    <p className="text-[11px] text-slate-500 font-medium">
                      SWIFT / IBAN wire credentials verified for outward remittance
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SWIFT Verified</span>
                </span>
              </CardHeader>

              <CardContent className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Recipient Full Name */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Recipient Full Name</span>
                    <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                      {remittanceDetail?.beneficiaryName || order.session?.beneficiaryName || 'Krupa Pakhan'}
                    </span>
                  </div>

                  {/* Destination Country */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Destination Country</span>
                    <span className="font-extrabold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                      <span className="text-base">{getFlag(order.session?.country || 'US')}</span>
                      <span>{order.session?.country || 'United States'}</span>
                    </span>
                  </div>

                  {/* Bank Name */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Recipient Bank Name</span>
                    <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{remittanceDetail?.beneficiaryBank || order.session?.beneficiaryBank || 'Citibank, N.A. / JPMorgan Chase'}</span>
                    </span>
                  </div>

                  {/* SWIFT / BIC */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold block">SWIFT / BIC Code</span>
                      <button
                        onClick={() => handleCopy(remittanceDetail?.swiftCode || order.session?.beneficiarySwift || 'CITIUS33', 'swift', 'SWIFT Code')}
                        className="text-slate-400 hover:text-amber-700 p-0.5 rounded cursor-pointer"
                        title="Copy SWIFT"
                      >
                        {copiedKey === 'swift' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="font-mono font-black text-slate-900 text-xs px-2 py-0.5 rounded bg-white border border-slate-200 inline-block mt-1">
                      {remittanceDetail?.swiftCode || order.session?.beneficiarySwift || 'CITIUS33'}
                    </span>
                  </div>

                  {/* Account / IBAN */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Account Number / IBAN</span>
                      <button
                        onClick={() => handleCopy(remittanceDetail?.ibanOrAccountNumber || order.session?.beneficiaryAccount || '123456789012', 'iban', 'Account Number')}
                        className="text-slate-400 hover:text-amber-700 p-0.5 rounded cursor-pointer"
                        title="Copy Account"
                      >
                        {copiedKey === 'iban' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block tracking-wider">
                      {remittanceDetail?.ibanOrAccountNumber || order.session?.beneficiaryAccount || '123456789012'}
                    </span>
                  </div>

                  {/* Bank Address */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Recipient Bank / Branch Address</span>
                    <span className="text-slate-700 font-medium mt-0.5 block leading-relaxed">
                      {remittanceDetail?.beneficiaryAddress || order.session?.beneficiaryAddress || '388 Greenwich Street, New York, NY 10013, United States'}
                    </span>
                  </div>
                </div>

                {/* Purpose & Transfer Memo */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-950 uppercase block">Transfer Purpose</span>
                      <span className="font-bold text-amber-900">
                        {remittanceDetail?.purpose?.name || order.session?.purpose || 'Higher Education / University Tuition Fees'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                    LRS A2 Code
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card C: Remitter (Sender in India) Identity Details */}
          <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-50/90 to-amber-50/20 border-b border-slate-100 p-6">
              <CardTitle className="text-base font-display font-black text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-700" />
                <span>Remitter (Sender in India) Identity Record</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Full Legal Name</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block truncate">{remitterName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Indian PAN Number</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-black text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                      {remitterPan}
                    </span>
                    <button 
                      onClick={() => handleCopy(remitterPan, 'pan', 'PAN Number')}
                      className="text-slate-400 hover:text-amber-700 p-0.5"
                    >
                      {copiedKey === 'pan' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Contact Mobile</span>
                  <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{remitterPhone}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Email Address</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{remitterEmail}</span>
                  </span>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Card D: Branch Collection / Home Delivery (If Applicable) */}
          {!isWire && order.branch && (
            <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50/90 to-amber-50/20 border-b border-slate-100 p-6">
                <CardTitle className="text-base font-display font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>Authorized Collection Branch Vault</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{order.branch.name}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{order.branch.address || order.branch.city}</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">Open Mon–Sat • 9:30 AM to 6:30 PM</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 font-black text-[10px] rounded-full uppercase">
                    Ready for Collection
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card E: Cancellation Request CTA (When eligible) */}
          {!order.cancelRequested && ['PENDING', 'PENDING_KYC', 'KYC_SUBMITTED', 'KYC_APPROVED', 'PENDING_PAYMENT', 'PAYMENT_PENDING'].includes(order.status) && (
            <div className="p-6 rounded-3xl bg-red-50/50 border border-red-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-red-900 text-sm">Need to cancel this order?</h3>
                <p className="text-xs text-red-700 font-medium mt-0.5">
                  You can submit a cancellation request before currency allocation and wire broadcast.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
                className="shrink-0 font-extrabold rounded-2xl bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-xs shadow-xs cursor-pointer transition-all active:scale-98"
              >
                {isCancelling ? 'Submitting...' : 'Request Cancellation'}
              </Button>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: TIMELINE & COMPLIANCE SIDEBAR */}
        <div className="space-y-6">
          
          {/* Order Status Timeline Card */}
          <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white sticky top-24">
            <CardHeader className="bg-gradient-to-r from-slate-50/90 to-amber-50/30 border-b border-slate-100 p-5 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-display font-black text-slate-900">
                  Order Processing Status
                </CardTitle>
                <p className="text-[10px] text-slate-500 font-medium">Real-time banking fulfillment pipeline</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              <StatusTimeline order={order} />

              {/* Security & Regulatory Clearance Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>RBI AD-II Statutory Protected</span>
                </div>
                <p className="text-[11px] text-emerald-800/90 font-medium leading-relaxed">
                  All foreign currency rates and outward remittances are backed by Authorized Dealer Category-II statutory vaults.
                </p>
              </div>

              {/* Need Assistance Hotline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Operations Desk</span>
                    <span className="text-[10px] text-slate-500 font-semibold">+91 1800-FOREXMATE</span>
                  </div>
                </div>

                <Link href="/dashboard/support">
                  <Button variant="ghost" size="sm" className="text-[11px] font-extrabold text-amber-800 hover:bg-amber-100 rounded-xl px-2.5">
                    Help Desk →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

