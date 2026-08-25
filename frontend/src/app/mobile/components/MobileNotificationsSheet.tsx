"use client";

import React from 'react';
import { Bell, X, CheckCircle2, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

interface MobileNotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNotificationsSheet({ isOpen, onClose }: MobileNotificationsSheetProps) {
  const notifications = [
    {
      id: '1',
      title: 'Order Dispatch Update',
      message: 'Delivery Partner Vikram Singh has been assigned for Order FX-98214.',
      time: '10 mins ago',
      type: 'ORDER',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: '2',
      title: 'USD Live Rate Alert',
      message: 'USD rate dropped to 83.45 INR! Lock your rate now for travel savings.',
      time: '1 hour ago',
      type: 'RATE',
      icon: TrendingUp,
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      id: '3',
      title: 'RBI KYC Status',
      message: 'Your Passport and PAN card verification has been approved by the Manager.',
      time: 'Yesterday',
      type: 'KYC',
      icon: ShieldAlert,
      iconColor: 'text-blue-600 bg-blue-50',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-white border-t border-slate-200 rounded-t-[36px] p-5 space-y-4 max-h-[85%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Push Notifications</h3>
              <p className="text-[10px] text-slate-500 font-medium">Order updates & treasury rate alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs"
              >
                <div className={`w-8 h-8 rounded-xl ${n.iconColor} flex items-center justify-center shrink-0 mt-0.5 border border-slate-100`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{n.title}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug font-medium">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
