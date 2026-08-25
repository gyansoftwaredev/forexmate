import React from 'react';
import { useOrder, useRequestCancelOrder } from '../hooks/useOrders';
import { StatusTimeline } from './StatusTimeline';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Info, ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function OrderDetails({ id }: { id: string }) {
  const { data: order, isLoading, error } = useOrder(id);
  const requestCancelMutation = useRequestCancelOrder();

  const handleCancel = () => {
    const reason = window.prompt('Please provide a brief reason for requesting order cancellation:');
    if (reason === null) return; // User closed the dialog

    if (!reason.trim()) {
      alert('A valid reason is required to submit a cancellation request.');
      return;
    }

    requestCancelMutation.mutate({ id, reason });
  };

  const isCancelling = requestCancelMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center text-red-600 font-medium">
          Failed to load order details.
        </CardContent>
      </Card>
    );
  }

  const productName = order.items?.[0]?.product?.name || 'Unknown Product';
  const foreignAmount = order.items?.[0]?.amount || order.quote?.amountForeign || '0';
  const currency = order.items?.[0]?.currency?.code || order.quote?.currency?.code || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order {order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {order.cancelRequested && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full">
              ⏳ Cancellation Pending Manager Approval
            </span>
          )}
          {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
            <Button variant="outline" className="font-bold text-gray-700 bg-white">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {order.cancelRequested && (
            <Card className="border-amber-200 bg-amber-50/50 rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <Info className="w-6 h-6 text-amber-650" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800">Cancellation Pending Approval</h3>
                  <p className="text-sm text-amber-700 mt-1 font-medium">
                    You have requested to cancel this order. A branch manager is currently reviewing your request.
                  </p>
                  <p className="text-xs text-gray-600 mt-2 font-medium bg-white/80 border border-amber-200 px-3 py-1.5 rounded-lg inline-block">
                    <span className="font-bold text-amber-700">Reason:</span> {order.cancelReason}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {order.complianceStatus === 'LRS_FAILED' && (
            <Card className="border-red-200 bg-red-50/50 rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">LRS Limit Exceeded</h3>
                  <p className="text-sm text-red-700 mt-1 font-medium">You cannot purchase this amount.</p>
                  <p className="text-xs text-red-600 mt-2 font-mono bg-red-100/50 border border-red-200 px-3 py-1.5 rounded-lg inline-block">
                    Remaining Limit: {
                      order.history?.find((h: any) => h.comments?.includes('Remaining Limit'))
                        ?.comments?.split('Remaining Limit:')[1]?.trim() || '₹0'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Ordered Currencies & Items</CardTitle>
              {order.items && order.items.length > 1 && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                  {order.items.length} Currencies Included
                </span>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {order.items && order.items.length > 0 ? (
                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {order.items.map((item: any, idx: number) => {
                    const itemAmt = item.amount || '0';
                    const itemCurr = item.currency?.code || item.currency || '';
                    const itemName = item.product?.name || `${itemAmt} ${itemCurr} Foreign Currency`;
                    const itemRate = item.rate ? `₹${item.rate}` : order.quote?.lockedInrRate ? `₹${order.quote.lockedInrRate}` : null;
                    const itemInr = item.inrEquivalent ? `₹${Number(item.inrEquivalent).toLocaleString('en-IN')}` : null;

                    return (
                      <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-gray-900 text-sm">{itemName}</div>
                          <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                            <span>Amount: <strong className="text-gray-800 font-bold">{itemAmt} {itemCurr}</strong></span>
                            {itemRate && <span>• Rate: <strong className="text-blue-600 font-bold">{itemRate}</strong></span>}
                          </div>
                        </div>
                        {itemInr && (
                          <div className="text-right font-black text-gray-900 text-sm">
                            {itemInr}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="text-gray-500 font-medium text-sm">Product</div>
                    <div className="font-bold text-gray-900">{productName}</div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="text-gray-500 font-medium text-sm">Amount</div>
                    <div className="font-bold text-gray-900">{foreignAmount} {currency}</div>
                  </div>
                  {order.quote?.lockedInrRate && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="text-gray-500 font-medium text-sm">Locked Rate</div>
                      <div className="font-bold text-gray-900">₹{order.quote.lockedInrRate}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between py-3 pt-4 border-t border-gray-100">
                <div className="text-gray-900 font-bold">Total Order Value</div>
                <div className="text-xl font-extrabold text-blue-600">{formatCurrencyINR(order.totalAmountInr)}</div>
              </div>
            </CardContent>
          </Card>

          {order.branch && (
            <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Collection Branch
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <h4 className="font-bold text-gray-900">{order.branch.name}</h4>
                <p className="text-sm text-gray-500 mt-1 font-medium">{order.branch.city}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancel Order — Prominent Action Card */}
          {!order.cancelRequested && ['PENDING', 'PENDING_KYC', 'KYC_SUBMITTED', 'KYC_APPROVED', 'PENDING_PAYMENT', 'PAYMENT_PENDING'].includes(order.status) && (
            <Card className="border-red-200 bg-red-50/40 rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-red-800 text-base">Want to cancel this order?</h3>
                  <p className="text-sm text-red-600 font-medium mt-0.5">
                    You can request a cancellation — a branch manager will review and approve it.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="shrink-0 font-extrabold rounded-xl bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-sm shadow-md"
                >
                  {isCancelling ? 'Submitting...' : '🚫 Cancel Order'}
                </Button>
              </CardContent>
            </Card>
          )}

          {order.cancelRequested && (
            <Card className="border-amber-300 bg-amber-50 rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="text-3xl">⏳</div>
                <div>
                  <h3 className="font-extrabold text-amber-800 text-base">Cancellation Under Review</h3>
                  <p className="text-sm text-amber-700 font-medium mt-0.5">
                    Your request has been sent to the branch manager. You'll be notified once it's approved.
                  </p>
                  {order.cancelReason && (
                    <p className="text-xs text-gray-600 mt-2 font-semibold">
                      Your reason: <span className="italic">"{order.cancelReason}"</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden sticky top-24">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
              <CardTitle className="text-lg font-bold">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <StatusTimeline order={order} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
