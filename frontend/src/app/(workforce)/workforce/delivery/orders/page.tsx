"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { BottomNav, MobileHeader, OrderCard, LoadingScreen, EmptyState } from '@/components/workforce/MobileUI';

const DELIVERY_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/workforce/delivery' },
  { id: 'orders', label: 'Deliveries', icon: '🚚', href: '/workforce/delivery/orders' },
  { id: 'history', label: 'History', icon: '📋', href: '/workforce/delivery/history' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/workforce/delivery/profile' },
];

export default function DeliveryOrdersListPage() {
  const { employee, loading: authLoading } = useWorkforceAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');

  useEffect(() => {
    if (!authLoading && !employee) router.replace('/workforce/login');
  }, [employee, authLoading, router]);

  const fetchOrders = () => {
    if (!employee) return;
    workforceFetch('/orders')
      .then(workforceJson)
      .then((d) => setOrders(d.deliveries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    window.addEventListener('forexmate-sync', fetchOrders);
    window.addEventListener('storage', fetchOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener('forexmate-sync', fetchOrders);
      window.removeEventListener('storage', fetchOrders);
    };
  }, [employee]);

  if (authLoading || loading) return <LoadingScreen message="Loading deliveries..." />;

  const filtered = orders.filter(o => {
    if (filter === 'ACTIVE') return !['COMPLETED', 'CANCELLED', 'REJECTED', 'DELIVERED'].includes(o.status) && o.fulfillmentStatus !== 'DELIVERY_COMPLETED';
    if (filter === 'DELIVERED') return ['DELIVERED', 'COMPLETED'].includes(o.status) || o.fulfillmentStatus === 'DELIVERY_COMPLETED';
    return true;
  });

  return (
    <div style={{ paddingBottom: 80, background: '#f8fafc', minHeight: '100dvh' }}>
      <MobileHeader title="My Deliveries" subtitle={`${orders.filter(o => !['COMPLETED','CANCELLED','REJECTED','DELIVERED'].includes(o.status)).length} active`} />

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
        {(['ALL', 'ACTIVE', 'DELIVERED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', background: filter === f ? '#065f46' : '#f3f4f6', color: filter === f ? 'white' : '#6b7280', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <EmptyState icon="🚚" title="No Deliveries" message="No deliveries match your filter." />
        ) : (
          filtered.map((order: any) => (
            <OrderCard key={order.id} order={order} onClick={() => router.push(`/workforce/delivery/orders/${order.orderNumber || order.id}`)} theme="emerald" />
          ))
        )}
      </div>

      <BottomNav tabs={DELIVERY_TABS} active="orders" theme="emerald" />
    </div>
  );
}
