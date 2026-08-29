"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Trash2, Globe, Landmark, 
  CheckCircle, AlertCircle, X, ArrowRight, Clipboard, 
  Sparkles, ShieldCheck, Lock, Building2, Send, Check, Hash, MapPin, User
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import API_URL, { authFetch, apiJson } from '@/lib/api';

export const WORLD_COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
  { name: 'New Zealand', flag: '🇳🇿', code: 'NZ' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { name: 'Ireland', flag: '🇮🇪', code: 'IE' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
  { name: 'Italy', flag: '🇮🇹', code: 'IT' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES' },
  { name: 'Sweden', flag: '🇸🇪', code: 'SE' },
  { name: 'Norway', flag: '🇳🇴', code: 'NO' },
  { name: 'Denmark', flag: '🇩🇰', code: 'DK' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
  { name: 'Qatar', flag: '🇶🇦', code: 'QA' },
  { name: 'Hong Kong', flag: '🇭🇰', code: 'HK' },
  { name: 'Thailand', flag: '🇹🇭', code: 'TH' },
  { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
  { name: 'Malaysia', flag: '🇲🇾', code: 'MY' },
  { name: 'Philippines', flag: '🇵🇭', code: 'PH' },
  { name: 'Poland', flag: '🇵🇱', code: 'PL' },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
  { name: 'Austria', flag: '🇦🇹', code: 'AT' },
  { name: 'Belgium', flag: '🇧🇪', code: 'BE' },
  { name: 'Finland', flag: '🇫🇮', code: 'FI' },
  { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ' },
  { name: 'Hungary', flag: '🇭🇺', code: 'HU' },
  { name: 'Greece', flag: '🇬🇷', code: 'GR' },
  { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
  { name: 'China', flag: '🇨🇳', code: 'CN' },
  { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
  { name: 'Mexico', flag: '🇲🇽', code: 'MX' },
  { name: 'Indonesia', flag: '🇮🇩', code: 'ID' },
  { name: 'Vietnam', flag: '🇻🇳', code: 'VN' },
  { name: 'Mauritius', flag: '🇲🇺', code: 'MU' },
  { name: 'Sri Lanka', flag: '🇱🇰', code: 'LK' },
  { name: 'Nepal', flag: '🇳🇵', code: 'NP' },
  { name: 'Bangladesh', flag: '🇧🇩', code: 'BD' },
  { name: 'Egypt', flag: '🇪🇬', code: 'EG' },
  { name: 'Kenya', flag: '🇰🇪', code: 'KE' },
  { name: 'Israel', flag: '🇮🇱', code: 'IL' },
  { name: 'Oman', flag: '🇴🇲', code: 'OM' },
  { name: 'Kuwait', flag: '🇰🇼', code: 'KW' },
  { name: 'Bahrain', flag: '🇧🇭', code: 'BH' },
  { name: 'Cyprus', flag: '🇨🇾', code: 'CY' },
  { name: 'Malta', flag: '🇲🇹', code: 'MT' },
  { name: 'Luxembourg', flag: '🇱🇺', code: 'LU' },
  { name: 'Iceland', flag: '🇮🇸', code: 'IS' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
  { name: 'Chile', flag: '🇨🇱', code: 'CL' },
  { name: 'Colombia', flag: '🇨🇴', code: 'CO' },
  { name: 'Peru', flag: '🇵🇪', code: 'PE' },
  { name: 'Taiwan', flag: '🇹🇼', code: 'TW' },
  { name: 'Romania', flag: '🇷🇴', code: 'RO' },
  { name: 'Bulgaria', flag: '🇧🇬', code: 'BG' },
  { name: 'Croatia', flag: '🇭🇷', code: 'HR' },
  { name: 'Estonia', flag: '🇪🇪', code: 'EE' },
  { name: 'Latvia', flag: '🇱🇻', code: 'LV' },
  { name: 'Lithuania', flag: '🇱🇹', code: 'LT' },
  { name: 'Slovakia', flag: '🇸🇰', code: 'SK' },
  { name: 'Slovenia', flag: '🇸🇮', code: 'SI' },
];

interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  ibanOrAccountNumber: string;
  swiftCode: string;
  address: string;
  country: string;
  createdAt: string;
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('United States');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');

  const filteredCountries = WORLD_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
    c.code.toLowerCase().includes(countryFilter.toLowerCase())
  );

  const fetchBeneficiaries = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/remittances/beneficiaries`);
      const data = await apiJson<any[]>(res);
      setBeneficiaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load beneficiaries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !bankName.trim() || !accountNumber.trim() || !swiftCode.trim() || !address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // SWIFT validation check
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;
    if (!swiftRegex.test(swiftCode.trim())) {
      toast.error('Invalid SWIFT/BIC code format. Must be 8 or 11 alphanumeric characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/remittances/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          bankName: bankName.trim(),
          swiftCode: swiftCode.trim().toUpperCase(),
          ibanOrAccountNumber: accountNumber.trim(),
          address: address.trim(),
          country
        })
      });
      const newBen = await apiJson<Beneficiary>(res);
      setBeneficiaries(prev => [newBen, ...prev]);
      toast.success('Wire beneficiary saved successfully');
      setIsAddOpen(false);

      // Reset Form
      setName('');
      setBankName('');
      setAccountNumber('');
      setSwiftCode('');
      setAddress('');
      setCountry('United States');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save beneficiary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wire beneficiary?')) return;
    try {
      await authFetch(`${API_URL}/remittances/beneficiaries/${id}`, {
        method: 'DELETE'
      });
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      toast.success('Beneficiary removed successfully');
    } catch (err) {
      toast.error('Failed to delete beneficiary');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getCountryFlag = (countryName: string) => {
    const found = WORLD_COUNTRIES.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    return found?.flag || '🌐';
  };

  const filtered = beneficiaries.filter(b => 
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ibanOrAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.swiftCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* --- EXECUTIVE HERO BENEFICIARIES HEADER --- */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-blue-500/5 border border-amber-200/90 p-6 sm:p-8 shadow-sm overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                RBI LRS Remittance Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                SWIFT / IBAN Verified
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
              International Wire Beneficiaries
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Save verified foreign bank accounts for university tuition, family maintenance, medical transfers, and corporate trade remittances.
            </p>
          </div>

          <button 
            onClick={() => setIsAddOpen(true)} 
            className="px-5 py-3.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add Wire Beneficiary</span>
          </button>
        </div>
      </div>

      {/* --- SEARCH & QUICK FILTERS --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            placeholder="Search by beneficiary name, bank, country, IBAN..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-xs font-bold text-slate-900 outline-none shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>Total Saved: <strong className="text-slate-900">{beneficiaries.length}</strong> accounts</span>
        </div>
      </div>

      {/* --- BENEFICIARIES LIST GRID --- */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading wire beneficiaries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xs">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-2xs">
            🌐
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            {searchQuery ? 'No matching beneficiaries found' : 'No Wire Beneficiaries Saved Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            {searchQuery 
              ? `No accounts matched "${searchQuery}". Try searching by another keyword.`
              : 'Add international university accounts, overseas bank accounts, or vendor IBANs for 1-click international remittances.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-6 py-3 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add First Beneficiary</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(ben => (
            <Card key={ben.id} className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden hover:border-amber-400 hover:shadow-md transition-all bg-white flex flex-col justify-between group">
              <CardHeader className="bg-gradient-to-r from-slate-50/80 to-amber-50/20 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-display font-black text-sm shadow-xs border border-white shrink-0">
                    {ben.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'WB'}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold text-slate-900">{ben.name}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
                      <span>{getCountryFlag(ben.country)}</span>
                      <span>{ben.country}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(ben.id)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                  title="Remove Beneficiary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Bank Name</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                      <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ben.bankName}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">SWIFT / BIC Code</span>
                    <span className="font-mono font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{ben.swiftCode}</span>
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Account / IBAN Number</span>
                    <div className="font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl flex items-center justify-between mt-1 shadow-2xs">
                      <span className="truncate">{ben.ibanOrAccountNumber}</span>
                      <button 
                        onClick={() => copyToClipboard(ben.ibanOrAccountNumber, 'IBAN / Account Number')}
                        className="text-slate-400 hover:text-amber-700 p-1 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                        title="Copy Account Number"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Bank Address</span>
                    <span className="text-slate-600 font-medium mt-0.5 block leading-relaxed line-clamp-2">
                      {ben.address}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>LRS Verified</span>
                  </div>

                  <button 
                    onClick={() => window.location.href = `/transfer-money?beneficiaryId=${ben.id}`}
                    className="px-4 py-2 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs rounded-xl shadow-2xs hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Send Wire</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- ADD WIRE BENEFICIARY MODAL DIALOG --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-amber-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">Add Wire Beneficiary</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Save foreign recipient bank details for outward wire transfers</p>
                </div>
              </div>

              <button 
                onClick={() => setIsAddOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              
              {/* Recipient Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {name.length}/15 chars
                  </span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={15}
                    placeholder="e.g. John Miller"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Recipient Country (Custom Searchable Combobox) */}
              <div className="space-y-1.5 relative">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  Recipient Country <span className="text-red-500">*</span>
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="w-full pl-3.5 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 hover:border-amber-400 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 flex items-center justify-between shadow-2xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getCountryFlag(country)}</span>
                    <span>{country}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {/* Dropdown Menu Overlay */}
                {isCountryOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setIsCountryOpen(false)} 
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* Search Filter Inside Dropdown */}
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          value={countryFilter}
                          onChange={e => setCountryFilter(e.target.value)}
                          placeholder="Type country name..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg text-xs font-semibold outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {/* Scrollable List */}
                      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                        {filteredCountries.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400 font-medium">
                            No country found
                          </div>
                        ) : (
                          filteredCountries.map(c => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setCountry(c.name);
                                setIsCountryOpen(false);
                                setCountryFilter('');
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                                country === c.name 
                                  ? 'bg-amber-500/10 text-amber-900 font-black' 
                                  : 'text-slate-700 hover:bg-slate-100 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span>{c.name}</span>
                              </div>
                              {country === c.name && (
                                <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bank Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  Recipient Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. Citibank, N.A. / Barclays / JPMorgan Chase"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* SWIFT & Account Number in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    SWIFT / BIC Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      value={swiftCode}
                      onChange={e => setSwiftCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. CITIUS33"
                      maxLength={11}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-mono font-black text-slate-900 uppercase outline-none shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    Account Number / IBAN <span className="text-red-500">*</span>
                  </label>
                  <input 
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="IBAN or Account Number"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-mono font-bold text-slate-900 outline-none shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Recipient Full Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  Recipient Bank / Branch Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street Address, City, State/Province, Postal Code"
                    required
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs placeholder:text-slate-400 placeholder:font-normal resize-none"
                  />
                </div>
              </div>

              {/* Statutory Note */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-200/80 flex items-start gap-2.5 text-[11px] text-slate-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Under RBI LRS guidelines, foreign outward wire routing details must match your beneficiary invoicing documentation.</span>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)} 
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Beneficiary</span>
                      <Check className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

