'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, FileText, Camera, File, Image as ImageIcon, X, RefreshCw, Trash2, Eye, Lock, Shield, Clock, ShieldCheck, PhoneCall, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadKyc, useDeleteKyc, useSendOtp, useVerifyOtp } from '../../features/compliance/hooks/useKyc';
import { KycDocument } from '../../features/compliance/types';
import { useDev } from '@/components/devtools/DevContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface DocumentUploadCardProps {
  docType: string;
  title: string;
  description: string;
  existingDoc?: KycDocument;
  onSuccess: () => void;
}

export function DocumentUploadCard({ docType, title, description, existingDoc, onSuccess }: DocumentUploadCardProps) {
  const { devFlags } = useDev();
  const skipOcr = devFlags?.skipOcr;
  const skipOtp = devFlags?.skipOtp;

  const [file, setFile] = useState<File | null>(null);
  const [ocrStep, setOcrStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<'IDLE' | 'SENT' | 'VERIFIED'>('IDLE');
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    documentNumber: '',
    fullName: '',
    dob: '',
    expiryDate: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');

  useEffect(() => {
    setFormData({ documentNumber: '', fullName: '', dob: '', expiryDate: '' });
    setOtpStep('IDLE');
    setOtpValue('');
    setError(null);
    setDevOtpCode(null);
    setCountdown(0);
  }, [docType]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const uploadMutation = useUploadKyc();
  const deleteMutation = useDeleteKyc();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum size is 5MB.');
        return;
      }
      setFile(selected);
      setError(null);
      startOcrSimulation(selected);
    }
  };

  const startOcrSimulation = (selectedFile: File) => {
    const ocrSpeed = skipOcr ? 125 : 1200;
    setOcrStep(1);
    setTimeout(() => setOcrStep(2), ocrSpeed);
    setTimeout(() => setOcrStep(3), ocrSpeed * 2);
    setTimeout(() => setOcrStep(4), ocrSpeed * 3);
    setTimeout(() => completeUpload(selectedFile), ocrSpeed * 4);
  };


  const completeUpload = async (selectedFile: File) => {
    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        docType,
        knownDocNumber: formData.documentNumber || undefined,
        knownDob: formData.dob || undefined,
        knownName: formData.fullName || undefined,
        knownExpiryDate: formData.expiryDate || undefined,
      });
      setFile(null);
      setOcrStep(0);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setOcrStep(0);
      setFile(null);
    }
  };

  const handleDelete = async () => {
    if (existingDoc) {
      await deleteMutation.mutateAsync(existingDoc.id);
    }
  };

  if (existingDoc) {
    const ocr = existingDoc.ocrData?.extractedData;
    const isRejected = existingDoc.status === 'REJECTED';
    const latestReviewNotes = existingDoc.reviews?.[0]?.notes;

    if (isRejected) {
      return (
        <div className="border-2 border-red-300 bg-red-50/40 rounded-3xl p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                <X className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-red-900 text-sm truncate" title={existingDoc.filePath}>{existingDoc.filePath}</h3>
                <p className="text-xs text-red-700 font-bold mt-0.5">❌ Document Rejected by Compliance</p>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5" 
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Re-upload</span>
            </button>
          </div>

          {latestReviewNotes && (
            <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-2xs">
              <h4 className="text-[10px] font-black text-red-700 uppercase tracking-wider mb-1">Reason for Rejection</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">{latestReviewNotes}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="border-2 border-emerald-300 bg-emerald-50/30 rounded-3xl p-6 shadow-2xs">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-emerald-950 text-sm truncate" title={existingDoc.filePath}>{existingDoc.filePath}</h3>
              <p className="text-xs text-emerald-700 font-bold mt-0.5">✓ Uploaded & Stored in Compliance Vault</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5" 
              onClick={() => window.open(`/uploads/${existingDoc.filePath}`, '_blank')}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button 
              className="px-3.5 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5" 
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {ocr && (
          <div className="mt-5 bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs">
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Extracted Record Data</span>
              </h4>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Match
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Document Number</p>
                <p className="font-mono text-xs font-black text-slate-900 mt-0.5">{ocr.documentNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Full Name</p>
                <p className="font-mono text-xs font-black text-slate-900 mt-0.5">{ocr.name || ocr.fullName || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</p>
                <p className="font-mono text-xs font-black text-slate-900 mt-0.5">{ocr.dob || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isFormValid = () => {
    if (skipOtp) return true;
    const recipient = mobileNumber || user?.mobile || user?.email;
    if (!recipient) return false;
    if (docType === 'PASSPORT') return formData.fullName && formData.documentNumber && formData.dob && formData.expiryDate && (otpStep === 'VERIFIED' || skipOtp);
    if (docType === 'PAN') return formData.documentNumber && formData.documentNumber.length === 10 && (otpStep === 'VERIFIED' || skipOtp);
    return true;
  };

  return (
    <div className="space-y-4">
      {ocrStep === 0 && (docType === 'PASSPORT' || docType === 'PAN') && (
        <div className="mb-6 space-y-4 text-left border border-slate-200/90 p-6 rounded-3xl bg-slate-50/60 shadow-2xs">
           <div className="flex items-center justify-between">
             <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
               <FileText className="w-4 h-4 text-amber-700" />
               <span>{docType === 'PAN' ? 'PAN Card Information' : 'Passport Information'}</span>
             </h4>
             <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Step 1 of 2</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {docType === 'PASSPORT' && (
               <>
                 <div>
                   <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">Passport Number</label>
                   <input className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none uppercase shadow-2xs" placeholder="e.g. Z9876543" value={formData.documentNumber} onChange={e => setFormData({...formData, documentNumber: e.target.value.toUpperCase()})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">Full Name (As per Passport)</label>
                   <input className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none shadow-2xs" placeholder="Enter full name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">Date of Birth</label>
                   <input type="date" className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none shadow-2xs" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">Passport Expiry Date</label>
                   <input type="date" className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none shadow-2xs" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
               </>
             )}

             {docType === 'PAN' && (
               <>
                 <div className="col-span-1 md:col-span-2">
                   <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">PAN Card Number</label>
                   <input className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-mono font-black focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none uppercase shadow-2xs" placeholder="ABCDE1234F" maxLength={10} value={formData.documentNumber} onChange={e => setFormData({...formData, documentNumber: e.target.value.toUpperCase()})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">Date of Birth <span className="text-slate-400 font-normal lowercase">(as on pan)</span></label>
                   <input type="date" className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none shadow-2xs" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">Full Name <span className="text-slate-400 font-normal lowercase">(as on pan)</span></label>
                   <input className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none shadow-2xs" placeholder="As on PAN card" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
               </>
             )}

             {(!user?.mobile && !skipOtp) && (
               <div className="col-span-1 md:col-span-2">
                 <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">Registered Mobile Number</label>
                 <div className="relative">
                   <PhoneCall className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                   <input className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none shadow-2xs" placeholder="e.g. +91 98765 43210" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} disabled={otpStep === 'VERIFIED'} />
                 </div>
               </div>
             )}

             <div className="col-span-1 md:col-span-2 mt-2">
                {skipOtp ? (
                  <div className="flex items-center justify-center p-3 text-emerald-800 text-xs font-extrabold border border-emerald-200 rounded-2xl bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> OTP Verification Bypassed (Dev Sandbox Mode)
                  </div>
                ) : (
                  <>
                    {otpStep === 'IDLE' && (
                      <button 
                        type="button" 
                        className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          if(!formData.documentNumber) {
                            return setError('Enter document number first'); 
                          }
                          const recipient = mobileNumber || user?.mobile || user?.email || '';
                          if(!recipient) {
                            return setError('Please enter a valid mobile number or email');
                          }
                          setError(null); 
                          try {
                            const res = await sendOtpMutation.mutateAsync({ recipient, purpose: `KYC_${docType}` });
                            if (res && (res as any).devCode) {
                              setDevOtpCode((res as any).devCode);
                            }
                            setOtpStep('SENT'); 
                            setCountdown(60);
                          } catch (err: any) {
                            setError(err.message || 'Failed to send OTP');
                          }
                        }}
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>{sendOtpMutation.isPending ? 'Sending Verification OTP...' : 'Authenticate & Send Verification OTP'}</span>
                      </button>
                    )}
                    
                    {error && (
                      <div className="mt-2 text-xs text-red-600 font-bold bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    {otpStep === 'SENT' && (
                      <div className="bg-amber-500/10 border border-amber-200 rounded-2xl p-4 animate-in fade-in">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-xs font-bold text-amber-950">
                            Verification OTP sent to <strong>{mobileNumber || user?.mobile || user?.email}</strong>
                          </p>
                          {countdown > 0 ? (
                            <span className="text-[11px] text-amber-800 font-extrabold flex items-center gap-1"><Clock size={12} /> Resend in {countdown}s</span>
                          ) : (
                            <button className="text-[11px] text-amber-900 hover:text-amber-950 font-black underline cursor-pointer" onClick={async (e) => {
                              e.stopPropagation();
                              setError(null);
                              try {
                                const res = await sendOtpMutation.mutateAsync({ recipient: mobileNumber || user?.mobile || user?.email || '', purpose: `KYC_${docType}` });
                                if (res && (res as any).devCode) {
                                  setDevOtpCode((res as any).devCode);
                                }
                                setCountdown(60);
                                toast.success('Verification OTP resent successfully!');
                              } catch (err: any) {
                                setError(err.message || 'Failed to send OTP');
                              }
                            }}>Resend OTP</button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input className="flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none shadow-2xs" placeholder="Enter 6-digit OTP" maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value)} />
                          <button 
                            type="button" 
                            className="px-5 py-2 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50" 
                            disabled={verifyOtpMutation.isPending} 
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              setError(null);
                              try {
                                const res = await verifyOtpMutation.mutateAsync({ recipient: mobileNumber || user?.mobile || user?.email || '', purpose: `KYC_${docType}`, code: otpValue });
                                if (res.verified) {
                                  setOtpStep('VERIFIED');
                                  setDevOtpCode(null);
                                } else {
                                  setError('Invalid OTP code. Please check and try again.');
                                }
                              } catch (err: any) {
                                setError(err.message || 'Verification failed');
                              }
                            }}
                          >
                            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                        {devOtpCode && (
                          <div className="mt-3 bg-white border border-amber-300 rounded-xl p-3 text-[11px] text-amber-900 flex items-center justify-between shadow-2xs">
                            <span className="flex items-center gap-1.5"><Shield size={14} className="text-amber-600 shrink-0" /> [Dev Mode Code]: <strong>{devOtpCode}</strong></span>
                            <button className="underline font-black text-amber-950 hover:text-amber-900 ml-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); setOtpValue(devOtpCode); }}>Auto-fill</button>
                          </div>
                        )}
                      </div>
                    )}
 
                    {otpStep === 'VERIFIED' && (
                      <div className="flex items-center justify-center p-3 text-emerald-900 text-xs font-extrabold border border-emerald-300 rounded-2xl bg-emerald-50">
                        <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" /> {docType === 'PAN' ? 'PAN ID Card' : 'Passport Document'} Authenticated Successfully
                      </div>
                    )}
                  </>
                )}
             </div>
           </div>
        </div>
      )}

      <div
        onClick={() => {
          if (docType === 'PAN' && formData.documentNumber && formData.documentNumber.length !== 10) {
            setError('PAN number must be exactly 10 characters long.');
            return;
          }
          if (!isFormValid()) {
            setError('Please fill in the document details and complete verification above before uploading.');
            return;
          }
          !ocrStep && fileInputRef.current?.click();
        }}
        className={cn(
          "border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all bg-white shadow-2xs",
          ocrStep > 0 ? "border-amber-500 bg-amber-50/30" : "border-slate-300 hover:border-amber-500 hover:bg-amber-50/10 cursor-pointer"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".jpg,.jpeg,.png,.pdf" 
          onChange={handleFileChange}
          disabled={ocrStep > 0}
        />
        
        {ocrStep === 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mb-3.5 shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Upload {title}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-sm">{description}</p>
            {error && <p className="text-xs text-red-600 mt-3 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">{error}</p>}
            
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <button 
                type="button" 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                onClick={(e) => { e.stopPropagation(); if (!isFormValid()) { setError('Please fill in details and complete verification first.'); return; } fileInputRef.current?.click(); }}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take Photo</span>
              </button>
              <button 
                type="button" 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                onClick={(e) => { e.stopPropagation(); if (!isFormValid()) { setError('Please fill in details and complete verification first.'); return; } fileInputRef.current?.click(); }}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Image</span>
              </button>
              <button 
                type="button" 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                onClick={(e) => { e.stopPropagation(); if (!isFormValid()) { setError('Please fill in details and complete verification first.'); return; } fileInputRef.current?.click(); }}
              >
                <File className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <RefreshCw className="w-10 h-10 text-amber-600 animate-spin mb-4" />
            <div className="space-y-2 w-64 text-left">
              <p className={cn("text-xs font-bold transition-colors", ocrStep >= 1 ? "text-amber-800" : "text-slate-400")}>
                {ocrStep > 1 ? '✓ Uploaded securely' : 'Uploading...'}
              </p>
              <p className={cn("text-xs font-bold transition-colors", ocrStep >= 2 ? "text-amber-800" : ocrStep === 2 ? 'Reading Document...' : 'Waiting...')} >
                {ocrStep > 2 ? '✓ Document identified' : ocrStep === 2 ? 'Reading Document...' : 'Waiting...'}
              </p>
              <p className={cn("text-xs font-bold transition-colors", ocrStep >= 3 ? "text-amber-800" : ocrStep === 3 ? 'Extracting Name & Details...' : 'Waiting...')} >
                {ocrStep > 3 ? '✓ Data extracted' : ocrStep === 3 ? 'Extracting Name & Details...' : 'Waiting...'}
              </p>
              <p className={cn("text-xs font-bold transition-colors", ocrStep >= 4 ? "text-emerald-700" : ocrStep === 4 ? 'Running verification checks...' : 'Waiting...')} >
                {ocrStep > 4 ? '✓ Verification complete' : ocrStep === 4 ? 'Running verification checks...' : 'Waiting...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
