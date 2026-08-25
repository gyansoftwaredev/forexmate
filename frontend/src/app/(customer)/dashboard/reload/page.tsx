"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, RefreshCw, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ReloadPage() {
  const router = useRouter();
  const [actionType, setActionType] = useState<'RELOAD' | 'UNLOAD'>('RELOAD');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9842');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('1000');
  
  const rates: Record<string, number> = {
    USD: 84.13,
    EUR: 91.05,
    GBP: 106.80,
    SGD: 62.40,
    AUD: 55.60
  };

  const currentRate = rates[currency] || 84.13;
  const inrTotal = Math.round(Number(amount || 0) * currentRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid foreign currency amount');
      return;
    }

    toast.success(`Redirecting to instant ${actionType.toLowerCase()} order processing...`);
    router.push(`/buy-forex?tab=card&type=card&currency=${currency}&amount=${amount}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reload & Unload Travel Card</h1>
          <p className="text-slate-500 font-medium mt-1">Instant 24/7 top-up and Indian Rupee refund for your multi-currency Forex Card.</p>
        </div>

        <Link href="/dashboard/cards" className="text-xs font-black text-amber-700 hover:underline flex items-center gap-1">
          <span>View Active Cards</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200/90 bg-white shadow-2xs rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6">
              <div className="flex bg-slate-200/70 p-1 rounded-xl w-full max-w-xs mb-3">
                <button
                  type="button"
                  onClick={() => setActionType('RELOAD')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                    actionType === 'RELOAD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ RELOAD CARD
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('UNLOAD')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                    actionType === 'UNLOAD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🏦 UNLOAD TO INR
                </button>
              </div>

              <CardTitle className="text-lg font-black text-slate-900">
                {actionType === 'RELOAD' ? 'Add Funds to Forex Card' : 'Encash Unused Currency to Bank Account'}
              </CardTitle>
              <CardDescription>
                {actionType === 'RELOAD' 
                  ? 'Locked live interbank exchange rates with zero margin markups.'
                  : 'Refund remaining foreign currency balance back into your linked Indian bank account.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Select Target Card */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 block">Select Forex Card</label>
                  <select
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="4532 •••• •••• 9842">VISA PLATINUM — 4532 •••• •••• 9842 (Active)</option>
                    <option value="5241 •••• •••• 1088">MASTERCARD EXECUTIVE — 5241 •••• •••• 1088 (Active)</option>
                  </select>
                </div>

                {/* Currency & Amount Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 block">Currency Pocket</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full h-11 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 block">Foreign Amount ({currency})</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="rounded-xl border-slate-200 h-11 font-black text-slate-900"
                    />
                  </div>
                </div>

                {/* Calculated Total Card */}
                <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">
                      {actionType === 'RELOAD' ? 'NET INR PAYABLE' : 'NET INR CREDIT TO BANK'}
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      ₹{inrTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-extrabold text-slate-500 block">APPLIED RATE</span>
                    <span className="text-xs font-black text-amber-900">1 {currency} = ₹{currentRate}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="btn-gold w-full h-12 rounded-xl text-xs font-black text-slate-950 shadow-md hover:scale-[1.01] transition-transform"
                >
                  <Zap className="w-4 h-4 mr-2 fill-slate-950" />
                  <span>Proceed to {actionType === 'RELOAD' ? 'Reload Card' : 'Unload Card'}</span>
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Instant Benefits */}
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-2xs rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant Card Top-Up Highlights</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { title: '30-Minute Processing', desc: 'Loaded funds reflect on card within 30 minutes during bank hours.' },
                { title: 'Zero Markup Conversion', desc: 'No hidden cross-currency surcharge when spending abroad.' },
                { title: 'RBI LRS Compliant', desc: 'Automatic digital Form A2 generation for regulatory clearance.' },
                { title: '24/7 Global Assistance', desc: 'Emergency card blocking and replacement anywhere in the world.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-extrabold block">{item.title}</strong>
                    <span className="text-slate-500 font-medium">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
