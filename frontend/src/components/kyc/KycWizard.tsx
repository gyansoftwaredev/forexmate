"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, FileText, Globe, Plane, Sparkles, ArrowRight, Check, UserCheck, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentUploadCard } from './DocumentUploadCard';
import { useSubmitKyc, useKycRules } from '../../features/compliance/hooks/useKyc';
import { KycDocument } from '../../features/compliance/types';
import { useTransactionStore } from '@/stores/transactionStore';

interface KycWizardProps {
  documents: KycDocument[];
  requiredDocTypes?: string[];
  orderId?: string;
}

const WIZARD_STEPS = [
  { id: 'IDENTITY', label: '1. Identity' },
  { id: 'DOCUMENTS', label: '2. Documents' },
  { id: 'REVIEW', label: '3. Review' },
  { id: 'SUBMITTED', label: '4. Verified' }
];

export function KycWizard({ documents, requiredDocTypes, orderId }: KycWizardProps) {
  const [step, setStep] = useState(0);
  const [activeDoc, setActiveDoc] = useState<string>('PAN');
  const submitMutation = useSubmitKyc();

  const getDoc = (type: string) => documents.find(d => d.docType === type);
  const hasDoc = (type: string) => !!getDoc(type);

  const { draftState } = useTransactionStore();
  const { data: dynamicRules, isLoading: isRulesLoading } = useKycRules(draftState.product || 'CASH', draftState.purpose || 'TOURISM');

  const getDocMeta = (type: string) => {
    switch (type) {
      case 'PAN':
        return { name: 'PAN Card (Self-Attested)', reason: 'Mandatory identity & tax clearance under Income Tax Act & RBI', icon: FileText };
      case 'PASSPORT':
        return { name: 'Indian Passport Copy', reason: 'Mandatory proof of citizenship for international forex transactions', icon: Globe };
      case 'VISA':
        return { name: 'Student / Tourist Visa / I-20 Form', reason: 'Proof of overseas stay duration & legal immigration status', icon: Plane };
      case 'ADMISSION_INVOICE':
        return { name: 'University Admission / Fee Invoice', reason: 'Official fee invoice / cost estimate from foreign institution', icon: FileText };
      case 'BANK_STATEMENT':
        return { name: '6-Month Bank Account Statement', reason: 'RBI requirement to verify source of funds & financial solvency', icon: FileText };
      case 'FORM_A2':
        return { name: 'Signed RBI Form A2 Declaration', reason: 'Mandatory declaration under Liberalised Remittance Scheme (LRS)', icon: FileText };
      case 'TICKET':
        return { name: 'Confirmed Flight Ticket', reason: 'Travel proof for physical foreign currency purchase', icon: Plane };
      default:
        return { name: type.replace(/_/g, ' '), reason: 'Required for statutory compliance verification', icon: FileText };
    }
  };

  const REQUIRED_DOCS = requiredDocTypes
    ? requiredDocTypes.map(type => {
        const meta = getDocMeta(type);
        return {
          type,
          name: meta.name,
          icon: meta.icon,
          required: true,
          reason: meta.reason,
          usedFor: ['RBI LRS Compliance']
        };
      })
    : (dynamicRules ? dynamicRules.map((r: any) => ({
        type: r.type,
        name: r.name,
        icon: r.type === 'PAN' ? FileText : r.type === 'PASSPORT' ? Globe : Plane,
        required: r.required,
        reason: r.reason,
        usedFor: r.usedFor || []
      })) : []);

  const handleFinalSubmit = async () => {
    try {
      await submitMutation.mutateAsync();
      setStep(3);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Executive Stepper Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-6 right-6 top-4 h-1 bg-slate-100 rounded-full z-0" />
          <div 
            className="absolute left-6 top-4 h-1 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full z-0 transition-all duration-500"
            style={{ width: `${(step / (WIZARD_STEPS.length - 1)) * 90}%` }}
          />
          
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 flex-1 cursor-pointer" onClick={() => i <= step && setStep(i)}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-xs transition-all duration-300 shadow-2xs",
                step === i ? "bg-[#C59B27] text-slate-950 ring-4 ring-amber-100 scale-110" :
                step > i ? "bg-emerald-600 text-white" : "bg-white border-2 border-slate-200 text-slate-400"
              )}>
                {step > i ? '✓' : i + 1}
              </div>
              <span className={cn(
                "text-[11px] font-extrabold tracking-wider uppercase transition-colors text-center",
                step >= i ? "text-slate-900" : "text-slate-400"
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: IDENTITY */}
      {step === 0 && (
        <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white animate-in fade-in duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50/90 to-amber-50/30 border-b border-slate-100 p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-display font-black text-slate-900">1. Select Identity Document</CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
                  To comply with RBI guidelines, authenticate your primary PAN identity records.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-black shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>RBI LRS Mandatory</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 space-y-6">
            {isRulesLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold">Loading requirements...</div>
            ) : REQUIRED_DOCS.filter((d: any) => d.type === 'PAN').length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold">No identity documents required.</div>
            ) : (
              REQUIRED_DOCS.filter((d: any) => d.type === 'PAN').map((doc: any) => (
                <div 
                  key={doc.type}
                  onClick={() => setActiveDoc(doc.type)}
                  className={cn(
                    "border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-center justify-between shadow-2xs",
                    activeDoc === doc.type ? "border-amber-500 bg-amber-500/5 ring-4 ring-amber-500/10" : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl shrink-0 transition-colors", activeDoc === doc.type ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500")}>
                      <doc.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{doc.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.reason}</p>
                    </div>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3", activeDoc === doc.type ? "border-amber-600 bg-amber-600" : "border-slate-300")}>
                    {activeDoc === doc.type && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              ))
            )}

            <div className="pt-6 border-t border-slate-100">
              <DocumentUploadCard 
                docType={activeDoc} 
                title={REQUIRED_DOCS.find((d: any) => d.type === activeDoc)?.name || activeDoc} 
                description={`Upload a clear picture or PDF of your ${REQUIRED_DOCS.find((d: any) => d.type === activeDoc)?.name || activeDoc}.`} 
                existingDoc={getDoc(activeDoc)}
                onSuccess={() => {}}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={() => {
                  setStep(1);
                  const nonPan = REQUIRED_DOCS.find((d: any) => d.type !== 'PAN');
                  if (nonPan) setActiveDoc(nonPan.type);
                }}
                className="px-6 py-3 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Travel Documents</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: DOCUMENTS */}
      {step === 1 && (
        <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white animate-in fade-in duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50/90 to-amber-50/30 border-b border-slate-100 p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-display font-black text-slate-900">2. Travel & Supporting Documents</CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
                  Upload Passport and travel visas for international compliance verification.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black shrink-0">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Passport & Visa</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REQUIRED_DOCS.filter((d: any) => d.type !== 'PAN').map((doc: any) => {
                const uploaded = hasDoc(doc.type);
                return (
                  <div 
                    key={doc.type}
                    onClick={() => setActiveDoc(doc.type)}
                    className={cn(
                      "border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between shadow-2xs",
                      activeDoc === doc.type ? "border-amber-500 bg-amber-500/5 ring-4 ring-amber-500/10" : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("p-2.5 rounded-xl shrink-0", activeDoc === doc.type ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500")}>
                        <doc.icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-slate-900 text-xs truncate">{doc.name}</h4>
                        <span className={cn("text-[10px] font-black uppercase mt-0.5 block", uploaded ? "text-emerald-600" : "text-slate-400")}>
                          {uploaded ? "✓ Uploaded" : "Required"}
                        </span>
                      </div>
                    </div>
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2", activeDoc === doc.type ? "border-amber-600 bg-amber-600" : "border-slate-300")}>
                      {activeDoc === doc.type && <div className="w-1 h-1 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <DocumentUploadCard 
                docType={activeDoc} 
                title={REQUIRED_DOCS.find((d: any) => d.type === activeDoc)?.name || activeDoc} 
                description={`Upload a clear picture or PDF of your ${REQUIRED_DOCS.find((d: any) => d.type === activeDoc)?.name || activeDoc}.`} 
                existingDoc={getDoc(activeDoc)}
                onSuccess={() => {}}
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={() => setStep(0)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Review</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: REVIEW */}
      {step === 2 && (
        <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white animate-in fade-in duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50/90 to-amber-50/30 border-b border-slate-100 p-6 sm:p-7">
            <CardTitle className="text-xl font-display font-black text-slate-900">3. Review & Submit Verification</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
              Verify your statutory identity and travel documents before final submission.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5 mb-4">
                  Identity Record Summary
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Passport Name:</span>
                    <span className="font-bold text-slate-900">{getDoc('PASSPORT')?.ocrData?.extractedData?.fullName || 'Verified on Card'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Passport Number:</span>
                    <span className="font-mono font-bold text-slate-900">{getDoc('PASSPORT')?.ocrData?.extractedData?.documentNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">PAN ID:</span>
                    <span className="font-mono font-bold text-amber-800">{getDoc('PAN')?.ocrData?.extractedData?.documentNumber || 'Verified on Record'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5 mb-4">
                  Compliance Document Attachments
                </h4>
                <div className="space-y-2.5 text-xs">
                  {REQUIRED_DOCS.map((doc: any) => {
                    const uploaded = hasDoc(doc.type);
                    return (
                      <div key={doc.type} className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          {uploaded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2 h-2 rounded-full bg-amber-400" />}
                          <span>{doc.name}</span>
                        </span>
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", uploaded ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200")}>
                          {uploaded ? "✓ Attached" : "Missing"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                By submitting this form, you certify that all uploaded identity documents are valid and conform to RBI Master Directions for Liberalised Remittance Scheme (LRS) and Foreign Exchange Management Act (FEMA).
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={() => setStep(1)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                disabled={submitMutation.isPending}
              >
                Back
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={submitMutation.isPending}
                className="px-7 py-3 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitMutation.isPending ? 'Submitting to Vault...' : 'Submit for Final Verification'}
                <Check className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: SUBMITTED */}
      {step === 3 && (
        <Card className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden bg-white animate-in fade-in duration-300 text-center py-12">
          <CardContent className="flex flex-col items-center space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xs">
              🎉
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-slate-900">
                {orderId ? 'Documents Submitted Successfully' : 'KYC Submitted for Compliance Review'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                {orderId
                  ? 'Your identity documents have been routed to our verification desk.'
                  : 'Your statutory identity records have been securely stored in the compliance vault.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-2.5 text-xs text-amber-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Estimated Verification Time: 5–15 Minutes</span>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/buy-forex'}
                className="px-6 py-2.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Book Forex Order</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
