"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Settings, Shield, Clock, Lock, Save, CheckCircle, Banknote, CreditCard, ArrowLeftRight, Send, Coins } from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: string }>({
    WORKING_HOURS: '09:00 AM - 06:00 PM',
    OTP_EXPIRY_MINUTES: '10',
    BRANCH_REASSIGNMENT_ENABLED: 'true',
    MAX_AML_SCORE: '80',
    MAX_LRS_USD: '250000',
    DELIVERY_RADIUS_KM: '25',
    SERVICE_CHARGE_BUY: '0',
    SERVICE_CHARGE_SELL: '0',
    SERVICE_CHARGE_REMITTANCE: '0',
    SERVICE_CHARGE_CARD: '0',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const list = await authFetch(`${API_URL}/admin/settings`).then(apiJson);
      if (Array.isArray(list) && list.length > 0) {
        const map: { [key: string]: string } = {};
        list.forEach((item: any) => {
          map[item.key] = item.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: string, category: string = 'GENERAL') => {
    setSaving(true);
    setMsg('');
    try {
      await authFetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, category }),
      }).then(apiJson);
      setMsg(`Setting '${key}' saved successfully!`);
    } catch (err: any) {
      setMsg(err.message || 'Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllServiceCharges = async () => {
    setSaving(true);
    setMsg('');
    try {
      await Promise.all([
        authFetch(`${API_URL}/admin/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'SERVICE_CHARGE_BUY', value: settings.SERVICE_CHARGE_BUY || '0', category: 'PRICING' }),
        }),
        authFetch(`${API_URL}/admin/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'SERVICE_CHARGE_SELL', value: settings.SERVICE_CHARGE_SELL || '0', category: 'PRICING' }),
        }),
        authFetch(`${API_URL}/admin/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'SERVICE_CHARGE_CARD', value: settings.SERVICE_CHARGE_CARD || '0', category: 'PRICING' }),
        }),
        authFetch(`${API_URL}/admin/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'SERVICE_CHARGE_REMITTANCE', value: settings.SERVICE_CHARGE_REMITTANCE || '0', category: 'PRICING' }),
        }),
      ]);
      setMsg('All product service charges updated successfully! Customer storefronts will reflect this immediately.');
    } catch (err: any) {
      setMsg(err.message || 'Failed to save service charges');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Headquarters Control
            </span>
            <span className="text-slate-400 text-xs font-semibold">⚙️ System Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">System Configuration & Pricing Control</h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure global product service charges, operational parameters, compliance limits, and Role-Based Access Control matrix.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle size={16} /> {msg}
        </div>
      )}

      {/* Product Service Charges (Pricing Control) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Coins size={18} className="text-amber-500" /> Product Service Charges (Customer Pricing Control)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set the exact service charge (in ₹) for each forex product. Changes reflect live on customer calculators and checkout summaries.
            </p>
          </div>
          <button
            onClick={handleSaveAllServiceCharges}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save size={14} /> Save All Service Charges
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Buy Forex */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <Banknote size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Buy Forex (Cash)</span>
                <span className="text-[10px] text-slate-500 font-medium">Currency Notes</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 uppercase font-bold block mb-1">Service Fee (₹)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.SERVICE_CHARGE_BUY}
                    onChange={(e) => setSettings({ ...settings, SERVICE_CHARGE_BUY: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 font-bold text-xs outline-amber-500"
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={() => handleSaveSetting('SERVICE_CHARGE_BUY', settings.SERVICE_CHARGE_BUY || '0', 'PRICING')}
                  className="px-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save size={13} />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold bg-white p-2 rounded-lg border border-slate-200">
              Customer pays: <strong className="text-slate-900 font-bold">₹{settings.SERVICE_CHARGE_BUY || '0'}</strong>
            </div>
          </div>

          {/* 2. Sell Forex */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <ArrowLeftRight size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Sell Forex</span>
                <span className="text-[10px] text-slate-500 font-medium">Convert to INR</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 uppercase font-bold block mb-1">Service Fee (₹)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.SERVICE_CHARGE_SELL}
                    onChange={(e) => setSettings({ ...settings, SERVICE_CHARGE_SELL: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 font-bold text-xs outline-emerald-500"
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={() => handleSaveSetting('SERVICE_CHARGE_SELL', settings.SERVICE_CHARGE_SELL || '0', 'PRICING')}
                  className="px-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save size={13} />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold bg-white p-2 rounded-lg border border-slate-200">
              Customer pays: <strong className="text-slate-900 font-bold">₹{settings.SERVICE_CHARGE_SELL || '0'}</strong>
            </div>
          </div>

          {/* 3. Forex Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                <CreditCard size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Forex Card</span>
                <span className="text-[10px] text-slate-500 font-medium">Multi-Currency Card</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 uppercase font-bold block mb-1">Service Fee (₹)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.SERVICE_CHARGE_CARD}
                    onChange={(e) => setSettings({ ...settings, SERVICE_CHARGE_CARD: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 font-bold text-xs outline-sky-500"
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={() => handleSaveSetting('SERVICE_CHARGE_CARD', settings.SERVICE_CHARGE_CARD || '0', 'PRICING')}
                  className="px-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save size={13} />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold bg-white p-2 rounded-lg border border-slate-200">
              Customer pays: <strong className="text-slate-900 font-bold">₹{settings.SERVICE_CHARGE_CARD || '0'}</strong>
            </div>
          </div>

          {/* 4. Remittance */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                <Send size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Remittance</span>
                <span className="text-[10px] text-slate-500 font-medium">International Wire</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 uppercase font-bold block mb-1">Service Fee (₹)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.SERVICE_CHARGE_REMITTANCE}
                    onChange={(e) => setSettings({ ...settings, SERVICE_CHARGE_REMITTANCE: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 font-bold text-xs outline-purple-500"
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={() => handleSaveSetting('SERVICE_CHARGE_REMITTANCE', settings.SERVICE_CHARGE_REMITTANCE || '0', 'PRICING')}
                  className="px-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save size={13} />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold bg-white p-2 rounded-lg border border-slate-200">
              Customer pays: <strong className="text-slate-900 font-bold">₹{settings.SERVICE_CHARGE_REMITTANCE || '0'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* System Configurations Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings size={18} className="text-indigo-600" /> Operational Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">Working Hours</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.WORKING_HOURS}
                onChange={(e) => setSettings({ ...settings, WORKING_HOURS: e.target.value })}
                className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
              />
              <button
                onClick={() => handleSaveSetting('WORKING_HOURS', settings.WORKING_HOURS, 'GENERAL')}
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">OTP Expiry (Minutes)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={settings.OTP_EXPIRY_MINUTES}
                onChange={(e) => setSettings({ ...settings, OTP_EXPIRY_MINUTES: e.target.value })}
                className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
              />
              <button
                onClick={() => handleSaveSetting('OTP_EXPIRY_MINUTES', settings.OTP_EXPIRY_MINUTES, 'SECURITY')}
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">Maximum LRS Threshold (USD)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={settings.MAX_LRS_USD}
                onChange={(e) => setSettings({ ...settings, MAX_LRS_USD: e.target.value })}
                className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
              />
              <button
                onClick={() => handleSaveSetting('MAX_LRS_USD', settings.MAX_LRS_USD, 'COMPLIANCE')}
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">Same-City Reassignment Toggle</label>
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-300">
              <span className="text-slate-800">Enable Branch Reassignment</span>
              <button
                onClick={() => {
                  const newVal = settings.BRANCH_REASSIGNMENT_ENABLED === 'true' ? 'false' : 'true';
                  setSettings({ ...settings, BRANCH_REASSIGNMENT_ENABLED: newVal });
                  handleSaveSetting('BRANCH_REASSIGNMENT_ENABLED', newVal, 'WORKFLOW');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase cursor-pointer ${
                  settings.BRANCH_REASSIGNMENT_ENABLED === 'true'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {settings.BRANCH_REASSIGNMENT_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security RBAC Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield size={18} className="text-indigo-600" /> Role-Based Access Control (RBAC) Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Role</th>
                <th className="p-3">KYC/AML Verification</th>
                <th className="p-3">Branch Selection</th>
                <th className="p-3">Vault Allocation</th>
                <th className="p-3">Delivery Dispatch</th>
                <th className="p-3">ERP Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3 font-extrabold text-indigo-700">Super Admin</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-900">Central Operations Staff</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-900">Branch Manager</td>
                <td className="p-3 text-slate-400">Read-Only (Locked)</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-900">Delivery Partner</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 font-bold text-emerald-600">Execute Delivery ✅</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
