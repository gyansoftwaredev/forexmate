import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Order } from '../types';

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    let apiOrders: Order[] = [];
    try {
      const response = await authFetch(`${API_URL}/orders`);
      if (response.ok) {
        apiOrders = await apiJson<Order[]>(response);
      }
    } catch (err) {
      console.warn('API getOrders notice:', err);
    }

    let localOrders: Order[] = [];
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('forexmate_user') || localStorage.getItem('user') || localStorage.getItem('auth_user');
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

            const uMobile = currentUser?.mobile ? currentUser.mobile.replace(/\D/g, '').slice(-10) : (currentUser?.phone ? currentUser.phone.replace(/\D/g, '').slice(-10) : '');
            localOrders = currentUser ? sanitized.filter((o: any) => {
              const oMobile = (o.mobile || o.phone || '').replace(/\D/g, '').slice(-10);
              return (o.userId && o.userId === currentUser.id) ||
                (o.userEmail && o.userEmail?.toLowerCase() === currentUser.email?.toLowerCase()) ||
                (o.customerEmail && o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) ||
                (uMobile && oMobile && uMobile === oMobile);
            }) : sanitized;
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
        status: ao.status || matchingLocal?.status || 'ORDER_PLACED',
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
      const response = await authFetch(`${API_URL}/orders/${id}`);
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
      const response = await authFetch(`${API_URL}/orders/${id}/request-cancel`, {
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
