"use client";
import React from 'react';
import Link from 'next/link';

/* ─── Mobile Bottom Tab Bar ─────────────────────────────────── */
interface TabItem { id: string; label: string; icon: string; href: string; }
export function BottomNav({ tabs, active, theme = 'indigo' }: { tabs: TabItem[]; active: string; theme?: 'indigo' | 'emerald' }) {
  const color = theme === 'emerald' ? '#065f46' : '#4338CA';
  const bg = theme === 'emerald' ? '#d1fae5' : '#e0e7ff';
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom, 0px)', boxShadow: '0 -4px 24px rgba(0,0,0,0.06)' }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <Link key={tab.id} href={tab.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px 8px', textDecoration: 'none', color: isActive ? color : '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', gap: 3, transition: 'color 0.2s' }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, fontFamily: 'inherit', letterSpacing: '0.01em' }}>{tab.label}</span>
            {isActive && <span style={{ width: 4, height: 4, borderRadius: '50%', background: color, marginTop: 1 }} />}
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Page Header ───────────────────────────────────────────── */
export function MobileHeader({ title, subtitle, onBack, rightAction }: { title: string; subtitle?: string; onBack?: () => void; rightAction?: React.ReactNode }) {
  return (
    <header style={{ padding: '16px 20px 14px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>←</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{subtitle}</p>}
      </div>
      {rightAction}
    </header>
  );
}

/* ─── Stats Row Card ────────────────────────────────────────── */
export function StatCard({ value, label, color = '#4338CA', bg = '#eef2ff' }: { value: number | string; label: string; color?: string; bg?: string }) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '14px 12px', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 4, opacity: 0.8 }}>{label}</div>
    </div>
  );
}

/* ─── Order Card ────────────────────────────────────────────── */
interface OrderCardProps { order: any; onClick: () => void; theme?: 'indigo' | 'emerald'; }
export function OrderCard({ order, onClick, theme = 'indigo' }: OrderCardProps) {
  const accentColor = theme === 'emerald' ? '#065f46' : '#4338CA';
  const accentBg = theme === 'emerald' ? '#d1fae5' : '#eef2ff';
  const currency = order.items?.[0]?.currency;
  const amount = order.items?.[0]?.amount;
  const customerName = order.profile?.user?.fullName || 'Customer';

  const isDelivered = (order.status === 'DELIVERED' || order.status === 'COMPLETED') && (order.deliveryMethod?.includes('DELIVERY') || order.fulfillmentStatus === 'DELIVERY_COMPLETED');
  const badgeStatus = isDelivered ? 'DELIVERED' : order.status;

  const statusColors: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: '#fef9c3', color: '#854d0e' },
    DISPATCHED: { bg: '#dbeafe', color: '#1d4ed8' },
    DELIVERED: { bg: '#dcfce7', color: '#166534' },
    COMPLETED: { bg: '#dcfce7', color: '#166534' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
  };
  const sc = statusColors[badgeStatus] || statusColors[order.status] || { bg: '#f3f4f6', color: '#374151' };

  return (
    <button onClick={onClick} style={{ width: '100%', background: 'white', border: '1.5px solid #f1f5f9', borderRadius: 16, padding: '16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: accentColor, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{order.orderNumber}</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{customerName}</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, ...sc }}>{badgeStatus}</span>
      </div>
      {currency && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: accentBg, color: accentColor, fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>{currency.code}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{parseFloat(amount || '0').toLocaleString('en-IN')}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{order.deliveryMethod?.replace(/_/g, ' ')}</span>
        <span style={{ fontSize: 12, color: accentColor, fontWeight: 700 }}>View Details →</span>
      </div>
    </button>
  );
}

/* ─── Loading Spinner ───────────────────────────────────────── */
export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────── */
export function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: 32, textAlign: 'center', gap: 12 }}>
      <span style={{ fontSize: 48 }}>{icon}</span>
      <p style={{ fontSize: 17, fontWeight: 800, color: '#374151', margin: 0 }}>{title}</p>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, maxWidth: 240, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

/* ─── Auth Guard ────────────────────────────────────────────── */
export function useWorkforceGuard(requiredRole?: string) {
  // This is handled per-page, exposed as a utility
  return null;
}

/* ─── Denomination List ─────────────────────────────────────── */
export function DenominationList({ allocation }: { allocation: any }) {
  if (!allocation?.items?.length) return <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No denominations allocated.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {allocation.items.map((item: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{item.quantity} × {allocation.currencyCode} {item.denomination}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>= {(item.quantity * item.denomination).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
}
