"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus, ShieldCheck, Trash2, CreditCard, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useAddBank, useDeleteBank } from '../../features/profile/hooks/useProfile';

export function BankAccounts() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id || '');
  const addBankMutation = useAddBank();
  const deleteBankMutation = useDeleteBank();

  const [isAdding, setIsAdding] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: '',
    holderName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const handleAdd = async () => {
    if (!user?.id) return;
    await addBankMutation.mutateAsync({ userId: user.id, data: newBank });
    setIsAdding(false);
    setNewBank({ bankName: '', holderName: '', accountNumber: '', ifscCode: '' });
  };

  const handleDelete = async (bankId: string) => {
    if (!user?.id) return;
    if (confirm('Are you sure you want to delete this bank account?')) {
      await deleteBankMutation.mutateAsync({ userId: user.id, bankId });
    }
  };

  const banks = profile?.profiles?.banks || [];

  return (
    <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/30 border-b border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Building2 className="w-4 h-4" />
              </span>
              <CardTitle className="text-xl font-display font-extrabold text-slate-900">
                Linked Bank Accounts
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm">
              Link authorized INR bank accounts for rapid outward wire clearance and instant remittance refunds.
            </CardDescription>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            {isAdding ? (
              <span>Cancel</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link New Account</span>
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* ADD NEW BANK DRAWER / CARD */}
        {isAdding && (
          <div className="p-6 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/20 rounded-3xl space-y-5 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">Add Verified Settlement Account</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">Bank Name</label>
                <input
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  value={newBank.bankName}
                  onChange={e => setNewBank({ ...newBank, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">Account Holder Name (As per Bank)</label>
                <input
                  placeholder="e.g. Krupa Pakhan"
                  value={newBank.holderName}
                  onChange={e => setNewBank({ ...newBank, holderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">Bank Account Number</label>
                <input
                  placeholder="e.g. 50100234567890"
                  type="password"
                  value={newBank.accountNumber}
                  onChange={e => setNewBank({ ...newBank, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">IFSC Code (11 Digits)</label>
                <input
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  value={newBank.ifscCode}
                  onChange={e => setNewBank({ ...newBank, ifscCode: e.target.value.toUpperCase().slice(0, 11) })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-black text-slate-900 outline-none shadow-2xs font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={addBankMutation.isPending || !newBank.bankName || !newBank.accountNumber}
                className="px-6 py-2 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {addBankMutation.isPending ? 'Verifying & Saving...' : 'Link Bank Account'}
              </button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs">Loading bank accounts...</div>
        ) : banks.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl mb-3 shadow-2xs">
              🏦
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">No Bank Accounts Linked Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-5">
              Link your primary savings or current bank account for instant INR payouts, refunds, and RBI LRS outward remittances.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Link First Bank Account</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banks.map((bank: any) => (
              <div 
                key={bank.id} 
                className="border border-slate-200/90 rounded-2xl p-5 relative bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 hover:border-emerald-400/80 hover:shadow-xs transition-all group"
              >
                <button 
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => handleDelete(bank.id)}
                  title="Remove Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-200/90 shadow-2xs rounded-2xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-emerald-700" />
                  </div>

                  <div className="space-y-1 pr-6">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {bank.bankName}
                    </h3>
                    <p className="text-xs font-mono font-bold text-slate-600 tracking-wider">
                      •••• •••• {bank.accountNumber?.slice(-4) || '****'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">{bank.holderName}</p>

                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>IMPS / NEFT Ready</span>
                      </div>
                      {bank.ifscCode && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          IFSC: {bank.ifscCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Compliance Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-200/80 flex items-start gap-3 text-xs text-slate-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your bank accounts are securely encrypted with bank-grade 256-bit SSL protocols. Under statutory RBI guidelines, outward transfers and currency buyback payouts can only be routed to accounts matching your KYC identity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

