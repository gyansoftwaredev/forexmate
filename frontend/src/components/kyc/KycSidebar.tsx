'use client';

import React from 'react';
import { Lock, CheckCircle2, Circle, Clock, ShieldCheck, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { KycSummaryResponse } from '../../features/compliance/types';

interface KycSidebarProps {
  data: KycSummaryResponse | undefined;
}

export function KycSidebar({ data }: KycSidebarProps) {
  const documents = data?.documents || [];

  const getDocStatus = (type: string) => {
    const doc = documents.find(d => d.docType === type);
    if (!doc) return 'Missing';
    if (doc.status === 'APPROVED') return 'Approved';
    if (doc.status === 'REJECTED') return 'Rejected';
    if (doc.status === 'REVIEWING') return 'Awaiting Review';
    if (doc.ocrData) return 'OCR Complete';
    return 'Uploaded';
  };

  const getStatusColor = (status: string) => {
    if (['Approved', 'Eligible', 'Cleared', 'VERIFIED'].includes(status)) return 'text-emerald-800 bg-emerald-50 border-emerald-300';
    if (['Missing', 'Unknown', 'Pending Upload', 'NOT_SUBMITTED'].includes(status)) return 'text-slate-500 bg-slate-50 border-slate-200';
    if (['Rejected', 'Ineligible', 'Flagged'].includes(status)) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-amber-900 bg-amber-50 border-amber-300';
  };

  const panDoc = documents.find(d => d.docType === 'PAN');
  const lrsStatus = !panDoc
    ? 'Unknown'
    : data?.overallStatus === 'LRS_FAILED'
    ? 'Ineligible'
    : panDoc.status === 'APPROVED'
    ? 'Eligible'
    : panDoc.status === 'REJECTED'
    ? 'Ineligible'
    : 'Under Review';

  const hasApproved = documents.some(d => d.status === 'APPROVED');
  const hasReviewing = documents.some(d => d.status === 'REVIEWING');
  const amlStatus = hasApproved ? 'Cleared' : hasReviewing ? 'In Progress' : 'Pending';

  const requiredTypes = ['PAN', 'PASSPORT'];
  const filled = requiredTypes.filter(t => documents.some(d => d.docType === t)).length;
  const progress = Math.round((filled / requiredTypes.length) * 100);

  return (
    <div className="space-y-5">
      {/* Progress Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>KYC Progress</span>
          </h3>
          <span className="text-xs font-mono font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            {progress}% Complete
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Email Address Verified</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Mobile OTP Verified</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            {getDocStatus('PAN') !== 'Missing'
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
            <span className="text-xs font-bold text-slate-700">PAN Card Attached</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            {getDocStatus('PASSPORT') !== 'Missing'
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
            <span className="text-xs font-bold text-slate-700">Passport / Visa Attached</span>
          </div>
        </div>
      </div>

      {/* Compliance Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6">
        <h3 className="font-display font-black text-slate-900 text-sm mb-4">
          Statutory Compliance Summary
        </h3>
        <div className="space-y-2.5 text-xs">

          {/* Overall */}
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Overall Status</span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getStatusColor(
              data?.overallStatus === 'APPROVED' ? 'Approved' : data?.overallStatus === 'LRS_FAILED' ? 'LRS_FAILED' : data?.overallStatus === 'NOT_SUBMITTED' ? 'Pending Upload' : 'Pending'
            )}`}>
              {data?.overallStatus === 'NOT_SUBMITTED' ? 'Pending Upload' : data?.overallStatus === 'LRS_FAILED' ? 'LRS Failed' : (data?.overallStatus || 'Pending Upload')}
            </span>
          </div>

          {/* PAN */}
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">PAN ID Record</span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getStatusColor(getDocStatus('PAN'))}`}>
              {getDocStatus('PAN')}
            </span>
          </div>

          {/* Passport */}
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Passport Document</span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getStatusColor(getDocStatus('PASSPORT'))}`}>
              {getDocStatus('PASSPORT')}
            </span>
          </div>

          {/* LRS Eligible */}
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">RBI LRS Eligibility</span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getStatusColor(lrsStatus)}`}>
              {lrsStatus === 'Eligible' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
              {lrsStatus === 'Ineligible' && <ShieldAlert className="w-3 h-3 text-red-600" />}
              {lrsStatus === 'Under Review' && <Clock className="w-3 h-3 text-amber-600" />}
              <span>{lrsStatus}</span>
            </span>
          </div>

          {/* AML Screening */}
          <div className="flex justify-between items-center py-1.5">
            <span className="text-slate-500 font-medium">AML / Sanctions Screening</span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getStatusColor(amlStatus)}`}>
              {amlStatus === 'Cleared' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
              {(amlStatus === 'In Progress' || amlStatus === 'Pending') && <Clock className="w-3 h-3 text-amber-600" />}
              <span>{amlStatus}</span>
            </span>
          </div>

        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-3xl border border-emerald-200/90 p-5 flex items-start gap-3.5 shadow-2xs">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">AES-256 Statutory Vault</h4>
          <p className="text-[11px] text-emerald-800/90 font-medium mt-0.5 leading-relaxed">
            Your government ID documents are encrypted at rest with hardware-security modules adhering to RBI data protection guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}

