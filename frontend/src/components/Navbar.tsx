"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Globe, Banknote, Send, CreditCard, Briefcase, ShieldCheck, Smartphone, Handshake, Building2, MapPin, ChevronDown, User, Phone } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 text-slate-900 font-sans transition-all shadow-xs">
      {/* Top Banner Contact & License Ribbon */}
      <div className="py-1.5 px-4 md:px-8 flex justify-between items-center text-xs border-b border-slate-200/60 bg-slate-50 text-slate-700">
        <div className="flex space-x-4 md:space-x-6 items-center">
          <a href="tel:09212219191" className="flex items-center hover:text-amber-600 font-bold transition-colors">
            <Phone className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            <span>+91 9212219191</span>
          </a>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center text-[10px] text-emerald-700 font-extrabold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
            RBI Authorized Category II FFMC
          </span>
          <span className="text-slate-300 hidden md:inline">•</span>
          <Link href="/branches" className="hidden md:flex items-center text-slate-700 hover:text-amber-600 font-bold transition-colors">
            <MapPin className="w-3 h-3 mr-1 text-amber-600" />
            <span>Branch Locator</span>
          </Link>
        </div>

        <div className="flex space-x-3 items-center">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="font-extrabold text-slate-900 text-xs">Hi, {user.fullName.split(' ')[0]}</span>
              </div>
              <span className="text-slate-300">•</span>
              <Link href="/dashboard" className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs">
                My Dashboard
              </Link>
              <button onClick={() => logout()} className="text-slate-500 hover:text-rose-600 text-xs font-bold transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-amber-600 font-bold text-xs transition-colors text-slate-800">
                Login
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/register" className="btn-gold px-3.5 py-1 rounded-full text-xs font-black shadow-xs hover:scale-105 transition-all">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="px-4 md:px-8 flex justify-between items-center h-16 max-w-7xl mx-auto">
        
        {/* Brand Logo with Gold Typography */}
        <div className="flex items-center shrink-0 mr-8">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 p-[2px] shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Forex<span className="text-amber-600 font-black">Mate</span>
              </div>
              <div className="section-label text-[8px] tracking-[0.25em] text-amber-700">A MTTPL Company</div>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden lg:flex items-center space-x-8 text-xs font-extrabold uppercase tracking-wider text-slate-800">
          
          {/* Forex Services Dropdown */}
          <div className="relative group py-4">
            <button className="flex items-center hover:text-amber-600 transition-colors gap-1">
              <span>Forex Services</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform text-slate-500" />
            </button>
            
            <div className="absolute top-14 -left-6 bg-white border border-slate-200/90 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-[580px] p-5 grid grid-cols-2 gap-4 text-slate-900 z-50">
              <div>
                <div className="section-label mb-3 text-[9px] text-amber-600">Retail Currency</div>
                <div className="space-y-1.5">
                  <Link href="/buy-forex" className="flex items-center p-2 rounded-xl hover:bg-slate-100 transition-colors group/item">
                    <Banknote className="w-4 h-4 mr-2.5 text-amber-600 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-slate-900">Buy Foreign Cash</div>
                      <div className="text-[10px] text-slate-500 font-medium">Zero margin live rates</div>
                    </div>
                  </Link>

                  <Link href="/sell-forex" className="flex items-center p-2 rounded-xl hover:bg-slate-100 transition-colors group/item">
                    <Banknote className="w-4 h-4 mr-2.5 text-emerald-600 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-slate-900">Sell Foreign Cash</div>
                      <div className="text-[10px] text-slate-500 font-medium">Convert back to INR instantly</div>
                    </div>
                  </Link>

                  <Link href="/forex-cards" className="flex items-center p-2 rounded-xl hover:bg-slate-100 transition-colors group/item">
                    <CreditCard className="w-4 h-4 mr-2.5 text-purple-600 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-slate-900">Multi-Currency Forex Card</div>
                      <div className="text-[10px] text-slate-500 font-medium">Accepted in 150+ countries</div>
                    </div>
                  </Link>
                </div>
              </div>

              <div>
                <div className="section-label mb-3 text-[9px] text-amber-600">Wire & Remittance</div>
                <div className="space-y-1.5">
                  <Link href="/remittance" className="flex items-center p-2 rounded-xl hover:bg-slate-100 transition-colors group/item">
                    <Send className="w-4 h-4 mr-2.5 text-blue-600 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-slate-900">Outward Remittance</div>
                      <div className="text-[10px] text-slate-500 font-medium">University fees & family transfer</div>
                    </div>
                  </Link>

                  <Link href="/trade-remittance" className="flex items-center p-2 rounded-xl hover:bg-slate-100 transition-colors group/item">
                    <Briefcase className="w-4 h-4 mr-2.5 text-amber-600 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-slate-900">Corporate Trade Remittance</div>
                      <div className="text-[10px] text-slate-500 font-medium">B2B import/export payments</div>
                    </div>
                  </Link>

                  <Link href="/faas-partners" className="flex items-center p-2 rounded-xl hover:bg-slate-100 transition-colors group/item">
                    <Handshake className="w-4 h-4 mr-2.5 text-emerald-600 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-black text-slate-900">FaaS Partner API</div>
                      <div className="text-[10px] text-slate-500 font-medium">Integrate Forex into travel sites</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Top Currencies */}
          <Link href="/rates" className="hover:text-amber-600 transition-colors">
            Live Rate Card
          </Link>

          {/* Corporate Solutions */}
          <Link href="/corporate-solutions" className="hover:text-amber-600 transition-colors">
            Corporate Solutions
          </Link>

          {/* MTTPL Travel Portal Redirect */}
          <a
            href="https://earnest-sawine-29983e.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-amber-800 hover:text-amber-900 bg-amber-500/15 px-3 py-1.5 rounded-full border border-amber-500/30 transition-all hover:bg-amber-500/25 shadow-2xs font-extrabold"
          >
            <span>✈️ MTTPL Travels</span>
          </a>

        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/buy-forex"
            className="btn-gold px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:scale-105 transition-all"
          >
            <span>Book Forex @ Live Rate</span>
          </Link>
        </div>

      </nav>
    </header>
  );
}
