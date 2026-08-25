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
        const stored = localStorage.getItem('local_user_orders');
        if (stored) {
          localOrders = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Merge API orders and local orders without duplicates
    const combined = [...localOrders];
    apiOrders.forEach(ao => {
      if (!combined.some(co => co.id === ao.id || co.orderNumber === ao.orderNumber)) {
        combined.push(ao);
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
