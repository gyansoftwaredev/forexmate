import React from 'react';
import { useOrders, useRequestCancelOrder } from '../hooks/useOrders';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import { PackageOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function OrdersList() {
  const { data: orders, isLoading, error } = useOrders();
  const requestCancelMutation = useRequestCancelOrder();

  const handleCancel = (orderId: string) => {
    const reason = window.prompt('Please provide a brief reason for requesting order cancellation:');
    if (reason === null) return; // User closed dialog

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
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !orders) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center text-red-600 font-medium">
          Failed to load orders. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Orders</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          You don't have any active currency or remittance orders.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => window.location.href = '/buy-forex'}>
          Place an Order
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs p-4">Order ID</TableHead>
              <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs p-4">Date</TableHead>
              <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs p-4">Product Details</TableHead>
              <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs p-4">Amount (INR)</TableHead>
              <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs p-4">Status</TableHead>
              <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs p-4 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const hasMultipleItems = order.items && order.items.length > 1;
              const productName = hasMultipleItems
                ? order.items.map((it: any) => `${it.amount} ${it.currency?.code || it.currency || ''}`).join(' + ') + ' Notes'
                : (order.items?.[0]?.product?.name || 'Unknown Product');
              
              const foreignSummary = hasMultipleItems
                ? order.items.map((it: any) => `${it.amount} ${it.currency?.code || it.currency || ''}`).join(' • ')
                : `${order.items?.[0]?.amount || order.quote?.amountForeign || '0'} ${order.items?.[0]?.currency?.code || order.quote?.currency?.code || ''}`;
              
              return (
                <TableRow key={order.id} className="cursor-pointer hover:bg-blue-50/50 transition-colors" onClick={() => window.location.href = `/dashboard/orders/${order.id}`}>
                  <TableCell className="p-4 font-bold text-blue-600">{order.orderNumber}</TableCell>
                  <TableCell className="p-4 text-gray-600 font-medium">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="p-4">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                      <span>{productName}</span>
                      {hasMultipleItems && (
                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-md">
                          Multi-Currency
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">
                      {foreignSummary}
                    </div>
                  </TableCell>
                  <TableCell className="p-4 font-bold text-gray-900">{formatCurrencyINR(order.totalAmountInr)}</TableCell>
                  <TableCell className="p-4"><OrderStatusBadge status={order.status} /></TableCell>
                  <TableCell className="p-4 text-right flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold" onClick={() => window.location.href = `/dashboard/orders/${order.id}`}>
                      View Details
                    </Button>
                    {!order.cancelRequested && ['PENDING', 'PENDING_KYC', 'KYC_SUBMITTED', 'KYC_APPROVED', 'PENDING_PAYMENT', 'PAYMENT_PENDING'].includes(order.status) && (
                      <Button 
                        variant="ghost" 
                        disabled={requestCancelMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                        onClick={() => handleCancel(order.id)}
                      >
                        Cancel
                      </Button>
                    )}
                    {order.cancelRequested && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Cancel Pending
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
