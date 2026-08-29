"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, Trash2, Home, Building, Check, Sparkles, Navigation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useAddAddress, useDeleteAddress } from '../../features/profile/hooks/useProfile';

export function AddressBook() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id || '');
  const addAddressMutation = useAddAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [isAdding, setIsAdding] = useState(false);
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');
  const [newAddress, setNewAddress] = useState({
    city: '',
    state: '',
    address: '',
    pin: '',
    landmark: ''
  });

  const handleAdd = async () => {
    if (!user?.id) return;
    await addAddressMutation.mutateAsync({ userId: user.id, data: newAddress });
    setIsAdding(false);
    setNewAddress({ city: '', state: '', address: '', pin: '', landmark: '' });
  };

  const handleDelete = async (addressId: string) => {
    if (!user?.id) return;
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddressMutation.mutateAsync({ userId: user.id, addressId });
    }
  };

  const addresses = profile?.profiles?.addresses || [];

  return (
    <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                <MapPin className="w-4 h-4" />
              </span>
              <CardTitle className="text-xl font-display font-extrabold text-slate-900">
                Address Book
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm">
              Manage your verified doorstep currency delivery and dispatch destinations.
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
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add New Address</span>
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* ADD NEW ADDRESS DRAWER / CARD */}
        {isAdding && (
          <div className="p-6 border border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-white to-amber-50/20 rounded-3xl space-y-5 shadow-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <h4 className="font-extrabold text-slate-900 text-sm">New Delivery Destination</h4>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['HOME', 'OFFICE', 'OTHER'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressType(type)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                      addressType === type ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">Street Address / House No.</label>
                <input
                  placeholder="e.g. Flat 402, Signature Towers, MG Road"
                  value={newAddress.address}
                  onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">City</label>
                <input
                  placeholder="e.g. Mumbai, Pune, Delhi"
                  value={newAddress.city}
                  onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">State</label>
                <input
                  placeholder="e.g. Maharashtra, Delhi NCR"
                  value={newAddress.state}
                  onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">PIN Code</label>
                <input
                  placeholder="e.g. 411001"
                  maxLength={6}
                  value={newAddress.pin}
                  onChange={e => setNewAddress({ ...newAddress, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase">Landmark (Optional)</label>
                <input
                  placeholder="e.g. Near Metro Pillar 140"
                  value={newAddress.landmark}
                  onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs"
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
                disabled={addAddressMutation.isPending || !newAddress.address || !newAddress.city}
                className="px-6 py-2 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {addAddressMutation.isPending ? 'Saving Address...' : 'Save & Verify Address'}
              </button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-2xl mb-3 shadow-2xs">
              📍
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">No Delivery Addresses Saved</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-5">
              Add your home or corporate office address for fast, secure doorstep forex deliveries and card dispatches.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr: any, index: number) => (
              <div 
                key={addr.id} 
                className="border border-slate-200/90 rounded-2xl p-5 relative bg-white hover:border-amber-400/80 hover:shadow-xs transition-all group"
              >
                <button 
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => handleDelete(addr.id)}
                  title="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                    {index % 2 === 0 ? <Home className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 pr-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Address {index + 1}
                      </h3>
                      {index === 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Default Delivery
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                      <span className="block font-bold text-slate-800">{addr.address}</span>
                      {addr.landmark && <span className="block text-slate-500">Landmark: {addr.landmark}</span>}
                      <span className="block text-slate-700">{addr.city}, {addr.state} - <strong className="font-mono text-slate-900">{addr.pin}</strong></span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

