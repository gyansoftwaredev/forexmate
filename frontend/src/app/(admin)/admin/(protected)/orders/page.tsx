"use client";
import React, { useState, useEffect, useCallback } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import {
  FileSpreadsheet, Search, Eye, RefreshCw, ShieldCheck, Building2,
  Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, Package,
  ArrowRight, X, Filter, TrendingUp, Globe, DollarSign,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  ORDER_PLACED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  KYC_SUBMITTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  KYC_APPROVED: 'bg-teal-100 text-teal-800 border-teal-200',
  PAYMENT_PENDING: 'bg-blue-100 text-blue-800 border-blue-200',
  PAYMENT_COMPLETED: 'bg-sky-100 text-sky-800 border-sky-200',
  DISPATCHED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  DELIVERED: 'bg-violet-100 text-violet-800 border-violet-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  READY_TO_FORWARD: 'bg-purple-100 text-purple-800 border-purple-200',
  FORWARDED_TO_PARTNER: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  PARTNER_PROCESSING: 'bg-indigo-100 text-indigo-700 border-indigo-100',
  TRANSFER_COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-100',
};

const COMPLIANCE_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
};

const PRODUCT_ICONS: Record<string, string> = {
  CASH: '💵',
  CASH_SELL: '💱',
  REMITTANCE: '🌐',
  FOREX_CARD: '💳',
};

const ALL_STATUSES = [
  'ORDER_PLACED', 'PENDING', 'KYC_SUBMITTED', 'KYC_APPROVED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED',
  'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED',
  'READY_TO_FORWARD', 'FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [complianceFilter, setComplianceFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusOverride, setStatusOverride] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [kycNotes, setKycNotes] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/orders`).then(apiJson);
      setOrders(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (actionMsg) {
      const t = setTimeout(() => setActionMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [actionMsg]);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.profile?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.branch?.branchName?.toLowerCase().includes(search.toLowerCase()) ||
      o.branch?.branchCity?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchCompliance = complianceFilter === 'ALL' || o.complianceStatus === complianceFilter;
    const matchProduct = productFilter === 'ALL' || o.productType === productFilter;

    return matchSearch && matchStatus && matchCompliance && matchProduct;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.complianceStatus === 'PENDING').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
    processing: orders.filter((o) => o.status === 'PROCESSING').length,
  };

  const handleApproveKyc = async (orderId: string) => {
    setActionLoading(true);
    try {
      await authFetch(`${API_URL}/admin/orders/${orderId}/approve-kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: kycNotes }),
      }).then(apiJson);
      setActionMsg({ type: 'success', text: 'KYC approved successfully. Order has been advanced.' });
      setKycNotes('');
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        const updated = orders.find((o) => o.id === orderId);
        if (updated) setSelectedOrder({ ...updated, complianceStatus: 'APPROVED' });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to approve KYC.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusOverride = async (orderId: string) => {
    if (!statusOverride) { setActionMsg({ type: 'error', text: 'Select a new status.' }); return; }
    setActionLoading(true);
    try {
      await authFetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusOverride, reason: overrideReason }),
      }).then(apiJson);
      setActionMsg({ type: 'success', text: `Order status updated to ${statusOverride}.` });
      setStatusOverride('');
      setOverrideReason('');
      await loadOrders();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to update status.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6 font-sans">

      {/* Toast */}
      {actionMsg && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-3 animate-bounce-in ${
          actionMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {actionMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              HQ Admin ERP
            </span>
            <span className="text-slate-400 text-xs font-semibold">📊 Order Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Order Management Console</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Full control over all orders — approve KYC, override status, inspect details across all branches.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'from-indigo-500 to-indigo-600', icon: '📋' },
          { label: 'KYC Pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: '⏳' },
          { label: 'Processing', value: stats.processing, color: 'from-blue-500 to-indigo-500', icon: '⚙️' },
          { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-teal-500', icon: '✅' },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} p-4 rounded-2xl text-white shadow-md`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-black mt-1">{s.value}</p>
            <p className="text-xs font-bold opacity-80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, branch, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>

          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ALL">All KYC</option>
            <option value="PENDING">KYC Pending</option>
            <option value="APPROVED">KYC Approved</option>
            <option value="REJECTED">KYC Rejected</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ALL">All Products</option>
            <option value="CASH">Buy Forex (Cash)</option>
            <option value="CASH_SELL">Sell Forex</option>
            <option value="REMITTANCE">Remittance</option>
            <option value="FOREX_CARD">Forex Card</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-indigo-600" />
            Live Order Monitor
            <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-0.5 rounded-full">{filteredOrders.length}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3 pl-5">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Status</th>
                <th className="p-3">KYC</th>
                <th className="p-3">Amount (₹)</th>
                <th className="p-3 pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400 italic">No orders match current filters.</td></tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 pl-5">
                      <span className="font-mono font-black text-indigo-700 text-xs">#{o.orderNumber}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{o.profile?.user?.fullName || 'Customer'}</span>
                      <span className="text-[10px] text-slate-400 block">{o.profile?.user?.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-black text-[10px] px-2 py-0.5 rounded border border-indigo-100">
                        {PRODUCT_ICONS[o.productType] || '📦'} {o.productType}
                      </span>
                      <span className="text-slate-600 font-mono text-xs block mt-0.5">
                        {o.items?.[0]?.amount} {o.items?.[0]?.currency?.code}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800">{o.branch?.branchName || '—'}</span>
                      <span className="text-[10px] text-slate-400 block">{o.branch?.branchCity}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-700'}`}>
                        {o.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${COMPLIANCE_COLORS[o.complianceStatus] || 'bg-slate-100 text-slate-700'}`}>
                        {o.complianceStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-600">
                      ₹{Number(o.totalAmountInr).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 pr-5">
                      <div className="flex gap-1.5">
                        {o.complianceStatus === 'PENDING' && (
                          <button
                            onClick={() => handleApproveKyc(o.id)}
                            disabled={actionLoading}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck size={11} /> KYC ✓
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedOrder(o); setStatusOverride(''); setOverrideReason(''); setKycNotes(''); }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={11} /> Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Inspection</p>
                <h3 className="font-black text-slate-900 text-lg">#{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Badges Row */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${STATUS_COLORS[selectedOrder.status] || 'bg-slate-100 text-slate-700'}`}>
                  {selectedOrder.status?.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${COMPLIANCE_COLORS[selectedOrder.complianceStatus] || 'bg-slate-100 text-slate-700'}`}>
                  KYC: {selectedOrder.complianceStatus}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-indigo-50 text-indigo-700 border-indigo-100">
                  {PRODUCT_ICONS[selectedOrder.productType]} {selectedOrder.productType}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-slate-50 text-slate-700 border-slate-200">
                  {selectedOrder.currentStage}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Customer', value: selectedOrder.profile?.user?.fullName || '—' },
                  { label: 'Email', value: selectedOrder.profile?.user?.email || '—' },
                  { label: 'Branch', value: `${selectedOrder.branch?.branchName} (${selectedOrder.branch?.branchCity})` },
                  { label: 'Delivery Method', value: selectedOrder.deliveryMethod },
                  { label: 'Total INR', value: `₹${Number(selectedOrder.totalAmountInr).toLocaleString('en-IN')}` },
                  { label: 'Workflow', value: selectedOrder.workflowType || '—' },
                  { label: 'Created', value: new Date(selectedOrder.createdAt).toLocaleString('en-IN') },
                  { label: 'Updated', value: new Date(selectedOrder.updatedAt).toLocaleString('en-IN') },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                    <p className="font-black text-slate-900 mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Currency Items */}
              {selectedOrder.items?.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Currency Items</p>
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs font-bold text-indigo-900">
                      <span>{item.currency?.code} — {item.amount} units @ ₹{item.rateApplied}/unit</span>
                      <span className="text-emerald-600">₹{(Number(item.amount) * Number(item.rateApplied)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* KYC Approval Block */}
              {selectedOrder.complianceStatus === 'PENDING' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-600" />
                    <h4 className="font-black text-amber-800 text-sm">Approve KYC — Admin Override</h4>
                  </div>
                  <textarea
                    value={kycNotes}
                    onChange={(e) => setKycNotes(e.target.value)}
                    placeholder="Optional: add approval notes..."
                    rows={2}
                    className="w-full text-xs font-semibold bg-white border border-amber-200 rounded-xl p-3 focus:outline-none focus:border-amber-400 resize-none"
                  />
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApproveKyc(selectedOrder.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck size={14} />
                    {actionLoading ? 'Approving...' : 'Approve KYC (Admin Override)'}
                  </button>
                </div>
              )}

              {/* Status Override Block */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Admin Status Override
                </h4>
                <div className="flex gap-2">
                  <select
                    value={statusOverride}
                    onChange={(e) => setStatusOverride(e.target.value)}
                    className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    <option value="">Select new status...</option>
                    {ALL_STATUSES.filter((s) => s !== selectedOrder.status).map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Reason for override (optional)..."
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400"
                />
                <button
                  disabled={actionLoading || !statusOverride}
                  onClick={() => handleStatusOverride(selectedOrder.id)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRight size={14} />
                  {actionLoading ? 'Updating...' : `Set Status → ${statusOverride || '...'}`}
                </button>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
