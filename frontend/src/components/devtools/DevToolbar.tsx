"use client";
import React, { useState } from 'react';
import { DevPanel } from './DevPanel';
import { Settings } from 'lucide-react';

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Developer toolbar is turned off by default
  const showToolbar = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';

  if (!showToolbar) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-all border border-orange-400 z-50 group"
        title="Open Developer Settings"
      >
        <Settings className="w-7 h-7 group-hover:rotate-45 transition-transform duration-300" />
      </button>
      
      <DevPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

