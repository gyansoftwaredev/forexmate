"use client";

import React, { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav, MobileTabType } from './components/MobileBottomNav';
import { MobileHomeTab } from './components/MobileHomeTab';
import { MobileExchangeTab } from './components/MobileExchangeTab';
import { MobileCardsTab } from './components/MobileCardsTab';
import { MobileOrdersTab } from './components/MobileOrdersTab';
import { MobileProfileTab } from './components/MobileProfileTab';
import { MobileSupportSheet } from './components/MobileSupportSheet';
import { MobileNotificationsSheet } from './components/MobileNotificationsSheet';

export default function MobileAppPage() {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [activeTab, setActiveTab] = useState<MobileTabType>('home');
  const [exchangeProduct, setExchangeProduct] = useState('CASH_BUY');
  const [exchangeCurrency, setExchangeCurrency] = useState('USD');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleNavigateTab = (tab: MobileTabType, subState?: any) => {
    setActiveTab(tab);
    if (tab === 'exchange' && subState) {
      if (subState.product) setExchangeProduct(subState.product);
      if (subState.currency) setExchangeCurrency(subState.currency);
    }
    if (tab === 'orders' && subState?.selectedId) {
      setSelectedOrderId(subState.selectedId);
    }
  };

  const handleOrderCreated = (newOrderId: string) => {
    setSelectedOrderId(newOrderId);
    setActiveTab('orders');
  };

  return (
    <MobileFrame>
      {/* Fixed BookMyForex App Header */}
      <MobileHeader
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onNavigateTab={(tab, state) => handleNavigateTab(tab, state)}
        unreadNotificationsCount={2}
      />

      {/* Dynamic Tab Body Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'home' && (
          <MobileHomeTab
            selectedCity={selectedCity}
            onNavigateTab={(tab, state) => handleNavigateTab(tab, state)}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        )}

        {activeTab === 'exchange' && (
          <MobileExchangeTab
            initialProduct={exchangeProduct}
            initialCurrency={exchangeCurrency}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {activeTab === 'cards' && (
          <MobileCardsTab
            onReloadCard={() => handleNavigateTab('exchange', { product: 'CARD_RELOAD' })}
          />
        )}

        {activeTab === 'orders' && (
          <MobileOrdersTab
            selectedOrderId={selectedOrderId}
            onNavigateExchange={() => handleNavigateTab('exchange')}
          />
        )}

        {activeTab === 'profile' && (
          <MobileProfileTab
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
      </div>

      {/* Fixed App Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        activeOrdersCount={1}
      />

      {/* Drawer Sheets */}
      <MobileSupportSheet
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <MobileNotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </MobileFrame>
  );
}
