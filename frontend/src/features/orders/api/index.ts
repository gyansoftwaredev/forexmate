import { authFetch, apiJson } from '@/lib/api';
import { Order } from '../types';

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    let apiOrders: Order[] = [];
    try {
      const response = await authFetch('/api/v1/orders');
      if (response.ok) {
        apiOrders = await apiJson<Order[]>(response);
      }
    } catch (err) {
      console.warn('API getOrders notice:', err);
    }

    let localOrders: Order[] = [];
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('auth_user') || localStorage.getItem('user');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        
        const stored = localStorage.getItem('local_user_orders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            let mutated = false;
            const sanitized = parsed.map((o: any) => {
              if (!o.assignedStaffId && (o.status === 'READY_FOR_PICKUP' || o.status === 'READY_FOR_CASH_HANDOVER')) {
                mutated = true;
                return { ...o, status: 'ORDER_PLACED' };
              }
              return o;
            });
            if (mutated) {
              localStorage.setItem('local_user_orders', JSON.stringify(sanitized));
            }

            localOrders = currentUser ? sanitized.filter((o: any) => {
              return (o.userId && o.userId === currentUser.id) ||
                (o.userEmail && o.userEmail?.toLowerCase() === currentUser.email?.toLowerCase()) ||
                (o.customerEmail && o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) ||
                (o.mobile && currentUser.mobile && o.mobile.replace(/\D/g, '') === currentUser.mobile.replace(/\D/g, '')) ||
                (o.phone && currentUser.mobile && o.phone.replace(/\D/g, '') === currentUser.mobile.replace(/\D/g, ''));
            }) : [];
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Real API orders take precedence over local storage
    const combined: Order[] = [];
    apiOrders.forEach(ao => {
      const matchingLocal = localOrders.find(lo => lo.id === ao.id || lo.orderNumber === ao.orderNumber);
      combined.push({
        ...(matchingLocal || {}),
        ...ao,
        status: ao.status,
        assignedStaffId: ao.assignedStaffId,
        fulfillmentStatus: ao.fulfillmentStatus,
        items: (ao.items && ao.items.length > 0) ? ao.items : (matchingLocal?.items || []),
      });
    });

    localOrders.forEach(lo => {
      if (!combined.some(co => co.id === lo.id || co.orderNumber === lo.orderNumber)) {
        combined.push(lo);
      }
    });

    return combined;
  },

  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await authFetch(`/api/v1/orders/${id}`);
      if (response.ok) {
        return await apiJson<Order>(response);
      }
    } catch (err) {
      console.warn('API getOrderById notice:', err);
    }

    // Fallback to local orders
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('local_user_orders');
      if (stored) {
        const localOrders: Order[] = JSON.parse(stored);
        const match = localOrders.find(o => o.id === id || o.orderNumber === id);
        if (match) return match;
      }
    }

    throw new Error('Order not found');
  },

  requestCancel: async (id: string, reason: string): Promise<Order> => {
    try {
      const response = await authFetch(`/api/v1/orders/${id}/request-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        return await apiJson<Order>(response);
      }
    } catch (err) {
      console.warn('API requestCancel notice:', err);
    }

    // Fallback for local orders
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('local_user_orders');
      if (stored) {
        let localOrders: Order[] = JSON.parse(stored);
        localOrders = localOrders.map(o => {
          if (o.id === id || o.orderNumber === id) {
            return { ...o, cancelRequested: true, cancelReason: reason };
          }
          return o;
        });
        localStorage.setItem('local_user_orders', JSON.stringify(localOrders));
        const updated = localOrders.find(o => o.id === id || o.orderNumber === id);
        if (updated) return updated;
      }
    }

    throw new Error('Order not found');
  },
};
