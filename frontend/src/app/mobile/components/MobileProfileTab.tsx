"use client";

import React, { useState } from 'react';
import { 
  User, ShieldCheck, ShieldAlert, FileText, Camera, Upload, 
  MapPin, Plus, LogOut, ChevronRight, CheckCircle2, Lock, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileProfileTabProps {
  onNavigateHome: () => void;
}

export function MobileProfileTab({ onNavigateHome }: MobileProfileTabProps) {
  const { user, logout } = useAuth();
  const [showKycScanner, setShowKycScanner] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<string | null>(null);

  const displayName = user?.fullName || 'Alex Harrison';
  const email = user?.email || 'alex.harrison@example.com';
  const mobile = user?.mobile || '+91 98765 43210';

  const handleUploadSimulate = (docType: string) => {
    setUploadedDoc(docType);
    setTimeout(() => {
      setUploadedDoc(null);
      setShowKycScanner(false);
    }, 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24 scrollbar-none bg-slate-50">
      
      {/* User Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-md">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-black text-amber-400 text-lg">
              {displayName.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">{displayName}</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{email}</div>
            <div className="text-[10px] text-slate-500 font-medium">{mobile}</div>
          </div>
        </div>

        <button
          onClick={() => setShowKycScanner(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-[11px] shadow-xs hover:bg-amber-100"
        >
          KYC Vault
        </button>
      </div>

      {/* RBI LRS $250,000 Quota Meter */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black text-slate-900">RBI LRS Quota ($250,000 Limit)</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Compliant
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <div>
            <div className="text-[10px] text-slate-500 font-semibold">Used (FY 2026-27)</div>
            <div className="font-black text-amber-600">$ 1,25,000 USD</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-semibold">Remaining Quota</div>
            <div className="font-black text-emerald-700">$ 1,25,000 USD</div>
          </div>
        </div>

        {/* Ring progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full w-[50%] rounded-full" />
        </div>
      </div>

      {/* Document Vault Summary */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900">Mandatory RBI KYC Documents</span>
          <button
            onClick={() => setShowKycScanner(true)}
            className="text-[10px] font-extrabold text-amber-600 flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            <span>Upload New</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">Passport</div>
              <div className="text-[9px] text-emerald-700 font-extrabold">Verified</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">PAN Card</div>
              <div className="text-[9px] text-emerald-700 font-extrabold">Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="space-y-2">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 flex items-center justify-between text-xs font-extrabold text-slate-800 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-amber-600" />
            <span>Switch to Desktop Customer Portal</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={logout}
          className="w-full p-3.5 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 flex items-center justify-between text-xs font-extrabold shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out of Mobile App</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>

      {/* KYC Scanner Modal */}
      {showKycScanner && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Camera className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">KYC Document Camera Scanner</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Tap a document to scan & submit directly to RBI compliance desk</p>
            </div>

            {uploadedDoc ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-black flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadedDoc} Scanned & Uploaded!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUploadSimulate('Passport Front')}
                  className="p-3 bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-2xl text-xs font-extrabold text-slate-800"
                >
                  📘 Passport Front
                </button>
                <button
                  onClick={() => handleUploadSimulate('Valid Visa')}
                  className="p-3 bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-2xl text-xs font-extrabold text-slate-800"
                >
                  ✈️ Air Ticket / Visa
                </button>
              </div>
            )}

            <button
              onClick={() => setShowKycScanner(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
            >
              Close Camera Scanner
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
