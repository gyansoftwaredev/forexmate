"use client";

import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Bell, Lock, CheckCircle2, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);

  // Preference Checkboxes
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [rateAlerts, setRateAlerts] = useState(true);
  const [complianceSms, setComplianceSms] = useState(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    toast.success('Password updated successfully!');
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const toggle2FA = () => {
    if (is2FaEnabled) {
      setIs2FaEnabled(false);
      toast.info('Two-Factor Authentication disabled');
    } else {
      setIs2FaEnabled(true);
      toast.success('Two-Factor Authentication (SMS OTP) enabled successfully!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Security & Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage authentication options, password security, and communication preferences.</p>
      </div>

      {/* Account Security Card */}
      <Card className="border-slate-200 bg-white shadow-2xs rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6">
          <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <span>Account Security & Login</span>
          </CardTitle>
          <CardDescription>Manage credentials and two-step verification security.</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          
          {/* Change Password */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>Account Password</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Last updated 30 days ago. Keep password strong & unique.</p>
            </div>

            <Button 
              onClick={() => setIsPasswordModalOpen(true)} 
              variant="outline"
              className="border-slate-200 text-slate-900 font-bold text-xs h-10 px-5 rounded-xl hover:bg-slate-50"
            >
              Update Password
            </Button>
          </div>

          {/* Two Factor Authentication */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Two-Factor Authentication (2FA)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Require SMS OTP confirmation for foreign currency dispatch and remittance.</p>
            </div>

            <Button 
              onClick={toggle2FA}
              className={`text-xs font-black h-10 px-5 rounded-xl transition-all ${
                is2FaEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'btn-gold text-slate-950'
              }`}
            >
              {is2FaEnabled ? '2FA Enabled ✓' : 'Enable 2FA'}
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-slate-200 bg-white shadow-2xs rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6">
          <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Communication Preferences</span>
          </CardTitle>
          <CardDescription>Choose how you receive order status and rate movement alerts.</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={orderUpdates}
              onChange={e => {
                setOrderUpdates(e.target.checked);
                toast.success('Order status notification settings updated');
              }}
              className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
            />
            <div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Order Status Updates (Email & SMS)</span>
              <span className="text-[11px] text-slate-500 font-medium">Real-time alerts for vault pickup readiness, door delivery dispatch, and wire confirmation.</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={rateAlerts}
              onChange={e => {
                setRateAlerts(e.target.checked);
                toast.success('Rate alert preferences updated');
              }}
              className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
            />
            <div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Market Rate Alert Notifications</span>
              <span className="text-[11px] text-slate-500 font-medium">Instant alerts when USD, EUR, or GBP drop below target interbank thresholds.</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={complianceSms}
              onChange={e => {
                setComplianceSms(e.target.checked);
                toast.success('Statutory compliance alert settings updated');
              }}
              className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
            />
            <div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Statutory RBI LRS Compliance SMS</span>
              <span className="text-[11px] text-slate-500 font-medium">Mandatory reminders for pending document verification and annual limit resets.</span>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 text-base">Change Account Password</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsPasswordModalOpen(false)} className="rounded-full">
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 block">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 block">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 block">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="btn-gold font-black text-slate-950 rounded-xl px-5">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
