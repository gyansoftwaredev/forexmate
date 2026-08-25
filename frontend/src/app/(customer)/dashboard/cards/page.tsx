'use client';

import React from 'react';
import Link from 'next/link';
import { useMyCards } from '@/features/cards/hooks/useCards';
import { CardDisplay } from '@/features/cards/components/CardDisplay';
import { CardTransactionHistory } from '@/features/cards/components/CardTransactionHistory';
import { CreditCard } from 'lucide-react';

export default function CardsPage() {
  const { data: cards, isLoading, error } = useMyCards();

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
        Failed to load your cards. Please try again.
      </div>
    );
  }

  // Aggregate all recent transactions across all cards
  const allTransactions = cards?.flatMap(c => c.transactions) ?? [];
  allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Forex Cards</h1>
          <p className="text-gray-500 mt-1">Manage your multi-currency travel cards.</p>
        </div>
        <Link 
          href="/buy-forex?tab=card"
          className="btn-gold font-black text-slate-950 text-xs px-5 py-3 rounded-xl shadow-md hover:scale-105 transition-all"
        >
          + Order / Reload Forex Card
        </Link>
      </div>

      {/* Cards Grid */}
      {!cards || cards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Cards Yet</h3>
          <p className="text-gray-500 mb-6">Apply for a Forexmate Multi-Currency Card to get started.</p>
          <Link 
            href="/buy-forex?tab=card"
            className="btn-gold inline-block text-slate-950 font-extrabold px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-md"
          >
            Order Forex Card Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(card => (
            <CardDisplay key={card.id} card={card} />
          ))}
        </div>
      )}

      {/* Recent Transactions */}
      {allTransactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Card Transactions</h3>
          </div>
          <CardTransactionHistory transactions={allTransactions.slice(0, 10)} />
        </div>
      )}
    </div>
  );
}
