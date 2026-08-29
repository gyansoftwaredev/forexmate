"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { AddressBook } from '@/components/profile/AddressBook';
import { BankAccounts } from '@/components/profile/BankAccounts';
import { useAuth } from '@/context/AuthContext';
import { UserCheck, MapPin, Building2, Sparkles, ShieldCheck, Award, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  const userInitials = (user?.fullName || 'User')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* --- EXECUTIVE HERO PROFILE HEADER --- */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 border border-amber-200/90 p-6 sm:p-8 shadow-sm overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar Initials Badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-md border-2 border-white">
                {userInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs" title="Verified Account">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Gold Tier Executive
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  RBI LRS Compliant
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                {user?.fullName || 'Customer Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {user?.email || 'Manage personal KYC details, linked settlement accounts & addresses.'}
              </p>
            </div>
          </div>

          {/* Quick Security Badge */}
          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/80 gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Account ID: FXM-{user?.id?.slice(0, 8).toUpperCase() || 'USER'}</span>
          </div>
        </div>
      </div>

      {/* --- TABBED NAVIGATION --- */}
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-13 items-center bg-slate-100/80 border border-slate-200/80 p-1.5 rounded-2xl shadow-2xs">
          <TabsTrigger 
            value="personal" 
            className="font-extrabold text-xs sm:text-sm h-full rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Personal Info</span>
          </TabsTrigger>

          <TabsTrigger 
            value="address" 
            className="font-extrabold text-xs sm:text-sm h-full rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Address Book</span>
          </TabsTrigger>

          <TabsTrigger 
            value="banks" 
            className="font-extrabold text-xs sm:text-sm h-full rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Bank Accounts</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-0 outline-none">
          <PersonalInfoForm />
        </TabsContent>
        
        <TabsContent value="address" className="mt-0 outline-none">
          <AddressBook />
        </TabsContent>
        
        <TabsContent value="banks" className="mt-0 outline-none">
          <BankAccounts />
        </TabsContent>
      </Tabs>
      
    </div>
  );
}

