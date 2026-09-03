'use client';

import React from 'react';
import Link from 'next/link';
import { RemittanceOrder, RemittanceStatus } from '../types';
import { Globe, ArrowRight, Landmark, Hash, Check, Calendar } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  PENDING:             { label: 'KYC Pending',          color: 'bg-amber-100 text-amber-900 border-amber-300', badge: 'PENDING' },
  PENDING_KYC:         { label: 'KYC Pending',          color: 'bg-amber-100 text-amber-900 border-amber-300', badge: 'PENDING' },
  KYC_SUBMITTED:       { label: 'Compliance Review',    color: 'bg-blue-100 text-blue-900 border-blue-200',    badge: 'REVIEW' },
  COMPLIANCE_REVIEW:   { label: 'Compliance Review',    color: 'bg-blue-100 text-blue-900 border-blue-200',    badge: 'REVIEW' },
  READY_TO_FORWARD:    { label: 'Processing',           color: 'bg-indigo-100 text-indigo-900 border-indigo-200', badge: 'PROCESSING' },
  PROCESSING:          { label: 'Processing',           color: 'bg-indigo-100 text-indigo-900 border-indigo-200', badge: 'PROCESSING' },
  FORWARDED_TO_PARTNER:{ label: 'Nostro Wire In-Flight',color: 'bg-purple-100 text-purple-900 border-purple-200', badge: 'IN-FLIGHT' },
  PARTNER_PROCESSING:  { label: 'Nostro Wire In-Flight',color: 'bg-purple-100 text-purple-900 border-purple-200', badge: 'IN-FLIGHT' },
  TRANSFER_PROCESSING: { label: 'Nostro Wire In-Flight',color: 'bg-purple-100 text-purple-900 border-purple-200', badge: 'IN-FLIGHT' },
  TRANSFER_COMPLETED:  { label: 'Settled to Beneficiary', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', badge: 'COMPLETED' },
  COMPLETED:           { label: 'Settled to Beneficiary', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', badge: 'COMPLETED' },
  CANCELLED:           { label: 'Cancelled',            color: 'bg-red-100 text-red-900 border-red-200',        badge: 'CANCELLED' },
  REJECTED:            { label: 'Rejected',             color: 'bg-red-100 text-red-900 border-red-200',        badge: 'REJECTED' },
};

interface RemittanceListProps {
  remittances: RemittanceOrder[];
}

export const RemittanceList: React.FC<RemittanceListProps> = ({ remittances }) => {
  if (remittances.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-2xs">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-2xs">
          🌍
        </div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">No Wire Transfers Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          You haven't initiated any international outward remittances or university fee transfers yet.
        </p>
        <Link 
          href="/remittance" 
          className="px-6 py-3.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Send Money Abroad (Wire)</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {remittances.map(order => {
        const item = order.items[0];
        const detail = item?.remittance;
        const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED' || order.complianceStatus === 'REJECTED';
        const config = isCancelled
          ? { label: 'Cancelled / Rejected', color: 'bg-red-100 text-red-900 border-red-200', badge: 'CANCELLED' }
          : (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING);

        return (
          <Link key={order.id} href={`/dashboard/remittances/${order.id}`}>
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-700">{order.orderNumber}</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  <p className="text-xl font-display font-black text-slate-900">
                    {item?.currency.symbol || item?.currency.code} {Number(item?.amount || 0).toLocaleString()} {item?.currency.code}
                  </p>

                  {detail && (
                    <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 pt-0.5">
                      <Landmark className="w-3.5 h-3.5 text-slate-400" />
                      <span>{detail.beneficiaryName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium">{detail.beneficiaryBank}</span>
                    </p>
                  )}

                  {detail?.swiftCode && (
                    <p className="text-[11px] text-slate-400 font-mono">SWIFT: {detail.swiftCode}</p>
                  )}
                </div>

                <div className="text-left sm:text-right space-y-1 sm:space-y-1.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <p className="text-lg font-mono font-black text-slate-900">
                    ₹{Number(order.totalAmountInr).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-400 font-medium flex sm:justify-end items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
