"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, Sparkles, ShieldCheck, RefreshCw, MessageSquare, ChevronDown } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const INITIAL_GREETING: ChatMessage = {
  id: '1',
  sender: 'bot',
  text: "Hey! 👋 I'm Alpha, your 24/7 Forexmate AI Guide. How can I assist you with currency exchange, forex cards, or international money transfers today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  "🚚 Delivery Cutoff Time?",
  "💳 How Forex Cards Work?",
  "🛡️ Is Forexmate RBI Approved?",
  "📋 Required KYC Docs?",
  "🏦 How to Send Money Abroad?",
];

const FOREXMATE_KEYWORDS = [
  'forex', 'currency', 'currencies', 'card', 'cards', 'rate', 'rates', 'inr', 'usd', 'eur', 'gbp', 'aud', 'cad', 'sded', 
  'doorstep', 'delivery', 'time', 'cutoff', 'city', 'cities', 'rbi', 'lrs', 'kyc', 'passport', 'pan', 'transfer', 'wire', 
  'remittance', 'buy', 'sell', 'order', 'status', 'refund', 'support', 'contact', 'phone', 'helpline', 'markup', 'margin', 
  'cashback', 'promo', 'coupon', 'insurance', 'sim', 'branch', 'notes', 'exchange', 'forexmate', 'alpha', 'hello', 'hi', 'hey', 'help'
];

export default function AlphaChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGreetingTooltip, setShowGreetingTooltip] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Strictly only render on the homepage ('/')
  if (pathname !== '/') {
    return null;
  }

  // Entrance Flight Animation Sequence on Page Load
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsLoaded(true);
    }, 600); // Alpha flies into position after 600ms

    const timer2 = setTimeout(() => {
      setShowGreetingTooltip(true);
    }, 1400); // Speech bubble pops up after Alpha settles

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowGreetingTooltip(false);
    }
  }, [messages, isOpen, isTyping]);

  const generateAlphaResponse = (userQuery: string): string => {
    const query = userQuery.toLowerCase().trim();

    // Check scope - if query contains no Forexmate related terms and is not a simple greeting
    const isRelevant = FOREXMATE_KEYWORDS.some(kw => query.includes(kw));

    if (!isRelevant) {
      return "I am Alpha, specialized strictly in Forexmate services, currency exchange, forex cards, and international money transfers! How can I help with your travel or forex needs today? ✈️💵";
    }

    if (query.includes('delivery') || query.includes('cutoff') || query.includes('time') || query.includes('today')) {
      return "🚚 Doorstep Delivery Policy:\n\n• Orders placed before 1:00 PM are delivered same-day by 9:00 PM!\n• Orders placed after 1:00 PM are delivered next business day by 9:00 PM.\n• Same-day doorstep delivery is active across 65+ major Indian cities!";
    }

    if (query.includes('rbi') || query.includes('licensed') || query.includes('license') || query.includes('safe') || query.includes('secure') || query.includes('authorized')) {
      return "🛡️ RBI Authorized & Regulated:\n\nForexmate is a fully Reserve Bank of India (RBI) licensed Full Fledged Money Changer (FFMC) under License No. NDL-FFMC-0093-2023. All transactions are 100% FEMA & LRS compliant.";
    }

    if (query.includes('card') || query.includes('forex card')) {
      return "💳 Multi-Currency Forex Cards:\n\n• Zero forex markup at interbank live exchange rates\n• Load up to 16 global currencies on 1 card\n• Worldwide ATM cash withdrawals & POS contactless tap-pay\n• Instant lock/unlock controls inside the Forexmate App.";
    }

    if (query.includes('transfer') || query.includes('wire') || query.includes('abroad') || query.includes('lrs') || query.includes('send money')) {
      return "🏦 International Wire Transfers:\n\n• Direct bank-to-bank international money transfers for university tuition, medical treatment, or family maintenance.\n• Under RBI's Liberalised Remittance Scheme (LRS), resident Indians can remit up to $250,000 USD per financial year with 100% compliance.";
    }

    if (query.includes('kyc') || query.includes('document') || query.includes('passport') || query.includes('pan')) {
      return "📋 Required KYC Documents:\n\n1. Valid Indian Passport (front & back)\n2. PAN Card\n3. Confirmed Air Ticket or Overseas Visa\n\nKYC verification is completed online in under 2 minutes!";
    }

    if (query.includes('rate') || query.includes('markup') || query.includes('margin') || query.includes('price')) {
      return "📈 Live Interbank Rates:\n\nWe provide real-time live interbank exchange rates with zero hidden markups. You get live rates tied directly to global market feeds!";
    }

    if (query.includes('city') || query.includes('cities') || query.includes('delhi') || query.includes('mumbai') || query.includes('bangalore')) {
      return "📍 City Availability:\n\nWe operate doorstep delivery & branch pickup in 65+ Indian cities including Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur, and Chandigarh!";
    }

    if (query.includes('support') || query.includes('contact') || query.includes('phone') || query.includes('number') || query.includes('help')) {
      return "🎧 24/7 Helpline & Support:\n\n• Call Us Anytime: +91-9212219191\n• Email Support: hello@forexmate.com\n• Live Chat: Right here with Alpha!";
    }

    return "At Forexmate, you can buy/sell 40+ foreign currencies, order multi-currency forex cards, or transfer money abroad with zero hidden markups and same-day doorstep delivery! What specific service would you like to explore?";
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
      const responseText = generateAlphaResponse(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] font-sans transition-all duration-1000 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
      isLoaded 
        ? 'translate-y-0 opacity-100 scale-100 rotate-0 pointer-events-auto' 
        : '-translate-y-[100vh] opacity-0 scale-75 -rotate-12 pointer-events-none'
    }`}>
      
      {/* Floating Greeting Speech Bubble (Visible without clicking) */}
      {!isOpen && showGreetingTooltip && (
        <div 
          onClick={() => setIsOpen(true)}
          className="absolute bottom-16 right-0 mb-3 w-80 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-blue-500/40 text-white rounded-3xl p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ring-1 ring-white/10 group cursor-pointer"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowGreetingTooltip(false);
            }} 
            className="absolute -top-2 -right-2 bg-slate-900 text-slate-400 hover:text-white rounded-full p-1 border border-slate-700 shadow-md hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> Alpha AI Guide
            </span>
          </div>
          
          <p className="text-xs font-semibold text-slate-100 leading-relaxed">
            "Hey! 👋 I'm <strong className="text-blue-400 font-extrabold">Alpha</strong>. Here to guide you with live rates, forex cards & doorstep delivery!"
          </p>
          
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] font-extrabold text-orange-400 group-hover:text-amber-300 transition-colors">
            <span>Ask me anything about Forexmate</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>

          {/* Speech bubble arrow pointer */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-950 border-r border-b border-blue-500/40 transform rotate-45"></div>
        </div>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-3xl w-[360px] sm:w-[400px] h-[540px] flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200 mb-4 ring-1 ring-white/10">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(59,130,246,0.6)] border border-blue-400/50 bg-slate-900 shrink-0">
                  <img src="/alpha_avatar.png" alt="Alpha AI" className="w-full h-full object-cover" />
                </div>
                <span className="w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm tracking-tight text-white">Alpha</h3>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    AI Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Forexmate Official Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setMessages([INITIAL_GREETING])} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                  <div className="w-7 h-7 rounded-xl overflow-hidden border border-blue-500/40 shrink-0 mt-1 shadow-sm bg-slate-900">
                    <img src="/alpha_avatar.png" alt="Alpha" className="w-full h-full object-cover" />
                  </div>
                )}

                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none font-medium' 
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <div className={`text-[9px] mt-1.5 text-right font-medium ${msg.sender === 'user' ? 'text-orange-100/70' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-xl overflow-hidden border border-blue-500/40 shrink-0 bg-slate-900">
                  <img src="/alpha_avatar.png" alt="Alpha" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 py-2 border-t border-slate-800/60 bg-slate-950/60 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 shadow-xs cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/90">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 items-center"
            >
              <input 
                type="text" 
                placeholder="Ask Alpha about forex rates, cards..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                disabled={!inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Toggle Button - Sleek Small Circle Logo Avatar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 rounded-full bg-slate-950 border-2 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-blue-500/30 p-1"
          title="Chat with Alpha AI"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border border-blue-400/40">
            <img src="/alpha_avatar.png" alt="Alpha AI" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <span className="w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full absolute bottom-0 right-0 animate-pulse shadow-md z-10"></span>
        </button>
      )}

    </div>
  );
}
