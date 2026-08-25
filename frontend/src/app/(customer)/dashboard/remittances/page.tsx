'use client';

import React from 'react';
import Link from 'next/link';
import { useMyRemittances } from '@/features/remittance/hooks/useRemittance';
import { RemittanceList } from '@/features/remittance/components/RemittanceList';

export default function RemittancesPage() {
  const { data: remittances, isLoading, error } = useMyRemittances();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Failed to load remittances. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wire Transfers</h1>
          <p className="text-gray-500 mt-1">Track your international remittance orders.</p>
        </div>
        <Link
          href="/buy-forex?tab=remittance"
          className="btn-gold font-black text-slate-950 text-xs px-5 py-3 rounded-xl shadow-md hover:scale-105 transition-all"
        >
          + Send Money Abroad (Wire)
        </Link>
      </div>

      <RemittanceList remittances={remittances ?? []} />
    </div>
  );
}
