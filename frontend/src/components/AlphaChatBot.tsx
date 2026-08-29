"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Bot, X, Send, Sparkles, ShieldCheck, RefreshCw, 
  MessageSquare, ChevronDown, ArrowRight, ExternalLink,
  CreditCard, Globe, Landmark, Clock, Phone, MapPin, Check
} from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickAction?: {
    label: string;
    href: string;
  };
}

const INITIAL_GREETING: ChatMessage = {
  id: '1',
  sender: 'bot',
  text: "Hello! 👋 I'm **Alpha**, your 24/7 MTTPL & Forexmate AI Concierge.\n\nHow may I assist you with live interbank exchange rates, multi-currency forex cards, or international wire transfers today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  quickAction: {
    label: "Explore Zero Margin Rates",
    href: "/rates"
  }
};

const SUGGESTIONS = [
  "📈 Live Rates & Margins",
  "🚚 Same-Day Doorstep Cutoff",
  "💳 Multi-Currency Forex Card",
  "🏦 Outward Wire Transfer (LRS)",
  "📋 Required KYC Documents",
  "🛡️ RBI FFMC License Info",
];

const FOREXMATE_KEYWORDS = [
  'forex', 'currency', 'currencies', 'card', 'cards', 'rate', 'rates', 'inr', 'usd', 'eur', 'gbp', 'aud', 'cad', 'sded', 
  'doorstep', 'delivery', 'time', 'cutoff', 'city', 'cities', 'rbi', 'lrs', 'kyc', 'passport', 'pan', 'transfer', 'wire', 
  'remittance', 'buy', 'sell', 'order', 'status', 'refund', 'support', 'contact', 'phone', 'helpline', 'markup', 'margin', 
  'cashback', 'promo', 'coupon', 'insurance', 'sim', 'branch', 'notes', 'exchange', 'forexmate', 'alpha', 'hello', 'hi', 'hey', 'help',
  'mttpl', 'travel', 'flight', 'concierge'
];

export default function AlphaChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMicroTip, setShowMicroTip] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Strictly only render on the homepage ('/')
  if (pathname !== '/') {
    return null;
  }

  // Smooth entrance after page mount without blocking screen
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsLoaded(true);
    }, 800);

    const timer2 = setTimeout(() => {
      setShowMicroTip(true);
    }, 2000);

    // Auto-dismiss micro-tip after 7 seconds so it never lingers or blocks UI
    const timer3 = setTimeout(() => {
      setShowMicroTip(false);
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowMicroTip(false);
    }
  }, [messages, isOpen, isTyping]);

  const generateAlphaResponse = (userQuery: string): { text: string; quickAction?: { label: string; href: string } } => {
    const query = userQuery.toLowerCase().trim();

    const isRelevant = FOREXMATE_KEYWORDS.some(kw => query.includes(kw));

    if (!isRelevant) {
      return {
        text: "I am **Alpha**, specialized exclusively in MTTPL & Forexmate currency exchange, multi-currency cards, and international money transfers! How can I assist with your global travel or foreign remittance needs today?",
        quickAction: { label: "View All Forex Services", href: "/buy-forex" }
      };
    }

    if (query.includes('delivery') || query.includes('cutoff') || query.includes('time') || query.includes('today')) {
      return {
        text: "🚚 **Same-Day Doorstep Delivery Policy**:\n\n• **Orders before 1:00 PM**: Delivered same-day by 9:00 PM.\n• **Orders after 1:00 PM**: Guaranteed next business day by 9:00 PM.\n• Active across 65+ Indian cities with armored security courier.",
        quickAction: { label: "Order Cash Delivery", href: "/buy-forex" }
      };
    }

    if (query.includes('rbi') || query.includes('licensed') || query.includes('license') || query.includes('safe') || query.includes('secure') || query.includes('authorized')) {
      return {
        text: "🛡️ **RBI Licensed & FEMA Regulated**:\n\nForexmate (MTTPL Global Services) operates under **RBI Full Fledged Money Changer (FFMC) License No. RBI-FFMC-2026-0001**.\n\nAll rates, remittances, and cards are 100% statutory compliant under RBI LRS guidelines.",
        quickAction: { label: "Learn About Compliance", href: "/about" }
      };
    }

    if (query.includes('card') || query.includes('forex card')) {
      return {
        text: "💳 **MTTPL Multi-Currency Forex Card**:\n\n• Zero forex markup locked at live interbank rates\n• Load up to 16 global currencies on 1 contactless Visa card\n• Worldwide ATM cash withdrawals & merchant POS payments\n• Instant lock/unlock controls from your customer dashboard.",
        quickAction: { label: "Get Forex Card", href: "/forex-cards" }
      };
    }

    if (query.includes('transfer') || query.includes('wire') || query.includes('abroad') || query.includes('lrs') || query.includes('send money') || query.includes('remittance')) {
      return {
        text: "🏦 **Outward International Wire Transfers**:\n\n• Direct SWIFT bank-to-bank transfers for university tuition, medical expenses, or family maintenance.\n• Resident Indians can remit up to **$250,000 USD per financial year** under RBI's Liberalised Remittance Scheme (LRS).",
        quickAction: { label: "Send Wire Transfer", href: "/transfer-money" }
      };
    }

    if (query.includes('kyc') || query.includes('document') || query.includes('passport') || query.includes('pan')) {
      return {
        text: "📋 **Required Statutory KYC Documents**:\n\n1. Valid Indian Passport (front & back copies)\n2. Indian PAN Card\n3. Confirmed Air Ticket or Overseas Visa / University Offer Letter\n\nInstant digital KYC verification is completed online in under 2 minutes!",
        quickAction: { label: "Start Digital KYC", href: "/kyc" }
      };
    }

    if (query.includes('rate') || query.includes('markup') || query.includes('margin') || query.includes('price')) {
      return {
        text: "📈 **True Zero Margin Interbank Rates**:\n\nWe provide real-time interbank rates without the typical 2.5%–4% bank markups. The rate you see is the rate you pay.",
        quickAction: { label: "Check Live Rates", href: "/rates" }
      };
    }

    if (query.includes('city') || query.includes('cities') || query.includes('delhi') || query.includes('mumbai') || query.includes('bangalore')) {
      return {
        text: "📍 **65+ Operational Cities**:\n\nDoorstep delivery & branch network available in Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur, Chandigarh, and 55+ more cities!",
        quickAction: { label: "Locate Nearest Branch", href: "/branches" }
      };
    }

    if (query.includes('support') || query.includes('contact') || query.includes('phone') || query.includes('number') || query.includes('help')) {
      return {
        text: "🎧 **24/7 MTTPL Executive Concierge**:\n\n• Toll-Free Helpline: **+91 9212219191**\n• Email Support: **hello@forexmate.com**\n• Physical Branch Vaults open Mon–Sat 9:30 AM to 6:30 PM.",
        quickAction: { label: "Open Support Desk", href: "/contact" }
      };
    }

    return {
      text: "At **Forexmate (A MTTPL Company)**, you can exchange 40+ currencies at zero hidden markups, order multi-currency forex cards, or transfer money overseas with same-day doorstep fulfillment.\n\nWhich service would you like to explore?",
      quickAction: { label: "Book Live Rate", href: "/buy-forex" }
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = generateAlphaResponse(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: resp.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickAction: resp.quickAction
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] font-sans transition-all duration-700 ease-out ${
      isLoaded 
        ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' 
        : 'translate-y-12 opacity-0 scale-90 pointer-events-none'
    }`}>
      
      {/* ─── 1. ULTRA-COMPACT MTTPL LUXURY MICRO-TOOLTIP (Non-blocking) ─── */}
      {!isOpen && showMicroTip && (
        <div 
          onClick={() => setIsOpen(true)}
          className="absolute bottom-14 right-0 mb-2.5 w-64 bg-slate-950/95 border border-amber-400/40 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300 ring-1 ring-amber-400/20 group cursor-pointer"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMicroTip(false);
            }} 
            className="absolute -top-1.5 -right-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-full p-0.5 border border-slate-700 shadow-sm hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> MTTPL Concierge
            </span>
          </div>
          
          <p className="text-[11px] font-medium text-slate-200 leading-snug">
            Need help locking live rates or forex cards? <strong className="text-amber-400">Ask Alpha</strong>
          </p>

          {/* Micro arrow pointer */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-950 border-r border-b border-amber-400/40 transform rotate-45"></div>
        </div>
      )}

      {/* ─── 2. EXPANDED MTTPL LUXURY AI DRAWER ────────────────────────── */}
      {isOpen && (
        <div className="bg-slate-950/95 backdrop-blur-2xl border border-amber-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl w-[340px] sm:w-[380px] h-[520px] flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200 mb-3 ring-1 ring-white/10">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 px-4.5 py-3.5 border-b border-amber-400/20 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-400/60 bg-slate-900 shrink-0">
                  <img src="/alpha_avatar.png" alt="Alpha AI" className="w-full h-full object-cover" />
                </div>
                <span className="w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">Alpha</h3>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[8.5px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                    MTTPL Concierge
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">24/7 Zero Margin Forex Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setMessages([INITIAL_GREETING])} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-hide text-xs">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg overflow-hidden border border-amber-400/40 shrink-0 mt-1 shadow-sm bg-slate-900">
                    <img src="/alpha_avatar.png" alt="Alpha" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="max-w-[82%] space-y-2">
                  <div 
                    className={`rounded-2xl px-3.5 py-2.5 shadow-md leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-br-none' 
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[9px] mt-1 text-right font-medium ${msg.sender === 'user' ? 'text-amber-950/70' : 'text-slate-500'}`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Optional 1-Click Quick Action CTA */}
                  {msg.quickAction && (
                    <Link 
                      href={msg.quickAction.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 hover:bg-amber-500/25 text-[11px] font-extrabold transition-all shadow-2xs group cursor-pointer"
                    >
                      <span>{msg.quickAction.label}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-amber-400" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-amber-400/40 shrink-0 bg-slate-900">
                  <img src="/alpha_avatar.png" alt="Alpha" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/80 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-400/30 px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap transition-all shrink-0 shadow-2xs cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800/90 bg-slate-900/95">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 items-center"
            >
              <input 
                type="text" 
                placeholder="Ask Alpha about live rates, cards..." 
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none font-medium transition-colors"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black p-2 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                disabled={!inputValue.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ─── 3. SLEEK COMPACT MTTPL LUXURY FLOATING TRIGGER ────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-400/50 shadow-[0_4px_20px_rgba(245,158,11,0.25)] backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-amber-400/20"
          title="Chat with MTTPL Alpha Concierge"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-900 border border-amber-400/60 shrink-0">
            <img src="/alpha_avatar.png" alt="Alpha AI" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full absolute bottom-0 right-0 animate-pulse"></span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1 text-[11px] font-black text-white group-hover:text-amber-300 transition-colors">
              <span>Alpha</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            </div>
            <div className="text-[9px] font-bold text-amber-400/90 tracking-wide uppercase">
              MTTPL AI
            </div>
          </div>
        </button>
      )}

    </div>
  );
}

