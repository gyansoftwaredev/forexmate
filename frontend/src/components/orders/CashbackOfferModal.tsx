"use client";

import React from 'react';
import { X, Sparkles, Gift, CheckCircle2, ShieldCheck, ArrowRight, Wallet, Percent } from 'lucide-react';

interface CashbackOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
}

const CASHBACK_SLABS = [
  { range: '₹25,000 – ₹50,000', cashback: '₹100', perk: 'Instant Checkout Credit' },
  { range: '₹50,000 – ₹1,00,000', cashback: '₹300', perk: 'Direct IMPS Bank Transfer' },
  { range: '₹1,00,000 – ₹1,50,000', cashback: '₹1,000', perk: 'Zero Delivery Fee + Cash Reward' },
  { range: '₹1,50,000 – ₹2,00,000', cashback: '₹1,800', perk: 'Live Rate Lock Guarantee' },
  { range: '₹2,00,000 – ₹2,50,000', cashback: '₹3,000', perk: 'Global Travel eSIM Voucher' },
  { range: '₹2,50,000 – ₹3,00,000', cashback: '₹4,000', perk: 'Airport Lounge Access Pass' },
  { range: '₹3,00,000 – ₹3,75,000', cashback: '₹5,500', perk: 'Priority Vault Concierge' },
  { range: '₹3,75,000 & Above', cashback: '₹7,500', perk: 'Maximum VIP Travel Reward' },
];

export function CashbackOfferModal({ isOpen, onClose, onApply }: CashbackOfferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-6 text-slate-950 relative shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-slate-950 font-bold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 border border-slate-950/20 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            First Order &amp; Volume Privilege
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            ForexMate Travel Cashback Slabs
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-900/90 mt-1">
            Get up to <span className="font-black underline decoration-2">₹7,500 guaranteed cashback</span> credited directly to your bank account upon order completion.
          </p>
        </div>

        {/* Modal Body: Slabs Table */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow">
          
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking Order Value</th>
                  <th className="py-3 px-4 text-emerald-700">Cashback Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CASHBACK_SLABS.map((slab, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-amber-50/60 transition-colors ${
                      idx === CASHBACK_SLABS.length - 1 ? 'bg-amber-500/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span>{slab.range}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-block font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {slab.cashback}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Terms & Highlights */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Transparent Terms &amp; Conditions
            </h4>
            <ul className="text-[11px] text-slate-600 space-y-1.5 font-medium leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Applicable on all 45+ currencies across <strong>Forex Card</strong> and <strong>Foreign Cash Notes</strong> bookings.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Cashback is credited via instant IMPS to your remitting bank account within 24 hours of successful order handover.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>No promo code required — our checkout engine automatically detects and applies your best eligible reward tier.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }}
            className="btn-gold flex-1 py-2.5 rounded-xl font-extrabold text-xs text-slate-950 shadow-md hover:scale-102 transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Apply Cashback &amp; Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
