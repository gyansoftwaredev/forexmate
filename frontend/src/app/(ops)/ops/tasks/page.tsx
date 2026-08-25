"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  Archive, 
  Truck, 
  UserPlus, 
  ShieldAlert, 
  Lock, 
  ExternalLink,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  AlertTriangle,
  Send,
  Loader2,
  ListTodo,
  FileCheck,
  Coins,
  TrendingUp,
  Wallet,
  Eye,
  X,
  Filter,
  ChevronDown,
  Upload,
  PhoneCall
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { getCurrencyFlag } from '@/lib/currencyMetadata';
import RemittanceCRMDesk from './RemittanceCRMDesk';

export default function OperationsCrmPage() {
  const { user } = useAuth();
  
  // CRM Pools
  const [unassignedLeads, setUnassignedLeads] = useState<any[]>([]);
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeDocumentUrl, setActiveDocumentUrl] = useState<string | null>(null);
  const [activeDocumentType, setActiveDocumentType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'MY_LEADS' | 'UNASSIGNED' | 'ALL' | 'CANCEL_REQUESTS'>('MY_LEADS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  
  const [branchVaults, setBranchVaults] = useState<any[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [selectedCashierId, setSelectedCashierId] = useState('');
  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState('');
  const [allocationQuantities, setAllocationQuantities] = useState<Record<number, number>>({ 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 });
  const [allocationError, setAllocationError] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('BLURRY_DOCUMENT');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [partnerRef, setPartnerRef] = useState('');
  const [partnerRemarks, setPartnerRemarks] = useState('');
  const [selectedPartnerStatus, setSelectedPartnerStatus] = useState('PARTNER_PROCESSING');

  const [sameCityBranches, setSameCityBranches] = useState<any[]>([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const [cityComparisonData, setCityComparisonData] = useState<any>(null);
  const [loadingCityComparison, setLoadingCityComparison] = useState(false);
  const [showSmartReassignConfirmModal, setShowSmartReassignConfirmModal] = useState(false);
  const [pendingTargetBranch, setPendingTargetBranch] = useState<any>(null);
  const [smartReassignReasonInput, setSmartReassignReasonInput] = useState('');

  const fetchCityComparison = async (orderId: string) => {
    setLoadingCityComparison(true);
    try {
      const res = await authFetch(`${API_URL}/ops/orders/${orderId}/city-inventory-comparison`).then(apiJson);
      if (res) {
        setCityComparisonData(res);
      }
    } catch (err) {
      console.error('Failed to fetch city inventory comparison:', err);
    } finally {
      setLoadingCityComparison(false);
    }
  };

  const handleSmartAssignBranch = async (orderId: string, targetBranchId: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/orders/${orderId}/smart-assign-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetBranchId, reason }),
      }).then(apiJson);

      if (res?.success) {
        alert(res.message || 'Branch assigned successfully!');
        setShowSmartReassignConfirmModal(false);
        setShowReassignModal(false);
        fetchLeads();
        if (orderId) fetchCityComparison(orderId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign branch');
    } finally {
      setActionLoading(false);
    }
  };

  const [showSendToBranchModal, setShowSendToBranchModal] = useState(false);
  const [sendToBranchRemarks, setSendToBranchRemarks] = useState('');
  const [commTab, setCommTab] = useState<'ALL' | 'CALLS' | 'EMAILS' | 'SMS' | 'WHATSAPP'>('ALL');

  const REJECTION_REASONS = [
    { value: 'BLURRY_DOCUMENT', label: 'Blurry or unreadable document copy' },
    { value: 'EXPIRED_DOCUMENT', label: 'Expired document (Passport/ID)' },
    { value: 'NAME_MISMATCH', label: 'Name on document does not match account name' },
    { value: 'INCORRECT_DOC_TYPE', label: 'Incorrect document uploaded (e.g. Aadhaar instead of PAN)' },
    { value: 'MISSING_BACK_SIDE', label: 'Missing back side of the card/document' },
    { value: 'EDITED_OR_TAMPERED', label: 'Document appears digitally altered or edited' },
    { value: 'OTHER', label: 'Other (specify details below)' }
  ];

  useEffect(() => {
    fetchLeads();
    fetchVaults();

    const handleSync = () => {
      console.log('[Sync Hook] Refreshing leads and vaults due to sync event');
      fetchLeads();
      fetchVaults();
    };

    window.addEventListener('forexmate-sync', handleSync);
    return () => {
      window.removeEventListener('forexmate-sync', handleSync);
    };
  }, []);

  const fetchVaults = async () => {
    try {
      const res = await authFetch(`${API_URL}/ops/branch-vaults`);
      if (res.ok) {
        const data = await apiJson(res);
        setBranchVaults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch branch vaults:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch(`${API_URL}/ops/leads`);
      if (!res.ok) throw new Error('Failed to fetch CRM leads');
      const data = await apiJson(res);
      
      setUnassignedLeads(data.unassigned || []);
      setMyLeads(data.myLeads || []);
      setAllLeads(data.allLeads || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (leadId: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/leads/${leadId}/claim`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errMsg = body.error?.message || body.message || 'Failed to claim lead';
        throw new Error(errMsg);
      }
      await fetchLeads();
      setSelectedLeadId(leadId);
      setActiveTab('MY_LEADS');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeadAction = async (leadId: string, action: string, customNotes?: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/leads/${leadId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: customNotes !== undefined ? customNotes : notesText })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errMsg = body.error?.message || body.message || 'Failed to execute lead checklist action';
        throw new Error(errMsg);
      }
      setNotesText('');
      await fetchLeads();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForwardToPartner = async (leadId: string, pRef?: string, pRemarks?: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/orders/${leadId}/forward-remittance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerReference: pRef || partnerRef, partnerRemarks: pRemarks || partnerRemarks })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to forward remittance case to partner');
      }
      setShowForwardModal(false);
      setPartnerRef('');
      setPartnerRemarks('');
      await fetchLeads();
    } catch (err: any) {
      alert(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePartnerStatus = async (leadId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/orders/${leadId}/update-remittance-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerStatus: status, partnerReference: partnerRef, partnerRemarks })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to update partner status');
      }
      alert(`Partner status updated to ${status}.`);
      await fetchLeads();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDoc = async (orderId: string, docType: string, status = 'APPROVED', notes = '') => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/leads/${orderId}/verify-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, status, notes })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to verify KYC document');
      }
      await fetchLeads();
      alert(`✅ ${docType} has been marked verified for this order!`);
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStaffUploadDoc = async (orderId: string, docType: string, file: File) => {
    if (!file) return;
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      formData.append('notes', `Uploaded directly by staff (${user?.fullName || user?.email || 'Operations Desk'})`);

      const res = await authFetch(`${API_URL}/ops/leads/${orderId}/upload-doc`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to upload document');
      }

      alert(`✅ ${docType} document successfully uploaded & verified!`);
      await fetchLeads();
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchSameCityBranches = async (branchId: string) => {
    try {
      const res = await authFetch(`${API_URL}/ops/branches/same-city/${branchId}`);
      if (res.ok) {
        const data = await apiJson(res);
        setSameCityBranches(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch same city branches:', err);
    }
  };

  const handleSendToBranch = async (leadId: string, remarks: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/orders/${leadId}/send-to-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to send order to branch');
      }
      alert('Compliance completed! Case transferred to Branch Manager successfully.');
      setShowSendToBranchModal(false);
      setSendToBranchRemarks('');
      await fetchLeads();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassignBranch = async (leadId: string, tBranchId: string, reason: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/ops/orders/${leadId}/reassign-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetBranchId: tBranchId, reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to reassign branch');
      }
      alert('Order branch reassigned successfully with audit record!');
      setShowReassignModal(false);
      setTargetBranchId('');
      setReassignReason('');
      await fetchLeads();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Find currently selected lead
  const selectedLead = allLeads.find(l => l.id === selectedLeadId);

  useEffect(() => {
    if (selectedLead && selectedLead.currentStage === 'FULFILLMENT_STAGE') {
      authFetch(`${API_URL}/ops/cashiers`)
        .then(apiJson)
        .then(data => setCashiers(data || []))
        .catch(err => console.error(err));

      authFetch(`${API_URL}/ops/delivery-partners`)
        .then(apiJson)
        .then(data => setDeliveryPartners(data || []))
        .catch(err => console.error(err));
        
      setSelectedCashierId(selectedLead.cashierId || '');
      setSelectedDeliveryPartnerId(selectedLead.deliveryPartnerId || '');
    }

    if (selectedLeadId) {
      fetchCityComparison(selectedLeadId);
    }

    if (selectedLead?.branchId) {
      fetchSameCityBranches(selectedLead.branchId);
    }
    
    if (selectedLead && selectedLead.currentStage === 'INVENTORY_STAGE') {
      setAllocationQuantities({ 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 });
      setAllocationError(null);
    }
  }, [selectedLeadId, selectedLead?.currentStage]);

  const submitCashAllocation = async () => {
    if (!selectedLead) return;
    setActionLoading(true);
    try {
      const items = Object.entries(allocationQuantities)
        .map(([denom, qty]) => ({ denomination: parseInt(denom), quantity: qty }))
        .filter(item => item.quantity > 0);

      const res = await authFetch(`${API_URL}/ops/cash-allocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedLead.id,
          items
        })
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Failed to submit cash allocation');
      }

      alert('Cash allocation locked & inventory reserved successfully.');
      await fetchLeads();
      await fetchVaults();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitFulfillmentAssignment = async () => {
    if (!selectedLead) return;
    setActionLoading(true);
    const isPickup = selectedLead.deliveryMethod === 'PICKUP' || selectedLead.deliveryMethod === 'STORE_PICKUP';
    const payload = isPickup 
      ? { cashierId: selectedCashierId }
      : { deliveryPartnerId: selectedDeliveryPartnerId };

    try {
      const res = await authFetch(`${API_URL}/ops/leads/${selectedLead.id}/assign-fulfillment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Failed to assign fulfillment partner');
      }

      alert('Fulfillment assignment saved successfully.');
      await fetchLeads();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter lists based on search + status + assignment + stage
  const filterList = (list: any[], applyExtraFilters = false) => {
    return list.filter(l => {
      // Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.orderNumber.toLowerCase().includes(q) ||
        (l.profile?.user?.fullName || '').toLowerCase().includes(q) ||
        (l.profile?.user?.email || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;

      // Extra filters only in ALL tab
      if (applyExtraFilters) {
        if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
        if (assignmentFilter === 'ASSIGNED' && !l.assignedStaffId) return false;
        if (assignmentFilter === 'UNASSIGNED' && l.assignedStaffId) return false;
        if (stageFilter !== 'ALL' && l.currentStage !== stageFilter) return false;
      }
      return true;
    });
  };

  const displayLeads = 
    activeTab === 'MY_LEADS' ? filterList(myLeads) :
    activeTab === 'UNASSIGNED' ? filterList(unassignedLeads) :
    activeTab === 'CANCEL_REQUESTS' ? filterList(allLeads.filter((o: any) => o.cancelRequested)) :
    filterList(allLeads.filter((o: any) => !o.cancelRequested), true);

  // Filter counts for badges
  const activeFilterCount = [statusFilter !== 'ALL', assignmentFilter !== 'ALL', stageFilter !== 'ALL'].filter(Boolean).length;

  if (isLoading && allLeads.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold max-w-lg mx-auto mt-12">
        {error}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 -m-4 overflow-hidden">
      
      {/* LEFT COLUMN: Leads Selector List */}
      <div className="w-full md:w-80 lg:w-80 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shrink-0 shadow-sm">
        
        {/* Tabs selector */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-1.5">
              <ListTodo className="w-5 h-5 text-indigo-600" />
              CRM Lead Pipelines
            </h2>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowInventory(true)}
              className="bg-white hover:bg-slate-50 text-[10px] h-7 font-extrabold border-gray-200 text-slate-700 shadow-sm"
            >
              <Wallet size={12} className="mr-1.5 text-indigo-600" />
              Vaults
            </Button>
          </div>
          <div className="flex gap-1 p-0.5 bg-gray-150 rounded-xl text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab('MY_LEADS')}
              className={`flex-1 py-2 px-1.5 rounded-lg transition-all ${
                activeTab === 'MY_LEADS' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              My Leads ({myLeads.length})
            </button>
            <button
              onClick={() => { setActiveTab('UNASSIGNED'); setShowFilters(false); setStatusFilter('ALL'); setAssignmentFilter('ALL'); setStageFilter('ALL'); }}
              className={`flex-1 py-2 px-1.5 rounded-lg transition-all ${
                activeTab === 'UNASSIGNED' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              Unassigned ({unassignedLeads.length})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-2 px-1.5 rounded-lg transition-all ${
                activeTab === 'ALL' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              All Leads
            </button>
            <button
              onClick={() => setActiveTab('CANCEL_REQUESTS')}
              className={`flex-1 py-2 px-1.5 rounded-lg transition-all relative ${
                activeTab === 'CANCEL_REQUESTS' ? 'bg-white text-red-700 shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              {allLeads.filter((o: any) => o.cancelRequested).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {allLeads.filter((o: any) => o.cancelRequested).length}
                </span>
              )}
              ⚠ Cancel Req.
            </button>
          </div>
          <Input
            placeholder="Search reference or customer name..."
            className="text-xs focus-visible:ring-indigo-500 h-8 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter toggle button — only visible in All Leads */}
          {activeTab === 'ALL' && (
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <Filter size={11} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white/30 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={11} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Filter Panel — slides in below the header */}
        {activeTab === 'ALL' && showFilters && (
          <div className="px-4 pb-3 border-b border-gray-100 bg-gray-50/60 space-y-3">

            {/* Status filter */}
            <div>
              <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Order Status</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'All', value: 'ALL' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
                  { label: 'Payment Done', value: 'PAYMENT_COMPLETED' },
                  { label: 'KYC Approved', value: 'KYC_APPROVED' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                  { label: 'Rejected', value: 'REJECTED' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      statusFilter === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignment filter */}
            <div>
              <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Assignment</p>
              <div className="flex gap-1.5">
                {[
                  { label: 'All', value: 'ALL' },
                  { label: 'Assigned', value: 'ASSIGNED' },
                  { label: 'Unassigned', value: 'UNASSIGNED' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAssignmentFilter(opt.value as any)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      assignmentFilter === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage filter */}
            <div>
              <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Workflow Stage</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'All Stages', value: 'ALL' },
                  { label: 'KYC', value: 'KYC_STAGE' },
                  { label: 'Inventory', value: 'INVENTORY_STAGE' },
                  { label: 'Fulfillment', value: 'FULFILLMENT_STAGE' },
                  { label: 'Completed', value: 'COMPLETED' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStageFilter(opt.value)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      stageFilter === opt.value
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setStatusFilter('ALL'); setAssignmentFilter('ALL'); setStageFilter('ALL'); }}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {displayLeads.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold">No active leads found</p>
            </div>
          ) : (
            displayLeads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const hasUnreadNotes = lead.complianceStatus === 'LRS_FAILED';
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between border-l-4 ${
                    isSelected ? 'bg-indigo-50/40 border-l-indigo-600' : 'border-l-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-black text-xs text-gray-900">{lead.orderNumber}</span>
                      <Badge className={`text-[10px] px-2 py-0.5 font-bold shrink-0 ${
                        lead.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                        lead.status === 'CANCELLED' || lead.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        lead.status === 'PAYMENT_COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        lead.status === 'PAYMENT_PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {lead.status.replace(/_/g, ' ')}
                      </Badge>
                      {lead.currentStage && lead.currentStage !== 'COMPLETED' && (
                        <Badge className="text-[10px] px-2 py-0.5 font-bold shrink-0 bg-violet-50 text-violet-700 border-violet-200">
                          {lead.currentStage.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-gray-800 truncate">
                      {lead.profile?.user?.fullName || 'Anonymous Customer'}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mt-1 flex-wrap">
                      <span>₹{Number(lead.totalAmountInr).toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>{format(new Date(lead.createdAt), 'PP')}</span>
                      {lead.assignedStaff && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-500 font-bold">{lead.assignedStaff.fullName.split(' ')[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 ml-2" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Lead Workspace Panel */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
        {!selectedLead ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/20">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <FileCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Lead Selected</h3>
            <p className="text-slate-500 max-w-sm text-xs mt-1 leading-relaxed">
              Select a lead from the pipeline selector panel on the left to start checking compliance details, reserving inventory, and processing handovers.
            </p>
          </div>
        ) : selectedLead.productType === 'REMITTANCE' || selectedLead.items?.[0]?.product?.type === 'REMITTANCE' ? (
          <RemittanceCRMDesk
            lead={selectedLead}
            user={user}
            actionLoading={actionLoading}
            onLeadAction={handleLeadAction}
            onClaim={handleClaim}
            onForwardToPartner={handleForwardToPartner}
            onUpdatePartnerStatus={handleUpdatePartnerStatus}
            onRefresh={fetchLeads}
            setShowRejectModal={setShowRejectModal}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* STICKY ENTERPRISE ORDER SUMMARY HEADER */}
            {(() => {
              const createdDate = new Date(selectedLead.createdAt);
              const diffMs = Math.max(0, Date.now() - createdDate.getTime());
              const elapsedHours = Math.floor(diffMs / (1000 * 60 * 60));
              const elapsedMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              const isBreached = elapsedHours >= 24;
              const elapsedStr = `${elapsedHours}h ${elapsedMins}m ago`;
              const remainingStr = isBreached ? 'SLA Breached' : `${24 - elapsedHours}h remaining`;

              let pBadgeLabel = 'BUY CASH';
              let pBadgeColor = 'bg-blue-600 text-white border-blue-500';
              if (selectedLead.productType === 'CASH_SELL') {
                pBadgeLabel = 'SELL CASH';
                pBadgeColor = 'bg-emerald-600 text-white border-emerald-500';
              } else if (selectedLead.productType === 'REMITTANCE') {
                pBadgeLabel = 'OUTWARD REMITTANCE';
                pBadgeColor = 'bg-indigo-600 text-white border-indigo-500';
              }

              const prefBranch = selectedLead.originalBranch?.branchName || selectedLead.branch?.branchName || selectedLead.payoutBranch || 'Main Branch';
              const currBranch = selectedLead.currentBranch?.branchName || selectedLead.branch?.branchName || selectedLead.payoutBranch || 'Main Branch';
              const isReassigned = selectedLead.reassignedBranchId || (selectedLead.originalBranchId && selectedLead.currentBranchId && selectedLead.originalBranchId !== selectedLead.currentBranchId);

              return (
                <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-6 py-3.5 space-y-2.5 shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border shadow-xs ${pBadgeColor}`}>
                        {pBadgeLabel}
                      </span>
                      <h3 className="font-mono font-black text-xl text-gray-900">{selectedLead.orderNumber}</h3>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                        Stage: {selectedLead.currentStage?.replace(/_/g, ' ')}
                      </Badge>

                      {isBreached ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> SLA Breached ({elapsedStr})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /> SLA Remaining: {remainingStr} ({elapsedStr})
                        </span>
                      )}
                    </div>

                    {/* Quick Actions Toolbar (17) */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => window.open(`tel:${selectedLead.profile?.user?.mobile || ''}`)}
                        title="Call Customer"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Phone size={12} /> Call
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${selectedLead.profile?.user?.email || ''}`)}
                        title="Email Customer"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Mail size={12} /> Email
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${(selectedLead.profile?.user?.mobile || '').replace(/[^0-9]/g, '')}`)}
                        title="WhatsApp Customer"
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        💬 WhatsApp
                      </button>
                      <button
                        onClick={() => window.print()}
                        title="Print Order"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        🖨️ Print
                      </button>
                      <button
                        onClick={() => alert(`Order ${selectedLead.orderNumber} escalated to Ops Supervisor.`)}
                        title="Escalate Case"
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        ⚠️ Escalate
                      </button>
                      <button
                        onClick={() => fetchLeads()}
                        title="Refresh Lead Data"
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        🔄 Refresh
                      </button>

                      {!selectedLead.assignedStaffId ? (
                        <Button
                          onClick={() => handleClaim(selectedLead.id)}
                          disabled={actionLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-sm rounded-xl text-xs px-3 h-8 flex items-center gap-1"
                        >
                          <UserPlus size={13} /> Claim Lead
                        </Button>
                      ) : selectedLead.complianceLocked ? (
                        <span className="px-3 py-1 bg-slate-900 text-emerald-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1">
                          🔒 Sent to Branch
                        </span>
                      ) : selectedLead.complianceStatus === 'APPROVED' ? (
                        <Button
                          onClick={() => setShowSendToBranchModal(true)}
                          disabled={actionLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm rounded-xl text-xs px-3 h-8 flex items-center gap-1 cursor-pointer"
                        >
                          <Send size={13} /> 🚀 Send to Branch
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 font-semibold">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Customer</span>
                      <strong className="text-gray-900 text-xs block truncate">{selectedLead.profile?.user?.fullName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Preferred Branch</span>
                      <strong className="text-indigo-700 text-xs block truncate">{prefBranch}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Current Branch</span>
                      <strong className="text-indigo-950 text-xs block truncate">
                        {currBranch}
                        {isReassigned && <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-black">REASSIGNED</span>}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Fulfillment</span>
                      <strong className="text-gray-900 text-xs block">
                        {selectedLead.deliveryMethod === 'HOME_DELIVERY' ? '🚗 Home Delivery' : '🏢 Branch Pickup'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Current Owner</span>
                      <strong className="text-gray-900 text-xs block truncate">
                        {selectedLead.assignedStaff?.fullName || 'Central Operations'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Assigned Mgr</span>
                      <strong className="text-gray-900 text-xs block truncate">
                        {selectedLead.assignedManagerId || selectedLead.cashier?.name || 'Pending Handoff'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Created Date</span>
                      <span className="text-gray-700 text-[11px] block">{format(createdDate, 'dd MMM, h:mm a')}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Split Lead Detail Sections (Scrollable workspace) */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">

              {/* 12. COMPLIANCE LOCK BANNER */}
              {selectedLead.complianceLocked && (
                <div className="bg-emerald-950 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 border border-emerald-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                      🔒
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-emerald-100 flex items-center gap-2">
                        Compliance Completed & Transferred to Branch Execution
                      </h4>
                      <p className="text-xs text-emerald-200 mt-0.5 font-medium">
                        Processed on {selectedLead.complianceCompletedAt ? format(new Date(selectedLead.complianceCompletedAt), 'dd MMM yyyy, h:mm a') : 'Recent'} by {selectedLead.assignedStaff?.fullName || 'Central Operations'}. Compliance information is now read-only.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-800 text-emerald-100 border-emerald-600 font-extrabold px-3 py-1 text-xs">
                    Read-Only Mode
                  </Badge>
                </div>
              )}

              {/* 6. ORDER JOURNEY PROGRESS TRACKER */}
              {(() => {
                const isKycDone = selectedLead.complianceStatus === 'APPROVED';
                const isLocked = selectedLead.complianceLocked;
                const isCompleted = selectedLead.status === 'COMPLETED' || selectedLead.currentStage === 'COMPLETED';

                const steps = [
                  { label: '1. Order Created', done: true, active: false },
                  { label: '2. KYC', done: isKycDone, active: selectedLead.currentStage === 'KYC_STAGE' && !isKycDone },
                  { label: '3. AML', done: isKycDone, active: false },
                  { label: '4. LRS', done: isKycDone, active: false },
                  { label: '5. Payment', done: selectedLead.status !== 'PAYMENT_PENDING', active: selectedLead.status === 'PAYMENT_PENDING' },
                  { label: '6. Cash Allocation', done: !!selectedLead.cashAllocation || isLocked, active: selectedLead.currentStage === 'INVENTORY_STAGE' },
                  { label: '7. Ready To Send', done: isLocked, active: isKycDone && !isLocked && !isCompleted },
                  { label: '8. Branch Execution', done: isCompleted, active: isLocked && !isCompleted },
                  { label: '9. Completed', done: isCompleted, active: isCompleted },
                ];

                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-sm space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Order Journey Progress Tracker</span>
                      <span className="text-[11px] font-bold text-indigo-400">
                        Current Stage: {selectedLead.currentStage?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                      {steps.map((st, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl text-[10px] text-center border transition-all ${
                            st.done
                              ? 'bg-emerald-600 text-white font-extrabold border-emerald-500 shadow-xs'
                              : st.active
                              ? 'bg-indigo-600 text-white font-black border-indigo-400 ring-2 ring-indigo-400/50 shadow-md'
                              : 'bg-slate-800 text-slate-400 border-slate-700 font-semibold'
                          }`}
                        >
                          <div className="truncate font-extrabold">{st.label}</div>
                          <div className="text-[8px] opacity-80 mt-0.5">{st.done ? '✓ Done' : st.active ? '● Active' : '○ Pending'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {selectedLead.complianceStatus === 'LRS_FAILED' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                  <div>
                    <h4 className="font-bold text-sm">LRS Annual Limit Check Failed</h4>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">
                      This customer has exceeded the ₹100 Lakhs ($1.2M equivalent) Liberalised Remittance Scheme limit in the current Financial Year. The order has been automatically cancelled.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid block */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Customer CRM Profile Info */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Customer Profile & Order Details</h4>
                  
                  {selectedLead.productType === 'REMITTANCE' ? (
                    <Card className="rounded-2xl border-indigo-100 shadow-none bg-indigo-50/20">
                      <CardContent className="p-4 space-y-3.5 text-xs font-semibold text-gray-800">
                        <div className="flex justify-between items-start border-b border-indigo-100 pb-2">
                          <div>
                            <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider block">Customer Name</span>
                            <span className="text-gray-900 font-extrabold text-sm">{selectedLead.profile?.user?.fullName || 'N/A'}</span>
                          </div>
                          <Badge className="bg-indigo-600 text-white font-black text-[10px]">
                            OUTWARD REMITTANCE
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order Reference</p>
                            <p className="text-indigo-900 font-mono font-black">{selectedLead.orderNumber}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Destination Country</p>
                            <p className="text-gray-900 font-extrabold">{selectedLead.travelDestination || 'United States'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Transfer Amount</p>
                            <p className="text-indigo-600 font-black text-sm">
                              {selectedLead.items?.[0]?.amount} {selectedLead.items?.[0]?.currency?.code}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total INR Payable</p>
                            <p className="text-gray-900 font-black text-sm">
                              ₹{Number(selectedLead.totalAmountInr).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Purpose of Remittance</p>
                            <p className="text-gray-900 font-extrabold">
                              {selectedLead.items?.[0]?.remittance?.purpose?.name || selectedLead.profile?.travelPurpose || 'Education'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Source of Funds</p>
                            <p className="text-gray-900 font-extrabold">
                              {selectedLead.items?.[0]?.remittance?.sourceOfFunds || 'Personal Savings'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Relationship</p>
                            <p className="text-gray-900 font-extrabold">
                              {selectedLead.items?.[0]?.remittance?.relationship || 'Self / Family'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Assigned Branch</p>
                            <p className="text-gray-900 font-extrabold">Delhi CP Main Vault Branch</p>
                          </div>
                        </div>

                        {/* Beneficiary Details Card */}
                        <div className="bg-white border border-indigo-150 rounded-xl p-3 space-y-2 mt-2">
                          <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider border-b pb-1">
                            Beneficiary Account Details
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400 text-[10px] block font-medium">Beneficiary Name</span>
                              <span className="font-extrabold text-gray-900">
                                {selectedLead.items?.[0]?.remittance?.beneficiaryName || selectedLead.items?.[0]?.remittance?.beneficiary?.name || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] block font-medium">Bank Name</span>
                              <span className="font-extrabold text-gray-900">
                                {selectedLead.items?.[0]?.remittance?.beneficiaryBank || selectedLead.items?.[0]?.remittance?.beneficiary?.bankName || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] block font-medium">Account / IBAN</span>
                              <span className="font-mono font-bold text-gray-900">
                                {selectedLead.items?.[0]?.remittance?.ibanOrAccountNumber || selectedLead.items?.[0]?.remittance?.beneficiary?.accountNumber || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] block font-medium">SWIFT / Bank Code</span>
                              <span className="font-mono font-bold text-gray-900">
                                {selectedLead.items?.[0]?.remittance?.swiftCode || selectedLead.items?.[0]?.remittance?.beneficiary?.swiftCode || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="rounded-2xl border-gray-200 shadow-none bg-slate-50/20">
                      <CardContent className="p-4 space-y-3.5 text-xs font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Full Name</p>
                            <p className="text-gray-900 font-extrabold">{selectedLead.profile?.user?.fullName || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Mobile Number</p>
                            <p className="text-gray-900 font-extrabold">{selectedLead.profile?.user?.mobile || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Email Address</p>
                            <p className="text-gray-950 font-extrabold">{selectedLead.profile?.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Payout Branch</p>
                            <p className="text-gray-900 font-bold">{selectedLead.branchId === 'c02821df-66b9-4d6f-b649-0fa71a2e4b09' ? 'दिल्ली Connaught Place Branch' : 'Main Branch'}</p>
                          </div>
                        </div>
                        {selectedLead.deliveryMethod === 'HOME_DELIVERY' && (
                          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-2.5 -mx-1">
                            <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider leading-none mb-0.5">Delivery Address</p>
                              <p className="text-gray-900 font-extrabold leading-snug">
                                {selectedLead.deliveryJob?.deliveryAddress
                                  ? selectedLead.deliveryJob.deliveryAddress
                                  : selectedLead.deliveries?.[0]?.address
                                    ? `${selectedLead.deliveries[0].address.address}, ${selectedLead.deliveries[0].address.city}, ${selectedLead.deliveries[0].address.state} - ${selectedLead.deliveries[0].address.pin}`
                                    : 'No delivery address recorded'}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Travel Dates & Purpose</p>
                            <p className="text-gray-900 font-extrabold">
                              {selectedLead.profile?.travelPurpose || 'TOURISM'} to {selectedLead.travelDestination || 'N/A'} (Dept: {selectedLead.departureDate ? format(new Date(selectedLead.departureDate), 'PP') : 'N/A'})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Total Transaction Amount</p>
                            <p className="text-indigo-650 text-indigo-600 font-black text-sm">
                              ₹{Number(selectedLead.totalAmountInr).toLocaleString('en-IN')} INR
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 15. FINANCIAL SUMMARY CARD */}
                  <Card className="rounded-2xl border-gray-200 shadow-none bg-slate-50/50 mt-4">
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-indigo-600" /> Financial Breakdown
                        </h4>
                        <Badge className="bg-indigo-600 text-white text-[10px] font-black">
                          {selectedLead.productType?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {/* Multi-Currency Items Breakdown */}
                      <div className="space-y-2">
                        {selectedLead.items && selectedLead.items.length > 0 ? (
                          selectedLead.items.map((item: any, idx: number) => {
                            const cCode = item.currency?.code || 'USD';
                            const amt = Number(item.amount || 0);
                            const rate = Number(item.rate || 0);
                            const subtotal = Number(item.inrSubtotal || (amt * rate));
                            return (
                              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                    <span className="text-base">{getCurrencyFlag(cCode)}</span>
                                    <span>{cCode} {item.product?.name ? `(${item.product.name})` : ''}</span>
                                  </span>
                                  <strong className="text-slate-900 font-mono font-black text-sm">
                                    {amt.toLocaleString('en-IN')} {cCode}
                                  </strong>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-500">
                                  <span>Applied Exchange Rate:</span>
                                  <span className="font-mono text-slate-700 font-bold">
                                    1 {cCode} = ₹{rate.toFixed(4)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-700 font-bold border-t border-slate-100 pt-1">
                                  <span>Gross Subtotal (INR):</span>
                                  <span className="font-mono text-emerald-700 font-black">
                                    ₹{subtotal.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <div className="flex justify-between text-slate-600">
                              <span>Total Amount:</span>
                              <strong className="text-slate-900 font-mono">₹{Number(selectedLead.totalAmountInr).toLocaleString('en-IN')} INR</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1 font-semibold">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Service & Operational Charges:</span>
                          <span>₹0.00 (Waived)</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>GST (18% on Fees):</span>
                          <span>Included</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>TCS (Tax Collected at Source):</span>
                          <span>₹0.00 (Within threshold)</span>
                        </div>
                      </div>

                      <hr className="border-slate-200 my-1" />
                      <div className="flex justify-between text-slate-950 font-black text-sm">
                        <span>Grand Total Payable (INR):</span>
                        <span className="text-indigo-600 font-mono text-base">
                          ₹{Number(selectedLead.totalAmountInr).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 2. Operations Lead Checklist */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Operational Checklist</h4>
                  
                  {selectedLead.productType === 'REMITTANCE' ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Verify Customer KYC', checked: selectedLead.complianceStatus === 'APPROVED' },
                        { label: 'Verify Required Documents', checked: selectedLead.complianceStatus === 'APPROVED' },
                        { label: 'AML Screening', checked: selectedLead.complianceStatus === 'APPROVED' },
                        { label: 'LRS Validation', checked: selectedLead.complianceStatus === 'APPROVED' },
                        { label: 'Beneficiary Verification', checked: selectedLead.complianceStatus === 'APPROVED' },
                        { label: 'Purpose Verification', checked: selectedLead.complianceStatus === 'APPROVED' },
                        { label: 'Source of Funds Verification', checked: selectedLead.complianceStatus === 'APPROVED' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${item.checked ? 'text-green-600 fill-green-50' : 'text-gray-300'}`} />
                            <span className="text-gray-700">{item.label}</span>
                          </div>
                          <Badge className={item.checked ? 'bg-green-100 text-green-700 font-black' : 'bg-gray-100 text-gray-400 font-bold'}>
                            {item.checked ? 'Passed' : 'Pending'}
                          </Badge>
                        </div>
                      ))}

                      {/* Compliance Result & Decision Buttons */}
                      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between mt-3">
                        <div>
                          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">Compliance Result</span>
                          <span className={`font-black text-xs ${selectedLead.complianceStatus === 'APPROVED' ? 'text-emerald-700' : selectedLead.complianceStatus === 'REJECTED' ? 'text-red-700' : 'text-amber-700'}`}>
                            {selectedLead.complianceStatus === 'APPROVED' ? 'APPROVED' : selectedLead.complianceStatus === 'REJECTED' ? 'REJECTED' : 'UNDER REVIEW'}
                          </span>
                        </div>
                        {selectedLead.complianceStatus !== 'APPROVED' && selectedLead.assignedStaffId && selectedLead.status !== 'CANCELLED' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => handleLeadAction(selectedLead.id, 'APPROVE_KYC')}
                              className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[11px] h-8 rounded-lg"
                            >
                              Approve Compliance
                            </Button>
                            <Button
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => setShowRejectModal(true)}
                              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] h-8 rounded-lg"
                            >
                              Reject Compliance
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Remittance Status & Partner Forwarding Workspace */}
                      <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-indigo-600" />
                            <span className="font-extrabold text-gray-900 text-xs">Remittance Status Timeline</span>
                          </div>
                          <Badge className="bg-indigo-600 text-white text-[10px] font-black">
                            {selectedLead.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {/* Interactive Remittance Timeline */}
                        <div className="grid grid-cols-5 gap-1.5 text-center">
                          {[
                            { label: 'Created', active: true },
                            { label: 'KYC Done', active: selectedLead.complianceStatus === 'APPROVED' || selectedLead.status !== 'PENDING' },
                            { label: 'Approved', active: ['READY_TO_FORWARD', 'FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED'].includes(selectedLead.status) },
                            { label: 'Forwarded', active: ['FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED'].includes(selectedLead.status) },
                            { label: 'Completed', active: ['TRANSFER_COMPLETED', 'COMPLETED'].includes(selectedLead.status) },
                          ].map((step, idx) => (
                            <div key={idx} className={`p-1.5 rounded-lg border text-[9px] font-bold ${
                              step.active ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-400 border-gray-200'
                            }`}>
                              {step.active ? '✓ ' : ''}{step.label}
                            </div>
                          ))}
                        </div>

                        {/* Staff Action: Forward to Partner */}
                        {(selectedLead.status === 'READY_TO_FORWARD' || (selectedLead.complianceStatus === 'APPROVED' && !['FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(selectedLead.status))) && (
                          <div className="bg-white p-3.5 rounded-lg border border-indigo-200 space-y-2 shadow-sm">
                            <p className="text-xs text-indigo-900 font-semibold flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              Compliance approved! Case is ready to be forwarded to partner dealer.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => setShowForwardModal(true)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9 shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <Send size={13} /> 🚀 Forward To Partner Dealer
                            </Button>
                          </div>
                        )}

                        {/* Manual Status Update Panel (Temporary operational feature until Dealer Portal) */}
                        {['FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED', 'REJECTED'].includes(selectedLead.status) && (
                          <div className="bg-white p-3.5 rounded-lg border border-indigo-200 space-y-3 text-xs">
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-gray-500 font-bold">Partner Reference:</span>
                              <span className="font-mono font-bold text-indigo-800">
                                {selectedLead.items?.[0]?.remittance?.partnerReference || selectedLead.remittanceDetail?.partnerReference || 'Ref Pending'}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                Partner Processing Status Dropdown
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={selectedPartnerStatus}
                                  onChange={(e) => setSelectedPartnerStatus(e.target.value)}
                                  className="flex-1 bg-slate-50 border border-gray-200 rounded-lg p-2 font-bold text-xs outline-indigo-500 text-gray-800"
                                >
                                  <option value="FORWARDED_TO_PARTNER">FORWARDED_TO_PARTNER</option>
                                  <option value="PARTNER_PROCESSING">PARTNER_PROCESSING</option>
                                  <option value="TRANSFER_COMPLETED">TRANSFER_COMPLETED</option>
                                  <option value="REJECTED">REJECTED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdatePartnerStatus(selectedLead.id, selectedPartnerStatus)}
                                  disabled={actionLoading}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9 px-3 shrink-0"
                                >
                                  {actionLoading ? 'Updating...' : 'Update Status'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Checklist item 1: Verify KYC */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${
                            selectedLead.complianceStatus === 'APPROVED' ? 'text-green-600 fill-green-50' : 
                            selectedLead.complianceStatus === 'REJECTED' ? 'text-red-500' : 'text-gray-300'
                          }`} />
                          <span className="text-gray-700">Verify KYC Documents</span>
                        </div>
                        {selectedLead.complianceStatus === 'APPROVED' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-black">Approved</Badge>
                        ) : (
                          selectedLead.assignedStaffId && selectedLead.status !== 'CANCELLED' && (
                            <div className="flex items-center gap-2">
                              {selectedLead.complianceStatus === 'REJECTED' && (
                                <Badge className="bg-red-100 text-red-700 font-black">Rejected</Badge>
                              )}
                              <Button
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleLeadAction(selectedLead.id, 'APPROVE_KYC')}
                                className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] rounded-lg h-7"
                              >
                                Approve KYC
                              </Button>
                              <Button
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => setShowRejectModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg h-7"
                              >
                                Reject KYC
                              </Button>
                            </div>
                          )
                        )}
                      </div>

                      {/* Checklist item 2: AML Checks */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${
                            selectedLead.complianceStatus === 'APPROVED' ? 'text-green-600 fill-green-50' : 'text-gray-300'
                          }`} />
                          <span className="text-gray-700">AML Screening</span>
                        </div>
                        {selectedLead.profile?.riskCategory === 'HIGH' ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 font-extrabold">AML FLAGGED (High Risk)</Badge>
                        ) : selectedLead.complianceStatus === 'APPROVED' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-black">Cleared</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 font-black">Pending</Badge>
                        )}
                      </div>

                      {/* Checklist item 3: LRS Validation */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${
                            selectedLead.complianceStatus === 'APPROVED' ? 'text-green-600 fill-green-50' : 
                            selectedLead.complianceStatus === 'LRS_FAILED' ? 'text-red-500 fill-red-50' : 'text-gray-300'
                          }`} />
                          <span className="text-gray-700">LRS Annual Limit Check</span>
                        </div>
                        {selectedLead.complianceStatus === 'LRS_FAILED' ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 font-extrabold">Limit Exceeded</Badge>
                        ) : selectedLead.complianceStatus === 'APPROVED' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-black">Eligible</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 font-black">Pending</Badge>
                        )}
                      </div>

                      {/* Checklist item 4: Cash Allocation (Branch Responsibility) */}
                      {selectedLead.productType !== 'CASH_SELL' && selectedLead.productType !== 'REMITTANCE' && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 ${
                                selectedLead.cashAllocation ? 'text-green-600 fill-green-50' : 'text-gray-300'
                              }`} />
                              <span className="text-gray-700">Cash Denomination Allocation (Branch Execution)</span>
                            </div>
                            {selectedLead.cashAllocation ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-md text-[9px] font-black uppercase">
                                Allocated by Branch
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[9px] font-black uppercase">
                                Pending Branch Vault
                              </span>
                            )}
                          </div>

                          {selectedLead.cashAllocation ? (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 font-medium">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Branch Manager Allocated Bills</p>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedLead.cashAllocation.items?.map((it: any, idx: number) => (
                                  <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
                                    {it.denomination} x {it.quantity} ({it.currencyCode || 'FX'})
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-lg text-[11px] text-amber-900 font-medium">
                              ℹ️ <strong>Branch Responsibility:</strong> Central Operations does not allocate physical currency. The assigned Branch Manager will allocate denominations and reserve vault stock upon receiving handoff.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Checklist item 5: Branch Execution & Fulfillment Monitoring */}
                      {selectedLead.productType !== 'REMITTANCE' && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 ${
                                ['FULFILLMENT_STAGE', 'COMPLETED'].includes(selectedLead.currentStage) && (selectedLead.cashierId || selectedLead.deliveryPartnerId) ? 'text-green-600 fill-green-50' : 'text-gray-300'
                              }`} />
                              <span className="text-gray-700">Branch Fulfillment & Dispatch Monitoring</span>
                            </div>
                            {selectedLead.fulfillmentStatus && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[9px] font-black uppercase">
                                {selectedLead.fulfillmentStatus?.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>

                          {(selectedLead.cashierId || selectedLead.deliveryPartnerId) ? (
                            <div className="bg-slate-100 p-3 rounded-lg border text-gray-700 font-medium text-[11px] space-y-2">
                              {selectedLead.cashierId && (
                                <div>
                                  <span className="text-gray-400 font-bold uppercase text-[9px] block">Assigned Branch Cashier</span>
                                  <span className="font-extrabold text-gray-900 text-xs block mt-0.5">
                                    {selectedLead.cashier?.name} ({selectedLead.cashier?.employeeCode})
                                  </span>
                                </div>
                              )}
                              {selectedLead.deliveryPartnerId && (
                                <div>
                                  <span className="text-gray-400 font-bold uppercase text-[9px] block">Assigned Delivery Partner</span>
                                  <span className="font-extrabold text-gray-900 text-xs block mt-0.5">
                                    {selectedLead.deliveryPartner?.name} ({selectedLead.deliveryPartner?.employeeCode})
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-slate-100 p-2.5 rounded-lg text-[11px] text-slate-600 font-medium">
                              🔒 <strong>Read-Only Monitoring:</strong> Branch Manager will assign cashier/delivery partner after vault allocation.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manager Only: Cancellation Request */}
                  {selectedLead.cancelRequested && (
                    <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-bold animate-in fade-in">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <span className="text-red-800 text-sm font-black block">Customer Requested Cancellation</span>
                          <span className="text-red-600 font-semibold text-[11px] block mt-0.5">
                            Reason: {selectedLead.cancelReason}
                          </span>
                        </div>
                      </div>
                      {(user?.role === 'BRANCH_MANAGER' || user?.role === 'SUPER_ADMIN') && (
                        <Button
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleLeadAction(selectedLead.id, 'APPROVE_CANCEL')}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg h-8 shrink-0 ml-3"
                        >
                          Approve Cancellation
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 13 & 14. CASE OWNERSHIP & ASSIGNMENT HISTORY */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 13. Ownership Card */}
                <Card className="rounded-2xl border-gray-200 shadow-none bg-slate-50/40">
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-indigo-600" /> Case Ownership & Control
                      </h4>
                      <Badge className={selectedLead.assignedStaffId ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 'bg-amber-100 text-amber-800 font-extrabold'}>
                        {selectedLead.assignedStaffId ? 'CLAIMED' : 'UNASSIGNED'}
                      </Badge>
                    </div>
                    <div className="space-y-2.5 font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Owner:</span>
                        <strong className="text-indigo-700">Central Operations</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Central Staff Assigned:</span>
                        <strong className="text-slate-900">{selectedLead.assignedStaff?.fullName || selectedLead.assignedCentralStaffId || 'Unassigned'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Destination Branch Manager:</span>
                        <strong className="text-slate-900">{selectedLead.assignedManagerId || selectedLead.cashier?.name || 'Pending Handover'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assignment Timestamp:</span>
                        <span>{selectedLead.assignedAt ? format(new Date(selectedLead.assignedAt), 'dd MMM yyyy, h:mm a') : 'Not yet claimed'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Compliance Status:</span>
                        <span className="font-extrabold text-slate-900">{selectedLead.complianceStatus || 'PENDING'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 14. Assignment History */}
                <Card className="rounded-2xl border-gray-200 shadow-none bg-slate-50/40">
                  <CardContent className="p-4 space-y-3 text-xs">
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs border-b border-gray-200 pb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" /> Assignment & Handoff Timeline
                    </h4>
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between items-center text-emerald-700">
                        <span>✓ 1. Order Created by Customer</span>
                        <span className="text-[10px] text-slate-400 font-normal">{format(new Date(selectedLead.createdAt), 'dd MMM, h:mm a')}</span>
                      </div>
                      <div className={`flex justify-between items-center ${selectedLead.assignedStaffId ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                        <span>{selectedLead.assignedStaffId ? '✓ 2. Claimed by Central Staff' : '○ 2. Claimed by Central Staff'}</span>
                        {selectedLead.assignedAt && <span className="text-[10px] text-slate-400 font-normal">{format(new Date(selectedLead.assignedAt), 'dd MMM, h:mm a')}</span>}
                      </div>
                      <div className={`flex justify-between items-center ${selectedLead.complianceStatus === 'APPROVED' ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                        <span>{selectedLead.complianceStatus === 'APPROVED' ? '✓ 3. Compliance Approved' : '○ 3. Compliance Approval'}</span>
                      </div>
                      <div className={`flex justify-between items-center ${selectedLead.complianceLocked ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                        <span>{selectedLead.complianceLocked ? '✓ 4. Sent to Destination Branch' : '○ 4. Send to Branch'}</span>
                        {selectedLead.complianceCompletedAt && <span className="text-[10px] text-slate-400 font-normal">{format(new Date(selectedLead.complianceCompletedAt), 'dd MMM, h:mm a')}</span>}
                      </div>
                      <div className={`flex justify-between items-center ${selectedLead.status === 'COMPLETED' ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                        <span>{selectedLead.status === 'COMPLETED' ? '✓ 5. Manager Handover Completed' : '○ 5. Manager Handover Completed'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 9 & 10. BRANCH INVENTORY OVERVIEW & SAME-CITY BRANCH REASSIGNMENT */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" /> Same-City Branch Stock & Reassignment Module
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Compare inventory across branches in {selectedLead.branch?.branchCity || 'this city'} and execute same-city branch transfers.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowReassignModal(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-8 px-3.5 rounded-xl shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    🔄 Reassign Branch
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">
                      Current Branch: {selectedLead.currentBranch?.branchName || selectedLead.branch?.branchName || 'Delhi CP Branch'}
                    </span>
                    <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
                      <span>Requested: {selectedLead.items?.[0]?.amount} {selectedLead.items?.[0]?.currency?.code}</span>
                      <span className="text-emerald-600">
                        In Stock: {Number(branchVaults.find(v => v.branchId === selectedLead.branchId && v.currencyId === selectedLead.items?.[0]?.currencyId)?.totalBalance || selectedLead.items?.[0]?.vaultStock || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between border-t pt-2">
                      <span>City Location: <strong>{selectedLead.branch?.branchCity || 'Delhi'}</strong></span>
                      <span>Reassignment Audit: <strong>{selectedLead.reassignedBranchId ? 'REASSIGNED' : 'ORIGINAL'}</strong></span>
                    </div>
                    {selectedLead.reassignmentReason && (
                      <div className="bg-amber-50 p-2 rounded text-[11px] text-amber-900 border border-amber-100 font-medium">
                        Reassignment Reason: {selectedLead.reassignmentReason}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider block">
                      Same-City Neighbor Branches ({sameCityBranches.length})
                    </span>
                    {sameCityBranches.length === 0 ? (
                      <p className="text-slate-400 italic text-[11px]">No other active branches in {selectedLead.branch?.branchCity || 'this city'}.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {sameCityBranches.map(b => (
                          <div key={b.id} className="flex justify-between items-center text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-bold text-slate-800">{b.branchName}</span>
                            <span className="text-slate-500 font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">{b.branchCode}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 16. COMMUNICATION HISTORY */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Phone size={15} className="text-indigo-600" /> Communication History & Customer Notifications
                  </h4>
                  <div className="flex gap-1 text-[11px] font-bold bg-slate-100 p-1 rounded-xl">
                    {['ALL', 'CALLS', 'EMAILS', 'SMS', 'WHATSAPP'].map(t => (
                      <button
                        key={t}
                        onClick={() => setCommTab(t as any)}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${commTab === t ? 'bg-white text-indigo-700 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-medium">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      ✉️
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900 text-xs">Order Confirmation Email Sent</strong>
                        <span className="text-[10px] text-slate-400">{format(new Date(selectedLead.createdAt), 'PP p')}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">Automated order receipt dispatched to {selectedLead.profile?.user?.email || 'Customer'}.</p>
                    </div>
                  </div>

                  {selectedLead.complianceLocked && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 flex items-start gap-3">
                      <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        📱
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-emerald-950 text-xs">Branch Dispatch SMS & Notification Sent</strong>
                          <span className="text-[10px] text-emerald-700">
                            {selectedLead.complianceCompletedAt ? format(new Date(selectedLead.complianceCompletedAt), 'PP p') : 'Recent'}
                          </span>
                        </div>
                        <p className="text-emerald-800 text-[11px] mt-0.5">
                          Customer notified that compliance verification is approved and order has been dispatched to {selectedLead.currentBranch?.branchName || selectedLead.branch?.branchName || 'Branch'}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. ENTERPRISE CITY INVENTORY & INTELLIGENT BRANCH ASSIGNMENT PANEL */}
              {selectedLead.productType !== 'REMITTANCE' && selectedLead.items && selectedLead.items.length > 0 && (
                <div className="space-y-6">
                  {/* Currency Summary Header Cards */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Requested Currencies & Valuation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLead.items.map((item: any) => (
                        <Card key={item.id} className="rounded-2xl border-gray-200 shadow-xs bg-slate-50/40">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <Badge className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase mb-1">
                                {item.product?.name || 'Foreign Currency Cash'}
                              </Badge>
                              <h4 className="font-black text-gray-900 text-xl flex items-center gap-1.5">
                                <Coins className="w-5 h-5 text-amber-500 shrink-0" />
                                {item.currency?.symbol || ''}{Number(item.amount).toLocaleString('en-US')} {item.currency?.code}
                              </h4>
                              <p className="text-[11px] text-gray-500 font-semibold mt-1">
                                Exchange Rate: 1 {item.currency?.code} = ₹{Number(item.rate).toFixed(4)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">INR Subtotal</p>
                              <p className="font-black text-gray-900 text-lg">
                                ₹{Number(item.inrSubtotal).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* BRANCH & CITY INVENTORY NETWORK PANEL */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-slate-900">Branch & City Inventory Network</h3>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-extrabold text-xs">
                            📍 {cityComparisonData?.city || selectedLead.branch?.branchCity || 'Same City Network'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Real-time inventory comparison across all branches in {cityComparisonData?.city || selectedLead.branch?.branchCity || 'this city'}.
                        </p>
                      </div>

                      {/* Action Control Bar */}
                      <div className="flex items-center gap-2">
                        {cityComparisonData?.preferredCanFulfill ? (
                          <Button
                            onClick={() => handleSmartAssignBranch(selectedLead.id, cityComparisonData.preferredBranch.id, `Assigned to customer preferred branch ${cityComparisonData.preferredBranch.branchName}`)}
                            disabled={actionLoading || selectedLead.branchId === cityComparisonData.preferredBranch.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs h-9 px-3 cursor-pointer"
                          >
                            ✓ Assign Preferred Branch
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="bg-slate-100 text-slate-400 font-extrabold text-xs rounded-xl h-9 px-3 border border-slate-200 cursor-not-allowed"
                            title="Preferred branch has inventory shortage"
                          >
                            🚫 Preferred Branch Shortage
                          </Button>
                        )}

                        {cityComparisonData?.recommendedBranch && cityComparisonData.recommendedBranch.id !== cityComparisonData.preferredBranch?.id && (
                          <Button
                            onClick={() => {
                              setPendingTargetBranch(cityComparisonData.recommendedBranch);
                              setSmartReassignReasonInput(`Reassigned to ${cityComparisonData.recommendedBranch.branchName} due to preferred branch inventory shortage.`);
                              setShowSmartReassignConfirmModal(true);
                            }}
                            disabled={actionLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md h-9 px-3 cursor-pointer animate-pulse"
                          >
                            ⚡ Assign Recommended Branch
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => {
                            fetchSameCityBranches(selectedLead.branchId);
                            setShowReassignModal(true);
                          }}
                          className="font-bold border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl h-9 text-xs cursor-pointer"
                        >
                          Choose Another Branch
                        </Button>
                      </div>
                    </div>

                    {/* Step 2: Automatic Inventory Validation Banner */}
                    {cityComparisonData && (
                      <div>
                        {cityComparisonData.preferredCanFulfill ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs font-bold text-emerald-900">
                            <div className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                              <div>
                                <p className="text-sm font-black text-emerald-950">🟢 Preferred Branch can fulfill this order.</p>
                                <p className="text-emerald-700 font-medium text-[11px] mt-0.5">
                                  {cityComparisonData.preferredBranch?.branchName} has {cityComparisonData.currencySymbol}{cityComparisonData.preferredBranch?.availableStock?.toLocaleString()} {cityComparisonData.requestedCurrency} available for requested {cityComparisonData.currencySymbol}{cityComparisonData.requestedAmount?.toLocaleString()}.
                                </p>
                              </div>
                            </div>
                            <span className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg shadow-xs">
                              Recommendation: Assign Preferred Branch
                            </span>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-xs font-bold text-red-900">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                              <div>
                                <p className="text-sm font-black text-red-950">🔴 Preferred Branch cannot fulfill this order.</p>
                                <p className="text-red-700 font-medium text-[11px] mt-0.5">
                                  Shortage: <strong className="font-black text-red-900">{cityComparisonData.currencySymbol}{cityComparisonData.preferredShortage?.toLocaleString()} {cityComparisonData.requestedCurrency}</strong> at {cityComparisonData.preferredBranch?.branchName || 'Preferred Branch'}. System automatically evaluated all branches in {cityComparisonData.city}.
                                </p>
                              </div>
                            </div>
                            <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg shadow-xs animate-pulse">
                              Shortage Alert: {cityComparisonData.currencySymbol}{cityComparisonData.preferredShortage}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Smart Branch Recommendation Display */}
                    {cityComparisonData?.recommendedBranch && !cityComparisonData.preferredCanFulfill && (
                      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                              ⭐ SMART RECOMMENDATION
                            </span>
                            <h4 className="font-black text-lg text-white">Recommended Branch: {cityComparisonData.recommendedBranch.branchName}</h4>
                          </div>
                          <Button
                            onClick={() => {
                              setPendingTargetBranch(cityComparisonData.recommendedBranch);
                              setSmartReassignReasonInput(`Reassigned to ${cityComparisonData.recommendedBranch.branchName} due to preferred branch inventory shortage.`);
                              setShowSmartReassignConfirmModal(true);
                            }}
                            disabled={actionLoading}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-9 px-4 rounded-xl shadow-md cursor-pointer"
                          >
                            Assign to {cityComparisonData.recommendedBranch.branchName} →
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Stock</span>
                            <strong className="text-emerald-400 text-sm font-black">{cityComparisonData.currencySymbol}{cityComparisonData.recommendedBranch.availableStock?.toLocaleString()} {cityComparisonData.requestedCurrency}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Reserved Stock</span>
                            <strong className="text-amber-400 text-sm font-black">{cityComparisonData.currencySymbol}{cityComparisonData.recommendedBranch.reservedStock?.toLocaleString()} {cityComparisonData.requestedCurrency}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Stock</span>
                            <strong className="text-blue-400 text-sm font-black">{cityComparisonData.currencySymbol}{cityComparisonData.recommendedBranch.remainingStock?.toLocaleString()} {cityComparisonData.requestedCurrency}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Status & City</span>
                            <span className="text-emerald-400 text-xs font-black">HEALTHY • {cityComparisonData.city}</span>
                          </div>
                        </div>
                        <p className="text-xs text-indigo-200 font-medium">
                          <strong>Reason:</strong> Inventory Available ({cityComparisonData.currencySymbol}{cityComparisonData.recommendedBranch.availableStock} vs {cityComparisonData.currencySymbol}{cityComparisonData.requestedAmount} requested) • Same City Network • Can fulfill order immediately.
                        </p>
                      </div>
                    )}

                    {/* Step 3 & 4: City Inventory Comparison Table */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                          Same-City Branch Comparison ({cityComparisonData?.sameCityBranches?.length || 0} Branches in {cityComparisonData?.city || 'City'})
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">Ranked by stock availability & lowest reserved inventory</span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                            <tr>
                              <th className="p-3">Branch</th>
                              <th className="p-3">Available</th>
                              <th className="p-3">Reserved</th>
                              <th className="p-3">Remaining</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Recommendation</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                            {cityComparisonData?.sameCityBranches?.map((branchItem: any) => {
                              const isSelectedCurrent = branchItem.id === (selectedLead.currentBranchId || selectedLead.branchId);

                              return (
                                <tr
                                  key={branchItem.id}
                                  className={`transition-colors ${
                                    branchItem.recommendationTag === 'RECOMMENDED'
                                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                                      : branchItem.isPreferred
                                        ? 'bg-indigo-50/30 hover:bg-indigo-50/50'
                                        : 'hover:bg-slate-50/60'
                                  }`}
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <strong className="text-slate-900 font-bold">{branchItem.branchName}</strong>
                                      {branchItem.isPreferred && (
                                        <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                          ★ Preferred
                                        </span>
                                      )}
                                      {isSelectedCurrent && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                          Assigned Now
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">{branchItem.branchCode} • {branchItem.branchCity}</span>
                                  </td>
                                  <td className="p-3 font-black text-slate-900">
                                    {branchItem.currencies && branchItem.currencies.length > 0 ? (
                                      <div className="space-y-1">
                                        {branchItem.currencies.map((c: any, i: number) => (
                                          <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                            <span>{getCurrencyFlag(c.currencyCode)}</span>
                                            <span>{c.currencySymbol}{Number(c.availableStock).toLocaleString()} {c.currencyCode}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span>{branchItem.currencySymbol}{Number(branchItem.availableStock).toLocaleString()} {branchItem.requestedCurrency}</span>
                                    )}
                                  </td>
                                  <td className="p-3 font-semibold text-slate-500">
                                    {branchItem.currencies && branchItem.currencies.length > 0 ? (
                                      <div className="space-y-1">
                                        {branchItem.currencies.map((c: any, i: number) => (
                                          <div key={i} className="text-xs">
                                            <span>{c.currencySymbol}{Number(c.reservedStock).toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span>{branchItem.currencySymbol}{Number(branchItem.reservedStock).toLocaleString()}</span>
                                    )}
                                  </td>
                                  <td className="p-3 font-bold text-blue-700">
                                    {branchItem.currencies && branchItem.currencies.length > 0 ? (
                                      <div className="space-y-1">
                                        {branchItem.currencies.map((c: any, i: number) => (
                                          <div key={i} className="text-xs">
                                            <span>{c.currencySymbol}{Number(c.remainingStock).toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span>{branchItem.currencySymbol}{Number(branchItem.remainingStock).toLocaleString()}</span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {branchItem.status === 'HEALTHY' ? (
                                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                                        HEALTHY
                                      </span>
                                    ) : branchItem.status === 'LOW' ? (
                                      <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                                        LOW STOCK
                                      </span>
                                    ) : (
                                      <span className="bg-red-100 text-red-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                                        CRITICAL
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {branchItem.recommendationTag === 'RECOMMENDED' ? (
                                      <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1 w-max">
                                        ⭐ RECOMMENDED
                                      </span>
                                    ) : branchItem.recommendationTag === 'ALTERNATIVE' ? (
                                      <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                        Alternative
                                      </span>
                                    ) : branchItem.recommendationTag === 'NOT_RECOMMENDED' ? (
                                      <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                        Not Recommended
                                      </span>
                                    ) : (
                                      <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                        Unavailable
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    {isSelectedCurrent ? (
                                      <span className="text-[11px] text-slate-400 font-extrabold">Active Branch</span>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setPendingTargetBranch(branchItem);
                                          setSmartReassignReasonInput(
                                            branchItem.isPreferred
                                              ? `Assigned to customer preferred branch ${branchItem.branchName}.`
                                              : `Reassigned to ${branchItem.branchName} due to inventory analysis.`
                                          );
                                          setShowSmartReassignConfirmModal(true);
                                        }}
                                        disabled={actionLoading || !branchItem.canFulfill}
                                        className={`h-7 text-[11px] font-extrabold px-2.5 rounded-lg cursor-pointer ${
                                          branchItem.canFulfill
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                      >
                                        Assign
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Purpose-Linked Compliance & KYC Documents Section */}
              {(() => {
                const purposeStr = (selectedLead.travelDatesAndPurpose || selectedLead.profile?.travelPurpose || 'TOURISM').toUpperCase();
                const isSell = selectedLead.productType === 'CASH_SELL';
                const isRemittance = selectedLead.productType === 'REMITTANCE';

                const requiredDocSpecs: Array<{ docType: string; label: string; desc: string; keywords: string[] }> = [
                  { docType: 'PAN', label: 'PAN Card (Govt Tax ID)', desc: 'Mandatory Government Identity & Tax Compliance', keywords: ['PAN'] },
                  { docType: 'PASSPORT', label: 'Passport (Front & Back)', desc: 'Mandatory for all international travel & forex under RBI', keywords: ['PASSPORT'] },
                ];

                if (isSell) {
                  requiredDocSpecs.push({ docType: 'CURRENCY_DECLARATION', label: 'Currency Surrender Form / Declaration', desc: 'Customer declaration of source of surrendered foreign currency', keywords: ['DECLARATION', 'SOURCE'] });
                } else if (isRemittance) {
                  requiredDocSpecs.push(
                    { docType: 'A2_FORM', label: 'RBI Form A2 Declaration', desc: 'Mandatory Liberalised Remittance Scheme declaration', keywords: ['A2', 'LRS'] },
                    { docType: 'BENEFICIARY_INVOICE', label: 'University Fee Invoice / Hospital Bill / Gift Deed', desc: 'Purpose supporting document for overseas wire beneficiary', keywords: ['INVOICE', 'BILL', 'OFFER', 'FEE'] }
                  );
                } else if (purposeStr.includes('EDU') || purposeStr.includes('STUDENT') || purposeStr.includes('UNIVERSITY')) {
                  requiredDocSpecs.push(
                    { docType: 'ADMIT_CARD', label: 'University Admission / Offer Letter / I-20', desc: 'Official admission letter or current university enrollment certificate', keywords: ['ADMIT', 'OFFER', 'UNIVERSITY', 'STUDENT'] },
                    { docType: 'STUDENT_VISA_TICKET', label: 'Student Visa or Confirmed Air Ticket', desc: 'Confirmed student visa sticker or international flight ticket', keywords: ['VISA', 'TICKET', 'AIR'] }
                  );
                } else if (purposeStr.includes('MED') || purposeStr.includes('HOSPITAL')) {
                  requiredDocSpecs.push(
                    { docType: 'HOSPITAL_ESTIMATE', label: 'Hospital Treatment Estimate / Doctor Letter', desc: 'Letter from overseas medical institution or attending specialist', keywords: ['HOSPITAL', 'MEDICAL', 'DOCTOR'] },
                    { docType: 'MEDICAL_VISA_TICKET', label: 'Medical Visa or Flight Ticket', desc: 'Confirmed flight ticket or medical travel visa', keywords: ['VISA', 'TICKET', 'AIR'] }
                  );
                } else if (purposeStr.includes('BUSINESS') || purposeStr.includes('CORP')) {
                  requiredDocSpecs.push(
                    { docType: 'BUSINESS_INVITATION', label: 'Business Invitation / Deputation Letter', desc: 'Invitation letter from overseas corporate entity or employer deputation', keywords: ['BUSINESS', 'INVITATION', 'DEPUTATION'] },
                    { docType: 'AIR_TICKET', label: 'Confirmed Flight Ticket', desc: 'Confirmed return/onward international flight ticket', keywords: ['TICKET', 'AIR', 'FLIGHT'] }
                  );
                } else if (purposeStr.includes('WORK') || purposeStr.includes('EMPLOYMENT')) {
                  requiredDocSpecs.push(
                    { docType: 'EMPLOYMENT_CONTRACT', label: 'Employment Contract / Work Permit', desc: 'Overseas job offer contract or valid work visa', keywords: ['EMPLOYMENT', 'CONTRACT', 'WORK'] },
                    { docType: 'AIR_TICKET', label: 'Confirmed Flight Ticket', desc: 'Confirmed flight ticket to destination country', keywords: ['TICKET', 'AIR', 'FLIGHT'] }
                  );
                } else {
                  requiredDocSpecs.push(
                    { docType: 'AIR_TICKET', label: 'Confirmed Air Ticket / Valid Visa', desc: 'Valid travel visa or confirmed international flight ticket', keywords: ['TICKET', 'AIR', 'VISA', 'FLIGHT'] }
                  );
                }

                const uploadedDocsList: any[] = selectedLead.profile?.user?.KycDocument || [];

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-indigo-600" />
                          <span>Purpose Compliance & KYC Documents</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Required documents under RBI guidelines for travel purpose: <strong className="text-slate-800">{purposeStr}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          {uploadedDocsList.length} of {requiredDocSpecs.length} Uploaded
                        </span>
                      </div>
                    </div>

                    {!selectedLead.assignedStaffId && (
                      <div className="p-3 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-indigo-50 border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 font-black">
                            🔒
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-900">Unassigned Lead Workflow</p>
                            <p className="text-slate-500 text-[11px]">
                              You can claim this lead now, or simply upload documents directly—it will automatically claim this case to your account.
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleClaim(selectedLead.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-7 px-3 rounded-xl shrink-0 shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <UserPlus size={12} />
                          <span>Claim Lead Now</span>
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requiredDocSpecs.map((spec) => {
                        const matchingDoc = uploadedDocsList.find((d: any) => {
                          const dt = (d.docType || '').toUpperCase();
                          return dt === spec.docType || spec.keywords.some(kw => dt.includes(kw));
                        });

                        const inputId = `staff-upload-${spec.docType}-${selectedLead.id}`;

                        if (matchingDoc) {
                          const fileUrl = matchingDoc.filePath?.startsWith('uploads/') 
                            ? `${API_URL.replace('/api/v1', '')}/${matchingDoc.filePath}`
                            : `${API_URL.replace('/api/v1', '')}/uploads/${matchingDoc.filePath}`;
                          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(matchingDoc.filePath || '');
                          const ocrConf = matchingDoc.ocrData?.ocrConfidence || 0;
                          const ocrData = matchingDoc.ocrData?.extractedData || {};

                          return (
                            <Card key={spec.docType} className="rounded-2xl border-gray-200 overflow-hidden shadow-2xs bg-white">
                              <div className="flex h-40">
                                <div className="w-32 bg-slate-900 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                                  {isImage ? (
                                    <div 
                                      onClick={() => { setActiveDocumentUrl(fileUrl); setActiveDocumentType(matchingDoc.docType); }}
                                      className="cursor-zoom-in w-full h-full"
                                    >
                                      <img src={fileUrl} className="w-full h-full object-cover hover:scale-105 transition-transform" alt={spec.label} />
                                    </div>
                                  ) : (
                                    <FileText className="w-10 h-10 text-slate-400" />
                                  )}
                                  <div className="absolute inset-0 bg-slate-950/65 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity p-1 text-center">
                                    <button 
                                      onClick={() => { setActiveDocumentUrl(fileUrl); setActiveDocumentType(matchingDoc.docType); }}
                                      className="text-white text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer w-max"
                                    >
                                      Preview <Eye size={11} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1 p-3 text-[10px] font-semibold text-gray-800 space-y-1.5 flex flex-col justify-between overflow-y-auto">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                      <Badge className="bg-indigo-100 text-indigo-700 font-extrabold text-[9px] truncate max-w-[130px]">{spec.label}</Badge>
                                      <Badge variant="outline" className={matchingDoc.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
                                        {matchingDoc.status}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-400 uppercase font-bold text-[8px] tracking-wider">Document Details</p>
                                    {matchingDoc.ocrData ? (
                                      <div className="space-y-0.5 text-slate-700">
                                        <p><span className="text-gray-400">Doc ID:</span> {ocrData.documentNumber || 'N/A'}</p>
                                        <p><span className="text-gray-400">Name:</span> {ocrData.name || ocrData.fullName || 'N/A'}</p>
                                        <p><span className="text-gray-400">Confidence:</span> {(ocrConf * 100).toFixed(0)}%</p>
                                      </div>
                                    ) : (
                                      <p className="text-emerald-700 font-bold">✓ Verified Document Attached</p>
                                    )}
                                  </div>

                                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                                    <input
                                      type="file"
                                      id={inputId}
                                      className="hidden"
                                      accept="image/*,application/pdf"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          handleStaffUploadDoc(selectedLead.id, spec.docType, e.target.files[0]);
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={inputId}
                                      className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
                                    >
                                      <Upload className="w-2.5 h-2.5" />
                                      <span>Replace Scan</span>
                                    </label>
                                    <span className="text-[8px] text-slate-400">Staff Mode</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        }

                        // Document NOT yet uploaded by customer -> Show Staff Assist Verification & Upload Card
                        return (
                          <Card key={spec.docType} className="rounded-2xl border-dashed border-2 border-amber-300/80 bg-amber-50/25 p-4 space-y-3 shadow-2xs">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-amber-900 font-black text-xs">{spec.label}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug">{spec.desc}</p>
                              </div>
                              <span className="bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                                ⚠️ PENDING SUBMISSION
                              </span>
                            </div>

                            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <Upload className="w-3 h-3 text-indigo-600" />
                                <span>Attach customer document:</span>
                              </span>

                              {/* Hidden file input for staff upload */}
                              <input
                                type="file"
                                id={inputId}
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleStaffUploadDoc(selectedLead.id, spec.docType, e.target.files[0]);
                                  }
                                }}
                              />

                              <label
                                htmlFor={inputId}
                                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-3.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Document (Staff)</span>
                              </label>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* 4. CRM Timeline Log & Note entry */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Timeline status logs */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Lead Activity Timeline</h4>
                  <div className="relative border-l border-gray-100 pl-4 space-y-4 ml-2">
                    {selectedLead.history && selectedLead.history.map((hist: any, index: number) => (
                      <div key={hist.id || index} className="relative text-xs">
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 bg-indigo-100 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                        </div>
                        <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl">
                          <p className="font-bold text-gray-900 mb-0.5">
                            Status changed to <span className="text-indigo-600">{hist.status}</span>
                          </p>
                          <p className="text-gray-500 font-medium text-[11px] leading-relaxed">
                            {hist.comments || 'No comments left.'}
                          </p>
                          <span className="text-[10px] text-gray-400 font-bold block mt-1.5">
                            By {hist.changedBy?.fullName || 'Staff'} • {format(new Date(hist.createdAt), 'PP p')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Internal Notes */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Internal Notes Form</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <textarea
                      placeholder="Add an internal CRM memo or custom operational note for this customer case..."
                      className="w-full h-24 border border-gray-200 focus-visible:ring-indigo-500 text-xs font-semibold p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white rounded-xl"
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={actionLoading || !notesText.trim()}
                        onClick={() => handleLeadAction(selectedLead.id, 'ADD_NOTE')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl h-8 px-4 flex items-center gap-1"
                      >
                        <Send size={12} /> Post Internal Memo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* High-Resolution Document Lightbox Modal */}
      {activeDocumentUrl && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => { setActiveDocumentUrl(null); setActiveDocumentType(null); }}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                {activeDocumentType || 'Document Preview'}
              </h3>
              <button 
                onClick={() => { setActiveDocumentUrl(null); setActiveDocumentType(null); }}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 p-6 bg-slate-100 overflow-auto flex items-center justify-center">
              {activeDocumentUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={`${activeDocumentUrl}#toolbar=0`} className="w-full h-[70vh] rounded-xl border border-gray-200 shadow-sm bg-white" />
              ) : (
                <img src={activeDocumentUrl} alt="Document Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm border border-gray-200 bg-white" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Branch Vault Inventory Modal */}
      {showInventory && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowInventory(false)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div>
                <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-indigo-600" />
                  Branch Vault Inventory
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">Live physical cash stock currently held at your branch</p>
              </div>
              <button 
                onClick={() => setShowInventory(false)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
              {branchVaults.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h4 className="text-gray-900 font-bold">Vault Empty</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">There are currently no currencies loaded into this branch's vault.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {branchVaults.map((vault) => (
                    <Card key={vault.id} className="rounded-2xl border-gray-200 shadow-sm overflow-hidden bg-white">
                      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                        <div>
                          <Badge className="bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase mb-2">
                            {vault.currency?.code}
                          </Badge>
                          <h4 className="font-black text-gray-900 text-2xl flex items-center gap-1.5">
                            {vault.currency?.symbol}{Number(vault.totalBalance).toLocaleString('en-US')}
                          </h4>
                        </div>
                      </div>
                      <div className="p-5 bg-white">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Denomination Breakdown</p>
                        {vault.denominations && vault.denominations.length > 0 ? (
                          <div className="space-y-2">
                            {vault.denominations.map((denom: any) => (
                              <div key={denom.id} className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-600 flex items-center gap-2">
                                  <div className="w-8 h-5 bg-green-50 border border-green-100 rounded flex items-center justify-center">
                                    <span className="text-[10px] font-black text-green-700">{vault.currency?.symbol}{denom.denomination}</span>
                                  </div>
                                  <span className="text-xs text-gray-400">× {denom.count} notes</span>
                                </span>
                                <span className="font-black text-gray-900">
                                  {vault.currency?.symbol}{Number(denom.amount).toLocaleString('en-US')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No denominations recorded</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC Rejection Modal */}
      {showRejectModal && selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Reject KYC Verification
              </h3>
              <button 
                onClick={() => { setShowRejectModal(false); setRejectionNotes(''); }}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rejection Reason</label>
                <select 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  {REJECTION_REASONS.map(reason => (
                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {rejectionReason === 'OTHER' ? 'Rejection Details (Required)' : 'Additional Comments (Optional)'}
                </label>
                <textarea 
                  rows={4}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder={rejectionReason === 'OTHER' ? "Please explain why the document is being rejected..." : "Provide clear instructions for the customer to fix..."}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/50">
              <Button 
                variant="outline"
                onClick={() => { setShowRejectModal(false); setRejectionNotes(''); }}
                className="font-bold border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (rejectionReason === 'OTHER' && !rejectionNotes.trim()) {
                    alert('Please specify a rejection reason details.');
                    return;
                  }
                  const selectedReason = REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || 'Rejection reason';
                  const finalNotes = rejectionReason === 'OTHER' ? rejectionNotes : `${selectedReason}. ${rejectionNotes}`;
                  
                  try {
                    await handleLeadAction(selectedLead.id, 'REJECT_KYC', finalNotes);
                    setShowRejectModal(false);
                    setRejectionNotes('');
                    setRejectionReason('BLURRY_DOCUMENT');
                  } catch (err: any) {
                    alert(err.message || 'Failed to reject KYC');
                  }
                }}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-1.5"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Forward to Partner Dealer */}
      {showForwardModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">Forward to Partner Dealer</h3>
              <button onClick={() => setShowForwardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              You are manually forwarding remittance case <strong className="font-mono text-gray-900">{selectedLead.orderNumber}</strong> to the partner dealer for international execution.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Partner Reference No. (Optional)</label>
                <input
                  value={partnerRef}
                  onChange={e => setPartnerRef(e.target.value)}
                  placeholder="e.g. DLR-REF-99203"
                  className="w-full border rounded-lg p-2 text-xs font-mono font-bold bg-slate-50 focus:bg-white focus:outline-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Internal Operational Remarks (Optional)</label>
                <textarea
                  value={partnerRemarks}
                  onChange={e => setPartnerRemarks(e.target.value)}
                  placeholder="e.g. Verified university invoice and student offer letter."
                  className="w-full border rounded-lg p-2 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-indigo-500 h-20"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                onClick={() => handleForwardToPartner(selectedLead.id)}
                disabled={actionLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9"
              >
                {actionLoading ? 'Forwarding...' : '🚀 Confirm & Forward to Partner'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForwardModal(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Send to Branch */}
      {showSendToBranchModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🚀</span> Send Case to Branch
              </h3>
              <button onClick={() => setShowSendToBranchModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Completing compliance will <strong>lock all compliance data into read-only mode</strong> and transfer branch execution ownership to <strong>{selectedLead.currentBranch?.branchName || selectedLead.branch?.branchName || 'Branch'}</strong>.
            </p>
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 block mb-1">Central Staff Remarks / Handover Notes (Optional)</label>
              <textarea
                value={sendToBranchRemarks}
                onChange={e => setSendToBranchRemarks(e.target.value)}
                placeholder="e.g. Verified original passport & PAN. Currency cash allocation complete."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-indigo-500 h-24"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleSendToBranch(selectedLead.id, sendToBranchRemarks)}
                disabled={actionLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'Transferring...' : '🔒 Confirm & Send to Branch'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSendToBranchModal(false)}
                className="font-bold border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reassign Branch (Same City Only) */}
      {showReassignModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🔄</span> Reassign Branch (Same City Only)
              </h3>
              <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs font-medium">
              ⚠️ <strong>Warning:</strong> Reassigning branch will change the operational branch for this order. Customer will be notified of the branch change.
            </div>
            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Select Destination Branch ({selectedLead.branch?.branchCity || 'Same City'})</label>
                <select
                  value={targetBranchId}
                  onChange={e => setTargetBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500 text-slate-800"
                >
                  <option value="">-- Select Destination Branch --</option>
                  {sameCityBranches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.branchName} ({b.branchCode}) - {b.branchCity}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Mandatory Reassignment Reason</label>
                <textarea
                  value={reassignReason}
                  onChange={e => setReassignReason(e.target.value)}
                  placeholder="e.g. Original branch inventory shortage; customer requested nearby branch pickup."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-indigo-500 h-20"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleReassignBranch(selectedLead.id, targetBranchId, reassignReason)}
                disabled={actionLoading || !targetBranchId || !reassignReason.trim()}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'Reassigning...' : 'Confirm Reassignment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReassignModal(false)}
                className="font-bold border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Step 5 Smart Reassignment Confirmation Modal */}
      {showSmartReassignConfirmModal && selectedLead && pendingTargetBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg p-6 space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🔀</span> Confirm Branch Reassignment
              </h3>
              <button onClick={() => setShowSmartReassignConfirmModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Step 5 Comparison Diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                  <span className="text-[10px] text-indigo-700 font-extrabold uppercase block mb-1">Customer Preferred Branch</span>
                  <strong className="text-indigo-950 text-sm block font-black">{cityComparisonData?.preferredBranch?.branchName || 'Preferred Branch'}</strong>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Available: {cityComparisonData?.currencySymbol}{cityComparisonData?.preferredBranch?.availableStock?.toLocaleString()} {cityComparisonData?.requestedCurrency}
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="text-[10px] text-emerald-700 font-extrabold uppercase block mb-1">New Assigned Branch</span>
                  <strong className="text-emerald-950 text-sm block font-black">{pendingTargetBranch.branchName}</strong>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                    Available: {cityComparisonData?.currencySymbol}{pendingTargetBranch.availableStock?.toLocaleString()} {cityComparisonData?.requestedCurrency}
                  </span>
                </div>
              </div>

              <div className="text-xs bg-white p-3 rounded-xl border border-slate-200 space-y-1 font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Number:</span>
                  <strong className="text-slate-900">{selectedLead.orderNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Amount:</span>
                  <strong className="text-slate-900">{cityComparisonData?.currencySymbol}{cityComparisonData?.requestedAmount?.toLocaleString()} {cityComparisonData?.requestedCurrency}</strong>
                </div>
                {cityComparisonData?.preferredShortage > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Preferred Branch Shortage:</span>
                    <span>{cityComparisonData?.currencySymbol}{cityComparisonData?.preferredShortage?.toLocaleString()} {cityComparisonData?.requestedCurrency}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 block mb-1 uppercase">Reassignment Reason Log</label>
              <textarea
                value={smartReassignReasonInput}
                onChange={e => setSmartReassignReasonInput(e.target.value)}
                placeholder="e.g. Reassigned to MG Road Branch due to preferred branch inventory shortage."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-indigo-500 h-20"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs font-medium space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>ℹ️</span> System Notification Warning:
              </p>
              <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 font-medium pl-1">
                <li>Generates permanent audit log event <strong className="font-black text-amber-950">BRANCH_REASSIGNED</strong></li>
                <li>Notifies target Branch Manager at {pendingTargetBranch.branchName}</li>
                <li>Notifies customer via in-app & email/SMS update</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleSmartAssignBranch(selectedLead.id, pendingTargetBranch.id, smartReassignReasonInput)}
                disabled={actionLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'Assigning...' : '✓ Confirm Assignment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSmartReassignConfirmModal(false)}
                className="font-bold border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
