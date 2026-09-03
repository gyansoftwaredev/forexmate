"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  X, Send, Sparkles, ShieldCheck, RefreshCw, 
  MoreHorizontal, Heart, Compass, CreditCard, 
  Clock, ArrowRight, ArrowLeft, Globe, Landmark,
  Shield, Truck, FileText, Check, Bot
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

const STARTER_PROMPTS = [
  {
    id: 'rates',
    icon: Heart,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50 border-rose-100',
    text: "How do zero margin interbank rates work?",
    query: "How do zero margin interbank rates work at Forexmate?"
  },
  {
    id: 'wire',
    icon: Compass,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    text: "What are the limits for international wire transfer under LRS?",
    query: "What are the limits for international wire transfer under LRS?"
  },
  {
    id: 'card',
    icon: CreditCard,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    text: "How to get an instant multi-currency forex card?",
    query: "How to get an instant multi-currency forex card?"
  },
  {
    id: 'delivery',
    icon: Clock,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100',
    text: "Check same-day delivery cutoff times for my city",
    query: "Check same-day doorstep delivery cutoff times for my city"
  }
];

const FOREXMATE_KEYWORDS = [
  'forex', 'currency', 'currencies', 'card', 'cards', 'rate', 'rates', 'inr', 'usd', 'eur', 'gbp', 'aud', 'cad', 
  'doorstep', 'delivery', 'time', 'cutoff', 'city', 'cities', 'rbi', 'lrs', 'kyc', 'passport', 'pan', 'transfer', 'wire', 
  'remittance', 'buy', 'sell', 'order', 'status', 'refund', 'support', 'contact', 'phone', 'helpline', 'markup', 'margin', 
  'cashback', 'promo', 'coupon', 'insurance', 'sim', 'branch', 'notes', 'exchange', 'forexmate', 'alpha', 'hello', 'hi', 'hey', 'help',
  'mttpl', 'travel', 'aviora'
];

export default function AlphaChatBot() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Strictly only render on the homepage ('/')
  if (pathname !== '/') {
    return null;
  }

  // Smooth entrance on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && hasInteracted) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping, hasInteracted]);

  const generateAlphaResponse = (userQuery: string): { text: string; quickAction?: { label: string; href: string } } => {
    const query = userQuery.toLowerCase().trim();
    const isRelevant = FOREXMATE_KEYWORDS.some(kw => query.includes(kw));

    if (!isRelevant) {
      return {
        text: "I am **Alpha**, your MTTPL & Forexmate digital travel companion! I specialize in zero-margin currency exchange, multi-currency cards, and international bank transfers. How can I help you today? ✈️💵",
        quickAction: { label: "View Forex Services", href: "/buy-forex" }
      };
    }

    if (query.includes('rate') || query.includes('zero margin') || query.includes('markup') || query.includes('margin')) {
      return {
        text: "📈 **True Zero Margin Interbank Rates**:\n\n• At Forexmate (MTTPL), you lock live interbank rates tied directly to global market feeds.\n• Unlike traditional banks that add a 2.5%–4% hidden markup, our rates have **0% extra margin**.\n• Lock rates instantly online for doorstep delivery or branch pickup!",
        quickAction: { label: "Check Live Rates", href: "/rates" }
      };
    }

    if (query.includes('transfer') || query.includes('wire') || query.includes('lrs') || query.includes('limit') || query.includes('abroad')) {
      return {
        text: "🏦 **RBI LRS Outward Wire Transfers**:\n\n• Under RBI's Liberalised Remittance Scheme (LRS), resident Indians can send up to **$250,000 USD per financial year**.\n• Ideal for overseas university tuition, living expenses, medical treatment, or gift remittances.\n• 100% statutory compliant with instant SWIFT MT103 confirmation.",
        quickAction: { label: "Send Wire Transfer", href: "/remittance" }
      };
    }

    if (query.includes('card') || query.includes('forex card')) {
      return {
        text: "💳 **Multi-Currency Forex Card**:\n\n• 1 Card with up to 16 global currencies loaded at live zero-margin rates.\n• Zero cross-currency markup on domestic and international transactions.\n• Instant ATM cash withdrawals & merchant POS tap-and-pay worldwide.\n• Real-time controls & instant freeze in your dashboard.",
        quickAction: { label: "Get Forex Card", href: "/forex-cards" }
      };
    }

    if (query.includes('delivery') || query.includes('cutoff') || query.includes('time') || query.includes('same-day')) {
      return {
        text: "🚚 **Same-Day Doorstep Delivery Cutoffs**:\n\n• **Orders before 1:00 PM**: Delivered same-day by 9:00 PM.\n• **Orders after 1:00 PM**: Delivered next business day by 9:00 PM.\n• Armored courier delivery active across 65+ Indian cities with OTP verification.",
        quickAction: { label: "Order Cash Delivery", href: "/buy-forex" }
      };
    }

    if (query.includes('kyc') || query.includes('document') || query.includes('passport') || query.includes('pan')) {
      return {
        text: "📋 **Required KYC Documents**:\n\n1. Valid Indian Passport (front & back)\n2. Indian PAN Card\n3. Confirmed Air Ticket or Overseas Visa\n\nDigital KYC verification takes under 2 minutes online!",
        quickAction: { label: "Complete KYC", href: "/kyc" }
      };
    }

    if (query.includes('rbi') || query.includes('license') || query.includes('safe') || query.includes('secure')) {
      return {
        text: "🛡️ **RBI Licensed & Regulated**:\n\nForexmate (A MTTPL Group Company) is an RBI-licensed Full Fledged Money Changer (FFMC License No. RBI-FFMC-2026-0001). All foreign exchange operations are 100% FEMA compliant.",
        quickAction: { label: "About MTTPL & Forexmate", href: "/about" }
      };
    }

    return {
      text: "At **Forexmate (A MTTPL Company)**, you can exchange 40+ currencies at zero hidden markups, order multi-currency forex cards, or transfer money overseas.\n\nWhich service can I assist you with right now?",
      quickAction: { label: "Book Live Rate", href: "/buy-forex" }
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setHasInteracted(true);

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
    }, 550);
  };

  const handleReset = () => {
    setMessages([]);
    setHasInteracted(false);
    setInputValue('');
  };

  const userName = user?.fullName?.split(' ')[0] || 'Guest';

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] font-sans transition-all duration-700 ease-out ${
      isLoaded 
        ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' 
        : 'translate-y-12 opacity-0 scale-90 pointer-events-none'
    }`}>
      
      {/* ─── 1. AVIORA / MTTPL LIGHT-MODE CHAT DRAWER ─────────────────────── */}
      {isOpen && (
        <div className="bg-white border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] rounded-[28px] w-[350px] sm:w-[380px] h-[520px] flex flex-col overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200 mb-3 ring-1 ring-black/5">
          
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white relative">
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Title: ALPHA.AI BETA */}
            <div className="flex items-center gap-1.5 font-black text-xs tracking-wider text-slate-800 uppercase font-mono">
              <span>ALPHA.AI</span>
              <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-200/60">
                BETA
              </span>
            </div>

            <div className="flex items-center gap-1">
              {hasInteracted && (
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Return to Suggestions"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body Area */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide flex flex-col justify-between">
            
            {/* VIEW A: Welcome Home View (Matching exact screenshot) */}
            {!hasInteracted ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Hero Header Card */}
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-amber-50/80 border border-amber-200/90 p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    <img src="/alpha_avatar.png" alt="Alpha AI" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-black tracking-widest text-amber-600 uppercase block">
                      DIGITAL COMPANION
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mt-0.5">
                      Meet Alpha
                    </h3>
                  </div>
                </div>

                {/* Big Greeting Headline */}
                <div className="pt-1">
                  <h2 className="text-2xl font-black tracking-tight text-blue-600">
                    Hi, {userName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    I'm Alpha — your personal forex assistant. Let's plan your currency exchange together.
                  </p>
                </div>

                {/* "YOU MAY TRY ASKING" Suggestions Section */}
                <div className="pt-2">
                  <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2.5">
                    YOU MAY TRY ASKING
                  </div>

                  <div className="space-y-2">
                    {STARTER_PROMPTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSend(item.query)}
                          className="w-full p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-sm flex items-center gap-3 text-left transition-all duration-200 cursor-pointer group"
                        >
                          <div className={`w-8 h-8 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                            {item.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              /* VIEW B: Active Conversation Mode */
              <div className="space-y-3 text-xs animate-in fade-in duration-200 flex-1">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-lg overflow-hidden border border-amber-200 shrink-0 mt-0.5 shadow-2xs bg-amber-50">
                        <img src="/alpha_avatar.png" alt="Alpha" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="max-w-[82%] space-y-1.5">
                      <div 
                        className={`rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed whitespace-pre-wrap ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white font-medium rounded-tr-xs' 
                            : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                        <div className={`text-[9px] mt-1 text-right font-medium ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </div>
                      </div>

                      {/* Optional 1-Click Action CTA */}
                      {msg.quickAction && (
                        <Link 
                          href={msg.quickAction.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[11px] font-extrabold transition-all shadow-2xs group cursor-pointer"
                        >
                          <span>{msg.quickAction.label}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-blue-600" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-amber-200 shrink-0 bg-amber-50">
                      <img src="/alpha_avatar.png" alt="Alpha" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

          </div>

          {/* Bottom Input Bar (Exact Pill Style from Screenshot) */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 items-center bg-slate-50 border border-slate-200/80 focus-within:border-blue-400 focus-within:bg-white rounded-full px-3.5 py-1.5 transition-all shadow-2xs"
            >
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="submit"
                className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer disabled:opacity-40"
                disabled={!inputValue.trim()}
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ─── 2. FLOATING TRIGGER BUTTON (Exact Glowing Avatar from Screenshot) ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-13 h-13 rounded-full bg-slate-950 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-amber-400/40 p-1"
          title="Open Alpha AI Companion"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border border-amber-400/50">
            <img src="/alpha_avatar.png" alt="Alpha AI" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <span className="w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full absolute bottom-0 right-0 animate-pulse shadow-md z-10"></span>
        </button>
      )}

    </div>
  );
}


