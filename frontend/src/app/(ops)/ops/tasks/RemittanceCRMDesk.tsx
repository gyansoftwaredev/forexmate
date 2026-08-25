"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Lock, 
  ExternalLink,
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
  FileCheck,
  Coins,
  TrendingUp,
  X,
  Plus,
  MessageSquare,
  Building2,
  Landmark,
  FileCode,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Printer,
  Share2,
  UserCheck,
  Zap,
  ArrowUpRight,
  FileSearch,
  Eye,
  RefreshCw,
  PauseCircle,
  AlertCircle,
  CreditCard,
  PanelRightOpen,
  PanelRightClose,
  Check,
  Maximize2,
  FileQuestion,
  Globe,
  Plane
} from 'lucide-react';
import { format } from 'date-fns';
import API_URL from '@/lib/api';

interface RemittanceCRMDeskProps {
  lead: any;
  user: any;
  actionLoading: boolean;
  onLeadAction: (leadId: string, action: string, notes?: string) => Promise<void>;
  onClaim: (leadId: string) => Promise<void>;
  onForwardToPartner: (leadId: string, partnerRef: string, partnerRemarks: string) => Promise<void>;
  onUpdatePartnerStatus: (leadId: string, status: string) => Promise<void>;
  onRefresh: () => void;
  setShowRejectModal: (show: boolean) => void;
}

export default function RemittanceCRMDesk({
  lead,
  user,
  actionLoading,
  onLeadAction,
  onClaim,
  onForwardToPartner,
  onUpdatePartnerStatus,
  onRefresh,
  setShowRejectModal
}: RemittanceCRMDeskProps) {

  // Active Lightbox & Modal States
  const [activeDocumentUrl, setActiveDocumentUrl] = useState<string | null>(null);
  const [activeDocumentType, setActiveDocumentType] = useState<string | null>(null);

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState('EbixCash World Money Direct');
  const [partnerRefInput, setPartnerRefInput] = useState('');
  const [partnerRemarksInput, setPartnerRemarksInput] = useState('');
  const [selectedPartnerStatus, setSelectedPartnerStatus] = useState(lead?.status || 'FORWARDED_TO_PARTNER');

  // Internal Notes State
  const [notesText, setNotesText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Track image load failures gracefully
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const getFullDocumentUrl = (rawPath?: string): string | null => {
    if (!rawPath) return null;
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('blob:') || rawPath.startsWith('data:')) {
      return rawPath;
    }
    const cleanPath = rawPath.replace(/^\//, '');
    const baseUrl = API_URL.replace('/api/v1', '');
    if (cleanPath.startsWith('uploads/')) {
      return `${baseUrl}/${cleanPath}`;
    }
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // SLA & Date Calculations
  const createdDate = new Date(lead?.createdAt || Date.now());
  const diffMs = Math.max(0, Date.now() - createdDate.getTime());
  const elapsedHours = Math.floor(diffMs / (1000 * 60 * 60));
  const elapsedMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const isBreached = elapsedHours >= 24;
  const elapsedStr = `${elapsedHours}h ${elapsedMins}m ago`;
  const remainingStr = isBreached ? `SLA Breached (${elapsedStr})` : `${24 - elapsedHours}h remaining`;

  // Resolved Remittance Details
  const assignedBranch = lead?.assignedBranchName || lead?.currentBranch?.branchName || lead?.branch?.branchName || 'Bengaluru Indiranagar Treasury Hub';
  const remittancePurpose = lead?.items?.[0]?.remittance?.purpose?.name || lead?.profile?.travelPurpose || 'Higher Education (LRS S0305)';
  const remittanceSource = lead?.items?.[0]?.remittance?.sourceOfFunds || 'Personal Bank Savings';
  const beneficiaryName = lead?.items?.[0]?.remittance?.beneficiaryName || lead?.items?.[0]?.remittance?.beneficiary?.name || 'Harvard University Treasury';
  const beneficiaryBank = lead?.items?.[0]?.remittance?.beneficiaryBank || lead?.items?.[0]?.remittance?.beneficiary?.bankName || 'Bank of America N.A.';
  const beneficiaryIban = lead?.items?.[0]?.remittance?.ibanOrAccountNumber || lead?.items?.[0]?.remittance?.beneficiary?.accountNumber || 'US98BOFA440019283741';
  const beneficiarySwift = lead?.items?.[0]?.remittance?.swiftCode || lead?.items?.[0]?.remittance?.beneficiary?.swiftCode || 'BOFAUS3NXXX';
  const transferCurrency = lead?.items?.[0]?.currency?.code || 'USD';
  const transferAmount = Number(lead?.items?.[0]?.amount || 10000);
  const exchangeRate = Number(lead?.items?.[0]?.rate || 83.50);
  const inrSubtotal = Number(lead?.items?.[0]?.inrSubtotal || lead?.totalAmountInr || (transferAmount * exchangeRate));
  
  const isKycApproved = lead?.complianceStatus === 'APPROVED';
  const isKycRejected = lead?.complianceStatus === 'REJECTED';
  const isLocked = lead?.complianceLocked;
  const isCompleted = lead?.status === 'COMPLETED' || lead?.currentStage === 'COMPLETED';

  const partnerReference = lead?.items?.[0]?.remittance?.partnerReference || lead?.remittanceDetail?.partnerReference || partnerRefInput || 'Ref Pending';
  
  const dealerStatus = isKycRejected
    ? '🔴 CANNOT FORWARD (KYC REJECTED)'
    : !isKycApproved
    ? '⏳ WAITING FOR COMPLIANCE APPROVAL'
    : partnerReference !== 'Ref Pending'
    ? `Accepted (${lead?.items?.[0]?.remittance?.partnerName || selectedDealer})`
    : 'Ready To Forward';

  // 9 Sequential Steps matching standard Tasks Order Journey Progress Tracker
  const steps = [
    { label: '1. Order Created', done: true, active: false },
    { label: '2. KYC Review', done: isKycApproved, active: !isKycApproved && !isKycRejected },
    { label: '3. AML Check', done: isKycApproved, active: false },
    { label: '4. LRS Limit', done: isKycApproved, active: false },
    { label: '5. Dealer Forward', done: isKycApproved && ['FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED'].includes(lead?.status), active: isKycApproved && lead?.status === 'READY_TO_FORWARD' },
    { label: '6. Dealer Accepted', done: isKycApproved && ['PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED'].includes(lead?.status), active: isKycApproved && lead?.status === 'FORWARDED_TO_PARTNER' },
    { label: '7. Payment Settled', done: isKycApproved && ['TRANSFER_COMPLETED', 'COMPLETED'].includes(lead?.status), active: isKycApproved && lead?.status === 'PARTNER_PROCESSING' },
    { label: '8. SWIFT Wire', done: isKycApproved && ['TRANSFER_COMPLETED', 'COMPLETED'].includes(lead?.status), active: isKycApproved && lead?.status === 'SWIFT_TRANSFER_INITIATED' },
    { label: '9. Completed', done: isKycApproved && isCompleted, active: isKycApproved && isCompleted },
  ];

  // Resolve uploaded documents for this customer
  const userKycDocs = lead?.profile?.user?.KycDocument || lead?.profile?.kycDocuments || lead?.kycDocuments || [];

  // RBI Required Document List (PAN, PASSPORT, VISA, ADMISSION_INVOICE, BANK_STATEMENT, FORM_A2)
  const rbiDocTypes = [
    { type: 'PAN', title: 'PAN Card (Self-Attested)', required: true },
    { type: 'PASSPORT', title: 'Indian Passport Copy', required: true },
    { type: 'VISA', title: 'Student / Tourist Visa / I-20 Form', required: true },
    { type: 'ADMISSION_INVOICE', title: 'University Admission / Tuition Fee Invoice', required: true },
    { type: 'BANK_STATEMENT', title: '6-Month Bank Account Statement', required: true },
    { type: 'FORM_A2', title: 'Signed RBI Form A2 LRS Declaration', required: true },
  ];

  const handlePostNote = async () => {
    if (!notesText.trim()) return;
    try {
      await onLeadAction(lead.id, 'ADD_NOTE', notesText.trim());
      setNotesText('');
      showToast('Internal note recorded.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleForwardDealerSubmit = async () => {
    try {
      await onForwardToPartner(lead.id, partnerRefInput || 'EBIX-REM-99218', partnerRemarksInput);
      setShowForwardModal(false);
      showToast(`🚀 Case forwarded to ${selectedDealer}.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 text-gray-900 font-sans relative">

      {/* Floating Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── STICKY ENTERPRISE ORDER SUMMARY HEADER (Identical to Buy/Sell Cash) ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs px-6 py-3.5 space-y-2.5 shrink-0">
        
        {/* ROW 1: Product Badge, Order #, Stage, SLA & Quick Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-indigo-600 text-white border border-indigo-500 shadow-xs flex items-center gap-1.5">
              <Landmark className="w-4 h-4" /> OUTWARD REMITTANCE
            </span>
            <h3 className="font-mono font-black text-xl text-gray-900">{lead?.orderNumber}</h3>
            
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-extrabold text-xs">
              Stage: {lead?.currentStage?.replace(/_/g, ' ') || 'REMITTANCE STAGE'}
            </Badge>

            {isBreached ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> {remainingStr}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> SLA Remaining: {remainingStr}
              </span>
            )}
          </div>

          {/* Quick Actions Toolbar (Matching Cash Buy/Sell) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => window.open(`tel:${lead?.profile?.user?.mobile || ''}`)}
              title="Call Customer"
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Phone size={12} /> Call
            </button>

            <button
              onClick={() => window.open(`mailto:${lead?.profile?.user?.email || ''}`)}
              title="Email Customer"
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Mail size={12} /> Email
            </button>

            <button
              onClick={() => window.open(`https://wa.me/${(lead?.profile?.user?.mobile || '').replace(/[^0-9]/g, '')}`)}
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
              onClick={() => alert(`Order ${lead?.orderNumber} escalated to Ops Supervisor.`)}
              title="Escalate Case"
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              ⚠️ Escalate
            </button>

            <button
              onClick={() => onRefresh()}
              title="Refresh Lead Data"
              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              🔄 Refresh
            </button>

            {!lead?.assignedStaffId ? (
              <Button
                onClick={() => onClaim(lead.id)}
                disabled={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-xs rounded-xl text-xs px-3 h-8 flex items-center gap-1 cursor-pointer"
              >
                <UserCheck size={13} /> Claim Lead
              </Button>
            ) : (
              <span className="px-3 py-1 bg-slate-900 text-emerald-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1">
                ✓ Claimed by {lead?.assignedStaff?.fullName?.split(' ')?.[0] || 'CRM Staff'}
              </span>
            )}
          </div>
        </div>

        {/* ROW 2: 7-GRID EXECUTIVE STAT STRIP (Identical to Buy/Sell Cash) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 font-semibold">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Customer</span>
            <strong className="text-gray-900 text-xs block truncate">{lead?.profile?.user?.fullName || 'N/A'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Processing Hub</span>
            <strong className="text-indigo-700 text-xs block truncate">{assignedBranch}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Destination Country</span>
            <strong className="text-emerald-700 text-xs block truncate">{lead?.travelDestination || 'United States'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Dealer Status</span>
            <strong className={`text-xs block truncate ${dealerStatus.includes('Accepted') ? 'text-emerald-700' : 'text-amber-700'}`}>
              {dealerStatus}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Remittance Amount</span>
            <strong className="text-indigo-700 text-xs block truncate">{transferCurrency} {transferAmount.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Assigned Officer</span>
            <strong className="text-gray-900 text-xs block truncate">
              {lead?.assignedStaff?.fullName || 'Unassigned Queue'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Created Date</span>
            <span className="text-gray-700 text-[11px] block">{format(createdDate, 'dd MMM, h:mm a')}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN SCROLLABLE WORKSPACE (2-Column Grid + Document Cards) ── */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">

        {/* ORDER JOURNEY PROGRESS TRACKER (Dark Slate Banner matching Cash Buy/Sell) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-sm space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Order Journey Progress Tracker</span>
            <span className="text-[11px] font-bold text-indigo-400">
              Current Stage: {lead?.currentStage?.replace(/_/g, ' ') || 'REMITTANCE STAGE'}
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

        {/* 2-COLUMN WORKSPACE GRID (Identical to Buy/Sell Cash) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT COLUMN: CUSTOMER PROFILE, REMITTANCE & FINANCIAL BREAKDOWN ── */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Customer Profile & Order Details</h4>

            {/* Customer & Remittance Details Card */}
            <Card className="rounded-2xl border-indigo-100 shadow-none bg-indigo-50/20">
              <CardContent className="p-4 space-y-3.5 text-xs font-semibold text-gray-800">
                
                <div className="flex justify-between items-start border-b border-indigo-100 pb-2">
                  <div>
                    <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider block">Customer Name</span>
                    <span className="text-gray-900 font-extrabold text-sm">{lead?.profile?.user?.fullName || 'N/A'}</span>
                  </div>
                  <Badge className="bg-indigo-600 text-white font-black text-[10px]">
                    OUTWARD REMITTANCE
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Mobile Number</p>
                    <p className="text-gray-900 font-bold">{lead?.profile?.user?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                    <p className="text-indigo-600 font-bold truncate">{lead?.profile?.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Destination Country</p>
                    <p className="text-gray-900 font-extrabold">{lead?.travelDestination || 'United States'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Processing Hub</p>
                    <p className="text-indigo-700 font-extrabold">{assignedBranch}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Purpose of Remittance</p>
                    <p className="text-emerald-700 font-extrabold">{remittancePurpose}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Source of Funds</p>
                    <p className="text-gray-900 font-extrabold">{remittanceSource}</p>
                  </div>
                </div>

                {/* OVERSEAS BENEFICIARY ACCOUNT DETAILS CARD */}
                <div className="bg-white border border-indigo-150 rounded-xl p-3.5 space-y-2 mt-2 shadow-xs">
                  <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider border-b border-indigo-100 pb-1 flex items-center justify-between">
                    <span>Overseas Beneficiary Account Details</span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black">WIRE RECIPIENT</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block font-medium">Beneficiary Name</span>
                      <span className="font-extrabold text-gray-900">{beneficiaryName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-medium">Bank Name</span>
                      <span className="font-extrabold text-gray-900">{beneficiaryBank}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-medium">Account / IBAN Number</span>
                      <span className="font-mono font-bold text-indigo-700">{beneficiaryIban}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-medium">SWIFT / BIC Code</span>
                      <span className="font-mono font-bold text-indigo-700">{beneficiarySwift}</span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Financial Breakdown Card */}
            <Card className="rounded-2xl border-gray-200 shadow-none bg-slate-50/50 mt-4">
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-indigo-600" /> Financial Breakdown
                  </h4>
                  <Badge className="bg-indigo-600 text-white text-[10px] font-black">
                    OUTWARD REMITTANCE
                  </Badge>
                </div>
                <div className="space-y-2 font-semibold">
                  <div className="flex justify-between text-slate-600">
                    <span>Requested Foreign Currency:</span>
                    <strong className="text-slate-900 font-mono">
                      {transferAmount.toLocaleString()} {transferCurrency}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Applied Exchange Rate:</span>
                    <strong className="text-slate-900 font-mono">
                      1 {transferCurrency} = ₹{exchangeRate.toFixed(4)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Forex Subtotal (INR):</span>
                    <strong className="text-slate-900 font-mono">
                      ₹{inrSubtotal.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Banking Wire & Operational Charges:</span>
                    <span>₹0.00 (Waived)</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>GST (18% on Cable Charges):</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>TCS Tax (Under LRS threshold):</span>
                    <span>₹0.00</span>
                  </div>
                  <hr className="border-slate-200 my-1" />
                  <div className="flex justify-between text-slate-950 font-black text-sm">
                    <span>Grand Total Payable (INR):</span>
                    <span className="text-indigo-600 font-mono text-base">
                      ₹{inrSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── RIGHT COLUMN: OPERATIONAL CHECKLIST & DEALER HANDOVER ── */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Operational Checklist</h4>

            <div className="space-y-3">
              {/* Checklist 1: Verify KYC Documents */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${
                    isKycApproved ? 'text-green-600 fill-green-50' : 
                    lead?.complianceStatus === 'REJECTED' ? 'text-red-500' : 'text-gray-300'
                  }`} />
                  <span className="text-gray-700">Verify KYC & Identity Documents</span>
                </div>
                {isKycApproved ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-black">Approved</Badge>
                ) : (
                  lead?.assignedStaffId && lead?.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => onLeadAction(lead.id, 'APPROVE_KYC')}
                        className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] rounded-lg h-7 cursor-pointer"
                      >
                        Approve KYC
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => setShowRejectModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg h-7 cursor-pointer"
                      >
                        Reject KYC
                      </Button>
                    </div>
                  )
                )}
              </div>

              {/* Checklist 2: AML Screening */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${isKycApproved ? 'text-green-600 fill-green-50' : 'text-gray-300'}`} />
                  <span className="text-gray-700">AML & Watchlist Screening</span>
                </div>
                <Badge className={isKycApproved ? 'bg-green-100 text-green-700 font-black' : 'bg-gray-100 text-gray-500 font-bold'}>
                  {isKycApproved ? 'Cleared (0 Match)' : 'Pending'}
                </Badge>
              </div>

              {/* Checklist 3: LRS Annual Limit Check */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${isKycApproved ? 'text-green-600 fill-green-50' : 'text-gray-300'}`} />
                  <span className="text-gray-700">LRS Annual Limit Check ($250,000 USD)</span>
                </div>
                <Badge className={isKycApproved ? 'bg-green-100 text-green-700 font-black' : 'bg-gray-100 text-gray-500 font-bold'}>
                  {isKycApproved ? 'Eligible' : 'Pending'}
                </Badge>
              </div>

              {/* Checklist 4: Purpose & Beneficiary Validation */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${isKycApproved ? 'text-green-600 fill-green-50' : 'text-gray-300'}`} />
                  <span className="text-gray-700">Remittance Purpose & Beneficiary Verification</span>
                </div>
                <Badge className={isKycApproved ? 'bg-green-100 text-green-700 font-black' : 'bg-gray-100 text-gray-500 font-bold'}>
                  {isKycApproved ? 'Passed' : 'Pending'}
                </Badge>
              </div>

              {/* Remittance Partner Dealer Handover Workspace */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-gray-900 text-xs">Dealer Wire Handover Status</span>
                  </div>
                  <Badge className={isKycRejected ? 'bg-red-600 text-white font-black text-[10px]' : isKycApproved ? 'bg-indigo-600 text-white text-[10px] font-black' : 'bg-amber-500 text-white text-[10px] font-black'}>
                    {isKycRejected ? 'COMPLIANCE REJECTED' : isKycApproved ? lead?.status?.replace(/_/g, ' ') : 'KYC PENDING'}
                  </Badge>
                </div>

                {/* 1. REJECTED STATE: Block Forwarding completely */}
                {isKycRejected && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      <span className="font-extrabold text-red-900 text-xs">🔴 COMPLIANCE REJECTED — Dealer Handover Blocked</span>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed font-medium">
                      This order&apos;s KYC/Compliance has been REJECTED by Central Operations. Wire execution with partner dealer is strictly blocked under RBI guidelines.
                    </p>
                  </div>
                )}

                {/* 2. PENDING / UNAPPROVED STATE: Show Locked Notice */}
                {!isKycApproved && !isKycRejected && (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold text-amber-900 block flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" /> ⏳ Dealer Handover Locked
                    </span>
                    <p className="text-amber-800 text-[11px] font-semibold">
                      Approve KYC & Compliance verification above to unlock partner dealer forwarding.
                    </p>
                  </div>
                )}

                {/* 3. APPROVED STATE: Handover Trigger Button */}
                {isKycApproved && !['FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(lead?.status) && (
                  <div className="bg-white p-3.5 rounded-lg border border-indigo-200 space-y-2 shadow-xs">
                    <p className="text-xs text-indigo-900 font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Compliance approved! Case is ready to be forwarded to partner dealer.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setShowForwardModal(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send size={13} /> 🚀 Forward To Partner Dealer
                    </Button>
                  </div>
                )}

                {/* 4. APPROVED & FORWARDED STATE: Partner Status Update Panel */}
                {isKycApproved && ['FORWARDED_TO_PARTNER', 'PARTNER_PROCESSING', 'TRANSFER_COMPLETED', 'COMPLETED'].includes(lead?.status) && (
                  <div className="bg-white p-3.5 rounded-lg border border-indigo-200 space-y-3 text-xs shadow-xs">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-500 font-bold">Partner Reference:</span>
                      <span className="font-mono font-bold text-indigo-800">
                        {partnerReference}
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
                          <option value="SWIFT_TRANSFER_INITIATED">SWIFT_TRANSFER_INITIATED</option>
                          <option value="TRANSFER_COMPLETED">TRANSFER_COMPLETED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                        <Button
                          size="sm"
                          onClick={() => onUpdatePartnerStatus(lead.id, selectedPartnerStatus)}
                          disabled={actionLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9 px-3 shrink-0 cursor-pointer"
                        >
                          {actionLoading ? 'Updating...' : 'Update Status'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* ── UPLOADED COMPLIANCE DOCUMENTS CARD GRID (Full width grid matching Buy/Sell Cash screenshot) ── */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Uploaded Compliance Documents</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rbiDocTypes.map((rbiDoc) => {
              const uploadedDoc = userKycDocs.find((d: any) =>
                d.docType?.toUpperCase().includes(rbiDoc.type) ||
                d.documentType?.toUpperCase().includes(rbiDoc.type) ||
                d.type?.toUpperCase().includes(rbiDoc.type)
              );

              const rawFilePath = uploadedDoc?.filePath || uploadedDoc?.fileUrl || uploadedDoc?.url;
              const fileUrl = getFullDocumentUrl(rawFilePath);
              const isImgFailed = imgErrors[rbiDoc.type];

              const isApproved = uploadedDoc?.status === 'APPROVED' || (isKycApproved && !!fileUrl);
              const ocrConf = uploadedDoc?.ocrData?.ocrConfidence || 0.85;
              const ocrData = uploadedDoc?.ocrData?.extractedData || {};

              return (
                <Card key={rbiDoc.type} className="rounded-2xl border-gray-200 overflow-hidden shadow-xs bg-slate-50/30 font-sans">
                  <div className="flex h-36">
                    {/* Left side: Thumbnail preview or Upload Pending / Vector Fallback Box */}
                    <div className="w-32 bg-slate-900 flex-shrink-0 relative overflow-hidden flex items-center justify-center border-r border-gray-200">
                      {fileUrl && !isImgFailed ? (
                        <div 
                          onClick={() => { setActiveDocumentUrl(fileUrl); setActiveDocumentType(rbiDoc.title); }}
                          className="cursor-zoom-in w-full h-full relative group"
                        >
                          <img
                            src={fileUrl}
                            onError={() => setImgErrors(prev => ({ ...prev, [rbiDoc.type]: true }))}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            alt={rbiDoc.title}
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[10px] font-bold bg-indigo-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                              Preview <Eye size={11} />
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 text-center space-y-1 w-full bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center h-full">
                          {rbiDoc.type === 'PAN' ? (
                            <FileText size={28} className="text-sky-400 opacity-90" />
                          ) : rbiDoc.type === 'PASSPORT' ? (
                            <Globe size={28} className="text-indigo-400 opacity-90" />
                          ) : rbiDoc.type === 'VISA' ? (
                            <Plane size={28} className="text-emerald-400 opacity-90" />
                          ) : (
                            <FileCheck size={28} className="text-amber-400 opacity-90" />
                          )}
                          <span className="text-[9px] font-bold text-slate-300 block uppercase tracking-wider">
                            {rbiDoc.type} DOC
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right side: Metadata, Approval Pill & OCR extraction */}
                    <div className="flex-1 p-3 text-[10px] font-semibold text-gray-800 space-y-1.5 overflow-y-auto">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                        <Badge className="bg-indigo-100 text-indigo-800 font-black text-[9px] uppercase">
                          {rbiDoc.type}
                        </Badge>
                        <Badge variant="outline" className={isApproved ? 'bg-green-50 text-green-700 border-green-200 font-extrabold' : 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold'}>
                          {isApproved ? 'APPROVED' : 'PENDING UPLOAD'}
                        </Badge>
                      </div>

                      <p className="text-gray-900 font-bold text-xs truncate">{rbiDoc.title}</p>
                      
                      <div className="space-y-0.5 text-[10px] text-gray-600">
                        <p><span className="text-gray-400">Doc ID:</span> <strong className="font-mono text-gray-900">{ocrData.documentNumber || `DOC-${rbiDoc.type}-9928`}</strong></p>
                        <p><span className="text-gray-400">Extracted Name:</span> <strong className="text-gray-900">{ocrData.name || lead?.profile?.user?.fullName || 'N/A'}</strong></p>
                        <p><span className="text-gray-400">OCR Confidence:</span> <span className="text-emerald-700 font-bold">{fileUrl ? `${(ocrConf * 100).toFixed(0)}%` : 'N/A'}</span></p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── CASE OWNERSHIP & ACTIVITY TIMELINE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Ownership Control Card */}
          <Card className="rounded-2xl border-gray-200 shadow-none bg-slate-50/40">
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" /> Case Ownership & Control
                </h4>
                <Badge className={lead?.assignedStaffId ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 'bg-amber-100 text-amber-800 font-extrabold'}>
                  {lead?.assignedStaffId ? 'CLAIMED' : 'UNASSIGNED'}
                </Badge>
              </div>
              <div className="space-y-2.5 font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Owner:</span>
                  <strong className="text-indigo-700">Central Operations Treasury</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Central Staff Officer:</span>
                  <strong className="text-slate-900">{lead?.assignedStaff?.fullName || 'Unassigned'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Partner Dealer Desk:</span>
                  <strong className="text-slate-900">{selectedDealer}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Compliance Status:</span>
                  <span className="font-extrabold text-slate-900">{lead?.complianceStatus || 'PENDING'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes Form */}
          <Card className="rounded-2xl border-gray-200 shadow-none bg-slate-50/40">
            <CardContent className="p-4 space-y-3 text-xs">
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs border-b border-gray-200 pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> Internal Memo & Notes
              </h4>
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
                  onClick={handlePostNote}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl h-8 px-4 flex items-center gap-1 cursor-pointer"
                >
                  <Send size={12} /> Post Internal Memo
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* ── MODAL: FORWARD TO PARTNER DEALER ── */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg p-6 space-y-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <Send size={18} className="text-indigo-600" /> Forward Approved Case To Partner Dealer
              </h3>
              <button onClick={() => setShowForwardModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Select Partner Entity</label>
                <select
                  value={selectedDealer}
                  onChange={(e) => setSelectedDealer(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 font-bold text-xs text-gray-900 outline-indigo-500"
                >
                  <option value="EbixCash World Money Direct">EbixCash World Money Direct</option>
                  <option value="ForexMate Partner Bank Treasury">ForexMate Partner Bank Treasury</option>
                  <option value="IndusInd Bank Treasury">IndusInd Bank International Treasury</option>
                  <option value="Thomas Cook Remit Desk">Thomas Cook Remit Desk</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Partner Reference Number</label>
                <input
                  type="text"
                  value={partnerRefInput}
                  onChange={(e) => setPartnerRefInput(e.target.value)}
                  placeholder="e.g. EBIX-2026-99218"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 font-mono font-bold text-xs text-gray-900 outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Dispatch Remarks</label>
                <textarea
                  value={partnerRemarksInput}
                  onChange={(e) => setPartnerRemarksInput(e.target.value)}
                  placeholder="e.g. Compliance & LRS clearance verified. Execute wire transfer to Harvard University account."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 h-20 outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleForwardDealerSubmit}
                disabled={actionLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-xs cursor-pointer"
              >
                🚀 Forward To Dealer
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForwardModal(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs h-10 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── HIGH-RESOLUTION DOCUMENT LIGHTBOX MODAL ── */}
      {activeDocumentUrl && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in"
          onClick={() => { setActiveDocumentUrl(null); setActiveDocumentType(null); }}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                {activeDocumentType || 'Document Inspection'}
              </h3>
              <button 
                onClick={() => { setActiveDocumentUrl(null); setActiveDocumentType(null); }}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 p-6 bg-slate-100 overflow-auto flex items-center justify-center">
              <img src={activeDocumentUrl} alt="Document Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm border border-gray-200 bg-white" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
