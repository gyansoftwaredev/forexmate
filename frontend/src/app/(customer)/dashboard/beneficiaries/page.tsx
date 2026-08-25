"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Trash2, Globe, Landmark, 
  CheckCircle, AlertCircle, X, ArrowRight, Clipboard 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import API_URL, { authFetch, apiJson } from '@/lib/api';

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

  // Form State
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD');

  const fetchBeneficiaries = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/remittances/beneficiaries`);
      const data = await apiJson<any[]>(res);
      setBeneficiaries(data);
    } catch (err) {
      toast.error('Failed to load beneficiaries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !bankName || !accountNumber || !swiftCode || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    // SWIFT validation check
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;
    if (!swiftRegex.test(swiftCode.trim())) {
      toast.error('Invalid SWIFT/BIC code format. Must be 8 or 11 alphanumeric characters.');
      return;
    }

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
      toast.success('Beneficiary saved successfully');
      setIsAddOpen(false);

      // Reset Form
      setName('');
      setBankName('');
      setAccountNumber('');
      setSwiftCode('');
      setAddress('');
      setCountry('United States');
      setCurrency('USD');
    } catch (err) {
      toast.error('Failed to save beneficiary');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await authFetch(`${API_URL}/remittances/beneficiaries/${id}`, {
        method: 'DELETE'
      });
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      toast.success('Beneficiary deleted');
    } catch (err) {
      toast.error('Failed to delete beneficiary');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getCurrencyForCountry = (countryName: string) => {
    const name = countryName.toLowerCase();
    if (name.includes('united kingdom') || name.includes('gb') || name.includes('britain')) return 'GBP';
    if (name.includes('germany') || name.includes('europe') || name.includes('eu')) return 'EUR';
    if (name.includes('australia') || name.includes('au')) return 'AUD';
    if (name.includes('singapore') || name.includes('sg')) return 'SGD';
    return 'USD';
  };

  const filtered = beneficiaries.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.ibanOrAccountNumber && b.ibanOrAccountNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    b.swiftCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Beneficiaries Hub</h1>
          <p className="text-gray-500 mt-1">Manage external bank accounts for international wire transfers.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-600/10 transition-all duration-200">
          <Plus className="w-5 h-5 mr-2" />
          Add Beneficiary
        </Button>
      </div>

      {/* Search Header */}
      <div className="relative max-w-md w-full">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <Input 
          placeholder="Search by name, bank, or account number..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-11 h-12 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm w-full"
        />
      </div>

      {/* Grid of Beneficiaries */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No beneficiaries found</h3>
          <p className="text-gray-500 max-w-xs mx-auto text-sm">Add a bank account to save details for outward wire transfers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(ben => (
            <Card key={ben.id} className="border-gray-200/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-700 text-sm border border-blue-100">
                    {ben.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900">{ben.name}</CardTitle>
                    <CardDescription className="text-xs font-semibold text-blue-600 tracking-wider uppercase mt-0.5">{getCurrencyForCountry(ben.country)} Account</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(ben.id)}
                  className="text-gray-400 hover:text-red-600 rounded-full h-8 w-8 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Bank Name</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <Landmark className="w-4 h-4 text-gray-400" />
                      {ben.bankName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Country</span>
                    <span className="font-semibold text-gray-700 flex items-center gap-1.5 mt-0.5">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {ben.country}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 block font-medium">Account / IBAN Number</span>
                    <span className="font-mono font-bold text-gray-900 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg flex items-center justify-between mt-1">
                      {ben.ibanOrAccountNumber}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-700" onClick={() => copyToClipboard(ben.ibanOrAccountNumber, 'Account Number')}>
                        <Clipboard className="w-3.5 h-3.5" />
                      </Button>
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">SWIFT / BIC Code</span>
                    <span className="font-mono font-bold text-gray-900 mt-0.5">{ben.swiftCode}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 block font-medium">Recipient Bank Address</span>
                    <span className="text-xs text-gray-600 mt-1 block leading-relaxed">{ben.address}</span>
                  </div>
                  <div className="col-span-2 pt-2 flex justify-end">
                    <Button 
                      className="btn-gold font-black text-slate-950 text-xs px-4 py-2 rounded-xl shadow-2xs hover:scale-105 transition-all flex items-center gap-1.5"
                      onClick={() => window.location.href = `/buy-forex?tab=remittance&beneficiaryId=${ben.id}`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Send Money to {ben.name.split(' ')[0]}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Add Wire Beneficiary</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 block">Recipient Full Name</label>
                <Input 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Miller"
                  required
                  className="rounded-lg border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 block">Account Currency</label>
                  <select 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 block">Recipient Country</label>
                  <select 
                    value={country} 
                    onChange={e => setCountry(e.target.value)}
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 block">Bank Name</label>
                <Input 
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. Citibank, N.A."
                  required
                  className="rounded-lg border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 block">SWIFT / BIC Code</label>
                  <Input 
                    value={swiftCode}
                    onChange={e => setSwiftCode(e.target.value)}
                    placeholder="e.g. CITIUS33"
                    required
                    className="rounded-lg border-gray-200 font-mono text-sm uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 block">Account Number / IBAN</label>
                  <Input 
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="IBAN or Local Account Number"
                    required
                    className="rounded-lg border-gray-200 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 block">Recipient Full Address</label>
                <Input 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Address, City, State, ZIP"
                  required
                  className="rounded-lg border-gray-200"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-lg">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5">
                  Save Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
