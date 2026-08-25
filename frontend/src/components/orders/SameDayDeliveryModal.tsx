"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function SameDayDeliveryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 text-center space-y-4 relative animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hand Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold border border-amber-500/20 shadow-2xs">
          👈
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
          Order Early for Same-Day Delivery
        </h3>

        {/* Modal Description */}
        <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed px-2">
          Place your order before <strong>1 PM</strong> and get your forex delivered today. Orders after 1 PM will be delivered the next working day, hassle-free.
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full btn-gold py-3 rounded-2xl font-extrabold text-sm text-slate-950 uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            OKAY GOT IT
          </button>
        </div>

      </div>

    </div>,
    document.body
  );
}
