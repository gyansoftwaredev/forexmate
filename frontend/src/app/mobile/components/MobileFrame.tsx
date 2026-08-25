"use client";

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Sparkles } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  const [isFrameMode, setIsFrameMode] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-0 md:p-6 font-sans relative overflow-x-hidden select-none">
      
      {/* Background subtle light ambient effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Frame Mode Toggle Bar for Desktop */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-2.5 px-4 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-black text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-900">ForexMate Customer Mobile App</div>
            <div className="text-[10px] text-slate-500 font-semibold">Connected to Staff & Treasury Desk</div>
          </div>
        </div>

        <button
          onClick={() => setIsFrameMode(!isFrameMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all border border-slate-300/80"
        >
          {isFrameMode ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-amber-600" />
              <span>Expand View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span>Phone Shell</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container: Mobile Frame vs Full Screen */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isFrameMode
            ? 'max-w-[430px] h-[915px] rounded-[52px] border-[10px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] bg-slate-50 overflow-hidden flex flex-col transform-gpu'
            : 'max-w-md md:max-w-2xl min-h-screen md:min-h-[850px] md:rounded-3xl border-0 md:border md:border-slate-200 bg-slate-50 overflow-hidden flex flex-col shadow-2xl relative'
        }`}
      >
        {/* Dynamic Island / Status Bar (Shown in Frame Mode) */}
        {isFrameMode && (
          <div className="w-full bg-white text-slate-900 pt-3 px-7 flex items-center justify-between shrink-0 z-40 select-none border-b border-slate-100">
            {/* Clock */}
            <span className="text-[13px] font-extrabold tracking-tight text-slate-900">{currentTime}</span>

            {/* Dynamic Island Pill */}
            <div className="w-28 h-6 bg-slate-950 rounded-full flex items-center justify-center gap-2 shadow-inner px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            </div>
          </div>
        )}

        {/* Inner App Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative isolate">
          {children}
        </div>

        {/* Bottom Home Indicator Bar (Phone Frame) */}
        {isFrameMode && (
          <div className="w-full bg-white py-1.5 flex justify-center shrink-0 z-40 border-t border-slate-100">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>

    </div>
  );
}
