"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Smartphone, Mail, ArrowRight, Eye, EyeOff, 
  X, CheckCircle2, Sparkles, AlertCircle, RefreshCw, KeyRound, User, UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTransactionStore } from '@/stores/transactionStore';
import API_URL, { apiJson } from '@/lib/api';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authenticatedUser?: any) => void;
}

export default function CustomerAuthModal({ isOpen, onClose, onSuccess }: CustomerAuthModalProps) {
  const { login } = useAuth();
  const { draftState } = useTransactionStore();

  const [authAction, setAuthAction] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  
  // Mobile OTP State
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up State
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);

  // Loading & Messages
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setOtpSent(true);
      setOtpTimer(30);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otpValues];
    newOtp[index] = val;
    setOtpValues(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`modal-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`modal-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const fullOtp = otpValues.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      const defaultName = regFullName.trim() || `Customer ${cleanMobile.slice(-4)}`;
      const defaultEmail = regEmail.trim() || `user_${cleanMobile}@forexmate.in`;

      const userData = {
        id: `user_otp_${Date.now()}`,
        email: defaultEmail,
        fullName: defaultName,
        phone: `+91 ${cleanMobile}`,
        mobile: cleanMobile,
        role: 'CUSTOMER',
      };

      const mockToken = `jwt_otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      login(mockToken, userData as any);

      setSuccessMessage('Verified! Proceeding to checkout...');
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(userData);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'include',
      });

      const payload = await apiJson<{ access_token: string; user: any }>(res);
      login(payload.access_token, payload.user);

      setSuccessMessage('Welcome back! Proceeding to checkout...');
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(payload.user);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = regFullName.trim();
    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (trimmedName.length > 15) {
      setErrorMessage('Full name must not exceed 15 characters.');
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
          fullName: trimmedName.slice(0, 15),
          mobile: cleanMobile,
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
        }),
      });

      const payload = await apiJson<any>(res);
      if (payload?.access_token && payload?.user) {
        login(payload.access_token, payload.user);
        setSuccessMessage('Account created! Proceeding to checkout...');
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(payload.user);
        }, 600);
        return;
      }

      setSuccessMessage('Account created successfully!');
      setIsSuccess(true);
      setTimeout(() => {
        setAuthAction('SIGN_IN');
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Email or mobile may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemoOtp = () => {
    setOtpValues(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Light Theme MTTPL Luxury Modal Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-8 relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MTTPL Gold Pill Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-extrabold tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>MTTPL FOREX MEMBER CLUB</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mt-3">
            {authAction === 'SIGN_IN' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {authAction === 'SIGN_IN'
              ? 'Sign in to access your zero margin rates & saved orders'
              : 'Join to lock live zero margin interbank rates'}
          </p>
        </div>

        {/* Segmented Sign In / Sign Up Switcher */}
        <div className="flex bg-slate-100/90 p-1 rounded-xl mt-5 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setAuthAction('SIGN_IN');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authAction === 'SIGN_IN'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthAction('SIGN_UP');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authAction === 'SIGN_UP'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
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
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= VIEW 1: SIGN IN ================= */}
        {authAction === 'SIGN_IN' && (
          <div className="mt-5 space-y-4">
            
            {/* Method Tabs (Password vs Mobile OTP) */}
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-slate-400">
              <button
                type="button"
                onClick={() => setAuthMethod('PASSWORD')}
                className={`cursor-pointer pb-0.5 border-b-2 transition-all ${
                  authMethod === 'PASSWORD'
                    ? 'border-amber-600 text-amber-900 font-extrabold'
                    : 'border-transparent hover:text-slate-700'
                }`}
              >
                Email & Password
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setAuthMethod('OTP')}
                className={`cursor-pointer pb-0.5 border-b-2 transition-all ${
                  authMethod === 'OTP'
                    ? 'border-amber-600 text-amber-900 font-extrabold'
                    : 'border-transparent hover:text-slate-700'
                }`}
              >
                Mobile Number OTP
              </button>
            </div>

            {/* Email & Password Login */}
            {authMethod === 'PASSWORD' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="gyan@sourcemytrip.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Password
                    </label>
                    <a href="/forgot-password" target="_blank" className="text-[11px] text-amber-700 font-bold hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold py-3.5 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mobile OTP Login */}
            {authMethod === 'OTP' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 block">
                        Mobile Number
                      </label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-xl p-1 transition-all shadow-2xs">
                        <div className="px-2.5 py-2 bg-white rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-bold text-slate-800">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs font-bold text-slate-900 outline-none bg-transparent"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || mobileNumber.length < 10}
                      className="w-full bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold py-3.5 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Get 6-Digit OTP</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Sent to <strong className="text-slate-900">+91 {mobileNumber}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        {otpValues.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`modal-otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-10 h-11 text-center text-base font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-amber-500 outline-none transition-all shadow-2xs"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={autofillDemoOtp}
                        className="text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Demo OTP: <strong>123456</strong>
                      </button>

                      <div className="text-slate-400">
                        {otpTimer > 0 ? (
                          <span>Resend in {otpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendOtp()}
                            className="text-amber-700 font-bold hover:underline cursor-pointer"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpValues.join('').length < 6}
                      className="w-full bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-extrabold py-3.5 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Sign In</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        )}

        {/* ================= VIEW 2: SIGN UP ================= */}
        {authAction === 'SIGN_UP' && (
          <form onSubmit={handleRegister} className="mt-5 space-y-3.5">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={15}
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
        )}

        {/* Footer Security Note */}
        <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bank-Grade 256-Bit SSL Encryption</span>
        </div>

      </div>

    </div>
  );
}
