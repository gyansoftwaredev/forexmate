"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Lock, Smartphone, Mail, ArrowRight, Eye, EyeOff, 
  X, CheckCircle2, Sparkles, AlertCircle, RefreshCw, User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import API_URL, { apiJson } from '@/lib/api';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regFullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = regMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          mobile: cleanMobile,
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
        }),
      });

      try {
        const payload = await apiJson<any>(res);
        if (payload?.access_token && payload?.user) {
          login(payload.access_token, payload.user);
          setIsSuccess(true);
          setTimeout(() => {
            router.push('/');
          }, 600);
          return;
        }
      } catch (_) {}

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), password: regPassword }),
        credentials: 'include',
      });

      const loginPayload = await apiJson<{ access_token: string; user: any }>(loginRes);
      login(loginPayload.access_token, loginPayload.user);

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Email or mobile may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Travel Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 scale-105"
        style={{ backgroundImage: `url('/travel_hero.png')` }}
      />
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm pointer-events-none" />

      {/* Main Luxury Light Theme Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-8 relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title="Back to Home"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* MTTPL Gold Pill Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-extrabold tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>MTTPL FOREX MEMBER CLUB</span>
          </div>

          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mt-3">
            Create Account
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Join to lock live zero margin interbank rates
          </p>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Account created! Redirecting...</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="mt-5 space-y-3.5">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 block">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Rahul Sharma"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                autoFocus
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 block">
              Mobile Number
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-xl p-1 transition-all shadow-2xs">
              <div className="px-2 py-1.5 bg-white rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-bold text-slate-800">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="rahul.sharma@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 block">
              Password
            </label>
            <div className="relative">
              <input
                type={regShowPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setRegShowPassword(!regShowPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !regFullName || !regMobile || !regEmail || !regPassword}
            className="w-full bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold py-3.5 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account & Sign In</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Sign In */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-700 font-bold hover:underline">
              Sign In →
            </Link>
          </p>
        </div>

        {/* Footer Security Note */}
        <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bank-Grade 256-Bit SSL Encryption</span>
        </div>

      </div>

    </div>
  );
}
