"use client";

import React, { useState } from 'react';
import { 
  Headphones, X, Send, MapPin, Phone, MessageSquare, 
  Sparkles, CheckCircle2, Clock, Building2 
} from 'lucide-react';

interface MobileSupportSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSupportSheet({ isOpen, onClose }: MobileSupportSheetProps) {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'BRANCHES'>('CHAT');
  const [messages, setMessages] = useState([
    { sender: 'AI', text: 'Hello! I am your ForexMate AI assistant. How can I help you today?' },
    { sender: 'USER', text: 'Where is my order FX-98214?' },
    { sender: 'AI', text: 'Order FX-98214 is out for delivery! Driver Vikram Singh is on his way to your address.' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: 'USER', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: 'I have logged your request on the staff support desk. A representative will contact you immediately!' }
      ]);
    }, 1000);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-white border-t border-slate-200 rounded-t-[36px] p-5 space-y-4 max-h-[85%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">ForexMate Customer Support</h3>
              <p className="text-[10px] text-slate-500 font-medium">24/7 Live Desk & Branch Finder</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'CHAT' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Live Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('BRANCHES')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'BRANCHES' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Nearest Branches</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'CHAT' ? (
          <div className="flex-1 flex flex-col min-h-[250px]">
            <div className="flex-1 overflow-y-auto space-y-2.5 p-2 scrollbar-none">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs font-semibold ${
                      m.sender === 'USER'
                        ? 'bg-amber-500 text-slate-950 font-black rounded-br-none shadow-xs'
                        : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 shrink-0">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSend}
                className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  Nariman Point Flagship Branch
                </span>
                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  Open Now
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Suite 401, Maker Chambers V, Nariman Point, Mumbai - 400021</p>
              <div className="text-[10px] text-slate-700 pt-1 font-bold">📞 +91 22 6789 4000</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  Bandra West Branch
                </span>
                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  Open Now
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Linking Road, Bandra West, Mumbai - 400050</p>
              <div className="text-[10px] text-slate-700 pt-1 font-bold">📞 +91 22 6789 4001</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
