import Link from 'next/link';
import { Mail, Phone, ShieldCheck, MapPin, Send, ArrowRight, Globe } from 'lucide-react';

export default function Footer() {
  const topCities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Gurgaon", "Noida", "Chandigarh", "Jaipur", "Lucknow", "Kochi", "Coimbatore", "Indore", "Surat", "Patna"];
  const topCurrencies = ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "CHF", "THB", "NZD"];

  return (
    <footer className="bg-[#071426] text-slate-300 text-sm font-sans border-t border-white/10 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 pt-16 pb-12">
        
        {/* Top Newsletter & Offer Subscription Strip */}
        <div className="bg-[#0D1B2A]/90 border border-amber-500/20 rounded-3xl p-8 mb-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="section-label bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block">
              🔥 Daily Rate Alerts & Coupons
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              Get Zero Margin Live Rate Drop Alerts
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Subscribe for live FX market alerts, zero commission promo codes & travel currency updates.
            </p>
          </div>

          <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="relative flex-1 min-w-[280px]">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-[#071426] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
              />
            </div>
            <button className="btn-gold px-6 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 shrink-0">
              <span>Subscribe Free</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 mb-16">
          
          {/* Column 1 */}
          <div>
            <div className="section-label mb-4 text-[10px] text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Delivery Cities</span>
            </div>
            <ul className="space-y-2.5">
              {topCities.slice(0, 8).map(city => (
                <li key={city}>
                  <Link 
                    href={`/currency-exchange/${city.toLowerCase()}`} 
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block"
                  >
                    Forex in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 2 */}
          <div>
            <div className="section-label mb-4 text-[10px] text-amber-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Wire Remittances</span>
            </div>
            <ul className="space-y-2.5">
              <li><Link href="/transfer-money" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Send Money to USA</Link></li>
              <li><Link href="/transfer-money" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Send Money to UK</Link></li>
              <li><Link href="/transfer-money" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Send Money to Canada</Link></li>
              <li><Link href="/transfer-money" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Send Money to Australia</Link></li>
              <li><Link href="/transfer-money" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Send Money to Germany</Link></li>
              <li><Link href="/transfer-money" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Send Money to Singapore</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <div className="section-label mb-4 text-[10px] text-amber-400">Products & Cards</div>
            <ul className="space-y-2.5">
              <li><Link href="/buy-forex" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Buy Foreign Currency Cash</Link></li>
              <li><Link href="/sell-forex" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Sell Foreign Currency</Link></li>
              <li><Link href="/forex-cards" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Multi-Currency Forex Card</Link></li>
              <li><Link href="/travel-insurance" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Overseas Travel Insurance</Link></li>
              <li><Link href="/international-sim" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">International SIM Cards</Link></li>
              <li><Link href="/faas-partners" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">FaaS API Integration</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <div className="section-label mb-4 text-[10px] text-amber-400">Corporate & Legal</div>
            <ul className="space-y-2.5">
              <li><Link href="/corporate-solutions" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Corporate Solutions</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">About ForexMate</Link></li>
              <li><Link href="/faqs" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Help Center & FAQs</Link></li>
              <li><Link href="/privacy-policy" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium block">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 5: MTTPL Group Identity */}
          <div>
            <div className="section-label mb-4 text-[10px] text-amber-400">Company & Ecosystem</div>
            <div className="space-y-3 text-xs">
              <div className="font-display text-xl font-bold text-white">ForexMate</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                A Division of SourceMyTrip (MTTPL Group). India&apos;s leading RBI Authorized Category II Foreign Exchange Platform.
              </p>
              
              <a
                href="https://earnest-sawine-29983e.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <span>✈️ Visit MTTPL Travels</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>© 2026 ForexMate / MTTPL Global Services. RBI FFMC License: RBI-FFMC-2026-0001. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>ISO 27001 Certified</span>
            <span>•</span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
