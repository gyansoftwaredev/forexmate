"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransactionStore } from '@/stores/transactionStore';
import { useUiStore } from '@/stores/uiStore';
import { Card } from '@/components/ui/card';
import { ProductCalculatorStep } from './steps/ProductCalculatorStep';
import { BookMyForexCheckoutEngine } from './BookMyForexCheckoutEngine';

export function OrderWizard() {
  const { sessionId, status, initSession, draftState, clearSession, updateDraft } = useTransactionStore();
  const { isGlobalLoading } = useUiStore();
  const searchParams = useSearchParams();

  // Reset to step 1 if the user navigates with new query params or previous order was converted
  useEffect(() => {
    const hasParams = searchParams && (searchParams.get('currency') || searchParams.get('amount') || searchParams.get('tab'));
    if (hasParams || draftState.status === 'CONVERTED' || draftState.checkoutStep === 5) {
      updateDraft({
        checkoutStep: 1,
        status: 'CREATED',
        bookingRef: undefined
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Ensure session is initialized
  useEffect(() => {
    if (!sessionId || draftState.status === 'CONVERTED') {
      initSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const checkoutStep = draftState.checkoutStep || 1;

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [checkoutStep, status]);

  return (
    <div className="w-full relative">
      {/* UI Loading Overlay */}
      {isGlobalLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="w-full min-h-[500px] overflow-visible">
        {checkoutStep === 1 ? (
          <ProductCalculatorStep />
        ) : (
          <BookMyForexCheckoutEngine />
        )}
      </div>
    </div>
  );
}
