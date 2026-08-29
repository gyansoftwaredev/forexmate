"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useUpdateProfile } from '../../features/profile/hooks/useProfile';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Lock 
} from 'lucide-react';

export function PersonalInfoForm() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id || '');
  const updateMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    panNumber: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile || user) {
      setFormData(prev => ({
        fullName: profile?.fullName || profile?.user?.fullName || user?.fullName || '',
        phone: profile?.mobile || profile?.user?.mobile || user?.mobile || '',
        panNumber: profile?.profiles?.panNumber || profile?.panNumber || prev.panNumber || ''
      }));
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setErrorMessage('');
    setSavedSuccess(false);

    if (formData.panNumber && formData.panNumber.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.panNumber.trim().toUpperCase())) {
        setErrorMessage('Please enter a valid 10-character PAN (e.g. ABCDE1234F).');
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        data: formData
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || 'Failed to update PAN details. Please try again.';
      setErrorMessage(msg);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm font-bold text-slate-600">Loading profile details...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-amber-50/30 border-b border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <User className="w-4 h-4" />
              </span>
              <CardTitle className="text-xl font-display font-extrabold text-slate-900">
                Personal Information
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm">
              Update your registered KYC identity and statutory contact details.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NSDL & UIDAI Ready</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile details updated successfully! Your statutory records are synchronized.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Full Name (As per PAN)</span>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">Permanent ID</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.fullName}
                disabled
                placeholder="Full Name"
                className="w-full pl-10 pr-10 py-3 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 cursor-not-allowed outline-none shadow-2xs"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Full name is locked to statutory identity records.</p>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">Primary Account</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-10 py-3 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 cursor-not-allowed outline-none shadow-2xs"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">To update primary email, contact customer support.</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Registered Mobile Number</span>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">Verified Mobile</span>
            </label>
            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-2xl p-1 shadow-2xs">
              <div className="px-2.5 py-1.5 bg-white/90 rounded-xl border border-slate-200 flex items-center gap-1 text-xs font-bold text-slate-700 shrink-0">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={formData.phone}
                disabled
                placeholder="9876543210"
                className="flex-1 px-3 py-2 text-xs sm:text-sm font-bold text-slate-600 bg-transparent cursor-not-allowed outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">To update registered mobile number, contact customer support.</p>
          </div>

          {/* PAN Number */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Permanent Account Number (PAN)</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">RBI Mandatory</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={10}
                value={formData.panNumber}
                onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase().slice(0, 10) })}
                placeholder="ABCDE1234F"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-2xl text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase outline-none transition-all shadow-2xs placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Security & Verification Guarantee Box */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-200/80 flex items-start gap-3 text-xs text-slate-600 font-medium">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your personal information is verified against official records during forex note delivery and outward remittances in compliance with RBI FEMA guidelines.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-8 py-3.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

