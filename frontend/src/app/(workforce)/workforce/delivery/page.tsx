"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { BottomNav, OrderCard, LoadingScreen, EmptyState } from '@/components/workforce/MobileUI';

const DELIVERY_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/workforce/delivery' },
  { id: 'orders', label: 'Deliveries', icon: '🚚', href: '/workforce/delivery/orders' },
  { id: 'history', label: 'History', icon: '📋', href: '/workforce/delivery/history' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/workforce/delivery/profile' },
];

export default function DeliveryDashboard() {
  const { employee, loading: authLoading } = useWorkforceAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !employee) router.replace('/workforce/login');
    if (!authLoading && employee?.mustChangePassword) router.replace('/workforce/change-password');
    if (!authLoading && employee && employee.role !== 'DELIVERY_PARTNER') {
      if (employee.role === 'BRANCH_MANAGER') router.replace('/workforce/manager');
      else if (employee.role === 'BRANCH_CASHIER') router.replace('/workforce/cashier');
      else router.replace('/workforce/login');
    }
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

  if (authLoading || loading) return <LoadingScreen message="Loading your workspace..." />;
  if (!employee) return null;

  const pending = orders.filter(o => !['COMPLETED', 'CANCELLED', 'REJECTED', 'DELIVERED'].includes(o.status) && o.fulfillmentStatus !== 'DELIVERY_COMPLETED');
  const delivered = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status) || o.fulfillmentStatus === 'DELIVERY_COMPLETED');
  const inTransit = orders.filter(o => o.status === 'DISPATCHED');

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46, #059669)', padding: '24px 20px 28px' }}>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Partner</p>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: '0 0 2px' }}>Good {getGreeting()}, {employee.name.split(' ')[0]}! 🚚</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>{employee.branchName}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {[
            { val: pending.length, label: 'Pending', accent: 'white' },
            { val: inTransit.length, label: 'In Transit', accent: '#fde68a' },
            { val: delivered.length, label: 'Delivered', accent: '#86efac' },
          ].map(({ val, label, accent }) => (
            <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '12px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: accent, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Quick Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <QuickActionCard icon="🚚" title="My Deliveries" count={pending.length} color="#065f46" bg="#d1fae5" href="/workforce/delivery/orders" />
          <QuickActionCard icon="📋" title="History" count={null} color="#0f766e" bg="#ccfbf1" href="/workforce/delivery/history" />
          <QuickActionCard icon="📍" title="Active Now" count={inTransit.length} color="#0369a1" bg="#e0f2fe" href="/workforce/delivery/orders" />
          <QuickActionCard icon="👤" title="My Profile" count={null} color="#5b21b6" bg="#f5f3ff" href="/workforce/delivery/profile" />
        </div>
      </div>

      {/* Assigned Deliveries */}
      {pending.length > 0 && (
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Assigned Deliveries</p>
            <Link href="/workforce/delivery/orders" style={{ fontSize: 12, color: '#065f46', fontWeight: 700, textDecoration: 'none' }}>See all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.slice(0, 3).map((order: any) => (
              <OrderCard key={order.id} order={order} onClick={() => router.push(`/workforce/delivery/orders/${order.orderNumber || order.id}`)} theme="emerald" />
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <EmptyState icon="🎉" title="All Deliveries Done!" message="No deliveries assigned. Check back soon." />
      )}

      <BottomNav tabs={DELIVERY_TABS} active="dashboard" theme="emerald" />
    </div>
  );
}

function QuickActionCard({ icon, title, count, color, bg, href }: { icon: string; title: string; count: number | null; color: string; bg: string; href: string }) {
  return (
    <Link href={href} style={{ background: bg, borderRadius: 16, padding: '16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, color, margin: '0 0 2px' }}>{title}</p>
        {count !== null && <p style={{ fontSize: 11, color, margin: 0, opacity: 0.7, fontWeight: 600 }}>{count} pending</p>}
      </div>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
