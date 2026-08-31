import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

import { useTransactionStore } from '@/stores/transactionStore';
import { useQuoteStore } from '@/stores/quoteStore';
import { useRates } from '@/hooks/useRates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, MapPin, Calendar, Briefcase, Plus, Edit2, Info, CheckCircle2, 
  Ticket, Globe, Landmark, User2, X, ChevronDown, Upload, FileText, AlertCircle, 
  Sparkles, Banknote, CreditCard, ArrowLeftRight, Send, Package, Receipt, 
  Building2, Truck, Zap, TriangleAlert, ShoppingCart, ShieldCheck, Lock, Clock,
  LayoutDashboard, ClipboardList, Users, Tag, Headphones, LogOut, Plane, Shield
} from 'lucide-react';

import { CitySelectorModal } from '../CitySelectorModal';
import { SameDayDeliveryModal } from '../SameDayDeliveryModal';
import { calculateForexGst } from '@/lib/gstCalculator';
import { getActiveBranches } from '@/lib/api-public';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { ALL_CURRENCIES_LIST, ALL_CURRENCIES_MAP } from '@/lib/currencyMetadata';
import { useAuth } from '@/context/AuthContext';
import CustomerAuthModal from '@/components/auth/CustomerAuthModal';
import { CurrencyDropdown } from '../CurrencyDropdown';
import { numberToWordsINR } from '@/lib/numberToWords';

const DESTINATION_COUNTRIES = [
  { name: 'United States', code: 'USA', flag: '🇺🇸' },
  { name: 'Europe (Schengen Area)', code: 'Europe', flag: '🇪🇺' },
  { name: 'United Kingdom', code: 'UK', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: 'UAE', flag: '🇦🇪' },
  { name: 'Singapore', code: 'Singapore', flag: '🇸🇬' },
  { name: 'Canada', code: 'Canada', flag: '🇨🇦' },
  { name: 'Australia', code: 'Australia', flag: '🇦🇺' },
  { name: 'Thailand', code: 'Thailand', flag: '🇹🇭' },
  { name: 'Japan', code: 'Japan', flag: '🇯🇵' },
  { name: 'Switzerland', code: 'Switzerland', flag: '🇨🇭' },
  { name: 'New Zealand', code: 'New Zealand', flag: '🇳🇿' },
  { name: 'Saudi Arabia', code: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Qatar', code: 'Qatar', flag: '🇶🇦' },
  { name: 'Hong Kong', code: 'Hong Kong', flag: '🇭🇰' },
  { name: 'Malaysia', code: 'Malaysia', flag: '🇲🇾' },
  { name: 'Vietnam', code: 'Vietnam', flag: '🇻🇳' },
  { name: 'Indonesia (Bali)', code: 'Indonesia', flag: '🇮🇩' },
  { name: 'South Korea', code: 'South Korea', flag: '🇰🇷' },
  { name: 'Turkey', code: 'Turkey', flag: '🇹🇷' },
  { name: 'Oman', code: 'Oman', flag: '🇴🇲' },
  { name: 'Bahrain', code: 'Bahrain', flag: '🇧🇭' },
  { name: 'Kuwait', code: 'Kuwait', flag: '🇰🇼' },
  { name: 'Mauritius', code: 'Mauritius', flag: '🇲🇺' },
  { name: 'Maldives', code: 'Maldives', flag: '🇲🇻' },
  { name: 'Sri Lanka', code: 'Sri Lanka', flag: '🇱🇰' },
  { name: 'Egypt', code: 'Egypt', flag: '🇪🇬' },
  { name: 'South Africa', code: 'South Africa', flag: '🇿🇦' },
  { name: 'Georgia', code: 'Georgia', flag: '🇬🇪' },
  { name: 'Azerbaijan', code: 'Azerbaijan', flag: '🇦🇿' },
  { name: 'Nepal', code: 'Nepal', flag: '🇳🇵' }
];

// Remittance Types
interface TransferPurpose {
  code: string;
  name: string;
  description: string;
  category: 'EDUCATION' | 'FAMILY' | 'GIFT' | 'MEDICAL' | 'IMMIGRATION' | 'INVESTMENT';
  tcsThreshold: number;
  tcsRateBelowThreshold: number;
  tcsRateAboveThreshold: number;
  requiredDocs: string[];
}

interface RemittanceCalculation {
  foreignAmount: number;
  currency: string;
  exchangeRate: number;
  inrSubtotal: number;
  feeAmount: number;
  tcsRate: number;
  tcsAmount: number;
  totalInr: number;
  thresholdExceeded: boolean;
}

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  swiftCode: string;
  country: string;
  currency: string;
}

const DUMMY_OFFERS = [
  {
    code: 'ZEROFEE',
    title: '100% Zero Fee Waiver',
    description: 'Flat ₹150 OFF on service charge',
    minAmount: 0,
    discountAmount: 150,
    tag: 'POPULAR',
  },
  {
    code: 'FLYHIGH500',
    title: 'Mega Travel Cashback',
    description: 'Flat ₹500 instant order discount',
    minAmount: 50000,
    discountAmount: 500,
    tag: 'BEST VALUE',
  },
  {
    code: 'STUDENT1000',
    title: 'Overseas Student Special',
    description: 'Flat ₹1,000 off on orders over ₹1 Lakh',
    minAmount: 100000,
    discountAmount: 1000,
    tag: 'STUDENT',
  },
  {
    code: 'WELCOME250',
    title: 'First Order Bonus',
    description: 'Flat ₹250 off on first order over ₹15,000',
    minAmount: 15000,
    discountAmount: 250,
    tag: 'NEW USER',
  },
];

export function ProductCalculatorStep() {
  const { draftState, updateDraft, allowedActions, sessionId } = useTransactionStore();
  const { lockQuote, isLocking } = useQuoteStore();
  const { data: rates } = useRates();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleTabSwitch = (newProduct: 'CASH' | 'CARD' | 'CASH_SELL' | 'REMITTANCE') => {
    updateDraft({ product: newProduct });
    const curr = draftState.currency || 'USD';
    const amt = draftState.amount || '1000';
    const city = draftState.city || 'Delhi';
    const fulfillment = draftState.deliveryMethod || 'HOME_DELIVERY';
    const query = `currency=${curr}&amount=${amt}&city=${encodeURIComponent(city)}&fulfillment=${fulfillment}`;
    if (newProduct === 'CASH') {
      router.replace(`/buy-forex?tab=buy&${query}`);
    } else if (newProduct === 'CARD') {
      router.replace(`/forex-cards?tab=card&type=card&${query}`);
    } else if (newProduct === 'CASH_SELL') {
      router.replace(`/sell-forex?tab=sell&${query}`);
    } else if (newProduct === 'REMITTANCE') {
      router.replace(`/remittance?tab=remittance&${query}`);
    }
  };

  // Coupon / Offers state
  const [couponInput, setCouponInput] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<typeof DUMMY_OFFERS[0] | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [deliveryDay, setDeliveryDay] = useState<'Today' | 'Tomorrow'>('Today');
  const [cutoffTimer, setCutoffTimer] = useState<string>('00h : 00m');

  // Rate Lock Timer (5 minute countdown)
  const [timeLeft, setTimeLeft] = useState(299);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 299));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMinutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const formatSeconds = String(timeLeft % 60).padStart(2, '0');

  useEffect(() => {
    const updateCutoff = () => {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour < 13) {
        setDeliveryDay('Today');
        const target = new Date();
        target.setHours(13, 0, 0, 0);
        const diffMs = Math.max(0, target.getTime() - now.getTime());
        const hrs = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
        const mins = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        setCutoffTimer(`${hrs}h : ${mins}m`);
      } else {
        setDeliveryDay('Tomorrow');
        const target = new Date();
        target.setDate(target.getDate() + 1);
        target.setHours(13, 0, 0, 0);
        const diffMs = Math.max(0, target.getTime() - now.getTime());
        const hrs = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
        const mins = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        setCutoffTimer(`${hrs}h : ${mins}m`);
      }
    };
    updateCutoff();
    const interval = setInterval(updateCutoff, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize draft state from URL parameters
  useEffect(() => {
    if (sessionId && searchParams) {
      const tab = searchParams.get('tab')?.toLowerCase();
      const type = searchParams.get('type')?.toLowerCase();
      const intent = searchParams.get('intent')?.toUpperCase();
      const productParam = searchParams.get('product')?.toUpperCase();
      const paramCurrency = searchParams.get('currency');
      const paramAmount = searchParams.get('amount');
      const paramBeneficiary = searchParams.get('beneficiaryId');
      
      const updates: any = {};
      
      let targetProduct = draftState.product;
      if (pathname === '/sell-forex' || tab === 'sell' || intent === 'SELL' || productParam === 'CASH_SELL') {
        targetProduct = 'CASH_SELL';
      } else if (pathname === '/remittance' || pathname === '/transfer-money' || pathname === '/trade-remittance' || tab === 'transfer' || tab === 'remittance' || intent === 'REMITTANCE' || productParam === 'REMITTANCE') {
        targetProduct = 'REMITTANCE';
      } else if (pathname === '/forex-cards' || pathname === '/cards' || tab === 'card' || type === 'card' || intent === 'CARD' || productParam === 'CARD') {
        targetProduct = 'CARD';
      } else if (pathname === '/buy-forex' || tab === 'buy' || type === 'cash' || intent === 'CASH' || productParam === 'CASH') {
        targetProduct = 'CASH';
      } else if (!draftState.product) {
        targetProduct = 'CASH';
      }
      
      if (targetProduct) {
        updates.product = targetProduct;
      }
      if (paramCurrency && paramCurrency.toUpperCase() !== draftState.currency) {
        updates.currency = paramCurrency.toUpperCase();
        updates.checkoutStep = 1;
        updates.status = 'CREATED';
      }
      if (paramAmount && paramAmount !== draftState.amount) {
        updates.amount = paramAmount;
      }
      if (paramBeneficiary && paramBeneficiary !== draftState.beneficiaryId) {
        updates.beneficiaryId = paramBeneficiary;
      }

      const paramCountry = searchParams.get('country') || searchParams.get('countryCode');
      if (paramCountry && paramCountry.toUpperCase() !== draftState.countryCode) {
        updates.countryCode = paramCountry.toUpperCase();
      }
      
      const paramCity = searchParams.get('city');
      const paramFulfillment = searchParams.get('fulfillment') || searchParams.get('deliveryMethod');
      const paramPurpose = searchParams.get('purpose');

      if (paramCity && paramCity !== draftState.city) {
        updates.city = paramCity;
      }
      if (paramFulfillment) {
        const normalized = (paramFulfillment.toUpperCase() === 'DOORSTEP' || paramFulfillment.toUpperCase() === 'HOME_DELIVERY') 
          ? 'HOME_DELIVERY' 
          : 'PICKUP';
        if (normalized !== draftState.deliveryMethod) {
          updates.deliveryMethod = normalized;
        }
      }
      if (paramPurpose && paramPurpose !== draftState.purpose) {
        updates.purpose = paramPurpose;
      }
      
      if (draftState.checkoutStep === 5 || draftState.status === 'CONVERTED') {
        updates.checkoutStep = 1;
        updates.status = 'CREATED';
        updates.bookingRef = undefined;
      }
      
      if (Object.keys(updates).length > 0) {
        updateDraft(updates);
      }
    }
  }, [searchParams, sessionId, pathname]);

  // Ensure default fulfillment is set
  useEffect(() => {
    if (!draftState.deliveryMethod) {
      updateDraft({ deliveryMethod: 'HOME_DELIVERY' });
    }
  }, [draftState.deliveryMethod]);

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isDeliveryPolicyOpen, setIsDeliveryPolicyOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Active product flags
  const [productsStatus, setProductsStatus] = useState<Record<string, boolean>>({
    CASH: true,
    CARD: true,
    FOREX_CARD: true,
    CASH_SELL: true,
    REMITTANCE: true,
  });

  useEffect(() => {
    fetch(`${API_URL}/api/public/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach((p: any) => {
            map[p.code] = p.isActive;
            if (p.code === 'FOREX_CARD') map['CARD'] = p.isActive;
          });
          setProductsStatus(prev => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});
  }, []);

  const isCurrentProductActive = 
    draftState.product === 'CARD' ? productsStatus.FOREX_CARD !== false && productsStatus.CARD !== false :
    productsStatus[draftState.product || 'CASH'] !== false;

  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);
  const [extraCurrencies, setExtraCurrencies] = useState<{ currency: string; amount: string }[]>(
    draftState.extraCurrencies || []
  );

  const updateExtraCurrencies = (newExtra: { currency: string; amount: string }[]) => {
    setExtraCurrencies(newExtra);
    updateDraft({ extraCurrencies: newExtra });
  };

  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
  const [newCurrencyCode, setNewCurrencyCode] = useState('EUR');
  const [newCurrencyAmount, setNewCurrencyAmount] = useState('500');

  const [extraCountries, setExtraCountries] = useState<string[]>([]);
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [selectedExtraCountry, setSelectedExtraCountry] = useState('Europe');

  // Travel Details
  const destination = draftState.destination || '';
  const departureDate = draftState.departureDate || '';
  const returnDate = draftState.returnDate || '';
  const noReturnDate = draftState.noReturnDate || false;
  const purpose = draftState.purpose || '';
  const selectedCity = draftState.city || 'Delhi';

  const todayStr = new Date().toISOString().split('T')[0];
  const maxTravelDate = new Date();
  maxTravelDate.setDate(maxTravelDate.getDate() + 60);
  const maxTravelDateStr = maxTravelDate.toISOString().split('T')[0];

  const handleDepartureDateChange = (val: string) => {
    const updates: any = { departureDate: val };
    if (!val) {
      updateDraft(updates);
      return;
    }
    const dep = new Date(val);
    const minAllowed = new Date(dep.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (returnDate && returnDate < minAllowed) {
      updates.returnDate = minAllowed;
    } else if (!returnDate) {
      const defRet = new Date(dep.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      updates.returnDate = defRet;
    }
    updateDraft(updates);
  };

  // Branch list state
  const [branches, setBranches] = useState<any[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  useEffect(() => {
    async function loadBranches() {
      try {
        setBranchesLoading(true);
        const data = await getActiveBranches();
        setBranches(data);
      } catch (err) {
        console.error("Failed to load branches:", err);
      } finally {
        setBranchesLoading(false);
      }
    }
    loadBranches();
  }, []);

  const availableCityBranches = useMemo(() => {
    if (!selectedCity) return [];
    return branches.filter((b) => b.city?.toLowerCase() === selectedCity.toLowerCase());
  }, [branches, selectedCity]);

  const hasBranchesInCity = availableCityBranches.length > 0;

  // Remittance State
  const [purposes, setPurposes] = useState<TransferPurpose[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [remCalc, setRemCalc] = useState<RemittanceCalculation | null>(null);
  const [isCalcLoading, setIsCalcLoading] = useState(false);

  // Modal State for New Beneficiary
  const [showAddBenModal, setShowAddBenModal] = useState(false);
  const [newBen, setNewBen] = useState({
    name: '',
    accountNumber: '',
    bankName: '',
    swiftCode: '',
    country: '',
    currency: 'USD',
  });

  const product = draftState.product || 'CASH';
  const currency = draftState.currency || 'USD';
  const amount = draftState.amount || '1000';
  const deliveryMethod = draftState.deliveryMethod || 'HOME_DELIVERY';
  const branchId = draftState.branchId || '';

  const isSell = product === 'CASH_SELL';
  const isRemittance = product === 'REMITTANCE';
  const isCard = product === 'CARD';

  const productName = 
    product === 'CARD' ? 'Multi-Currency Forex Card' :
    product === 'CASH_SELL' ? 'Sell Foreign Currency' :
    product === 'REMITTANCE' ? 'Outward Remittance' :
    'Foreign Currency Notes';

  // Load Remittance Purposes
  useEffect(() => {
    if (isRemittance) {
      fetch(`${API_URL}/api/remittance/purposes`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setPurposes(data);
            if (!draftState.purposeCode) {
              updateDraft({ purposeCode: data[0].code });
            }
          }
        })
        .catch(() => {});
    }
  }, [isRemittance]);

  // Load Beneficiaries
  const fetchBeneficiaries = async () => {
    try {
      const res = await authFetch(`${API_URL}/api/remittance/beneficiaries`);
      if (res.ok) {
        const data = await res.json();
        setBeneficiaries(data);
        if (data.length > 0 && !draftState.beneficiaryId) {
          updateDraft({ 
            beneficiaryId: data[0].id,
            beneficiaryName: data[0].name
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isRemittance) {
      fetchBeneficiaries();
    }
  }, [isRemittance]);

  // Rate Helper
  const getEffectiveRateForCurrency = (currCode: string): number => {
    let baseRate = 83.50;
    if (Array.isArray(rates) && rates.length > 0) {
      const found = rates.find((r: any) => r.currency?.code === currCode || r.currency === currCode);
      if (found && (found.inrRate || found.rate)) {
        baseRate = Number(found.inrRate || found.rate);
      }
    }
    if (isSell) return Math.round((baseRate - 0.63) * 100) / 100;
    if (isRemittance) return Math.round((baseRate + 0.10) * 100) / 100;
    return Math.round((baseRate + 0.63) * 100) / 100;
  };

  const adjustedRate = getEffectiveRateForCurrency(currency);

  const getCurrencyName = (code: string) => {
    const meta = ALL_CURRENCIES_MAP[code];
    return meta ? `${meta.flag} ${meta.code} - ${meta.name}` : code;
  };

  // Real-time Remittance Calculation
  useEffect(() => {
    if (!isRemittance || !amount || Number(amount) <= 0 || !draftState.purposeCode) {
      setRemCalc(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsCalcLoading(true);
        const res = await fetch(`${API_URL}/api/remittance/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(amount),
            currency,
            purposeCode: draftState.purposeCode,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setRemCalc(data);
          updateDraft({
            inrSubtotal: data.inrSubtotal,
            feeAmount: data.feeAmount,
            tcsAmount: data.tcsAmount,
            totalPayable: data.totalInr,
          });
        }
      } catch (err) {
        console.error("Calculation failed:", err);
      } finally {
        setIsCalcLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isRemittance, amount, currency, draftState.purposeCode]);

  // Branch Selection logic
  useEffect(() => {
    if (branches.length > 0 && selectedCity) {
      const cityBranches = branches.filter((b) => b.city?.toLowerCase() === selectedCity.toLowerCase());
      if (cityBranches.length > 0) {
        if (!branchId || !cityBranches.some((b) => b.id === branchId)) {
          updateDraft({ branchId: cityBranches[0].id });
        }
      } else {
        if (deliveryMethod === 'PICKUP') {
          updateDraft({ deliveryMethod: 'HOME_DELIVERY', branchId: '' });
        }
      }
    }
  }, [branches, selectedCity, branchId, deliveryMethod]);

  // Financial Calculations
  const inrEquivalent = useMemo(() => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || !adjustedRate) return 0;
    return Math.round(amt * adjustedRate);
  }, [amount, adjustedRate]);

  const extraCurrenciesCalculated = useMemo(() => {
    return extraCurrencies.map((c) => {
      const rate = getEffectiveRateForCurrency(c.currency);
      const amt = parseFloat(c.amount) || 0;
      return {
        ...c,
        rate,
        inrEquivalent: Math.round(amt * rate)
      };
    });
  }, [extraCurrencies, rates, isSell, isRemittance]);

  const totalCurrencyInrValue = useMemo(() => {
    const mainVal = inrEquivalent || 0;
    const extraVal = extraCurrenciesCalculated.reduce((acc, curr) => acc + curr.inrEquivalent, 0);
    return mainVal + extraVal;
  }, [inrEquivalent, extraCurrenciesCalculated]);

  // Handle Offer Removal if total falls below requirement
  useEffect(() => {
    if (appliedOffer) {
      const currentVal = totalCurrencyInrValue || inrEquivalent || 0;
      if (currentVal < appliedOffer.minAmount) {
        setAppliedOffer(null);
        setCouponInput('');
        setCouponError(`Offer '${appliedOffer.code}' was removed because minimum order amount (₹${appliedOffer.minAmount.toLocaleString('en-IN')}) is no longer met.`);
      }
    }
  }, [totalCurrencyInrValue, appliedOffer]);

  // Fee breakdown
  const parsedAmount = parseFloat(amount) || 0;
  const hasAnyCurrency = parsedAmount > 0 || extraCurrenciesCalculated.some(c => parseFloat(c.amount) > 0);

  const serviceCharge = hasAnyCurrency ? 150 : 0;
  const deliveryCharge = (!isRemittance && deliveryMethod === 'HOME_DELIVERY' && hasAnyCurrency) ? 150 : 0;
  const gst = totalCurrencyInrValue > 0 ? calculateForexGst(totalCurrencyInrValue) : 0;

  const appliedDiscount = appliedOffer ? appliedOffer.discountAmount : 0;

  const basePayableAmount = product === 'CASH_SELL'
    ? (totalCurrencyInrValue > 0 ? (totalCurrencyInrValue - serviceCharge - deliveryCharge - gst) : 0)
    : (totalCurrencyInrValue > 0 ? (totalCurrencyInrValue + serviceCharge + deliveryCharge + gst) : 0);

  const payableAmount = product === 'CASH_SELL'
    ? basePayableAmount
    : Math.max(0, basePayableAmount - appliedDiscount);

  const handleSelectOffer = (offer: typeof DUMMY_OFFERS[0]) => {
    if (appliedOffer?.code === offer.code) {
      return;
    }
    const currentVal = totalCurrencyInrValue || inrEquivalent || 0;
    if (currentVal < offer.minAmount) {
      setCouponError(`Min order amount of ₹${offer.minAmount.toLocaleString('en-IN')} required for ${offer.code}`);
      return;
    }
    setCouponError(null);
    setAppliedOffer(offer);
    setCouponInput(offer.code);
  };

  const handleApplyInputCoupon = () => {
    setCouponError(null);
    const codeToTest = couponInput.trim().toUpperCase();
    if (!codeToTest) return;
    const found = DUMMY_OFFERS.find(o => o.code === codeToTest);
    if (!found) {
      setCouponError(`Invalid promo code '${codeToTest}'. Choose an available offer below.`);
      return;
    }
    handleSelectOffer(found);
  };

  const handleQuote = async () => {
    if (!product || !currency || !amount) {
      alert("Please enter a valid amount.");
      return;
    }
    if (departureDate && returnDate && returnDate < departureDate) {
      updateDraft({ returnDate: departureDate });
    }
    if (!isCurrentProductActive) {
      alert('This product is temporarily disabled by administrator.');
      return;
    }
    updateDraft({ 
      extraCurrencies,
      totalCurrencyInrValue,
      serviceCharge,
      deliveryCharge,
      gst,
      payableAmount,
    });

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    proceedToNextStep();
  };

  const proceedToNextStep = () => {
    updateDraft({ checkoutStep: 2 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    updateDraft({ 
      extraCurrencies,
      totalCurrencyInrValue,
      serviceCharge,
      deliveryCharge,
      gst,
      payableAmount,
    });
    proceedToNextStep();
  };

  const getEligibilityMessage = () => {
    if (product === 'CARD') {
      return <span>Pre-payment required for <strong className="text-slate-300">Card Issuance</strong></span>;
    }
    if (product === 'REMITTANCE') {
      return <span>100% RBI LRS Compliant <strong className="text-slate-300">International Wire Transfer</strong></span>;
    }
    if (draftState.deliveryMethod === 'HOME_DELIVERY') {
      return <span>You are eligible for <strong className="text-slate-300">Pay On Delivery</strong></span>;
    }
    return <span>You are eligible for <strong className="text-slate-300">Pay At Branch</strong></span>;
  };

  return (
    <div className="w-full text-left relative text-white selection:bg-cyan-500 selection:text-black">
      
      {/* Top Header Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 pt-2 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2">
          {/* Logo on mobile or small header */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                <span>ForexMate</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-amber-400/90">
                Premium Forex Services
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators & Profile */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Secure</span>
          </div>

          <div className="bg-slate-900/80 border border-white/10 text-slate-300 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-xs">
            <span>Zero Hidden Charges</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div 
            onClick={() => {
              if (!user) setShowAuthModal(true);
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/20 text-white font-bold text-xs flex items-center justify-center shadow-md cursor-pointer hover:border-amber-400 transition-colors"
            title={user ? `Logged in as ${user.name || user.email}` : "Click to sign in"}
          >
            {user ? (user.name ? user.name[0].toUpperCase() : 'U') : 'N'}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Floating Glass Navigation Sidebar */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Menu
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer text-left"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('CASH')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
                product === 'CASH'
                  ? 'bg-gradient-to-r from-amber-500/25 to-amber-500/5 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Buy Forex</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('CARD')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
                product === 'CARD'
                  ? 'bg-gradient-to-r from-amber-500/25 to-amber-500/5 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Forex Card</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('REMITTANCE')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
                product === 'REMITTANCE'
                  ? 'bg-gradient-to-r from-amber-500/25 to-amber-500/5 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Send Remittance</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('CASH_SELL')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
                product === 'CASH_SELL'
                  ? 'bg-gradient-to-r from-amber-500/25 to-amber-500/5 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Sell Forex</span>
            </button>

            <div className="pt-2 pb-1 border-t border-white/10 mt-2">
              <button
                type="button"
                onClick={() => router.push('/dashboard/orders')}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer text-left"
              >
                <ClipboardList className="w-4 h-4 text-slate-400" />
                <span>Orders</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/beneficiaries')}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer text-left"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Beneficiaries</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('offers-card');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer text-left"
              >
                <Tag className="w-4 h-4 text-slate-400" />
                <span>Offers</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/support')}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer text-left"
              >
                <Headphones className="w-4 h-4 text-slate-400" />
                <span>Support</span>
              </button>
            </div>

            {user && (
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-all flex items-center gap-3 cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Main Funnel Cards */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          
          {/* Card 1: Amount & Currency */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
            {/* Header / Stepper Number */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                1
              </div>
              <div>
                <h2 className="font-extrabold text-base text-white tracking-tight">
                  Amount & Currency
                </h2>
                <p className="text-xs text-slate-400">
                  Enter amount and select your preferred currency
                </p>
              </div>
            </div>

            {/* Dual Hero Panels: You Pay & Live Interbank Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* You Pay Display Box */}
              <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isSell ? 'You Handover (INR Value)' : 'You Pay'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                  <span className="text-slate-400 text-xl font-sans">₹</span>
                  <span>{Math.round(inrEquivalent || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium italic truncate">
                  {numberToWordsINR(inrEquivalent || 0) || 'Enter forex amount below'}
                </div>
              </div>

              {/* Live Rate Display Box */}
              <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Live Interbank Rate
                  </span>
                  <span className="bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>LIVE</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black text-white font-mono">
                    1 {currency} = ₹{adjustedRate?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">
                    +0.12 (0.14%)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero Hidden Margin</span>
                </div>
              </div>
            </div>

            {/* Inputs: Select Currency & Forex Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pt-1">
              <div className="sm:col-span-6">
                <CurrencyDropdown
                  value={currency}
                  onChange={(newCurr) => updateDraft({ currency: newCurr })}
                  ratesData={rates}
                  rateType={isSell ? 'sell' : isRemittance ? 'remittance' : 'buy'}
                  label="Select Currency"
                  darkMode={true}
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  {isSell ? 'You Handover (Forex Amount)' : 'You Receive (Forex Amount)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => updateDraft({ amount: e.target.value })}
                    placeholder="1000.00"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-3 pr-16 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono shadow-inner"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-300 bg-slate-800 px-2 py-1 rounded-md border border-white/10">
                      {currency}
                    </span>
                    <button
                      type="button"
                      title={extraCurrencies.length > 0 ? "Remove currency" : "Clear amount"}
                      onClick={() => {
                        if (extraCurrencies.length > 0) {
                          const nextPrimary = extraCurrencies[0];
                          const remaining = extraCurrencies.slice(1);
                          updateDraft({ 
                            currency: nextPrimary.currency, 
                            amount: nextPrimary.amount,
                            extraCurrencies: remaining 
                          });
                          setExtraCurrencies(remaining);
                        } else {
                          updateDraft({ amount: '' });
                        }
                      }}
                      className="text-slate-400 hover:text-rose-400 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-0.5">
                  <span>Rate: 1 {currency} = ₹{adjustedRate?.toFixed(2)}</span>
                  <span className="text-cyan-400 font-bold font-mono">
                    Forex Value: ₹{inrEquivalent ? inrEquivalent.toLocaleString('en-IN') : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Currencies Rows */}
            {extraCurrenciesCalculated.map((c, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-white">{getCurrencyName(c.currency)}</span>
                  <span className="text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                    {c.amount} {c.currency} = <strong className="text-cyan-400">₹ {Math.round(c.inrEquivalent).toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-slate-400 font-mono">@ ₹{c.rate.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateExtraCurrencies(extraCurrencies.filter((_, i) => i !== idx))}
                  className="text-rose-400 hover:text-rose-300 text-xs font-bold bg-rose-950/40 border border-rose-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Conditionally Render + Add Another Currency */}
            {Boolean(amount && parseFloat(amount) > 0) && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAddCurrencyModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>+ Add Another Currency</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Fulfillment Method & Travel Details */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
            
            {/* Stepper Tabs Bar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>1 Fulfillment Method</span>
              </button>

              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>2 Travel Details</span>
              </button>

              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>3 Review & Pay</span>
              </button>
            </div>

            {/* Top Doorstep Delivery Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-300 bg-slate-800/40 p-3 px-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Guaranteed delivery by</span>
                <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-white/10 text-[11px]">
                  {deliveryDay}, 9:00 PM
                </span>
                <span>to</span>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-900 px-2.5 py-0.5 rounded-md border border-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-3 h-3 text-cyan-400" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryPolicyOpen(true)}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Same-Day Policy</span>
              </button>
            </div>

            {/* Fulfillment Options (Only shown when not Remittance) */}
            {!isRemittance && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch Pickup */}
                  {hasBranchesInCity ? (
                    <div
                      onClick={() => updateDraft({ deliveryMethod: 'PICKUP', branchId: availableCityBranches[0]?.id })}
                      className={`border p-4 rounded-2xl cursor-pointer transition-all flex items-start justify-between relative ${
                        deliveryMethod === 'PICKUP'
                          ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                          : 'border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border ${
                          deliveryMethod === 'PICKUP' ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400' : 'bg-slate-800 border-white/10 text-slate-400'
                        }`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">
                            {product === 'CASH_SELL' ? 'Branch Visit' : 'Branch Pickup'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {product === 'CASH_SELL' ? 'Visit our branch vault to verify & get paid' : 'Collect directly from our authorized branch vault'}
                          </div>
                        </div>
                      </div>

                      {deliveryMethod === 'PICKUP' && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ml-2">
                          ✓
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="border border-dashed border-white/10 bg-slate-900/30 p-4 rounded-2xl cursor-not-allowed opacity-50 select-none flex items-start gap-3"
                      title={`No branches in ${selectedCity}`}
                    >
                      <div className="p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-500">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-400">Branch Pickup</div>
                        <div className="text-xs text-slate-500 mt-0.5">Not available in {selectedCity}</div>
                      </div>
                    </div>
                  )}

                  {/* Home Delivery */}
                  <div
                    onClick={() => updateDraft({ deliveryMethod: 'HOME_DELIVERY' })}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all flex items-start justify-between relative ${
                      deliveryMethod === 'HOME_DELIVERY'
                        ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl border ${
                        deliveryMethod === 'HOME_DELIVERY' ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400' : 'bg-slate-800 border-white/10 text-slate-400'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          {product === 'CASH_SELL' ? 'Home Collection' : 'Home Delivery'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {product === 'CASH_SELL' ? 'Our executive will collect currency from your doorstep' : 'Guaranteed safe delivery to your address'}
                        </div>
                      </div>
                    </div>

                    {deliveryMethod === 'HOME_DELIVERY' && (
                      <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ml-2">
                        ✓
                      </div>
                    )}
                  </div>
                </div>

                {/* Branch Dropdown selector if Pickup */}
                {deliveryMethod === 'PICKUP' && hasBranchesInCity && (
                  <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Select Pickup Branch in {selectedCity}
                    </label>
                    <div className="relative">
                      <select
                        value={branchId}
                        onChange={(e) => updateDraft({ branchId: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pr-10 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                      >
                        {availableCityBranches.map((b) => (
                          <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                            {b.name} ({b.city}) - {b.address}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Travel Details Form */}
            {!isSell && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Travel Details
                </div>

                {/* Country Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Add Travel Destination
                  </label>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {destination && (
                      <div className="flex items-center bg-cyan-950/60 border border-cyan-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold text-cyan-300 shadow-sm">
                        <span>{destination}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (extraCountries.length > 0) {
                              const nextPrimary = extraCountries[0];
                              const remaining = extraCountries.slice(1);
                              updateDraft({ destination: nextPrimary });
                              setExtraCountries(remaining);
                            } else {
                              updateDraft({ destination: '' });
                            }
                          }}
                          className="ml-2 text-slate-400 hover:text-rose-400 font-bold text-xs cursor-pointer"
                          title="Remove country"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {extraCountries.map((c, idx) => (
                      <div key={idx} className="flex items-center bg-slate-800 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => setExtraCountries(prev => prev.filter((_, i) => i !== idx))}
                          className="ml-2 text-slate-400 hover:text-rose-400 font-bold text-xs cursor-pointer"
                          title="Remove country"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {!destination && (
                      <select
                        value={destination}
                        onChange={(e) => updateDraft({ destination: e.target.value })}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-cyan-500 outline-none max-w-xs cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-white">Select Country</option>
                        {DESTINATION_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {destination && (
                      <button
                        type="button"
                        onClick={() => setShowAddCountryModal(true)}
                        className="border border-white/10 hover:border-cyan-500 rounded-xl px-3 py-2 text-[11px] font-bold text-cyan-400 hover:bg-cyan-950/30 uppercase tracking-wider transition-all cursor-pointer"
                      >
                        + Add Country
                      </button>
                    )}
                  </div>
                </div>

                {/* Travel Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Departure Date *</label>
                    <input
                      type="date"
                      min={todayStr}
                      max={maxTravelDateStr}
                      value={departureDate}
                      onChange={(e) => handleDepartureDateChange(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {!noReturnDate && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Return Date</label>
                      <input
                        type="date"
                        min={departureDate || todayStr}
                        value={returnDate}
                        onChange={(e) => updateDraft({ returnDate: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                </div>

                {/* Purpose of Travel */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Purpose of Travel *</label>
                  <select
                    value={purpose}
                    onChange={(e) => updateDraft({ purpose: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-white">Select Purpose</option>
                    <option value="HOLIDAY" className="bg-slate-900 text-white">Holiday / Leisure Travel</option>
                    <option value="BUSINESS" className="bg-slate-900 text-white">Business Travel</option>
                    <option value="EDUCATION" className="bg-slate-900 text-white">Higher Studies Overseas</option>
                    <option value="MEDICAL" className="bg-slate-900 text-white">Medical Treatment</option>
                    <option value="EMPLOYMENT" className="bg-slate-900 text-white">Employment Abroad</option>
                    <option value="EMIGRATION" className="bg-slate-900 text-white">Emigration</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Capsule */}
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-40">
            {/* Live Rate Lock Countdown Clock */}
            <div className="flex items-center gap-3 bg-slate-950/70 border border-white/10 px-4 py-2.5 rounded-2xl shadow-inner">
              <Lock className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-bold text-slate-300">
                <span>Rate Locked For: </span>
                <span className="font-mono text-white font-extrabold ml-1 tracking-wider text-sm text-amber-400">
                  {formatMinutes} : {formatSeconds}
                </span>
                <span className="text-[10px] text-slate-500 ml-1.5">Min Sec</span>
              </div>
            </div>

            {/* Primary Action Button (Golden Glow) */}
            <button
              type="button"
              onClick={handleQuote}
              disabled={
                isLocking ||
                !amount ||
                (!isSell && (!destination || !departureDate || !purpose)) ||
                (deliveryMethod === 'PICKUP' && !branchId) ||
                (deliveryMethod === 'HOME_DELIVERY' && totalCurrencyInrValue < 25000)
              }
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              <span>{isLocking ? 'LOCKING RATE...' : 'LOCK RATE & CONTINUE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Validation Warning Notice */}
          {!isRemittance && deliveryMethod === 'HOME_DELIVERY' && totalCurrencyInrValue > 0 && totalCurrencyInrValue < 25000 && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-300 flex items-center gap-2">
              <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Doorstep delivery requires minimum ₹25,000 order value. Switch to Branch Pickup or add more currency to proceed.</span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Order Summary & Voucher Vault */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-6">
          
          {/* Card 1: Order Summary */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">Order Summary</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">INR</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total Currency Value</span>
                <span className="font-bold text-white font-mono">₹ {Math.round(totalCurrencyInrValue).toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pl-2">
                <span>{amount || 0} {currency} @ ₹{adjustedRate?.toFixed(2)}</span>
                <span className="font-mono">₹ {inrEquivalent.toLocaleString('en-IN')}.00</span>
              </div>

              {extraCurrenciesCalculated.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] text-cyan-400 pl-2">
                  <span>{c.amount} {c.currency} @ ₹{c.rate.toFixed(2)}</span>
                  <span className="font-mono">₹ {Math.round(c.inrEquivalent).toLocaleString('en-IN')}.00</span>
                </div>
              ))}

              <div className="flex justify-between items-center text-slate-300 pt-1">
                <span>Service Charges</span>
                <span className="font-bold text-white font-mono">₹ {serviceCharge}.00</span>
              </div>

              {!isRemittance && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-white font-mono">
                    {deliveryMethod === 'HOME_DELIVERY' ? `₹ ${deliveryCharge}.00` : 'FREE (Pickup)'}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-300">
                <span>GST (18%)</span>
                <span className="font-bold text-white font-mono">₹ {gst}.00</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                  <span>Promo Discount ({appliedOffer?.code})</span>
                  <span className="font-mono">- ₹ {appliedDiscount}.00</span>
                </div>
              )}

              {/* Glowing Golden Total Payable */}
              <div className="pt-3 border-t border-white/10 space-y-1">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-white font-black block text-xs">
                      {product === 'CASH_SELL' ? 'Total to Receive' : 'Total Payable Amount'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Incl. GST & Zero Margin
                    </span>
                  </div>
                  <span className="font-black text-amber-400 text-xl font-mono tracking-tight drop-shadow-md">
                    ₹ {payableAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.00
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl text-center border border-white/5">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {getEligibilityMessage()}
              </span>
            </div>
          </div>

          {/* Card 2: Offers & Coupons Vault */}
          <div id="offers-card" className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">Offers & Coupons</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {DUMMY_OFFERS.length} Available
              </span>
            </div>

            {/* Coupon input */}
            <div className="flex items-center gap-2 bg-slate-950/70 border border-white/10 rounded-xl p-1.5 focus-within:border-cyan-500 transition-all">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="ENTER PROMO CODE"
                className="bg-transparent flex-1 min-w-0 px-2 text-xs font-mono font-bold focus:outline-none uppercase placeholder:normal-case placeholder:text-slate-500 text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (appliedOffer?.code !== couponInput) {
                    handleApplyInputCoupon();
                  }
                }}
                className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  appliedOffer?.code === couponInput
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white'
                }`}
              >
                {appliedOffer?.code === couponInput ? 'Applied ✓' : 'Apply'}
              </button>
            </div>

            {couponError && (
              <div className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            {/* Offers list */}
            <div className="space-y-2.5 pt-1">
              {DUMMY_OFFERS.map((offer) => {
                const currentInrVal = inrEquivalent || 0;
                const isEligible = currentInrVal >= offer.minAmount;
                const isSelected = appliedOffer?.code === offer.code;

                return (
                  <div
                    key={offer.code}
                    className={`p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/60 ring-1 ring-amber-400/20'
                        : isEligible
                          ? 'bg-slate-800/40 border-white/10 hover:border-white/20'
                          : 'bg-slate-900/30 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                            {offer.code}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-400 uppercase">
                            {offer.tag}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">
                          {offer.title}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {offer.description}
                        </p>
                      </div>

                      {isEligible ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isSelected) handleSelectOffer(offer);
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white'
                          }`}
                        >
                          {isSelected ? 'Applied ✓' : 'Apply'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Modals with Dark Backdrop */}
      <CitySelectorModal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)} 
        onSelect={(city) => updateDraft({ city })} 
      />

      <SameDayDeliveryModal 
        isOpen={isDeliveryPolicyOpen} 
        onClose={() => setIsDeliveryPolicyOpen(false)} 
      />

      {/* Add Currency Modal */}
      {showAddCurrencyModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">+ Add Secondary Currency</h3>
              <button onClick={() => setShowAddCurrencyModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <CurrencyDropdown
                  value={newCurrencyCode}
                  onChange={(code) => setNewCurrencyCode(code)}
                  ratesData={rates}
                  rateType={isSell ? 'sell' : isRemittance ? 'remittance' : 'buy'}
                  label="Select Secondary Currency"
                  darkMode={true}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Required Amount</label>
                <input 
                  type="number"
                  value={newCurrencyAmount}
                  onChange={(e) => setNewCurrencyAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-sm font-bold text-white focus:border-cyan-500 outline-none"
                  placeholder="500.00"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  if (newCurrencyAmount && Number(newCurrencyAmount) > 0) {
                    updateExtraCurrencies([...extraCurrencies, { currency: newCurrencyCode, amount: newCurrencyAmount }]);
                    setShowAddCurrencyModal(false);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer"
              >
                Add Currency
              </Button>
              <Button variant="outline" onClick={() => setShowAddCurrencyModal(false)} className="rounded-xl border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Country Modal */}
      {showAddCountryModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">+ Add Destination Country</h3>
              <button onClick={() => setShowAddCountryModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Choose Additional Country</label>
              <select 
                value={selectedExtraCountry}
                onChange={(e) => setSelectedExtraCountry(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-sm font-bold text-white focus:border-cyan-500 outline-none cursor-pointer"
              >
                {DESTINATION_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  if (selectedExtraCountry && !extraCountries.includes(selectedExtraCountry)) {
                    if (!destination) {
                      updateDraft({ destination: selectedExtraCountry });
                    } else if (selectedExtraCountry !== destination) {
                      setExtraCountries(prev => [...prev, selectedExtraCountry]);
                    }
                  }
                  setShowAddCountryModal(false);
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer"
              >
                Add Destination
              </Button>
              <Button variant="outline" onClick={() => setShowAddCountryModal(false)} className="rounded-xl border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Auth Modal */}
      <CustomerAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
