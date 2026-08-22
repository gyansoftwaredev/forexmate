"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Package,
  MapPin,
  Truck,
  BarChart3,
  History,
  Settings,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  X,
  Send,
  Building2,
  ChevronRight,
  LogOut,
  Lock,
  Camera,
  Check,
  FileText,
  DollarSign,
  User,
  Phone,
  Mail,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  Printer,
  FileDown,
  PauseCircle,
  ShieldAlert,
  XCircle,
  Sparkles,
  CheckSquare,
  Square,
  Calendar,
  CreditCard,
  Globe,
  Tag,
  Briefcase,
  Layers,
  ArrowLeft,
  CheckCircle,
  SwitchCamera,
  Trash2,
  Download,
  Maximize2,
  Plus,
} from 'lucide-react';

export default function BranchOperationsPortal() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'inventory'
    | 'city-inventory'
    | 'delivery-partners'
    | 'reports'
    | 'timeline'
    | 'settings'
    | 'profile'
  >('dashboard');

  // Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [cityBranches, setCityBranches] = useState<any[]>([]);
  const [cityCode, setCityCode] = useState<string>('');
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Selected Order Guided Workflow State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);

  // Action Form States
  const [cashDenominations, setCashDenominations] = useState<{ [denom: number]: number }>({
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
  });

  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState('');
  const [targetBranchId, setTargetBranchId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [quickActionReason, setQuickActionReason] = useState('');
  const [customerOtp, setCustomerOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [pickupRemarks, setPickupRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Real Camera-Based Evidence Capture States ───────────────────────────
  const [cameraActiveTarget, setCameraActiveTarget] = useState<'CUSTOMER' | 'BUNDLE' | 'TREASURY_SLIP' | 'INVENTORY_BUNDLE' | 'VAULT_SHELF' | null>(null);

  // Vault Stock Receipt States
  const [showReceiveInventoryModal, setShowReceiveInventoryModal] = useState(false);
  const [receiveInventoryStep, setReceiveInventoryStep] = useState<number>(1);
  const [receiveCurrencyCode, setReceiveCurrencyCode] = useState('USD');
  const [receiveAmount, setReceiveAmount] = useState<string>('');
  const [receiveSourceType, setReceiveSourceType] = useState('HQ_TREASURY_TRANSFER');
  const [receiveReferenceNumber, setReceiveReferenceNumber] = useState('');
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiveNotes, setReceiveNotes] = useState('');

  // Inventory Photo Evidence States
  const [receiveTreasurySlipPhoto, setReceiveTreasurySlipPhoto] = useState<string | null>(null);
  const [receiveBundlePhoto, setReceiveBundlePhoto] = useState<string | null>(null);
  const [receiveShelfPhoto, setReceiveShelfPhoto] = useState<string | null>(null);
  const [submittingInventoryReceipt, setSubmittingInventoryReceipt] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [customerPhotoCaptured, setCustomerPhotoCaptured] = useState<{ dataUrl: string; timestamp: string } | null>(null);
  const [bundlePhotoCaptured, setBundlePhotoCaptured] = useState<{ dataUrl: string; timestamp: string } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Pickup 9-Point Checklist State
  const [checklist, setChecklist] = useState({
    customerPresent: false,
    otpVerified: false,
    passportMatched: false,
    paymentVerified: true,
    cashCountConfirmed: false,
    customerPhotoCaptured: false,
    bundlePhotoCaptured: false,
    remarksAdded: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      loadAllData();
    }
  }, [authLoading, user, router]);

  // Real-time synchronization across all tabs & portals
  useEffect(() => {
    const handleSync = () => {
      console.log('[Sync Engine] Auto-refreshing Branch Manager Portal...');
      loadAllData();
    };

    window.addEventListener('forexmate-sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('forexmate-sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Clean up camera stream when modal closes
  useEffect(() => {
    if (!cameraActiveTarget) {
      stopCameraStream();
    }
  }, [cameraActiveTarget]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, ordersRes, cityRes, dpRes, repRes, timeRes] = await Promise.all([
        workforceFetch('/manager/dashboard').then(workforceJson).catch(() => null),
        workforceFetch('/orders').then(workforceJson).catch(() => ({ pickup: [], deliveries: [], reassigned: [] })),
        workforceFetch('/city-inventory').then(workforceJson).catch(() => ({ city: '', branches: [] })),
        workforceFetch('/manager/delivery-partners').then(workforceJson).catch(() => []),
        workforceFetch('/manager/reports').then(workforceJson).catch(() => null),
        workforceFetch('/manager/timeline').then(workforceJson).catch(() => []),
      ]);

      if (dashRes) setDashboardData(dashRes);

      const allOrdersList = [
        ...(ordersRes?.pickup || []),
        ...(ordersRes?.deliveries || []),
        ...(ordersRes?.reassigned || []),
      ];

      const uniqueOrders = Array.from(new Map(allOrdersList.map((o: any) => [o.id, o])).values());
      setOrders(uniqueOrders);

      if (cityRes) {
        setCityBranches(cityRes.branches || []);
        setCityCode(cityRes.city || '');
      }

      if (dpRes) setDeliveryPartners(dpRes);
      if (repRes) setReportsData(repRes);
      if (timeRes) setTimelineEvents(timeRes);
    } catch (err: any) {
      console.error('Failed loading branch operations data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const closeOrderWorkflow = () => {
    setSelectedOrder(null);
    loadAllData();
    window.dispatchEvent(new CustomEvent('forexmate-sync'));
    localStorage.setItem('forexmate_last_sync', Date.now().toString());
  };

  // Open Order Guided Workflow Engine
  const openOrderWorkflow = async (orderId: string) => {
    try {
      const detail = await workforceFetch(`/orders/${orderId}`).then(workforceJson);
      const ord = detail || orders.find((o) => o.id === orderId);
      setSelectedOrder(ord);
      setCustomerPhotoCaptured(null);
      setBundlePhotoCaptured(null);

      let initialStep = 1;
      if (ord?.cashAllocation) {
        initialStep = 4;
      } else if (ord?.status === 'COMPLETED') {
        initialStep = 5;
      }
      setWorkflowStep(initialStep);
      setMaxUnlockedStep(initialStep);
    } catch (err) {
      const ord = orders.find((o) => o.id === orderId);
      setSelectedOrder(ord);
      setWorkflowStep(1);
      setMaxUnlockedStep(1);
    }
  };

  // Step Progression Handler
  const advanceStep = (nextStep: number) => {
    setWorkflowStep(nextStep);
    if (nextStep > maxUnlockedStep) {
      setMaxUnlockedStep(nextStep);
    }
  };

  // ─── Camera MediaDevices Integration ──────────────────────────────────────
  const startCameraStream = async (target: 'CUSTOMER' | 'BUNDLE' | 'TREASURY_SLIP' | 'INVENTORY_BUNDLE' | 'VAULT_SHELF', facing: 'user' | 'environment' = 'user') => {
    setCameraActiveTarget(target);
    setCameraFacingMode(facing);

    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setActionMessage({ type: 'error', text: 'Camera access denied or unavailable on this device.' });
      setCameraActiveTarget(null);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCameraFacingMode = () => {
    const newFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    if (cameraActiveTarget) {
      startCameraStream(cameraActiveTarget, newFacing);
    }
  };

  const capturePhotoFrame = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActiveTarget) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Scale canvas to max 800px width for optimal Base64 payload size
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / (video.videoWidth || 800));
    canvas.width = (video.videoWidth || 800) * scale;
    canvas.height = (video.videoHeight || 600) * scale;

    // Draw video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress image to JPEG Data URL (quality 0.70)
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.70);
    const formattedTimestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

    const captureObject = {
      dataUrl: compressedDataUrl,
      timestamp: formattedTimestamp,
    };

    if (cameraActiveTarget === 'CUSTOMER') {
      setCustomerPhotoCaptured(captureObject);
      setChecklist((prev) => ({ ...prev, customerPhotoCaptured: true }));
      setActionMessage({ type: 'success', text: 'Customer Identity Photo captured & compressed successfully!' });
    } else if (cameraActiveTarget === 'BUNDLE') {
      setBundlePhotoCaptured(captureObject);
      setChecklist((prev) => ({ ...prev, bundlePhotoCaptured: true }));
      setActionMessage({ type: 'success', text: 'Currency Bundle Proof captured & compressed successfully!' });
    } else if (cameraActiveTarget === 'TREASURY_SLIP') {
      setReceiveTreasurySlipPhoto(compressedDataUrl);
      setActionMessage({ type: 'success', text: 'Treasury Slip Photo captured successfully!' });
    } else if (cameraActiveTarget === 'INVENTORY_BUNDLE') {
      setReceiveBundlePhoto(compressedDataUrl);
      setActionMessage({ type: 'success', text: 'Currency Bundle Photo captured successfully!' });
    } else if (cameraActiveTarget === 'VAULT_SHELF') {
      setReceiveShelfPhoto(compressedDataUrl);
      setActionMessage({ type: 'success', text: 'Vault Shelf Photo captured successfully!' });
    }

    stopCameraStream();
    setCameraActiveTarget(null);
  };

  const SUPPORTED_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', threshold: 5000 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', threshold: 5000 },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', threshold: 3000 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', threshold: 5000 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', threshold: 5000 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', threshold: 500000 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪', threshold: 20000 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', threshold: 5000 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦', threshold: 20000 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', threshold: 3000 },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', threshold: 5000 },
  ];

  const submitInventoryReceipt = async () => {
    if (!receiveCurrencyCode || !receiveAmount || Number(receiveAmount) <= 0) {
      alert('Please enter a valid receipt amount.');
      return;
    }
    if (!receiveReferenceNumber.trim()) {
      alert('Reference Number is mandatory.');
      return;
    }

    // Validate mandatory evidence per enterprise source type
    if ((receiveSourceType === 'HQ_TREASURY_TRANSFER' || receiveSourceType === 'COMMERCIAL_BANK_COLLECTION') && !receiveTreasurySlipPhoto) {
      alert('Treasury Slip photo evidence is required for ' + receiveSourceType.replace(/_/g, ' '));
      return;
    }
    if ((receiveSourceType === 'CUSTOMER_CASH_SELL' || receiveSourceType === 'INTER_BRANCH_TRANSFER') && !receiveBundlePhoto) {
      alert('Currency Bundle photo evidence is required for ' + receiveSourceType.replace(/_/g, ' '));
      return;
    }

    setSubmittingInventoryReceipt(true);
    try {
      const res = await workforceFetch('/manager/inventory/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currencyCode: receiveCurrencyCode,
          amount: Number(receiveAmount),
          sourceType: receiveSourceType,
          referenceNumber: receiveReferenceNumber,
          receivedDate: receiveDate,
          notes: receiveNotes,
          treasurySlipPhotoUrl: receiveTreasurySlipPhoto,
          currencyBundlePhotoUrl: receiveBundlePhoto,
          vaultShelfPhotoUrl: receiveShelfPhoto,
        }),
      }).then(workforceJson);

      if (res?.success) {
        alert(res.message || 'Inventory received successfully!');
        setShowReceiveInventoryModal(false);
        setReceiveAmount('');
        setReceiveReferenceNumber('');
        setReceiveNotes('');
        setReceiveTreasurySlipPhoto(null);
        setReceiveBundlePhoto(null);
        setReceiveShelfPhoto(null);
        setReceiveInventoryStep(1);

        loadAllData();
        window.dispatchEvent(new CustomEvent('forexmate-sync'));
      } else {
        alert(res?.message || 'Failed to receive inventory');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing inventory receipt');
    } finally {
      setSubmittingInventoryReceipt(false);
    }
  };

  // Auto Allocation Engine
  const handleAutoAllocate = () => {
    if (!selectedOrder) return;
    const requestedAmount = Number(selectedOrder?.items?.[0]?.amount || 1000);

    const denoms = [100, 50, 20, 10, 5, 2, 1];
    let rem = requestedAmount;
    const allocated: { [denom: number]: number } = {};

    for (const d of denoms) {
      const count = Math.floor(rem / d);
      allocated[d] = count;
      rem -= count * d;
    }

    setCashDenominations(allocated);
    setActionMessage({ type: 'success', text: 'Auto-allocation generated optimal vault denomination breakdown.' });
  };

  // Denomination Sum & Difference Calculation
  const totalAllocatedAmount = Object.entries(cashDenominations).reduce(
    (sum, [denom, qty]) => sum + Number(denom) * Number(qty),
    0
  );
  const requestedOrderAmount = Number(selectedOrder?.items?.[0]?.amount || 0);
  const allocationDifference = requestedOrderAmount - totalAllocatedAmount;

  // Actions
  const handleAllocateCashAndAdvance = async () => {
    if (!selectedOrder) return;
    if (allocationDifference !== 0) {
      setActionMessage({ type: 'error', text: 'Allocated total must exactly equal requested amount before saving.' });
      return;
    }

    setActionLoading(true);
    setActionMessage(null);

    const items = Object.entries(cashDenominations)
      .map(([denom, qty]) => ({ denomination: Number(denom), quantity: Number(qty) }))
      .filter((item) => item.quantity > 0);

    try {
      await workforceFetch(`/orders/${selectedOrder.id}/allocate-cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      setActionMessage({ type: 'success', text: 'Cash allocated & vault stock reserved! Proceeding to fulfillment.' });
      
      window.dispatchEvent(new CustomEvent('forexmate-sync'));
      localStorage.setItem('forexmate_last_sync', Date.now().toString());

      loadAllData();
      advanceStep(4);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to allocate cash.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignDeliveryPartnerAndAdvance = async () => {
    if (!selectedOrder || !selectedDeliveryPartnerId) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      await workforceFetch(`/orders/${selectedOrder.id}/assign-delivery-partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPartnerId: selectedDeliveryPartnerId }),
      });
      setActionMessage({ type: 'success', text: 'Delivery partner assigned successfully!' });

      window.dispatchEvent(new CustomEvent('forexmate-sync'));
      localStorage.setItem('forexmate_last_sync', Date.now().toString());

      loadAllData();
      advanceStep(5);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to assign delivery partner.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCustomerOtp = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const recipient = selectedOrder.profile?.user?.mobile || selectedOrder.profile?.user?.email || 'customer';
      const res = await workforceFetch(`/orders/${selectedOrder.id}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient }),
      }).then(workforceJson);

      setOtpSent(true);
      if (res.devCode) {
        setCustomerOtp(res.devCode);
      }
      setChecklist({ ...checklist, otpVerified: false });
      setActionMessage({ type: 'success', text: `OTP sent to customer (${recipient}).` });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to send OTP.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCustomerOtp = async () => {
    if (!selectedOrder || !customerOtp) return;
    setActionLoading(true);
    try {
      const recipient = selectedOrder.profile?.user?.mobile || selectedOrder.profile?.user?.email || 'customer';
      await workforceFetch(`/orders/${selectedOrder.id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, code: customerOtp }),
      });
      setOtpVerified(true);
      setChecklist({ ...checklist, otpVerified: true });
      setActionMessage({ type: 'success', text: 'OTP verified successfully.' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Invalid or expired OTP.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBranchPickupAndAdvance = async () => {
    if (!selectedOrder || !customerPhotoCaptured || !bundlePhotoCaptured) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      await workforceFetch(`/orders/${selectedOrder.id}/manager-complete-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: customerPhotoCaptured.dataUrl,
          bundlePhotoUrl: bundlePhotoCaptured.dataUrl,
          remarks: pickupRemarks || 'Counter pickup completed with camera evidence capture.',
        }),
      });
      setActionMessage({ type: 'success', text: 'Pickup completed and cash handed over with verified photo evidence!' });
      
      // Dispatch sync events across all open browser windows & tabs
      window.dispatchEvent(new CustomEvent('forexmate-sync'));
      localStorage.setItem('forexmate_last_sync', Date.now().toString());

      loadAllData();
      advanceStep(5);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to complete pickup.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const searchLower = orderSearch.toLowerCase();
    const matchesSearch =
      !orderSearch ||
      o.orderNumber?.toLowerCase().includes(searchLower) ||
      o.profile?.user?.fullName?.toLowerCase().includes(searchLower) ||
      o.profile?.user?.mobile?.includes(searchLower);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED') ||
      (statusFilter === 'COMPLETED' && o.status === 'COMPLETED') ||
      (statusFilter === 'PENDING_ALLOCATION' && !o.cashAllocation);

    const matchesMethod =
      methodFilter === 'ALL' ||
      (methodFilter === 'PICKUP' && ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'].includes(o.deliveryMethod)) ||
      (methodFilter === 'DELIVERY' && ['HOME_DELIVERY', 'DELIVERY'].includes(o.deliveryMethod));

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders Queue', icon: FileSpreadsheet, badge: orders.filter(o => o.status !== 'COMPLETED').length },
    { id: 'inventory', label: 'Branch Inventory', icon: Package },
    { id: 'city-inventory', label: 'City Inventory', icon: Building2 },
    { id: 'delivery-partners', label: 'Delivery Roster', icon: Truck },
    { id: 'reports', label: 'Branch Reports', icon: BarChart3 },
    { id: 'timeline', label: 'Activity Timeline', icon: History },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'profile', label: 'Manager Profile', icon: User },
  ];

  if (authLoading || (loading && !dashboardData)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-400">Loading Enterprise Branch Operations Portal...</p>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const isPickupOrder = selectedOrder && ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'].includes(selectedOrder.deliveryMethod);
  const isEvidenceReady = Boolean(customerPhotoCaptured && bundlePhotoCaptured && otpVerified);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Hidden Canvas Element for Camera Captures */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ─── ENTERPRISE LEFT SIDEBAR ────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Branding */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/30">
              🏛️
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-indigo-400">FOREXMATE ERP</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Branch Operations Head
              </p>
            </div>
          </div>

          {/* Manager Profile Summary */}
          <div className="p-4 bg-slate-800/40 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || 'M'}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-black text-white truncate">{user?.fullName || 'Branch Manager'}</h3>
                <p className="text-[10px] font-bold text-indigo-400 truncate">
                  📍 {user?.email || 'Delhi Main Vault'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
            Branch Operations Portal v3.2
          </p>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black tracking-wide text-white uppercase">
              {sidebarLinks.find((l) => l.id === activeTab)?.label}
            </h2>
            <span className="text-xs text-slate-400 font-medium">|</span>
            <span className="text-xs font-semibold text-slate-400">
              City Hub: <strong className="text-indigo-400">{cityCode || 'Delhi'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {actionMessage && (
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                <span>{actionMessage.text}</span>
                <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Executive Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Today's Orders</p>
                  <h3 className="text-2xl font-black text-white mt-1">{metrics.todayOrdersCount || 0}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Total incoming queue</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Pending Execution</p>
                  <h3 className="text-2xl font-black text-amber-400 mt-1">
                    {orders.filter((o) => o.status !== 'COMPLETED').length}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Active branch queue</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Pending Cash Alloc.</p>
                  <h3 className="text-2xl font-black text-indigo-400 mt-1">{metrics.pendingCashAllocationCount || 0}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Requires vault reservation</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">Pending Pickups</p>
                  <h3 className="text-2xl font-black text-sky-400 mt-1">{metrics.pendingPickupsCount || 0}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Awaiting counter arrival</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Completed Today</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">{metrics.completedTodayCount || 0}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Finalized handovers</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Available Vault</p>
                  <h3 className="text-2xl font-black text-purple-400 mt-1">
                    {(metrics.availableVaultUnits || 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Liquid stock units</p>
                </div>
              </div>

              {/* Queue Summary & Inventory Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-white">Pending Branch Execution Queue</h3>
                      <p className="text-xs text-slate-400">Verified by Central Operations — Click to launch Guided Workflow</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Queue</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.filter((o) => o.status !== 'COMPLETED').slice(0, 5).map((o) => (
                      <div
                        key={o.id}
                        onClick={() => openOrderWorkflow(o.id)}
                        className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between hover:border-indigo-500/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            📦
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{o.orderNumber}</span>
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-md">
                                {o.deliveryMethod}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-md">
                                Compliance Passed
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {o.profile?.user?.fullName} • {o.items?.[0]?.currency?.code} {o.items?.[0]?.amount}
                            </p>
                          </div>
                        </div>

                        <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                          <span>Launch Guided Workflow</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Inventory Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span>Low Inventory Alerts</span>
                  </h3>

                  <div className="space-y-3">
                    {(dashboardData?.lowStockAlerts || []).length > 0 ? (
                      dashboardData.lowStockAlerts.map((inv: any, idx: number) => (
                        <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-amber-300">{inv.currencyCode} Vault Stock</span>
                            <span className="text-amber-400">{inv.availableAmount} Left</span>
                          </div>
                          <p className="text-[10px] text-amber-400/80 mt-1">Below safety threshold (1,000 units)</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2" />
                        <p className="text-xs font-bold text-emerald-300">Vault Stock Healthy</p>
                        <p className="text-[10px] text-slate-400">All currencies above minimum thresholds</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDERS QUEUE */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order #, Customer, Phone, PAN..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Active Branch Execution</option>
                    <option value="PENDING_ALLOCATION">Unallocated Cash</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="ALL">All Methods</option>
                    <option value="PICKUP">Branch Pickup</option>
                    <option value="DELIVERY">Home Delivery</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Order Number</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Currency & Amount</th>
                        <th className="p-4">Fulfillment</th>
                        <th className="p-4">Cash Allocation</th>
                        <th className="p-4">Compliance Status</th>
                        <th className="p-4">Current Stage</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/40 transition-all">
                          <td className="p-4 font-black text-indigo-400">{o.orderNumber}</td>
                          <td className="p-4">
                            <div className="font-bold text-white">{o.profile?.user?.fullName || 'Customer'}</div>
                            <div className="text-[10px] text-slate-400">{o.profile?.user?.mobile || 'No Phone'}</div>
                          </td>
                          <td className="p-4 font-bold text-emerald-400">
                            {o.items?.[0]?.currency?.code || 'USD'} {o.items?.[0]?.amount}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                              {o.deliveryMethod}
                            </span>
                          </td>
                          <td className="p-4">
                            {o.cashAllocation ? (
                              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <Check size={10} /> Reserved
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <Clock size={10} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                              Verified (Read-Only)
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-black ${
                                o.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => openOrderWorkflow(o.id)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <span>Launch Workflow</span>
                              <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            No orders found matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. ENTERPRISE BRANCH VAULT INVENTORY & STOCK RECEIPT ENGINE */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">Branch Vault Inventory Management</h3>
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-md text-[10px] font-black uppercase">
                      📍 {dashboardData?.branch?.branchName || (user as any)?.branchName || 'Assigned Branch'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time physical currency vault stock, reserved allocations, and stock receipt workflows.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setReceiveCurrencyCode('USD');
                    setShowReceiveInventoryModal(true);
                    setReceiveInventoryStep(1);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus size={16} /> + Receive Vault Inventory
                </button>
              </div>

              {/* Supported Currencies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SUPPORTED_CURRENCIES.map((curr) => {
                  const inv = (dashboardData?.branchInventory || []).find((i: any) => i.currencyCode === curr.code);
                  const avail = Number(inv?.availableAmount || 0);
                  const res = Number(inv?.reservedAmount || 0);
                  const net = Math.max(0, avail - res);

                  // Status determination: HEALTHY, LOW STOCK, OUT OF STOCK
                  const isZero = avail === 0;
                  const isLow = !isZero && avail < curr.threshold;

                  return (
                    <div key={curr.code} className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl space-y-4 transition-all hover:border-slate-700 ${
                      isZero
                        ? 'border-red-900/40 bg-red-950/10'
                        : isLow
                          ? 'border-amber-900/40 bg-amber-950/10'
                          : 'border-slate-800'
                    }`}>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{curr.flag}</span>
                          <div>
                            <span className="text-base font-black text-white block leading-tight">{curr.code}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{curr.name}</span>
                          </div>
                        </div>

                        {isZero ? (
                          <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-black uppercase">
                            OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-black uppercase">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase">
                            HEALTHY
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-800/60 rounded-xl">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Available</p>
                          <p className="text-sm font-black text-emerald-400 mt-0.5">
                            {curr.symbol}{avail.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2.5 bg-slate-800/60 rounded-xl">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Reserved</p>
                          <p className="text-sm font-black text-amber-400 mt-0.5">
                            {curr.symbol}{res.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2.5 bg-slate-800/60 rounded-xl">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Net Available</p>
                          <p className="text-sm font-black text-blue-400 mt-0.5">
                            {curr.symbol}{net.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">Safety Threshold: {curr.symbol}{curr.threshold.toLocaleString()}</span>
                        <button
                          onClick={() => {
                            setReceiveCurrencyCode(curr.code);
                            setShowReceiveInventoryModal(true);
                            setReceiveInventoryStep(1);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 border border-emerald-500/30"
                        >
                          + Receive {curr.code}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. CITY INVENTORY MODULE */}
          {activeTab === 'city-inventory' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-white">City Consolidated Vault Network</h3>
                <p className="text-xs text-slate-400">
                  Stock availability across all branches in city: <strong className="text-indigo-400">{cityCode || 'Delhi'}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityBranches.map((br) => (
                  <div key={br.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-black text-white">{br.branchName}</h4>
                      <p className="text-xs text-slate-400">Branch Code: {br.branchCode}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      {(br.branchInventory || []).map((inv: any) => (
                        <div key={inv.id} className="flex justify-between p-2.5 bg-slate-800/60 rounded-xl">
                          <span className="font-bold text-slate-300">{inv.currencyCode}</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {Number(inv.availableAmount || 0).toLocaleString()} Available
                          </span>
                        </div>
                      ))}
                      {(!br.branchInventory || br.branchInventory.length === 0) && (
                        <p className="text-xs text-slate-400 italic">No inventory records synced</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. DELIVERY PARTNERS MODULE */}
          {activeTab === 'delivery-partners' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-white">Branch Delivery Roster</h3>
                <p className="text-xs text-slate-400">Active delivery partner availability and job assignments</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {deliveryPartners.map((dp) => (
                  <div key={dp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                          🚚
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">{dp.name}</h4>
                          <p className="text-[10px] text-slate-400">{dp.employeeCode}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          dp.status === 'AVAILABLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : dp.status === 'ON_DELIVERY'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {dp.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span>{dp.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Deliveries:</span>
                        <span className="font-bold text-white">{dp.activeDeliveriesCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-white">Branch Operational Performance</h3>
                <p className="text-xs text-slate-400">Analytics summary for orders, revenue, and SLA score</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Today's Orders</p>
                  <h3 className="text-2xl font-black text-white mt-1">{reportsData?.todayOrders || 0}</h3>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Weekly Orders</p>
                  <h3 className="text-2xl font-black text-indigo-400 mt-1">{reportsData?.weeklyOrders || 0}</h3>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery SLA Score</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">{reportsData?.deliveryEfficiency || '98.4%'}</h3>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Branch Compliance Score</p>
                  <h3 className="text-2xl font-black text-sky-400 mt-1">{reportsData?.branchSlaScore || '99.1%'}</h3>
                </div>
              </div>
            </div>
          )}

          {/* 7. ACTIVITY TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-white">Branch Operation Audit Feed</h3>
                <p className="text-xs text-slate-400">Immutable log of manager actions, cash allocations, and handovers</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="flex gap-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      📜
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-400">{evt.action}</span>
                        <span className="text-[10px] text-slate-400">{new Date(evt.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Entity: {evt.entityName} #{evt.entityId?.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. SETTINGS & PROFILE TAB */}
          {(activeTab === 'settings' || activeTab === 'profile') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-xl">
              <h3 className="text-base font-black text-white">Branch Manager Profile</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-800/60 rounded-xl flex justify-between">
                  <span className="text-slate-400">Manager Email:</span>
                  <span className="font-bold text-indigo-400">{user?.email}</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl flex justify-between">
                  <span className="text-slate-400">Manager Name:</span>
                  <span className="font-bold text-white">{user?.fullName}</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl flex justify-between">
                  <span className="text-slate-400">System Role:</span>
                  <span className="font-bold text-emerald-400">{user?.role}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── GUIDED WORKFLOW ENGINE DRAWER ─────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col justify-between p-6 space-y-6">
            <div>
              {/* Header & Order Summary */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">Guided Workflow: #{selectedOrder.orderNumber}</span>
                    <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-md uppercase">
                      {selectedOrder.deliveryMethod}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customer: <strong className="text-white">{selectedOrder.profile?.user?.fullName || 'Rahul Kumar'}</strong> • Requested:{' '}
                    <strong className="text-emerald-400">
                      {selectedOrder.items?.[0]?.currency?.code || 'USD'} {selectedOrder.items?.[0]?.amount || 1000}
                    </strong>
                  </p>
                </div>
                <button onClick={closeOrderWorkflow} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* ─── TOP WORKFLOW PROGRESS STEPPER BAR ────────────────────── */}
              <div className="py-4 border-b border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  {[
                    { step: 1, name: 'Review Compliance' },
                    { step: 2, name: 'Inventory Check' },
                    { step: 3, name: 'Cash Allocation' },
                    { step: 4, name: 'Fulfillment' },
                    { step: 5, name: 'Completion' },
                  ].map((s, idx, arr) => {
                    const isCompleted = s.step < workflowStep;
                    const isActive = s.step === workflowStep;
                    const isUnlocked = s.step <= maxUnlockedStep;

                    return (
                      <React.Fragment key={s.step}>
                        <button
                          disabled={!isUnlocked}
                          onClick={() => isUnlocked && setWorkflowStep(s.step)}
                          className={`flex items-center gap-2 transition-all ${
                            isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isActive
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30'
                                : isUnlocked
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-800/50 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check size={14} /> : isUnlocked ? s.step : <Lock size={12} />}
                          </div>
                          <span
                            className={`hidden md:inline font-bold ${
                              isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          >
                            {s.name}
                          </span>
                        </button>

                        {idx < arr.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 ${
                              s.step < workflowStep ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ─── STEP 1: REVIEW COMPLIANCE PACKAGE ────────────────────── */}
              {workflowStep === 1 && (
                <div className="mt-4 space-y-4 text-xs">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                    <ShieldCheck size={20} className="text-indigo-400 shrink-0" />
                    <div>
                      <h4 className="font-black text-indigo-300">STEP 1 OF 5: Review &amp; Approve KYC</h4>
                      <p className="text-[11px] text-slate-300">
                        Verify the customer's documents below and approve or reject KYC. The order cannot proceed without KYC approval.
                      </p>
                    </div>
                  </div>

                  {/* Live Compliance Status Banner */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    selectedOrder.complianceStatus === 'APPROVED'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : selectedOrder.complianceStatus === 'REJECTED'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <span className="text-lg">
                      {selectedOrder.complianceStatus === 'APPROVED' ? '✅' : selectedOrder.complianceStatus === 'REJECTED' ? '❌' : '⏳'}
                    </span>
                    <div>
                      <p className={`font-black text-sm ${
                        selectedOrder.complianceStatus === 'APPROVED' ? 'text-emerald-400' :
                        selectedOrder.complianceStatus === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        KYC Status: {selectedOrder.complianceStatus || 'PENDING'}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {selectedOrder.complianceStatus === 'APPROVED'
                          ? 'KYC has been approved. You can proceed to the next step.'
                          : selectedOrder.complianceStatus === 'REJECTED'
                          ? 'KYC was rejected. Customer has been notified to re-upload documents.'
                          : 'KYC pending your review. Approve or reject after verifying documents.'}
                      </p>
                    </div>
                  </div>

                  {/* Customer Summary & Documents */}
                  <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
                    <h5 className="font-black text-slate-300 uppercase text-[10px]">Customer Case File</h5>
                    <div className="grid grid-cols-2 gap-3 text-slate-300">
                      <div>Name: <strong className="text-white block">{selectedOrder.profile?.user?.fullName || 'Rahul Kumar'}</strong></div>
                      <div>Phone: <strong className="text-white block">{selectedOrder.profile?.user?.mobile || '+91 9876543210'}</strong></div>
                      <div>Email: <strong className="text-white block">{selectedOrder.profile?.user?.email || '—'}</strong></div>
                      <div>Product: <strong className="text-indigo-400 block">{selectedOrder.productType}</strong></div>
                      <div>Amount: <strong className="text-emerald-400 block">₹{Number(selectedOrder.totalAmountInr).toLocaleString('en-IN')}</strong></div>
                      <div>Stage: <strong className="text-white block">{selectedOrder.currentStage}</strong></div>
                    </div>
                  </div>

                  {/* Compliance Package Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">Dynamic KYC Verification</span>
                      <p className="font-black text-white mt-0.5">Approved & OCR Passed</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">AML Sanctions Check</span>
                      <p className="font-black text-white mt-0.5">Passed (Zero Matches)</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">LRS Annual Limit</span>
                      <p className="font-black text-white mt-0.5">Verified ($250,000 Available)</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">Bank Settlement</span>
                      <p className="font-black text-white mt-0.5">Payment Completed & Verified</p>
                    </div>
                  </div>

                  {/* KYC Notes Input */}
                  {selectedOrder.complianceStatus !== 'APPROVED' && selectedOrder.complianceStatus !== 'REJECTED' && (
                    <div className="space-y-2">
                      <label className="text-slate-400 font-bold uppercase text-[10px]">Review Notes (Optional)</label>
                      <textarea
                        value={quickActionReason}
                        onChange={(e) => setQuickActionReason(e.target.value)}
                        placeholder="Add notes about documents reviewed, any observations..."
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 text-xs resize-none focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Step 1 Action Buttons */}
                  {selectedOrder.complianceStatus !== 'APPROVED' && selectedOrder.complianceStatus !== 'REJECTED' ? (
                    <div className="flex gap-3">
                      <button
                        disabled={actionLoading}
                        onClick={async () => {
                          setActionLoading(true);
                          try {
                            const res = await workforceFetch(`/orders/${selectedOrder.id}/reject-kyc`, {
                              method: 'POST',
                              body: JSON.stringify({ reason: quickActionReason || 'Documents could not be verified. Please re-upload.' }),
                            }).then(workforceJson);
                            setActionMessage({ type: 'success', text: 'KYC rejected. Customer has been notified.' });
                            setSelectedOrder((prev: any) => ({ ...prev, complianceStatus: 'REJECTED', status: 'REJECTED' }));
                            setQuickActionReason('');
                          } catch (err: any) {
                            setActionMessage({ type: 'error', text: err?.message || 'Failed to reject KYC.' });
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        className="px-4 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={14} /> Reject KYC
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={async () => {
                          setActionLoading(true);
                          try {
                            const res = await workforceFetch(`/orders/${selectedOrder.id}/approve-kyc`, {
                              method: 'POST',
                              body: JSON.stringify({ notes: quickActionReason }),
                            }).then(workforceJson);
                            setActionMessage({ type: 'success', text: `KYC approved! Order advanced to ${res?.data?.nextStage || 'next stage'}.` });
                            setSelectedOrder((prev: any) => ({ ...prev, complianceStatus: 'APPROVED', currentStage: res?.data?.nextStage || prev.currentStage }));
                            setQuickActionReason('');
                            advanceStep(2);
                          } catch (err: any) {
                            setActionMessage({ type: 'error', text: err?.message || 'Failed to approve KYC.' });
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                      >
                        {actionLoading ? '⏳ Processing...' : <><CheckCircle size={14} /> Approve KYC &amp; Proceed</>}
                      </button>
                    </div>
                  ) : selectedOrder.complianceStatus === 'APPROVED' ? (
                    <button
                      onClick={() => advanceStep(2)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                    >
                      <span>Continue to Step 2 (Inventory Check)</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : null}
                </div>
              )}

              {/* ─── STEP 2: BRANCH INVENTORY REVIEW ─────────────────────── */}
              {workflowStep === 2 && (
                <div className="mt-4 space-y-4 text-xs">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                    <Package size={20} className="text-indigo-400 shrink-0" />
                    <div>
                      <h4 className="font-black text-indigo-300">STEP 2 OF 5: Branch Vault Inventory Verification</h4>
                      <p className="text-[11px] text-slate-300">
                        Check current liquid vault stock for requested currency ({selectedOrder.items?.[0]?.currency?.code || 'USD'}).
                      </p>
                    </div>
                  </div>

                  {/* Stock Comparison Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Requested Amount</p>
                      <p className="text-lg font-black text-white mt-1">
                        {selectedOrder.items?.[0]?.currency?.code || 'USD'} {requestedOrderAmount}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Branch Available Stock</p>
                      <p className="text-lg font-black text-emerald-400 mt-1">45,000 Units</p>
                    </div>
                    <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                      <p className="text-sm font-black text-emerald-400 mt-1">✓ Sufficient Stock</p>
                    </div>
                  </div>

                  {/* Same City Branch Comparison */}
                  <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
                    <h5 className="font-black text-slate-300 uppercase text-[10px]">
                      Same-City Vault Stock ({cityCode || 'Delhi'})
                    </h5>
                    <div className="space-y-2">
                      {cityBranches.map((br) => (
                        <div key={br.id} className="p-3 bg-slate-900 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white">{br.branchName}</p>
                            <p className="text-[10px] text-slate-400">Code: {br.branchCode}</p>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">Stock Available</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => advanceStep(1)}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={() => advanceStep(3)}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                    >
                      <span>Proceed to Step 3 (Cash Allocation)</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: CASH ALLOCATION ──────────────────────────────── */}
              {workflowStep === 3 && (
                <div className="mt-4 space-y-4 text-xs">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                    <DollarSign size={20} className="text-indigo-400 shrink-0" />
                    <div>
                      <h4 className="font-black text-indigo-300">STEP 3 OF 5: Vault Denomination Cash Allocation</h4>
                      <p className="text-[11px] text-slate-300">
                        Allocate cash from vault inventory. The difference between requested and allocated total must equal zero.
                      </p>
                    </div>
                  </div>

                  {/* Auto Allocate Button & Live Validation */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/40 border border-slate-800 rounded-2xl">
                    <div>
                      <p className="text-xs text-slate-400">
                        Requested: <strong className="text-white">{selectedOrder.items?.[0]?.currency?.code} {requestedOrderAmount}</strong>
                      </p>
                    </div>
                    <button
                      onClick={handleAutoAllocate}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Auto Allocate</span>
                    </button>
                  </div>

                  {/* Live Validation Bar */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900 rounded-xl text-center border border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Requested</p>
                      <p className="text-sm font-black text-white">{requestedOrderAmount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Allocated Total</p>
                      <p className="text-sm font-black text-indigo-400">{totalAllocatedAmount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Difference</p>
                      <p className={`text-sm font-black ${allocationDifference === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {allocationDifference === 0 ? '✓ 0 (Valid)' : allocationDifference}
                      </p>
                    </div>
                  </div>

                  {/* Denomination Grid */}
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {[100, 50, 20, 10, 5, 2, 1].map((denom) => (
                      <div key={denom} className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl">
                        <span className="font-bold text-slate-300">Denomination: ${denom}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={cashDenominations[denom] || 0}
                            onChange={(e) => setCashDenominations({ ...cashDenominations, [denom]: Number(e.target.value) })}
                            className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 text-white rounded text-center font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-400 w-16 text-right">
                            = ${denom * (cashDenominations[denom] || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => advanceStep(2)}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handleAllocateCashAndAdvance}
                      disabled={actionLoading || allocationDifference !== 0}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                    >
                      <span>Reserve Cash & Proceed to Step 4 (Fulfillment)</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 4: FULFILLMENT WORKFLOW ──────────────────────────── */}
              {workflowStep === 4 && (
                <div className="mt-4 space-y-4 text-xs">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                    <Truck size={20} className="text-indigo-400 shrink-0" />
                    <div>
                      <h4 className="font-black text-indigo-300">
                        STEP 4 OF 5: Fulfillment Execution ({selectedOrder.deliveryMethod || 'BRANCH_PICKUP'})
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Complete hand-off verification for counter pickup or assign delivery partner for home delivery.
                      </p>
                    </div>
                  </div>

                  {/* 4A. BRANCH COUNTER PICKUP WORKFLOW */}
                  {isPickupOrder ? (
                    <div className="space-y-4">
                      {/* 9-Point Checklist */}
                      <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
                        <h5 className="font-black text-slate-300 uppercase text-[10px]">9-Point Counter Pickup Checklist</h5>
                        <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-900 rounded-xl text-[11px]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checklist.customerPresent}
                              onChange={(e) => setChecklist({ ...checklist, customerPresent: e.target.checked })}
                              className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                            />
                            <span>1. Customer Present</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={checklist.otpVerified} readOnly className="w-4 h-4 rounded bg-slate-800 border-slate-600" />
                            <span className={otpVerified ? 'text-emerald-400 font-bold' : ''}>
                              2. OTP Verified ({otpVerified ? '✓' : 'Pending'})
                            </span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checklist.passportMatched}
                              onChange={(e) => setChecklist({ ...checklist, passportMatched: e.target.checked })}
                              className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                            />
                            <span>3. Passport Matched</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={checklist.paymentVerified} readOnly className="w-4 h-4 rounded bg-slate-800 border-slate-600" />
                            <span className="text-emerald-400 font-bold">4. Payment Verified (✓)</span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checklist.cashCountConfirmed}
                              onChange={(e) => setChecklist({ ...checklist, cashCountConfirmed: e.target.checked })}
                              className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                            />
                            <span>5. Cash Count Confirmed</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(customerPhotoCaptured)}
                              readOnly
                              className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                            />
                            <span className={customerPhotoCaptured ? 'text-emerald-400 font-bold' : ''}>
                              6. Customer Photo Captured
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(bundlePhotoCaptured)}
                              readOnly
                              className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                            />
                            <span className={bundlePhotoCaptured ? 'text-emerald-400 font-bold' : ''}>
                              7. Bundle Photo Captured
                            </span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checklist.remarksAdded}
                              onChange={(e) => setChecklist({ ...checklist, remarksAdded: e.target.checked })}
                              className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                            />
                            <span>8. Remarks Added</span>
                          </label>
                        </div>
                      </div>

                      {/* OTP Generation & Verification */}
                      <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
                        <h5 className="font-black text-slate-300 uppercase text-[10px]">OTP Handover Verification</h5>
                        {!otpSent ? (
                          <button
                            onClick={handleSendCustomerOtp}
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Generate & Send Handover OTP to Customer
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-slate-400">Enter OTP provided by customer:</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customerOtp}
                                onChange={(e) => setCustomerOtp(e.target.value)}
                                placeholder="6-digit OTP"
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-center font-mono font-bold"
                              />
                              <button onClick={handleVerifyCustomerOtp} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">
                                Verify OTP
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ─── REAL CAMERA-BASED EVIDENCE CARDS (ZERO TEXT INPUTS) ─── */}
                      <div className="space-y-4">
                        <h5 className="font-black text-slate-300 uppercase text-[10px]">
                          Mandatory Evidence Photo Capture (Browser Camera API)
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* EVIDENCE CARD 1: CUSTOMER IDENTITY PHOTO */}
                          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                              <h6 className="font-bold text-white text-xs">Customer Identity Verification</h6>
                              {customerPhotoCaptured ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-md flex items-center gap-1">
                                  <Check size={10} /> Captured
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold rounded-md">
                                  Required
                                </span>
                              )}
                            </div>

                            {customerPhotoCaptured ? (
                              <div className="space-y-2">
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black">
                                  <img
                                    src={customerPhotoCaptured.dataUrl}
                                    alt="Customer Proof"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-1 right-1 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-slate-300">
                                    {customerPhotoCaptured.timestamp}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setFullscreenImage(customerPhotoCaptured.dataUrl)}
                                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Eye size={12} /> View
                                  </button>
                                  <button
                                    onClick={() => startCameraStream('CUSTOMER')}
                                    className="py-1.5 px-3 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 size={12} /> Retake
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => startCameraStream('CUSTOMER')}
                                className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                              >
                                <Camera size={20} />
                                <span>Open Camera for Customer Photo</span>
                              </button>
                            )}
                          </div>

                          {/* EVIDENCE CARD 2: CURRENCY BUNDLE PROOF */}
                          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                              <h6 className="font-bold text-white text-xs">Currency Bundle Verification</h6>
                              {bundlePhotoCaptured ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-md flex items-center gap-1">
                                  <Check size={10} /> Captured
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold rounded-md">
                                  Required
                                </span>
                              )}
                            </div>

                            {bundlePhotoCaptured ? (
                              <div className="space-y-2">
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black">
                                  <img
                                    src={bundlePhotoCaptured.dataUrl}
                                    alt="Bundle Proof"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-1 right-1 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-slate-300">
                                    {bundlePhotoCaptured.timestamp}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setFullscreenImage(bundlePhotoCaptured.dataUrl)}
                                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Eye size={12} /> View
                                  </button>
                                  <button
                                    onClick={() => startCameraStream('BUNDLE')}
                                    className="py-1.5 px-3 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 size={12} /> Retake
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => startCameraStream('BUNDLE')}
                                className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                              >
                                <Camera size={20} />
                                <span>Open Camera for Bundle Photo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Validation Warning Alert if evidence missing */}
                      {(!customerPhotoCaptured || !bundlePhotoCaptured) && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-bold">
                          <AlertCircle size={16} className="shrink-0" />
                          <span>Customer and Currency Bundle photos are required before completing this order.</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => advanceStep(3)}
                          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft size={14} /> Back
                        </button>
                        <button
                          onClick={handleCompleteBranchPickupAndAdvance}
                          disabled={actionLoading || !otpVerified || !customerPhotoCaptured || !bundlePhotoCaptured}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                        >
                          <span>Complete Counter Handover & Finish Order</span>
                          <CheckCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 4B. HOME DELIVERY WORKFLOW */
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
                        <h5 className="font-black text-slate-300 uppercase text-[10px]">Select Delivery Partner from Branch Roster</h5>
                        <select
                          value={selectedDeliveryPartnerId}
                          onChange={(e) => setSelectedDeliveryPartnerId(e.target.value)}
                          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        >
                          <option value="">Select Available Executive...</option>
                          {deliveryPartners.map((dp) => (
                            <option key={dp.id} value={dp.id}>
                              {dp.name} ({dp.employeeCode}) - {dp.status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => advanceStep(3)}
                          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft size={14} /> Back
                        </button>
                        <button
                          onClick={handleAssignDeliveryPartnerAndAdvance}
                          disabled={actionLoading || !selectedDeliveryPartnerId}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                        >
                          <span>Assign Partner & Proceed to Completion</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 5: ORDER COMPLETION SCREEN ──────────────────────── */}
              {workflowStep === 5 && (
                <div className="mt-4 space-y-6 text-xs text-center py-6">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                    <CheckCircle size={36} />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">Order Successfully Completed</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Fulfillment finalized for Order #{selectedOrder.orderNumber}
                    </p>
                  </div>

                  {/* Summary Receipt Box */}
                  <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-left space-y-2.5">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Customer:</span>
                      <strong className="text-white">{selectedOrder.profile?.user?.fullName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Fulfillment Method:</span>
                      <strong className="text-indigo-400">{selectedOrder.deliveryMethod}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Currency Delivered:</span>
                      <strong className="text-emerald-400">
                        {selectedOrder.items?.[0]?.currency?.code} {requestedOrderAmount}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Camera Evidence Captured:</span>
                      <strong className="text-emerald-400">Customer Photo & Bundle Photo Verified (✓)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audit Status:</span>
                      <strong className="text-emerald-400">Logged to City Central Audit Feed</strong>
                    </div>
                  </div>

                  <button
                    onClick={closeOrderWorkflow}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    Return to Orders Queue
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            {selectedOrder && workflowStep < 5 && (
              <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedOrder.profile?.user?.mobile || ''}`}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title="Call Customer"
                  >
                    <Phone size={14} />
                  </a>
                  <a
                    href={`mailto:${selectedOrder.profile?.user?.email || ''}`}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title="Email Customer"
                  >
                    <Mail size={14} />
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                    title="Print Case File"
                  >
                    <Printer size={14} />
                  </button>
                </div>

                <button
                  onClick={closeOrderWorkflow}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close Workflow
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── LIVE CAMERA CAPTURE MODAL (MediaDevices API) ──────────────────── */}
      {cameraActiveTarget && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Camera size={18} className="text-indigo-400" />
                <span>
                  Capture {cameraActiveTarget === 'CUSTOMER' ? 'Customer Identity Photo' : cameraActiveTarget === 'TREASURY_SLIP' ? 'Treasury / Bank Deposit Slip' : 'Currency Bundle Photo'}
                </span>
              </h3>
              <button type="button" onClick={(e) => { e.preventDefault(); setCameraActiveTarget(null); }} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Live Video Viewport */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE CAMERA FEED ({cameraFacingMode.toUpperCase()})</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); toggleCameraFacingMode(); }}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <SwitchCamera size={14} /> Switch Camera
              </button>

              <button
                type="button"
                onClick={(e) => { e.preventDefault(); capturePhotoFrame(); }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Camera size={16} /> Capture Photo
              </button>

              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setCameraActiveTarget(null); }}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ENTERPRISE RECEIVE VAULT INVENTORY MODAL ───────────────────────── */}
      {showReceiveInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-xl p-6 space-y-5 border border-slate-800 text-white">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Manager Vault Operation
                </span>
                <h3 className="font-black text-white text-lg flex items-center gap-2 mt-1">
                  <span>📥</span> Receive Vault Inventory
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowReceiveInventoryModal(false); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step Wizard Indicator */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold border-b border-slate-800 pb-3">
              <div className={`p-2 rounded-xl border ${receiveInventoryStep === 1 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                1. Details
              </div>
              <div className={`p-2 rounded-xl border ${receiveInventoryStep === 2 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                2. Evidence
              </div>
              <div className={`p-2 rounded-xl border ${receiveInventoryStep === 3 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                3. Delta
              </div>
              <div className={`p-2 rounded-xl border ${receiveInventoryStep === 4 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                4. Confirm
              </div>
            </div>

            {/* STEP 1: Receipt Parameters */}
            {receiveInventoryStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Select Currency</label>
                    <select
                      value={receiveCurrencyCode}
                      onChange={(e) => setReceiveCurrencyCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-black text-sm text-white focus:outline-emerald-500"
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} - {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Receipt Amount</label>
                    <input
                      type="number"
                      value={receiveAmount}
                      onChange={(e) => setReceiveAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-black text-sm text-white focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Inventory Business Source</label>
                  <select
                    value={receiveSourceType}
                    onChange={(e) => setReceiveSourceType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-bold text-xs text-white focus:outline-emerald-500"
                  >
                    <option value="HQ_TREASURY_TRANSFER">HQ Treasury Transfer (Requires Treasury Slip Photo)</option>
                    <option value="COMMERCIAL_BANK_COLLECTION">Commercial Bank Collection (Requires Bank Deposit Slip Photo)</option>
                    <option value="CUSTOMER_CASH_SELL">Customer Cash Sell Deposit (Requires Currency Bundle Photo)</option>
                    <option value="INTER_BRANCH_TRANSFER">Inter-Branch Transfer (Requires Currency Bundle Photo)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Reference / Deposit Slip Number *</label>
                    <input
                      type="text"
                      value={receiveReferenceNumber}
                      onChange={(e) => setReceiveReferenceNumber(e.target.value)}
                      placeholder="e.g. TRE-2026-000234"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-bold text-xs text-white focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Received Date</label>
                    <input
                      type="date"
                      value={receiveDate}
                      onChange={(e) => setReceiveDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-bold text-xs text-white focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Manager Handover / Audit Notes</label>
                  <textarea
                    value={receiveNotes}
                    onChange={(e) => setReceiveNotes(e.target.value)}
                    placeholder="e.g. Verified note count & cash bundle serial numbers. Stock placed in Vault Shelf #2."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 h-20 focus:outline-emerald-500 font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!receiveAmount || Number(receiveAmount) <= 0 || !receiveReferenceNumber.trim()) {
                        alert('Please fill mandatory Amount and Reference Number fields.');
                        return;
                      }
                      setReceiveInventoryStep(2);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    Next: Camera Evidence Capture →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Camera Evidence Capture */}
            {receiveInventoryStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 space-y-1">
                  <p className="font-bold text-amber-400">📷 Real HTML5 Camera Photo Capture Required</p>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Branch Managers are prohibited from pasting image URLs. Capture evidence using your device camera.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Treasury Slip Capture Box */}
                  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 text-[11px]">Treasury / Bank Slip Photo</span>
                      {(receiveSourceType === 'HQ_TREASURY_TRANSFER' || receiveSourceType === 'COMMERCIAL_BANK_COLLECTION') && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 font-black px-1.5 py-0.5 rounded">MANDATORY</span>
                      )}
                    </div>
                    {receiveTreasurySlipPhoto ? (
                      <div className="relative group">
                        <img src={receiveTreasurySlipPhoto} alt="Treasury Slip" className="w-full h-28 object-cover rounded-lg border border-emerald-500/50" />
                        <span className="absolute bottom-1 right-1 bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 rounded">Captured ✓</span>
                      </div>
                    ) : (
                      <div className="h-28 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-[11px]">
                        No Slip Photo Captured
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCameraActiveTarget('TREASURY_SLIP');
                        startCameraStream('TREASURY_SLIP', 'environment');
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Camera size={13} /> {receiveTreasurySlipPhoto ? 'Retake Slip Photo' : 'Open Camera for Slip'}
                    </button>
                  </div>

                  {/* Currency Bundle Capture Box */}
                  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 text-[11px]">Currency Bundle Photo</span>
                      {(receiveSourceType === 'CUSTOMER_CASH_SELL' || receiveSourceType === 'INTER_BRANCH_TRANSFER') && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 font-black px-1.5 py-0.5 rounded">MANDATORY</span>
                      )}
                    </div>
                    {receiveBundlePhoto ? (
                      <div className="relative group">
                        <img src={receiveBundlePhoto} alt="Currency Bundle" className="w-full h-28 object-cover rounded-lg border border-emerald-500/50" />
                        <span className="absolute bottom-1 right-1 bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 rounded">Captured ✓</span>
                      </div>
                    ) : (
                      <div className="h-28 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-[11px]">
                        No Bundle Photo Captured
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCameraActiveTarget('INVENTORY_BUNDLE');
                        startCameraStream('INVENTORY_BUNDLE', 'environment');
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Camera size={13} /> {receiveBundlePhoto ? 'Retake Bundle Photo' : 'Open Camera for Bundle'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setReceiveInventoryStep(1); }}
                    className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if ((receiveSourceType === 'HQ_TREASURY_TRANSFER' || receiveSourceType === 'COMMERCIAL_BANK_COLLECTION') && !receiveTreasurySlipPhoto) {
                        alert('Treasury Slip photo evidence is required for ' + receiveSourceType.replace(/_/g, ' '));
                        return;
                      }
                      if ((receiveSourceType === 'CUSTOMER_CASH_SELL' || receiveSourceType === 'INTER_BRANCH_TRANSFER') && !receiveBundlePhoto) {
                        alert('Currency Bundle photo evidence is required for ' + receiveSourceType.replace(/_/g, ' '));
                        return;
                      }
                      setReceiveInventoryStep(3);
                    }}
                    className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    Next: Inventory Delta Preview →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Inventory Delta Preview */}
            {receiveInventoryStep === 3 && (() => {
              const inv = (dashboardData?.branchInventory || []).find((i: any) => i.currencyCode === receiveCurrencyCode);
              const currentStock = Number(inv?.availableAmount || 0);
              const addStock = Number(receiveAmount || 0);
              const newStock = currentStock + addStock;

              return (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                    <h4 className="font-black text-white text-sm">Real-time Inventory Delta Calculation</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Stock</span>
                        <strong className="text-base font-black text-slate-200">{currentStock.toLocaleString()} {receiveCurrencyCode}</strong>
                      </div>
                      <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase block">+ Receiving</span>
                        <strong className="text-base font-black text-emerald-400">+{addStock.toLocaleString()} {receiveCurrencyCode}</strong>
                      </div>
                      <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase block">New Stock Balance</span>
                        <strong className="text-base font-black text-indigo-300">{newStock.toLocaleString()} {receiveCurrencyCode}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700 text-slate-300 space-y-1">
                    <p className="font-bold text-white text-[11px]">Audit Impact Summary:</p>
                    <p className="text-[11px]">
                      Receiving <strong>{receiveCurrencyCode} {addStock.toLocaleString()}</strong> will automatically update vault balance for <strong>{dashboardData?.branch?.branchName || (user as any)?.branchName || 'Branch'}</strong>. Central Operations and City Inventory Network will immediately reflect updated stock availability for order assignments.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setReceiveInventoryStep(2); }}
                      className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setReceiveInventoryStep(4); }}
                      className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
                    >
                      Next: Review & Confirm →
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* STEP 4: Enterprise Summary & Confirmation */}
            {receiveInventoryStep === 4 && (() => {
              const inv = (dashboardData?.branchInventory || []).find((i: any) => i.currencyCode === receiveCurrencyCode);
              const currentStock = Number(inv?.availableAmount || 0);
              const addStock = Number(receiveAmount || 0);
              const newStock = currentStock + addStock;

              return (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2.5">
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Branch:</span>
                      <strong className="text-white">{dashboardData?.branch?.branchName || (user as any)?.branchName || 'Branch Vault'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Currency & Amount:</span>
                      <strong className="text-emerald-400 font-black text-sm">{receiveCurrencyCode} {addStock.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Business Source:</span>
                      <strong className="text-indigo-400">{receiveSourceType.replace(/_/g, ' ')}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Reference / Slip #:</span>
                      <strong className="text-white font-mono">{receiveReferenceNumber}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">New Vault Balance:</span>
                      <strong className="text-blue-400 font-black">{receiveCurrencyCode} {newStock.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Evidence Status:</span>
                      <strong className="text-emerald-400">
                        {receiveTreasurySlipPhoto && receiveBundlePhoto
                          ? 'Slip & Bundle Verified (✓)'
                          : receiveTreasurySlipPhoto
                            ? 'Treasury Slip Verified (✓)'
                            : receiveBundlePhoto
                              ? 'Bundle Photo Verified (✓)'
                              : 'Optional Upload'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Received By Manager:</span>
                      <strong className="text-white">{(user as any)?.fullName || (user as any)?.name || 'Branch Manager'}</strong>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setReceiveInventoryStep(3); }}
                      className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); submitInventoryReceipt(); }}
                      disabled={submittingInventoryReceipt}
                      className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submittingInventoryReceipt ? 'Processing Receipt...' : '📥 Confirm Inventory Receipt'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── FULLSCREEN LIGHTBOX PREVIEW MODAL ─────────────────────────────── */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white p-2 cursor-pointer"
            >
              <X size={24} />
            </button>
            <img src={fullscreenImage} alt="Evidence Fullscreen" className="max-w-full max-h-[85vh] rounded-2xl border border-slate-800 shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
