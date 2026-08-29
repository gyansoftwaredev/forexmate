"use client";

import React from 'react';
import { useInvoices } from '@/features/documents/hooks/useDocuments';
import { DocumentList } from '@/features/documents/components/DocumentList';
import { Sparkles, ShieldCheck, FileText, Download } from 'lucide-react';

export default function InvoicesPage() {
  const { data: invoices, isLoading, error } = useInvoices();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading statutory tax invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-xs font-bold text-center">
        Failed to load invoices. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-blue-500/5 border border-amber-200/90 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                GST Tax Invoices & Receipts
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                RBI FEMA Audit Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
              Tax Invoices & Transaction Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Download GST-compliant tax invoices, statutory Form A2 documentation, and TCS statements for income tax filings.
            </p>
          </div>
        </div>
      </div>

      <DocumentList 
        documents={invoices || []} 
        title="Recent Statutory Invoices" 
        type="invoice" 
      />
    </div>
  );
}
