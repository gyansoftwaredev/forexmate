"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, ChevronUp, Phone, Mail, MapPin, ShieldCheck, 
  ArrowRight, Globe, Send, CreditCard, Sparkles, CheckCircle2
} from 'lucide-react';

export default function Footer() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setActiveCategory(prev => prev === cat ? null : cat);
  };

  const topCities = [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", 
    "Kolkata", "Ahmedabad", "Gurgaon", "Noida", "Chandigarh", "Jaipur", 
    "Lucknow", "Kochi", "Coimbatore", "Indore", "Surat", "Patna"
  ];

  const remittanceDestinations = [
    { name: "USA", country: "US", currency: "USD" },
    { name: "UK", country: "GB", currency: "GBP" },
    { name: "Canada", country: "CA", currency: "CAD" },
    { name: "Australia", country: "AU", currency: "AUD" },
    { name: "Germany", country: "DE", currency: "EUR" },
    { name: "Singapore", country: "SG", currency: "SGD" },
    { name: "UAE", country: "AE", currency: "AED" },
    { name: "New Zealand", country: "NZ", currency: "NZD" },
    { name: "Switzerland", country: "CH", currency: "CHF" },
    { name: "Japan", country: "JP", currency: "JPY" },
    { name: "Europe (Schengen)", country: "Europe", currency: "EUR" },
  ];

  const topCurrencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "AED", name: "UAE Dirham" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "THB", name: "Thai Baht" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "SAR", name: "Saudi Riyal" }
  ];

  const converterPairs = [
    { pair: "USD to INR", from: "USD", to: "INR" },
    { pair: "EUR to INR", from: "EUR", to: "INR" },
    { pair: "GBP to INR", from: "GBP", to: "INR" },
    { pair: "CAD to INR", from: "CAD", to: "INR" },
    { pair: "AUD to INR", from: "AUD", to: "INR" },
    { pair: "SGD to INR", from: "SGD", to: "INR" },
    { pair: "AED to INR", from: "AED", to: "INR" },
    { pair: "THB to INR", from: "THB", to: "INR" },
    { pair: "NZD to INR", from: "NZD", to: "INR" },
    { pair: "CHF to INR", from: "CHF", to: "INR" }
  ];

  const rateCities = [
    "Delhi", "Mumbai", "Bangalore", "Pune", "Hyderabad", "Chennai", 
    "Kolkata", "Ahmedabad", "Gurgaon", "Chandigarh", "Jaipur", "Kochi"
  ];

  return (
    <footer className="w-full font-sans text-slate-300">
      
      {/* ─────────────────────────────────────────────────────────────
          BAND 1 (UPPER SHADE): SOPHISTICATED GREYISH CHARCOAL (#18202d)
          5-Column Navigation Directory & Registered Office
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#18202d] text-slate-200 font-sans pt-16 pb-14 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative">
        
        <div className="max-w-7xl mx-auto">
          
          {/* 5-Column Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
            
            {/* Column 1: COMPANY */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm sm:text-[15px] text-white uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-[15px] text-slate-300 font-medium">
                <li><Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-all">About Us</Link></li>
                <li><Link href="/about#team" className="hover:text-white hover:translate-x-1 inline-block transition-all">Our Team</Link></li>
                <li><Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
                <li><Link href="/about#careers" className="hover:text-white hover:translate-x-1 inline-block transition-all">Careers</Link></li>
                <li><Link href="/about#investors" className="hover:text-white hover:translate-x-1 inline-block transition-all">Investor Info</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white hover:translate-x-1 inline-block transition-all">Our Policies</Link></li>
                <li><Link href="/faas-partners" className="hover:text-white hover:translate-x-1 inline-block transition-all">Banking Partners</Link></li>
                <li><Link href="/forex-cards" className="hover:text-white hover:translate-x-1 inline-block transition-all">ForexMate Travel Card</Link></li>
                <li><Link href="/buy-forex" className="hover:text-white hover:translate-x-1 inline-block transition-all">ForexMate Currency Notes</Link></li>
                <li>
                  <a 
                    href="https://earnest-sawine-29983e.netlify.app/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 font-bold text-sm sm:text-[15px]"
                  >
                    <span>✈️ MTTPL Group</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: SERVICES */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm sm:text-[15px] text-white uppercase tracking-wider">
                Services
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-[15px] text-slate-300 font-medium">
                <li><Link href="/buy-forex?tab=buy&type=cash&product=CASH" className="hover:text-white hover:translate-x-1 inline-block transition-all">Currency Exchange</Link></li>
                <li><Link href="/remittance?tab=remittance&product=REMITTANCE" className="hover:text-white hover:translate-x-1 inline-block transition-all">Money Transfer</Link></li>
                <li><Link href="/forex-cards?tab=card&type=card&product=CARD" className="hover:text-white hover:translate-x-1 inline-block transition-all">Forex Card</Link></li>
                <li><Link href="/forex-cards?purpose=EDUCATION" className="hover:text-white hover:translate-x-1 inline-block transition-all">Student Forex Card</Link></li>
                <li><Link href="/travel-insurance" className="hover:text-white hover:translate-x-1 inline-block transition-all">Travel Insurance</Link></li>
                <li><Link href="/international-sim" className="hover:text-white hover:translate-x-1 inline-block transition-all">International Sim Card</Link></li>
                <li><Link href="/trade-remittance" className="hover:text-white hover:translate-x-1 inline-block transition-all">Trade Remittance</Link></li>
                <li><Link href="/faas-partners" className="hover:text-white hover:translate-x-1 inline-block transition-all">Forex as a Service (FaaS)</Link></li>
              </ul>
            </div>

            {/* Column 3: QUICK LINKS */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm sm:text-[15px] text-white uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-[15px] text-slate-300 font-medium">
                <li><Link href="/faqs" className="hover:text-white hover:translate-x-1 inline-block transition-all">FAQs</Link></li>
                <li><Link href="/terms-conditions#cancellation" className="hover:text-white hover:translate-x-1 inline-block transition-all">Cancellation & Refund Policy</Link></li>
                <li><Link href="/mobile" className="hover:text-white hover:translate-x-1 inline-block transition-all">Currency Exchange App</Link></li>
                <li><Link href="/mobile" className="hover:text-white hover:translate-x-1 inline-block transition-all">International Money Transfer App</Link></li>
                <li><Link href="/rates" className="hover:text-white hover:translate-x-1 inline-block transition-all">Forex Rates</Link></li>
                <li><Link href="/currency-converter" className="hover:text-white hover:translate-x-1 inline-block transition-all">Currency Converter</Link></li>
                <li><Link href="/terms-conditions" className="hover:text-white hover:translate-x-1 inline-block transition-all">Terms Of Use</Link></li>
                <li><Link href="/offers" className="hover:text-white hover:translate-x-1 inline-block transition-all">Offers</Link></li>
                <li><Link href="/branches" className="hover:text-white hover:translate-x-1 inline-block transition-all">Branch Locator</Link></li>
              </ul>
            </div>

            {/* Column 4: INSIGHT */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm sm:text-[15px] text-white uppercase tracking-wider">
                Insight
              </h4>
              <ul className="space-y-2.5 text-sm sm:text-[15px] text-slate-300 font-medium">
                <li><Link href="/about#blog" className="hover:text-white hover:translate-x-1 inline-block transition-all">Blogs</Link></li>
                <li><Link href="/about#press" className="hover:text-white hover:translate-x-1 inline-block transition-all">Press Releases</Link></li>
                <li><Link href="/reviews" className="hover:text-white hover:translate-x-1 inline-block transition-all">Customer Reviews</Link></li>
                <li><Link href="/about#faqs" className="hover:text-white hover:translate-x-1 inline-block transition-all">Foreign Exchange Guide</Link></li>
                <li><Link href="/rates" className="hover:text-white hover:translate-x-1 inline-block transition-all">Market Insights</Link></li>
              </ul>
            </div>

            {/* Column 5: ADDRESS */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="font-extrabold text-sm sm:text-[15px] text-white uppercase tracking-wider">
                Address
              </h4>
              <div className="space-y-3.5 text-slate-300 text-sm sm:text-[15px] leading-relaxed">
                <div>
                  <span className="font-bold text-white block mb-1 text-sm sm:text-[15px]">Registered Office Address:</span>
                  <p className="text-slate-300 leading-normal">
                    ForexMate Pvt. Ltd.<br />
                    (A Division of MTTPL Group)<br />
                    P-701 to P-705, 7th Floor, Tower C,<br />
                    JMD Megapolis, Sohna Road, Sector-48,<br />
                    Gurugram, Haryana 122018
                  </p>
                </div>
                
                <div className="pt-0.5 text-slate-400 font-mono text-xs sm:text-sm">
                  <span>CIN: U74999HR2011PTC043950</span>
                </div>

                <div className="pt-1 space-y-2">
                  <a href="tel:+919212219191" className="flex items-center gap-2.5 text-white hover:text-amber-400 font-bold text-sm sm:text-base transition-colors">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>+91-9212219191</span>
                  </a>
                  <a href="mailto:hello@forexmate.com" className="flex items-center gap-2.5 text-slate-300 hover:text-white font-medium text-sm sm:text-[15px] transition-colors">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>hello@forexmate.com</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          BAND 2 (LOWER SHADE): DEEP OBSIDIAN BLACK (#07090e)
          Accordions, Disclaimers, Apps, Payments, Security
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#07090e] text-slate-300 font-sans pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] relative">
        
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* 3. ACCORDION MULTI-CATEGORY DROPDOWN BAR (City/Country/Currency links) */}
          <div className="space-y-4">
            
            {/* Category Trigger Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm sm:text-[15px]">
              
              <button
                type="button"
                onClick={() => toggleCategory('currency_exchange')}
                className={`px-4.5 py-2.5 rounded-full border transition-all flex items-center gap-2 font-bold cursor-pointer text-sm sm:text-[15px] ${
                  activeCategory === 'currency_exchange'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-white/[0.05] text-slate-200 border-white/15 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>Currency Exchange</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === 'currency_exchange' ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCategory('money_transfer')}
                className={`px-4.5 py-2.5 rounded-full border transition-all flex items-center gap-2 font-bold cursor-pointer text-sm sm:text-[15px] ${
                  activeCategory === 'money_transfer'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-white/[0.05] text-slate-200 border-white/15 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>Money Transfer</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === 'money_transfer' ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCategory('top_currencies')}
                className={`px-4.5 py-2.5 rounded-full border transition-all flex items-center gap-2 font-bold cursor-pointer text-sm sm:text-[15px] ${
                  activeCategory === 'top_currencies'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-white/[0.05] text-slate-200 border-white/15 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>Top Currencies</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === 'top_currencies' ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCategory('currency_converter')}
                className={`px-4.5 py-2.5 rounded-full border transition-all flex items-center gap-2 font-bold cursor-pointer text-sm sm:text-[15px] ${
                  activeCategory === 'currency_converter'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-white/[0.05] text-slate-200 border-white/15 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>Currency Converter</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === 'currency_converter' ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCategory('top_rates')}
                className={`px-4.5 py-2.5 rounded-full border transition-all flex items-center gap-2 font-bold cursor-pointer text-sm sm:text-[15px] ${
                  activeCategory === 'top_rates'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-white/[0.05] text-slate-200 border-white/15 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>Top Currency Rates</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === 'top_rates' ? 'rotate-180' : ''}`} />
              </button>

            </div>

            {/* Expanded Content Panel */}
            {activeCategory && (
              <div className="bg-white/[0.03] border border-white/[0.1] rounded-2xl p-6 mt-3 animate-in fade-in zoom-in-95 duration-200 text-slate-200 backdrop-blur-md shadow-2xl">
                
                {/* 1. Currency Exchange (Cities) */}
                {activeCategory === 'currency_exchange' && (
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>Order Currency Exchange by City (Direct Order Engine):</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-sm sm:text-[15px]">
                      {topCities.map(city => (
                        <Link 
                          key={city}
                          href={`/buy-forex?city=${encodeURIComponent(city)}`}
                          className="text-slate-300 hover:text-white hover:underline transition-all truncate font-medium"
                        >
                          Forex in {city}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Money Transfer (Countries & Currencies) */}
                {activeCategory === 'money_transfer' && (
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                      <Send className="w-4 h-4" />
                      <span>Send Wire Remittance by Destination Country:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-sm sm:text-[15px]">
                      {remittanceDestinations.map(item => (
                        <Link 
                          key={item.name}
                          href={`/remittance?country=${item.country}&currency=${item.currency}`}
                          className="text-slate-300 hover:text-white hover:underline transition-all font-medium"
                        >
                          Send Money to {item.name} ({item.currency})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Top Currencies */}
                {activeCategory === 'top_currencies' && (
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      <span>Top Foreign Currencies (Order Notes or Forex Card):</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-sm sm:text-[15px]">
                      {topCurrencies.map(curr => (
                        <Link 
                          key={curr.code}
                          href={`/buy-forex?currency=${curr.code}`}
                          className="text-slate-300 hover:text-white hover:underline transition-all font-medium"
                        >
                          {curr.name} ({curr.code})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Currency Converter */}
                {activeCategory === 'currency_converter' && (
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-3.5">
                      Real-Time Foreign Exchange Pair Calculators:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-sm sm:text-[15px]">
                      {converterPairs.map(cp => (
                        <Link 
                          key={cp.pair}
                          href={`/currency-converter/${cp.from}-${cp.to}`}
                          className="text-slate-300 hover:text-white hover:underline transition-all font-medium"
                        >
                          {cp.pair}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Top Currency Rates */}
                {activeCategory === 'top_rates' && (
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-3.5">
                      City-Specific Forex Rates & Comparisons:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-sm sm:text-[15px]">
                      {rateCities.map(city => (
                        <Link 
                          key={city}
                          href={`/currency-exchange/${city.toLowerCase()}`}
                          className="text-slate-300 hover:text-white hover:underline transition-all font-medium"
                        >
                          Exchange Rates in {city}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* 4. COMPLIANCE & LEGAL DISCLAIMER (RBI FFMC / IRDAI Standard) */}
          <div className="pt-8 border-t border-white/[0.08] space-y-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
            <p>
              ForexMate Pvt. Ltd., an MTTPL Group company, is a foreign exchange service provider authorised by the Reserve Bank of India (RBI). | FFMC License number: RBI-FFMC-2026-0001 | Insurance is the subject matter of solicitation | IRDAI Registration No. CA0429 | IRDAI.
            </p>
            <p>
              *Zero margin rates / interbank rates are available on select forex cards in 65+ Indian cities for qualifying orders amounting to ₹1.5 Lakh or more (Use promo code: ZEROMARKUP).
            </p>
            <p>
              **Same day delivery is available from Monday to Friday (excluding national & banking holidays) when all payments and mandatory KYC documents are received before 1:00 PM.
            </p>
          </div>

          {/* 5. BOTTOM STRIP: Social, App Badges, Payment Icons */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-col lg:flex-row items-center justify-between gap-y-6 gap-x-4 xl:gap-x-8 w-full">
            
            {/* 1. Social Media Icons */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <span className="text-white font-bold text-sm sm:text-[15px] whitespace-nowrap">
                Connect with Us
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-blue-600 hover:text-white text-slate-300 flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                {/* X (Twitter) */}
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="X"
                  className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-slate-900 hover:text-white text-slate-300 flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white text-slate-300 flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                {/* LinkedIn */}
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-blue-700 hover:text-white text-slate-300 flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                {/* YouTube */}
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-red-600 hover:text-white text-slate-300 flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* 2. Download Our App Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <span className="text-white font-bold text-sm sm:text-[15px] whitespace-nowrap">
                Download Our App
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {/* Google Play */}
                <div className="flex items-center gap-2 bg-black/80 border border-white/20 px-3 py-1.5 rounded-xl hover:border-amber-400/40 hover:bg-black transition-all cursor-pointer shrink-0">
                  <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 0 1-.61-.958V2.772c.162-.393.38-.685.609-.958zm11.305 11.305L4.823 23.21a2.023 2.023 0 0 0 1.637.072l11.12-6.38-2.666-3.783zm0-2.238l2.666-3.784-11.12-6.38a2.02 2.02 0 0 0-1.637.072l10.091 10.092zm1.614 1.119l3.87 2.22c1.07.613 1.07 1.616 0 2.23l-3.87 2.22-2.38-3.335 2.38-3.335z"/>
                  </svg>
                  <div className="text-left leading-tight whitespace-nowrap">
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">GET IT ON</div>
                    <div className="text-xs font-bold text-white tracking-tight">Google Play</div>
                  </div>
                </div>

                {/* App Store */}
                <div className="flex items-center gap-2 bg-black/80 border border-white/20 px-3 py-1.5 rounded-xl hover:border-amber-400/40 hover:bg-black transition-all cursor-pointer shrink-0">
                  <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.03-.49 2.65-1.24z"/>
                  </svg>
                  <div className="text-left leading-tight whitespace-nowrap">
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Download on the</div>
                    <div className="text-xs font-bold text-white tracking-tight">App Store</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. We Accept Payment Icons */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <span className="text-white font-bold text-sm sm:text-[15px] whitespace-nowrap">
                We Accept
              </span>
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                {/* RuPay */}
                <div className="px-2 py-0.5 bg-white rounded-md flex items-center justify-center h-6.5 shadow-xs shrink-0">
                  <span className="font-extrabold text-[11px] tracking-tight">
                    <span className="text-blue-700">Ru</span><span className="text-orange-600">Pay</span>
                  </span>
                </div>
                {/* VISA */}
                <div className="px-2 py-0.5 bg-white rounded-md flex items-center justify-center h-6.5 shadow-xs shrink-0">
                  <span className="font-black text-[11px] italic tracking-tighter text-[#1A1F71]">
                    VISA
                  </span>
                </div>
                {/* Mastercard */}
                <div className="px-2 py-0.5 bg-white rounded-md flex items-center justify-center h-6.5 shadow-xs shrink-0">
                  <div className="flex -space-x-1 items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90"></div>
                  </div>
                </div>
                {/* Maestro */}
                <div className="px-2 py-0.5 bg-white rounded-md flex items-center justify-center h-6.5 shadow-xs shrink-0">
                  <div className="flex -space-x-1 items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#0061A8] opacity-90"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90"></div>
                  </div>
                </div>
                {/* UPI */}
                <div className="px-2 py-0.5 bg-white rounded-md flex items-center justify-center h-6.5 shadow-xs shrink-0">
                  <span className="font-black text-[10px] tracking-tight text-emerald-700">
                    UPI
                  </span>
                </div>
                {/* Net Banking */}
                <div className="px-2 py-0.5 bg-white rounded-md flex items-center justify-center h-6.5 shadow-xs shrink-0">
                  <span className="font-bold text-[10px] tracking-tight text-slate-800">
                    NetBanking
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Copyright & Security strip */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs sm:text-sm gap-3">
            <div>
              © {new Date().getFullYear()} ForexMate, All Rights Reserved
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                <span>ISO 27001 Certified</span>
              </span>
              <span>•</span>
              <span>256-Bit Bank-Grade SSL</span>
              <span>•</span>
              <span>RBI Category II Compliant</span>
            </div>
          </div>

        </div>

      </div>

    </footer>
  );
}
