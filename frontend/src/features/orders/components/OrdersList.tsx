import React from 'react';
import { useOrders, useRequestCancelOrder } from '../hooks/useOrders';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import { PackageOpen, Loader2, ShoppingBag, ArrowRight, ExternalLink, Calendar, ShieldCheck, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OrdersList() {
  const { data: orders, isLoading, error } = useOrders();
  const requestCancelMutation = useRequestCancelOrder();

  const handleCancel = (orderId: string) => {
    const reason = window.prompt('Please provide a brief reason for requesting order cancellation:');
    if (reason === null) return;

    if (!reason.trim()) {
      alert('A valid reason is required to submit a cancellation request.');
      return;
    }

    requestCancelMutation.mutate({ id: orderId, reason });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (error || !orders) {
    return (
      <Card className="border-red-200 bg-red-50 rounded-3xl">
        <CardContent className="p-8 text-center text-red-600 font-bold text-xs">
          Failed to load orders. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-2xs">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-2xs">
          🛍️
        </div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">No Orders Placed Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          You haven't placed any currency note deliveries, forex card orders, or wire remittances yet.
        </p>
        <button 
          onClick={() => window.location.href = '/buy-forex'}
          className="px-6 py-3.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Book Currency / Forex Card</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="p-4 pl-6">Order ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Product Details</th>
              <th className="p-4">Amount (INR)</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
            {orders.map((order) => {
              const hasMultipleItems = order.items && order.items.length > 1;
              const productName = hasMultipleItems
                ? order.items.map((it: any) => `${it.amount} ${it.currency?.code || it.currency || ''}`).join(' + ') + ' Notes'
                : (order.items?.[0]?.product?.name || 'Foreign Currency Order');
              
              const foreignSummary = hasMultipleItems
                ? order.items.map((it: any) => `${it.amount} ${it.currency?.code || it.currency || ''}`).join(' • ')
                : `${order.items?.[0]?.amount || order.quote?.amountForeign || '0'} ${order.items?.[0]?.currency?.code || order.quote?.currency?.code || ''}`;
              
              return (
                <tr 
                  key={order.id} 
                  className="hover:bg-amber-50/20 transition-colors cursor-pointer" 
                  onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                >
                  <td className="p-4 pl-6 font-mono font-black text-amber-700">{order.orderNumber}</td>
                  <td className="p-4 text-slate-500 font-medium">{formatDate(order.createdAt)}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>{productName}</span>
                      {hasMultipleItems && (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                          Multi-Currency
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {foreignSummary}
                    </div>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900">{formatCurrencyINR(order.totalAmountInr)}</td>
                  <td className="p-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer" 
                        onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                      >
                        View Details
                      </button>
                      {!order.cancelRequested && ['PENDING', 'PENDING_KYC', 'KYC_SUBMITTED', 'KYC_APPROVED', 'PENDING_PAYMENT', 'PAYMENT_PENDING'].includes(order.status) && (
                        <button 
                          disabled={requestCancelMutation.isPending}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          onClick={() => handleCancel(order.id)}
                        >
                          Cancel
                        </button>
                      )}
                      {order.cancelRequested && (
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                          Cancel Requested
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

