import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Building2, Truck, Package } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const norm = (status || '').toUpperCase();

  switch (norm) {
    case 'COMPLETED':
    case 'DELIVERED':
    case 'SETTLED':
    case 'FULFILLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    case 'READY_FOR_PICKUP':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <Building2 className="w-3.5 h-3.5 text-amber-700" />
          <span>Ready at Branch</span>
        </span>
      );
    case 'OUT_FOR_DELIVERY':
    case 'DISPATCHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>Out for Delivery</span>
        </span>
      );
    case 'PROCESSING':
    case 'IN_PROGRESS':
    case 'ASSIGNED':
    case 'IN_BRANCH_PROCESSING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Processing</span>
        </span>
      );
    case 'PAYMENT_PENDING':
    case 'PENDING_PAYMENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Payment Pending</span>
        </span>
      );
    case 'PENDING_KYC':
    case 'UNDER_REVIEW':
    case 'ACTION_REQUIRED':
    case 'KYC_REQUIRED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-400 text-amber-950 font-black text-[11px] uppercase tracking-wider shadow-2xs animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>Action Required</span>
        </span>
      );
    case 'ORDER_PLACED':
    case 'PENDING_ASSIGNMENT':
    case 'ORDER_RECEIVED':
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <Package className="w-3.5 h-3.5 text-indigo-600" />
          <span>Order Placed</span>
        </span>
      );
    case 'CANCEL_REQUESTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Cancel Requested</span>
        </span>
      );
    case 'CANCELLED':
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[11px] uppercase tracking-wider shadow-2xs">
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{norm.replace(/_/g, ' ')}</span>
        </span>
      );
  }
}

