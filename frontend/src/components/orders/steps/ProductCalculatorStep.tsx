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
import { getActiveBranches, getServiceCharges } from '@/lib/api-public';
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

export const resolveDestinationCountryName = (input?: string, currencyCode?: string): string => {
  if (input) {
    const clean = input.trim().toLowerCase();
    if (clean === 'ca' || clean.includes('canada')) return 'Canada';
    if (clean === 'sg' || clean.includes('singapore')) return 'Singapore';
    if (clean === 'us' || clean === 'usa' || clean.includes('united states') || clean.includes('america')) return 'United States';
    if (clean === 'uk' || clean === 'gb' || clean.includes('united kingdom') || clean.includes('britain') || clean.includes('england')) return 'United Kingdom';
    if (clean === 'ae' || clean === 'uae' || clean.includes('emirates') || clean.includes('dubai')) return 'United Arab Emirates';
    if (clean === 'au' || clean.includes('australia')) return 'Australia';
    if (clean === 'de' || clean.includes('germany') || clean.includes('schengen') || clean.includes('europe')) return 'Europe (Schengen Area)';
    if (clean === 'ch' || clean.includes('switzerland')) return 'Switzerland';
    if (clean === 'nz' || clean.includes('new zealand')) return 'New Zealand';
    if (clean === 'jp' || clean.includes('japan')) return 'Japan';
    if (clean === 'th' || clean.includes('thailand')) return 'Thailand';
    if (clean === 'sa' || clean.includes('saudi')) return 'Saudi Arabia';
    if (clean === 'qa' || clean.includes('qatar')) return 'Qatar';
    if (clean === 'hk' || clean.includes('hong kong')) return 'Hong Kong';
    if (clean === 'my' || clean.includes('malaysia')) return 'Malaysia';
    if (clean === 'vn' || clean.includes('vietnam')) return 'Vietnam';
    if (clean === 'id' || clean.includes('indonesia')) return 'Indonesia (Bali)';
    if (clean === 'kr' || clean.includes('korea')) return 'South Korea';
    if (clean === 'za' || clean.includes('south africa')) return 'South Africa';

    const matched = DESTINATION_COUNTRIES.find(
      (c) => c.name.toLowerCase() === clean || c.code.toLowerCase() === clean
    );
    if (matched) return matched.name;
  }

  if (currencyCode) {
    const curr = currencyCode.trim().toUpperCase();
    if (curr === 'CAD') return 'Canada';
    if (curr === 'SGD') return 'Singapore';
    if (curr === 'USD') return 'United States';
    if (curr === 'GBP') return 'United Kingdom';
    if (curr === 'EUR') return 'Europe (Schengen Area)';
    if (curr === 'AUD') return 'Australia';
    if (curr === 'AED') return 'United Arab Emirates';
    if (curr === 'JPY') return 'Japan';
    if (curr === 'CHF') return 'Switzerland';
    if (curr === 'NZD') return 'New Zealand';
    if (curr === 'THB') return 'Thailand';
    if (curr === 'SAR') return 'Saudi Arabia';
    if (curr === 'QAR') return 'Qatar';
    if (curr === 'HKD') return 'Hong Kong';
    if (curr === 'MYR') return 'Malaysia';
    if (curr === 'ZAR') return 'South Africa';
  }

  return input || '';
};

export const resolveCountryDefaultCurrency = (countryInput?: string): string | undefined => {
  if (!countryInput) return undefined;
  const clean = countryInput.trim().toLowerCase();
  if (clean === 'us' || clean === 'usa' || clean.includes('united states') || clean.includes('america')) return 'USD';
  if (clean === 'uk' || clean === 'gb' || clean.includes('united kingdom') || clean.includes('britain') || clean.includes('england')) return 'GBP';
  if (clean === 'ca' || clean.includes('canada')) return 'CAD';
  if (clean === 'au' || clean.includes('australia')) return 'AUD';
  if (clean === 'de' || clean === 'eu' || clean.includes('germany') || clean.includes('schengen') || clean.includes('europe') || clean.includes('france') || clean.includes('italy') || clean.includes('spain')) return 'EUR';
  if (clean === 'sg' || clean.includes('singapore')) return 'SGD';
  if (clean === 'ae' || clean === 'uae' || clean.includes('emirates') || clean.includes('dubai')) return 'AED';
  if (clean === 'ch' || clean.includes('switzerland')) return 'CHF';
  if (clean === 'jp' || clean.includes('japan')) return 'JPY';
  if (clean === 'th' || clean.includes('thailand')) return 'THB';
  if (clean === 'nz' || clean.includes('new zealand')) return 'NZD';
  if (clean === 'sa' || clean.includes('saudi')) return 'SAR';
  if (clean === 'qa' || clean.includes('qatar')) return 'QAR';
  if (clean === 'hk' || clean.includes('hong kong')) return 'HKD';
  if (clean === 'my' || clean.includes('malaysia')) return 'MYR';
  if (clean === 'za' || clean.includes('south africa')) return 'ZAR';
  return undefined;
};

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

  // Dynamic Product Service Charges (Fetched live from Admin settings, default 0)
  const [systemServiceCharges, setSystemServiceCharges] = useState<{ BUY: number; SELL: number; REMITTANCE: number; CARD: number }>({
    BUY: 0,
    SELL: 0,
    REMITTANCE: 0,
    CARD: 0,
  });

  useEffect(() => {
    getServiceCharges()
      .then((charges) => {
        if (charges && typeof charges === 'object') {
          setSystemServiceCharges({
            BUY: Number(charges.BUY) || 0,
            SELL: Number(charges.SELL) || 0,
            REMITTANCE: Number(charges.REMITTANCE) || 0,
            CARD: Number(charges.CARD) || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Rate Lock Timer (5 minute countdown, shared across Step 1 and Checkout Engine)
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (draftState.rateLockExpiresAt) {
      const diff = Math.floor((draftState.rateLockExpiresAt - Date.now()) / 1000);
      if (diff > 0) return diff;
    }
    return 300;
  });

  useEffect(() => {
    if (!draftState.rateLockExpiresAt || draftState.rateLockExpiresAt <= Date.now()) {
      const newExpiry = Date.now() + 300 * 1000;
      updateDraft({ rateLockExpiresAt: newExpiry });
      setTimeLeft(300);
    } else {
      const diff = Math.max(0, Math.floor((draftState.rateLockExpiresAt - Date.now()) / 1000));
      setTimeLeft(diff);
    }
  }, [draftState.rateLockExpiresAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (draftState.rateLockExpiresAt) {
        const diff = Math.max(0, Math.floor((draftState.rateLockExpiresAt - Date.now()) / 1000));
        setTimeLeft(diff);
      } else {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [draftState.rateLockExpiresAt]);

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

  const lastProcessedSearchRef = React.useRef<string | null>(null);

  // Initialize draft state from URL parameters
  useEffect(() => {
    if (!searchParams) return;
    const currentQuery = searchParams.toString();
    if (lastProcessedSearchRef.current === currentQuery) {
      return;
    }
    lastProcessedSearchRef.current = currentQuery;

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
    
    if (targetProduct && targetProduct !== draftState.product) {
      updates.product = targetProduct;
    }

    const paramCountry = searchParams.get('country') || searchParams.get('countryCode');
    let targetCurrency = paramCurrency ? paramCurrency.toUpperCase() : undefined;
    if (!targetCurrency && paramCountry) {
      targetCurrency = resolveCountryDefaultCurrency(paramCountry);
    }

    if (targetCurrency && targetCurrency !== draftState.currency) {
      updates.currency = targetCurrency;
      updates.checkoutStep = 1;
      updates.status = 'CREATED';
    }
    if (paramAmount && paramAmount !== draftState.amount) {
      updates.amount = paramAmount;
    }
    if (paramBeneficiary && paramBeneficiary !== draftState.beneficiaryId) {
      updates.beneficiaryId = paramBeneficiary;
    }

    if (paramCountry) {
      updates.countryCode = paramCountry.toUpperCase();
      const resolvedCountry = resolveDestinationCountryName(paramCountry, targetCurrency || paramCurrency || undefined);
      if (resolvedCountry && resolvedCountry !== draftState.destination) {
        updates.destination = resolvedCountry;
      }
    } else if (targetCurrency) {
      const resolvedCountry = resolveDestinationCountryName(undefined, targetCurrency);
      if (resolvedCountry && !draftState.destination) {
        updates.destination = resolvedCountry;
      }
    }
    
    const paramCity = searchParams.get('city');
    const paramFulfillment = searchParams.get('fulfillment') || searchParams.get('deliveryMethod');
    const paramPurpose = searchParams.get('purpose');

    if (paramCity) {
      const cleanCity = paramCity.trim();
      const formattedCity = cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1);
      if (formattedCity !== draftState.city) {
        updates.city = formattedCity;
      }
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
  }, [searchParams, pathname]);

  // Ensure default fulfillment is set
  useEffect(() => {
    if (draftState.product === 'REMITTANCE') {
      if (draftState.deliveryMethod !== 'WIRE_TRANSFER') {
        updateDraft({ deliveryMethod: 'WIRE_TRANSFER' });
      }
      if (!draftState.destination) {
        const paramCountry = searchParams.get('country') || searchParams.get('countryCode');
        const paramCurr = searchParams.get('currency') || draftState.currency;
        const resolved = resolveDestinationCountryName(paramCountry || draftState.beneficiaryCountry, paramCurr);
        updateDraft({ destination: resolved || 'United States' });
      }
      if (!draftState.purpose) {
        updateDraft({ purpose: 'EDUCATION' });
      }
    } else if (!draftState.deliveryMethod || draftState.deliveryMethod === 'WIRE_TRANSFER') {
      updateDraft({ deliveryMethod: 'HOME_DELIVERY' });
    }
  }, [draftState.deliveryMethod, draftState.product, draftState.destination, draftState.beneficiaryCountry]);

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
  const urlCountry = searchParams?.get('country') || searchParams?.get('countryCode');
  const destination = draftState.destination !== undefined && draftState.destination !== ''
    ? draftState.destination 
    : (urlCountry ? resolveDestinationCountryName(urlCountry, draftState.currency || searchParams?.get('currency')) : (draftState.destination || ''));
  const departureDate = draftState.departureDate || '';
  const returnDate = draftState.returnDate || '';
  const noReturnDate = draftState.noReturnDate || false;
  const purpose = draftState.purpose || '';
  const urlCity = searchParams?.get('city');
  const selectedCity = draftState.city || (urlCity 
    ? (urlCity.trim().charAt(0).toUpperCase() + urlCity.trim().slice(1))
    : 'Delhi');

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

  const getBranchCityName = (b: any): string => {
    if (!b) return '';
    if (typeof b.city === 'string') return b.city;
    if (b.city && typeof b.city === 'object' && typeof b.city.name === 'string') return b.city.name;
    if (b.branchCity && typeof b.branchCity === 'string') return b.branchCity;
    if (b.cityName && typeof b.cityName === 'string') return b.cityName;
    return '';
  };

  const getBranchName = (b: any): string => {
    if (!b) return 'Vault Branch';
    return b.branchName || b.name || b.title || 'Vault Branch';
  };

  const getBranchAddress = (b: any): string => {
    if (!b) return '';
    return b.branchAddress || b.address || b.location || '';
  };

  const availableCityBranches = useMemo(() => {
    if (!selectedCity || !Array.isArray(branches)) return [];
    const target = selectedCity.trim().toLowerCase();
    return branches.filter((b) => getBranchCityName(b).trim().toLowerCase() === target);
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

  const urlProduct = (() => {
    if (!searchParams) return undefined;
    const tab = searchParams.get('tab')?.toLowerCase();
    const type = searchParams.get('type')?.toLowerCase();
    const intent = searchParams.get('intent')?.toUpperCase();
    const productParam = searchParams.get('product')?.toUpperCase();
    if (pathname === '/sell-forex' || tab === 'sell' || intent === 'SELL' || productParam === 'CASH_SELL') return 'CASH_SELL';
    if (pathname === '/remittance' || pathname === '/transfer-money' || pathname === '/trade-remittance' || tab === 'transfer' || tab === 'remittance' || intent === 'REMITTANCE' || productParam === 'REMITTANCE') return 'REMITTANCE';
    if (pathname === '/forex-cards' || pathname === '/cards' || tab === 'card' || type === 'card' || intent === 'CARD' || productParam === 'CARD') return 'CARD';
    if (pathname === '/buy-forex' || tab === 'buy' || type === 'cash' || intent === 'CASH' || productParam === 'CASH') return 'CASH';
    return undefined;
  })();

  const product = urlProduct || draftState.product || 'CASH';
  const urlCurrency = searchParams?.get('currency')?.toUpperCase() || (urlCountry ? resolveCountryDefaultCurrency(urlCountry) : undefined);
  const currency = draftState.currency || urlCurrency || 'USD';
  const amount = draftState.amount !== undefined && draftState.amount !== null ? String(draftState.amount) : '1000';
  const isRemittance = product === 'REMITTANCE';
  const deliveryMethod = isRemittance ? 'WIRE_TRANSFER' : (draftState.deliveryMethod || 'HOME_DELIVERY');
  const branchId = draftState.branchId || '';

  const handleCurrencyChange = (newCurr: string) => {
    const updates: any = { currency: newCurr };
    const autoCountry = resolveDestinationCountryName(undefined, newCurr);
    if (autoCountry && (!draftState.destination || draftState.destination === resolveDestinationCountryName(undefined, currency))) {
      updates.destination = autoCountry;
    }
    updateDraft(updates);

    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        params.set('currency', newCurr);
        if (autoCountry && params.has('country')) {
          params.set('country', autoCountry);
        }
        const newSearch = params.toString();
        lastProcessedSearchRef.current = newSearch;
        const newUrl = `${pathname || window.location.pathname}?${newSearch}`;
        window.history.replaceState(null, '', newUrl);
      } catch (_) {}
    }
  };

  const isSell = product === 'CASH_SELL';
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
      const res = await authFetch(`${API_URL}/remittances/beneficiaries`);
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
        setBeneficiaries(list);
        if (list.length > 0) {
          const targetId = searchParams.get('beneficiaryId') || draftState.beneficiaryId;
          const selectedBen = targetId 
            ? list.find((b: any) => b.id === targetId) || list[0]
            : list[0];
          const resolvedCountry = resolveDestinationCountryName(selectedBen.country, draftState.currency);
          updateDraft({ 
            beneficiaryId: selectedBen.id,
            beneficiaryName: selectedBen.name,
            beneficiaryCountry: selectedBen.country,
            destination: resolvedCountry || selectedBen.country || draftState.destination || 'United States',
            beneficiaryBank: selectedBen.bankName,
            beneficiaryAccount: selectedBen.ibanOrAccountNumber,
            beneficiarySwift: selectedBen.swiftCode,
            beneficiaryAddress: selectedBen.address || ''
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
    if (Array.isArray(branches) && branches.length > 0 && selectedCity) {
      const target = selectedCity.trim().toLowerCase();
      const cityBranches = branches.filter((b) => getBranchCityName(b).trim().toLowerCase() === target);
      if (cityBranches.length > 0) {
        if (!branchId || !cityBranches.some((b) => b.id === branchId)) {
          const firstBr = cityBranches[0];
          const bLabel = `${getBranchName(firstBr)} (${getBranchCityName(firstBr) || selectedCity})${getBranchAddress(firstBr) ? ` - ${getBranchAddress(firstBr)}` : ''}`;
          updateDraft({ branchId: firstBr.id, deliveryBranch: bLabel });
        }
      } else {
        if (deliveryMethod === 'PICKUP') {
          updateDraft({ deliveryMethod: 'HOME_DELIVERY', branchId: '', deliveryBranch: '' });
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

  const getProductServiceCharge = () => {
    if (!hasAnyCurrency) return 0;
    if (product === 'CASH_SELL') return systemServiceCharges.SELL ?? 0;
    if (product === 'CARD') return systemServiceCharges.CARD ?? 0;
    if (product === 'REMITTANCE') return systemServiceCharges.REMITTANCE ?? 0;
    return systemServiceCharges.BUY ?? 0;
  };

  const serviceCharge = getProductServiceCharge();
  const deliveryCharge = (!isRemittance && deliveryMethod === 'HOME_DELIVERY' && hasAnyCurrency) ? 150 : 0;
  const gst = totalCurrencyInrValue > 0 ? calculateForexGst(totalCurrencyInrValue) : 0;

  const appliedDiscount = appliedOffer
    ? (appliedOffer.code === 'ZEROFEE' ? Math.min(serviceCharge, appliedOffer.discountAmount) : appliedOffer.discountAmount)
    : 0;

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

  const handleRemoveOffer = () => {
    setAppliedOffer(null);
    setCouponInput('');
    setCouponError(null);
    updateDraft({ appliedOffer: undefined, appliedDiscount: 0 });
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
    let cachedUser: any = null;
    if (typeof window !== 'undefined') {
      try {
        const c = localStorage.getItem('forexmate_user') || localStorage.getItem('user');
        if (c) cachedUser = JSON.parse(c);
      } catch (_) {}
    }
    const eff = user || cachedUser;
    const updates: any = { checkoutStep: 2 };
    if (eff) {
      if (!draftState.travellerName && eff.fullName) updates.travellerName = eff.fullName;
      if (!draftState.email && eff.email) updates.email = eff.email;
      const rawMob = eff.mobile || eff.phone;
      if (!draftState.phone && rawMob) {
        const clean = rawMob.replace(/\D/g, '').slice(-10);
        if (clean) updates.phone = clean;
      }
      const rawPan = ((eff as any).pan || (eff as any).panNumber || '').trim().toUpperCase();
      if (!draftState.pan && rawPan) updates.pan = rawPan;
    }

    updateDraft(updates);
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
      return <span>Prepayment Required for <strong className="text-white font-semibold">Instant Card Issuance</strong></span>;
    }
    if (product === 'REMITTANCE') {
      return <span>Prepayment Required for <strong className="text-white font-semibold">RBI Wire Remittance</strong></span>;
    }
    if (product === 'CASH_SELL') {
      return <span>Payout Processed Upon <strong className="text-white font-semibold">Currency Verification</strong></span>;
    }
    if (draftState.deliveryMethod === 'HOME_DELIVERY') {
      return <span>Prepayment Required for <strong className="text-white font-semibold">Insured Doorstep Delivery</strong></span>;
    }
    return <span>Prepayment Required for <strong className="text-white font-semibold">Guaranteed Vault Pickup</strong></span>;
  };

  return (
    <div className="w-full text-left relative text-white selection:bg-cyan-500 selection:text-black py-4">
      


      {/* Main Wide Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_320px] gap-3 xl:gap-4 items-start">
        
        {/* LEFT COLUMN: Floating Glass Navigation Sidebar — sticky, independent scroll */}
        <div className="sticky top-[8.5rem] self-start">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-3 shadow-lg flex flex-col justify-between max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="space-y-4 lg:space-y-5">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all flex items-center gap-3.5 cursor-pointer text-left"
              >
                <LayoutDashboard className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('CASH')}
                className={`w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  product === 'CASH'
                    ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <Banknote className="w-5 h-5 shrink-0" />
                <span>Buy Forex</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('CASH_SELL')}
                className={`w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  product === 'CASH_SELL'
                    ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5 shrink-0" />
                <span>Sell Forex</span>
              </button>

              {/* Forex Card */}
              <button
                type="button"
                onClick={() => handleTabSwitch('CARD')}
                className={`w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  product === 'CARD' || pathname?.includes('forex-cards')
                    ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <CreditCard className="w-5 h-5 shrink-0" />
                <span>Forex Card</span>
              </button>

              {/* Remittance */}
              <button
                type="button"
                onClick={() => handleTabSwitch('REMITTANCE')}
                className={`w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  product === 'REMITTANCE' || pathname?.includes('remittance')
                    ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <Send className="w-5 h-5 shrink-0" />
                <span>Remittance</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/orders')}
                className="w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all flex items-center gap-3.5 cursor-pointer text-left"
              >
                <ClipboardList className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Orders</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/beneficiaries')}
                className="w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all flex items-center gap-3.5 cursor-pointer text-left"
              >
                <Users className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Beneficiaries</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/offers')}
                className={`w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  pathname === '/offers'
                    ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <Tag className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Offers</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/support')}
                className="w-full px-4 py-3.5 rounded-2xl text-sm sm:text-[15px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all flex items-center gap-3.5 cursor-pointer text-left"
              >
                <Headphones className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Support</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/[0.08] mt-4">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    logout();
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all flex items-center gap-3.5 cursor-pointer text-left"
              >
                <LogOut className="w-5 h-5 text-slate-400 shrink-0" />
                <span>{user ? 'Logout' : 'Sign In'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Main Wide Funnel Cards */}
        <div className="space-y-5 ml-8 mr-1">
          
          {/* Card 1: Amount & Currency (Enlarged & Spacious) */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-7 shadow-lg relative space-y-6">
            {/* Header / Stepper Number */}
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-400 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div>
                <h2 className="font-black text-lg text-white tracking-tight">
                  Amount & Currency
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Enter amount and select your preferred currency
                </p>
              </div>
            </div>

            {/* Dual Hero Panels: You Pay & Live Interbank Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* You Pay Display Box */}
              <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl p-5 sm:p-6 space-y-1.5 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isSell ? 'You Handover (INR Value)' : 'You Pay'}
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
                  <span className="text-slate-400 text-2xl font-sans">₹</span>
                  <span>{Math.round(inrEquivalent || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-xs text-slate-400 font-medium italic truncate pt-1">
                  {numberToWordsINR(inrEquivalent || 0) || 'Enter forex amount below'}
                </div>
              </div>

              {/* Live Rate Display Box */}
              <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl p-5 sm:p-6 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Live Interbank Rate
                  </span>
                  <span className="bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                    <span>LIVE</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    1 {currency} = ₹{adjustedRate?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                    +0.12 (0.14%)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Hidden Margin</span>
                </div>
              </div>
            </div>

            {/* Inputs: Select Currency & Forex Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 items-start pt-1">
              <div className="sm:col-span-6">
                <CurrencyDropdown
                  value={currency}
                  onChange={handleCurrencyChange}
                  ratesData={rates}
                  rateType={isSell ? 'sell' : isRemittance ? 'remittance' : 'buy'}
                  label="Select Currency"
                  darkMode={true}
                  hideRateBadge={true}
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  {isSell ? 'You Handover (Forex Amount)' : 'You Receive (Forex Amount)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="9999999"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 7) {
                        updateDraft({ amount: val });
                      }
                    }}
                    placeholder="1000.00"
                    className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3.5 pr-20 text-base font-black text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-xs font-black text-slate-300 bg-white/[0.08] px-2.5 py-1 rounded-md border border-white/[0.08]">
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
              </div>
            </div>

            {/* Additional Currencies Rows */}
            {extraCurrenciesCalculated.map((c, idx) => (
              <div key={idx} className="bg-white/[0.05] border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-white">{getCurrencyName(c.currency)}</span>
                  <span className="text-slate-300 bg-[#0c121d]/80 px-3 py-1 rounded-lg border border-white/[0.08] font-mono">
                    {c.amount} {c.currency} = <strong className="text-amber-400">₹ {Math.round(c.inrEquivalent).toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-slate-400 font-mono text-xs">@ ₹{c.rate.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateExtraCurrencies(extraCurrencies.filter((_, i) => i !== idx))}
                  className="text-rose-400 hover:text-rose-300 text-xs font-bold bg-rose-950/40 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
                  className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>+ Add Another Currency</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Fulfillment Method & Travel Details (Enlarged & Spacious) */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
            
            {/* Fulfillment Method Header */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/[0.08] pb-4">
              <div
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-sky-500/20 text-sky-300 border border-sky-400/35 flex items-center gap-2 shadow-xs"
              >
                {isRemittance ? <Send className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                <span>{isRemittance ? 'Wire Transfer Fulfillment Method' : 'Fulfillment Method'}</span>
              </div>
              {isRemittance && (
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RBI AD-II Statutory Channel</span>
                </span>
              )}
            </div>

            {/* Top Fulfillment Status Ribbon */}
            {isRemittance ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium text-slate-300 bg-sky-950/30 p-4 rounded-2xl border border-sky-500/30">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="flex h-2.5 w-2.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-white font-bold">Same-Day SWIFT Wire Processing</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">
                    Dispatched within <strong className="text-amber-300 font-bold">24–48 Business Hours</strong> with official <strong className="text-white font-mono font-bold">MT103 Swift Advice</strong>
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% LRS Statutory Compliant</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium text-slate-300 bg-white/[0.04] p-4 rounded-2xl border border-white/[0.06]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex h-2.5 w-2.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Guaranteed delivery by</span>
                  <span className="font-bold text-white bg-white/[0.06] px-3 py-1 rounded-lg border border-white/[0.08] text-xs font-mono">
                    {deliveryDay}, 9:00 PM
                  </span>
                  <span>to</span>
                  <button
                    type="button"
                    onClick={() => setIsCityModalOpen(true)}
                    className="font-bold text-sky-300 hover:text-sky-200 bg-[#0c121d]/80 hover:bg-[#0c121d] px-3 py-1 rounded-lg border border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{selectedCity}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeliveryPolicyOpen(true)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Same-Day Policy</span>
                </button>
              </div>
            )}

            {/* Fulfillment Options */}
            {isRemittance ? (
              <div className="border-2 border-sky-500/70 bg-sky-950/25 ring-1 ring-sky-500/30 p-5 rounded-2xl flex items-start justify-between shadow-[0_0_20px_rgba(14,165,233,0.12)]">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-white">Direct Overseas Bank Credit (SWIFT Wire)</span>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Selected Mode
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Statutory outward remittance wired through RBI Authorized Dealer Category-II banking pipeline directly to the overseas beneficiary bank account. Includes official MT103 confirmation receipt.
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-sky-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Direct University / Overseas Bank Credit
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Official MT103 Swift Advice Proof
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Zero Intermediary Deductions
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ml-2">
                  ✓
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Branch Pickup */}
                  {hasBranchesInCity ? (
                    <div
                      onClick={() => {
                        const firstBr = availableCityBranches[0];
                        const bLabel = firstBr 
                          ? `${getBranchName(firstBr)} (${getBranchCityName(firstBr) || selectedCity})${getBranchAddress(firstBr) ? ` - ${getBranchAddress(firstBr)}` : ''}`
                          : '';
                        updateDraft({ deliveryMethod: 'PICKUP', branchId: firstBr?.id, deliveryBranch: bLabel });
                      }}
                      className={`border-2 p-5 rounded-2xl cursor-pointer transition-all flex items-start justify-between relative ${
                        deliveryMethod === 'PICKUP'
                          ? 'border-sky-500/70 bg-sky-950/25 ring-1 ring-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.12)]'
                          : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.16] hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl border ${
                          deliveryMethod === 'PICKUP' ? 'bg-sky-500/20 border-sky-400/40 text-sky-400' : 'bg-white/[0.06] border-white/[0.08] text-slate-400'
                        }`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm sm:text-base text-white">
                            {product === 'CASH_SELL' ? 'Branch Visit' : 'Branch Pickup'}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {product === 'CASH_SELL' ? 'Visit our branch vault to verify & get paid' : 'Collect directly from our authorized branch vault'}
                          </div>
                        </div>
                      </div>

                      {deliveryMethod === 'PICKUP' && (
                        <div className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ml-2">
                          ✓
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="border border-dashed border-white/[0.08] bg-[#0c121d]/30 p-5 rounded-2xl cursor-not-allowed opacity-50 select-none flex items-start gap-3.5"
                      title={`No branches in ${selectedCity}`}
                    >
                      <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-slate-500">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-400">Branch Pickup</div>
                        <div className="text-xs text-slate-500 mt-1">Not available in {selectedCity}</div>
                      </div>
                    </div>
                  )}

                  {/* Home Delivery */}
                  <div
                    onClick={() => updateDraft({ deliveryMethod: 'HOME_DELIVERY' })}
                    className={`border-2 p-5 rounded-2xl cursor-pointer transition-all flex items-start justify-between relative ${
                      deliveryMethod === 'HOME_DELIVERY'
                        ? 'border-sky-500/70 bg-sky-950/25 ring-1 ring-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.12)]'
                        : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.16] hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl border ${
                        deliveryMethod === 'HOME_DELIVERY' ? 'bg-sky-500/20 border-sky-400/40 text-sky-400' : 'bg-white/[0.06] border-white/[0.08] text-slate-400'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-white">
                          {product === 'CASH_SELL' ? 'Home Collection' : 'Home Delivery'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {product === 'CASH_SELL' ? 'Our executive will collect currency from your doorstep' : 'Guaranteed safe delivery to your address'}
                        </div>
                      </div>
                    </div>

                    {deliveryMethod === 'HOME_DELIVERY' && (
                      <div className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ml-2">
                        ✓
                      </div>
                    )}
                  </div>
                </div>

                {/* Minimum Order Notice for Home Delivery */}
                {!isRemittance && deliveryMethod === 'HOME_DELIVERY' && totalCurrencyInrValue > 0 && totalCurrencyInrValue < 25000 && (
                  <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-xs sm:text-sm text-amber-300 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-400 block mb-0.5">Minimum Order Notice</span>
                      <span>
                        {hasBranchesInCity
                          ? 'Doorstep delivery requires minimum ₹25,000 order value. Switch to Branch Pickup or add more currency to proceed.'
                          : 'Doorstep delivery requires minimum ₹25,000 order value. Please increase your currency amount to proceed with home delivery.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Branch Dropdown selector if Pickup */}
                {deliveryMethod === 'PICKUP' && hasBranchesInCity && (
                  <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl p-4 sm:p-5 space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Select Pickup Branch in {selectedCity}
                    </label>
                    <div className="relative">
                      <select
                        value={branchId}
                        onChange={(e) => {
                          const chosenId = e.target.value;
                          const chosenObj = availableCityBranches.find((b) => b.id === chosenId);
                          const bLabel = chosenObj 
                            ? `${getBranchName(chosenObj)} (${getBranchCityName(chosenObj) || selectedCity})${getBranchAddress(chosenObj) ? ` - ${getBranchAddress(chosenObj)}` : ''}`
                            : '';
                          updateDraft({ branchId: chosenId, deliveryBranch: bLabel });
                        }}
                        className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl p-3.5 pr-10 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
                      >
                        {availableCityBranches.map((b) => {
                          const bName = getBranchName(b);
                          const bCity = getBranchCityName(b) || selectedCity;
                          const bAddr = getBranchAddress(b);
                          return (
                            <option key={b.id} value={b.id} className="bg-[#0d131f] text-white">
                              {bName} ({bCity}){bAddr ? ` - ${bAddr}` : ''}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remittance Transfer Details vs Travel Details Form */}
            {isRemittance ? (
              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>Remittance Transfer Details</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                    RBI LRS Mandate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Destination Country */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Destination Country (Beneficiary's Country) *
                    </label>
                    <select
                      value={
                        destination || 
                        resolveDestinationCountryName(searchParams.get('country') || searchParams.get('countryCode') || draftState.beneficiaryCountry, currency) || 
                        'United States'
                      }
                      onChange={(e) => updateDraft({ destination: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl p-3.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      {DESTINATION_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name} className="bg-[#0d131f] text-white">
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purpose of Remittance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Purpose of Remittance (RBI LRS Mandate) *
                    </label>
                    <select
                      value={purpose || 'EDUCATION'}
                      onChange={(e) => updateDraft({ purpose: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl p-3.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="EDUCATION" className="bg-[#0d131f] text-white">Higher Studies Overseas (University Fees)</option>
                      <option value="FAMILY_MAINTENANCE" className="bg-[#0d131f] text-white">Maintenance of Close Relatives Abroad</option>
                      <option value="MEDICAL" className="bg-[#0d131f] text-white">Medical Treatment Abroad</option>
                      <option value="GIFT" className="bg-[#0d131f] text-white">Gift / Financial Assistance</option>
                      <option value="EMIGRATION" className="bg-[#0d131f] text-white">Emigration / Visa Processing</option>
                      <option value="TRAVEL" className="bg-[#0d131f] text-white">Travel & Living Expenses for Studies</option>
                      <option value="OTHER" className="bg-[#0d131f] text-white">Other Permissible LRS Current Account Transfer</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : !isSell && (
              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
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
                      <div className="flex items-center bg-sky-950/40 border border-sky-500/30 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-sky-300 shadow-sm">
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
                          className="ml-2.5 text-slate-400 hover:text-rose-400 font-bold text-xs cursor-pointer"
                          title="Remove country"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {extraCountries.map((c, idx) => (
                      <div key={idx} className="flex items-center bg-white/[0.05] border border-white/[0.08] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300">
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => setExtraCountries(prev => prev.filter((_, i) => i !== idx))}
                          className="ml-2.5 text-slate-400 hover:text-rose-400 font-bold text-xs cursor-pointer"
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
                        className="bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-white focus:border-sky-500 outline-none max-w-xs cursor-pointer"
                      >
                        <option value="" className="bg-[#0d131f] text-white">Select Country</option>
                        {DESTINATION_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name} className="bg-[#0d131f] text-white">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {destination && (
                      <button
                        type="button"
                        onClick={() => setShowAddCountryModal(true)}
                        className="border border-white/[0.12] hover:border-amber-400/60 rounded-xl px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10 uppercase tracking-wider transition-all cursor-pointer"
                      >
                        + Add Country
                      </button>
                    )}
                  </div>
                </div>

                {/* Travel Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Departure Date *</label>
                    <input
                      type="date"
                      min={todayStr}
                      max={maxTravelDateStr}
                      value={departureDate}
                      onChange={(e) => handleDepartureDateChange(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl p-3 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-500"
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
                        className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl p-3 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-500"
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
                    className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl p-3.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="" className="bg-[#0d131f] text-white">Select Purpose</option>
                    <option value="HOLIDAY" className="bg-[#0d131f] text-white">Holiday / Leisure Travel</option>
                    <option value="BUSINESS" className="bg-[#0d131f] text-white">Business Travel</option>
                    <option value="EDUCATION" className="bg-[#0d131f] text-white">Higher Studies Overseas</option>
                    <option value="MEDICAL" className="bg-[#0d131f] text-white">Medical Treatment</option>
                    <option value="EMPLOYMENT" className="bg-[#0d131f] text-white">Employment Abroad</option>
                    <option value="EMIGRATION" className="bg-[#0d131f] text-white">Emigration</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Capsule (Wide & Prominent) */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            {/* Live Rate Lock Countdown Clock */}
            <div className="flex items-center gap-3.5 bg-white/[0.04] border border-white/[0.08] px-5 py-3 rounded-2xl">
              <Lock className="w-4 h-4 text-amber-400" />
              <div className="text-xs sm:text-sm font-bold text-slate-300 flex items-center">
                <span>Rate Locked For: </span>
                <span className="font-mono text-amber-400 font-black ml-1.5 text-base">
                  {formatMinutes}
                </span>
                <span className="text-[10px] text-slate-400 ml-1 mr-1.5 uppercase font-semibold">
                  Min
                </span>
                <span className="text-slate-500 font-bold">:</span>
                <span className="font-mono text-amber-400 font-black ml-1.5 text-base">
                  {formatSeconds}
                </span>
                <span className="text-[10px] text-slate-400 ml-1 uppercase font-semibold">
                  Sec
                </span>
              </div>
            </div>

            {/* Primary Action Button (Golden Glow) */}
            <button
              type="button"
              onClick={handleQuote}
              disabled={
                isLocking ||
                !amount ||
                Number(amount) <= 0 ||
                (!isSell && !isRemittance && (!destination || !departureDate || !purpose)) ||
                (isRemittance && (!destination || !purpose)) ||
                (!isRemittance && deliveryMethod === 'PICKUP' && !branchId) ||
                (!isRemittance && deliveryMethod === 'HOME_DELIVERY' && totalCurrencyInrValue < 25000)
              }
              className="flex-1 sm:flex-none px-10 py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              <span>{isLocking ? 'LOCKING RATE...' : 'LOCK RATE & CONTINUE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Order Summary & Voucher Vault — independent scroll */}
        <div className="sticky top-[8.5rem] self-start space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-0.5">
          
          {/* Card 1: Order Summary */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm text-white">Order Summary</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono">INR</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total Currency Value</span>
                <span className="font-bold text-white font-mono text-xs">₹ {Math.round(totalCurrencyInrValue).toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pl-2">
                <span>{amount || 0} {currency} @ ₹{adjustedRate?.toFixed(2)}</span>
                <span className="font-mono">₹ {inrEquivalent.toLocaleString('en-IN')}.00</span>
              </div>

              {extraCurrenciesCalculated.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-amber-400/90 pl-2">
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
                <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-500/30 text-xs">
                  <span className="truncate text-xs mr-2">Promo ({appliedOffer?.code})</span>
                  <span className="font-mono font-black whitespace-nowrap shrink-0 text-xs">
                    - ₹ {appliedDiscount}.00
                  </span>
                </div>
              )}

              {/* Glowing Golden Total Payable */}
              <div className="pt-4 border-t border-white/[0.08] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-white font-black block text-sm">
                      {product === 'CASH_SELL' ? 'Total to Receive' : 'Total Payable Amount'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Incl. GST & Zero Margin
                    </span>
                  </div>
                  <span className="font-black text-amber-400 text-base sm:text-lg font-mono tracking-tight drop-shadow-md whitespace-nowrap">
                    ₹ {payableAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.00
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/[0.06] p-3 rounded-xl text-center border border-amber-500/20">
              <span className="text-[11.5px] text-amber-300 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {getEligibilityMessage()}
              </span>
            </div>
          </div>

          {/* Card 2: Offers & Coupons Vault */}
          <div id="offers-card" className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm text-white">Offers & Coupons</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                {DUMMY_OFFERS.length} Available
              </span>
            </div>

            {/* Coupon input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-2 focus-within:border-amber-500/60 transition-all">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMO CODE"
                  className="bg-transparent flex-1 min-w-0 px-3 text-xs sm:text-sm font-mono font-bold focus:outline-none uppercase placeholder:normal-case placeholder:text-slate-500 text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (appliedOffer?.code !== couponInput) {
                      handleApplyInputCoupon();
                    }
                  }}
                  className={`font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    appliedOffer?.code === couponInput
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white'
                  }`}
                >
                  {appliedOffer?.code === couponInput ? 'Applied ✓' : 'Apply'}
                </button>
              </div>

              {appliedOffer && (
                <div className="flex items-center justify-between px-1.5 pt-0.5">
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon &apos;{appliedOffer.code}&apos; applied
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveOffer}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer flex items-center gap-1 hover:underline underline-offset-2"
                  >
                    <span>Remove coupon code</span>
                  </button>
                </div>
              )}
            </div>

            {couponError && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-3 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            {/* Offers list */}
            <div className="space-y-3 pt-1">
              {DUMMY_OFFERS.map((offer) => {
                const currentInrVal = inrEquivalent || 0;
                const isEligible = currentInrVal >= offer.minAmount;
                const isSelected = appliedOffer?.code === offer.code;

                return (
                  <div
                    key={offer.code}
                    className={`p-4 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/60 ring-1 ring-amber-400/20'
                        : isEligible
                          ? 'bg-white/[0.08] border-amber-500/40 hover:border-amber-500/60'
                          : 'bg-[#0c121d]/30 border-white/[0.04] opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs bg-white/[0.08] text-amber-300 px-2.5 py-0.5 rounded border border-amber-400/30">
                            {offer.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">
                            {offer.tag}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">
                          {offer.title}
                        </div>
                        <p className="text-xs text-slate-400">
                          {offer.description}
                        </p>
                      </div>

                      {isEligible ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected ? (
                            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 shadow-xs">
                              Applied ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectOffer(offer)}
                              className="text-xs font-bold px-4 py-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition-all cursor-pointer"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 shrink-0 font-medium">
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
        onSelect={(city) => {
          updateDraft({ city });
          if (typeof window !== 'undefined') {
            try {
              const params = new URLSearchParams(window.location.search);
              params.set('city', city);
              const newSearch = params.toString();
              lastProcessedSearchRef.current = newSearch;
              const newUrl = `${pathname || window.location.pathname}?${newSearch}`;
              window.history.replaceState(null, '', newUrl);
            } catch (_) {}
          }
        }} 
      />

      <SameDayDeliveryModal 
        isOpen={isDeliveryPolicyOpen} 
        onClose={() => setIsDeliveryPolicyOpen(false)} 
      />

      {/* Add Currency Modal */}
      {showAddCurrencyModal && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0d131f] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
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
                  min="1"
                  max="9999999"
                  value={newCurrencyAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 7) setNewCurrencyAmount(val);
                  }}
                  className="w-full bg-[#080c14] border border-white/[0.09] rounded-xl p-3 text-sm font-bold text-white focus:border-amber-500/70 outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              <button 
                type="button"
                onClick={() => setShowAddCurrencyModal(false)} 
                className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Country Modal */}
      {showAddCountryModal && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0d131f] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-white">+ Add Destination Country</h3>
              <button onClick={() => setShowAddCountryModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Choose Additional Country</label>
              <select 
                value={selectedExtraCountry}
                onChange={(e) => setSelectedExtraCountry(e.target.value)}
                className="w-full bg-[#080c14] border border-white/[0.09] rounded-xl p-3 text-sm font-bold text-white focus:border-amber-500/70 outline-none cursor-pointer"
              >
                {DESTINATION_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="bg-[#0d131f] text-white">
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
              <button 
                type="button"
                onClick={() => setShowAddCountryModal(false)} 
                className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Cancel
              </button>
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
