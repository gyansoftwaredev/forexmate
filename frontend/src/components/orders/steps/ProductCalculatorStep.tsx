import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransactionStore } from '@/stores/transactionStore';
import { useQuoteStore } from '@/stores/quoteStore';
import { useRates } from '@/hooks/useRates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Calendar, Briefcase, Plus, Edit2, Info, CheckCircle2, Ticket, Globe, Landmark, User2, X, ChevronDown, Upload, FileText, AlertCircle } from 'lucide-react';
import { CitySelectorModal } from '../CitySelectorModal';
import { SameDayDeliveryModal } from '../SameDayDeliveryModal';
import { calculateForexGst } from '@/lib/gstCalculator';
import { getActiveBranches } from '@/lib/api-public';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { ALL_CURRENCIES_LIST, ALL_CURRENCIES_MAP } from '@/lib/currencyMetadata';
import { useAuth } from '@/context/AuthContext';
import CustomerAuthModal from '@/components/auth/CustomerAuthModal';
import { CurrencyDropdown } from '../CurrencyDropdown';



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

// ─── Remittance Types ───────────────────────────────────────────────────────
interface TransferPurpose {
  id: string;
  code: string;
  name: string;
  description: string;
  tcsRateAbove: number;
  tcsThreshold: number;
  documentRequirements: { docType: string }[];
}

interface CountryConfig {
  id: string;
  countryCode: string;
  countryName: string;
  currencyCode: string;
}

interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  ibanOrAccountNumber: string;
  swiftCode: string;
  country: string;
}

const DUMMY_OFFERS = [
  {
    code: 'ZEROCOMM',
    title: '100% Zero Fee Waiver',
    description: 'Flat ₹150 OFF on service charge',
    minAmount: 25000,
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

  // Initialize draft state from URL parameters (always sync on searchParams change)
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
  }, [sessionId, searchParams]);

  // Ensure a default deliveryMethod is set if not already present
  useEffect(() => {
    if (sessionId && !draftState.deliveryMethod) {
      updateDraft({ deliveryMethod: 'HOME_DELIVERY' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const product = draftState.product || 'CASH'; // Default to CASH
  const isSell = product === 'CASH_SELL';
  const isRemittance = product === 'REMITTANCE';
  const currency = draftState.currency || 'USD';
  const amount = draftState.amount || '';
  const branchId = draftState.branchId || '';
  const deliveryMethod = draftState.deliveryMethod || 'PICKUP';

  const [productsStatus, setProductsStatus] = useState<Record<string, boolean>>({
    CASH: true,
    CASH_SELL: true,
    REMITTANCE: true,
    FOREX_CARD: true,
    CARD: true,
  });

  useEffect(() => {
    fetch('/api/v1/public/products')
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
    product === 'CARD' ? productsStatus.FOREX_CARD !== false && productsStatus.CARD !== false :
    productsStatus[product] !== false;

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
  const maxDepartureDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  })();

  const handleDepartureDateChange = (newDept: string) => {
    const updates: any = { departureDate: newDept };
    if (returnDate && newDept && returnDate < newDept) {
      updates.returnDate = newDept;
    }
    updateDraft(updates);
  };

  const handleReturnDateChange = (newReturn: string) => {
    const minAllowed = departureDate || todayStr;
    if (newReturn && newReturn < minAllowed) {
      updateDraft({ returnDate: minAllowed });
    } else {
      updateDraft({ returnDate: newReturn });
    }
  };



  const triggerDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if ('showPicker' in e.currentTarget) {
        (e.currentTarget as HTMLInputElement).showPicker();
      }
    } catch (_) {}
  };

  // Remittance-specific state
  const [transferPurposes, setTransferPurposes] = useState<TransferPurpose[]>([]);
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<Beneficiary[]>([]);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBenName, setNewBenName] = useState('');
  const [newBenBank, setNewBenBank] = useState('');
  const [newBenAccount, setNewBenAccount] = useState('');
  const [newBenSwift, setNewBenSwift] = useState('');
  const [newBenAddress, setNewBenAddress] = useState('');
  const [remCalc, setRemCalc] = useState<any>(null);
  const [isCalcLoading, setIsCalcLoading] = useState(false);

  // Fetch remittance lookup data
  // Fetch remittance lookup data
  useEffect(() => {
    if (!isRemittance) return;
    const fetchData = async () => {
      try {
        const [purposesRes, countriesRes] = await Promise.all([
          fetch(`${API_URL}/public/remittance-purposes`),
          fetch(`${API_URL}/public/remittance-countries`),
        ]);
        const [purposes, ctries] = await Promise.all([
          apiJson<TransferPurpose[]>(purposesRes),
          apiJson<CountryConfig[]>(countriesRes),
        ]);
        setTransferPurposes(purposes || []);
        setCountries(ctries || []);
      } catch (err) {
        console.error('Failed to load remittance lookup data:', err);
      }

      // Separately attempt to fetch saved beneficiaries (requires auth)
      try {
        const benRes = await authFetch(`${API_URL}/remittances/beneficiaries`);
        if (benRes.ok) {
          const bens = await apiJson<Beneficiary[]>(benRes);
          setSavedBeneficiaries(bens || []);
        }
      } catch (err) {
        // Guest user or unauthenticated
        setSavedBeneficiaries([]);
      }
    };
    fetchData();
  }, [isRemittance]);

  // Helper to match beneficiary country with CountryConfig
  const findMatchingCountry = (countryStr: string) => {
    if (!countryStr) return undefined;
    const bCountry = countryStr.toLowerCase().trim();
    return countries.find(c => 
      c.countryCode.toLowerCase() === bCountry ||
      c.countryName.toLowerCase() === bCountry ||
      (bCountry.includes('united states') && c.countryCode === 'US') ||
      (bCountry.includes('united kingdom') && c.countryCode === 'GB') ||
      (bCountry.includes('canada') && c.countryCode === 'CA') ||
      (bCountry.includes('australia') && c.countryCode === 'AU') ||
      (bCountry.includes('germany') && c.countryCode === 'DE') ||
      (bCountry.includes('singapore') && c.countryCode === 'SG') ||
      (bCountry.includes('emirates') && c.countryCode === 'AE') ||
      (bCountry.includes('france') && c.countryCode === 'FR') ||
      (bCountry.includes('japan') && c.countryCode === 'JP') ||
      (bCountry.includes('switzerland') && c.countryCode === 'CH') ||
      (bCountry.includes('new zealand') && c.countryCode === 'NZ') ||
      (bCountry.includes('ireland') && c.countryCode === 'IE') ||
      (bCountry.includes('netherlands') && c.countryCode === 'NL') ||
      (bCountry.includes('italy') && c.countryCode === 'IT') ||
      (bCountry.includes('spain') && c.countryCode === 'ES') ||
      (bCountry.includes('hong kong') && c.countryCode === 'HK') ||
      (bCountry.includes('thailand') && c.countryCode === 'TH') ||
      (bCountry.includes('south africa') && c.countryCode === 'ZA') ||
      (bCountry.includes('malaysia') && c.countryCode === 'MY') ||
      (bCountry.includes('philippines') && c.countryCode === 'PH') ||
      (bCountry.includes('saudi') && c.countryCode === 'SA') ||
      (bCountry.includes('qatar') && c.countryCode === 'QA') ||
      (bCountry.includes('kuwait') && c.countryCode === 'KW') ||
      (bCountry.includes('oman') && c.countryCode === 'OM') ||
      (bCountry.includes('bahrain') && c.countryCode === 'BHD') ||
      (bCountry.includes('sweden') && c.countryCode === 'SE') ||
      (bCountry.includes('norway') && c.countryCode === 'NO') ||
      (bCountry.includes('denmark') && c.countryCode === 'DK')
    );
  };

  // Auto-sync country and currency from selected beneficiary
  useEffect(() => {
    if (!isRemittance || !draftState.beneficiaryId || savedBeneficiaries.length === 0 || countries.length === 0) return;
    const ben = savedBeneficiaries.find(b => b.id === draftState.beneficiaryId);
    if (!ben || !ben.country) return;

    const matchingCountry = findMatchingCountry(ben.country);

    if (matchingCountry) {
      const updates: any = {};
      if (draftState.countryCode !== matchingCountry.countryCode) {
        updates.countryCode = matchingCountry.countryCode;
      }
      if (currency !== matchingCountry.currencyCode) {
        updates.currency = matchingCountry.currencyCode;
      }
      if (!draftState.beneficiaryName && ben.name) {
        updates.beneficiaryName = ben.name;
      }
      if (Object.keys(updates).length > 0) {
        updateDraft(updates);
      }
    }
  }, [isRemittance, draftState.beneficiaryId, savedBeneficiaries, countries]);

  // Auto-sync currency when country changes for remittance
  useEffect(() => {
    if (!isRemittance || !draftState.countryCode) return;
    const found = countries.find(c => c.countryCode === draftState.countryCode);
    if (found && found.currencyCode !== currency) {
      updateDraft({ currency: found.currencyCode });
    }
  }, [draftState.countryCode, countries]);

  // Debounced TCS/Fee calculation for remittance
  useEffect(() => {
    if (!isRemittance || !amount || !currency || !draftState.countryCode || !draftState.purposeCode) return;
    const timer = setTimeout(async () => {
      setIsCalcLoading(true);
      try {
        const res = await authFetch(
          `${API_URL}/remittances/calculate?amount=${amount}&currency=${currency}&countryCode=${draftState.countryCode}&purposeCode=${draftState.purposeCode}`
        );
        if (res.ok) {
          const calc = await apiJson<any>(res);
          setRemCalc(calc);
          updateDraft({
            feeAmount: calc.feeAmount,
            tcsAmount: calc.tcsAmount,
          });
        }
      } catch (err) {
        console.error('Calculation failed:', err);
      } finally {
        setIsCalcLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [amount, currency, draftState.countryCode, draftState.purposeCode, isRemittance]);

  const [isEditingAmount, setIsEditingAmount] = useState(!amount);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isDeliveryPolicyOpen, setIsDeliveryPolicyOpen] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  // Fetch active branches
  useEffect(() => {
    getActiveBranches()
      .then((data) => {
        if (Array.isArray(data)) {
          setBranches(data);
          // Auto-select the first branch if branchId is not set
          if (data.length > 0 && !draftState.branchId) {
            updateDraft({ branchId: data[0].id });
          }
        }
      })
      .catch((err) => console.error('Failed to fetch branches:', err));
  }, []);

  // Pre-fill mock dates and purpose for Cash Sell to bypass regular travel details validation
  useEffect(() => {
    if (product === 'CASH_SELL') {
      const updates: any = {};
      if (!draftState.departureDate) {
        updates.departureDate = new Date().toISOString().split('T')[0];
      }
      if (!draftState.purpose) {
        updates.purpose = 'CASH_SELL_DECLARATION';
      }
      if (Object.keys(updates).length > 0) {
        updateDraft(updates);
      }
    }
  }, [product]);

  const canGetQuote = allowedActions.includes('GET_QUOTE');
  const [isSavingBeneficiary, setIsSavingBeneficiary] = useState(false);

  // Remittance: add new beneficiary helper with debouncing & deduplication guard
  const handleAddNewBeneficiary = async () => {
    if (isSavingBeneficiary || !newBenName || !newBenBank || !newBenAccount || !newBenSwift) return;
    setIsSavingBeneficiary(true);
    try {
      const res = await authFetch(`${API_URL}/remittances/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBenName,
          bankName: newBenBank,
          ibanOrAccountNumber: newBenAccount,
          swiftCode: newBenSwift.toUpperCase(),
          address: newBenAddress,
          country: countries.find(c => c.countryCode === draftState.countryCode)?.countryName || '',
        }),
      });
      if (res.status === 401) {
        alert("Please sign in to save your beneficiary.");
        window.location.href = `/login?redirect=/buy-forex?tab=transfer`;
        return;
      }
      const newBen = await apiJson<Beneficiary>(res);
      setSavedBeneficiaries(prev => {
        if (prev.some(b => b.id === newBen.id || (b.ibanOrAccountNumber === newBen.ibanOrAccountNumber && b.swiftCode === newBen.swiftCode))) {
          return prev;
        }
        return [newBen, ...prev];
      });
      updateDraft({ beneficiaryId: newBen.id, beneficiaryName: newBen.name });
      setShowAddBeneficiary(false);
      setNewBenName(''); setNewBenBank(''); setNewBenAccount(''); setNewBenSwift(''); setNewBenAddress('');
    } catch (err: any) {
      console.error('Failed to add beneficiary:', err);
      alert(err.message || 'Please login to add a beneficiary.');
    } finally {
      setIsSavingBeneficiary(false);
    }
  };

  // Find the rate for the selected currency
  const currencyRateData = Array.isArray(rates) ? rates.find(r => r.currency?.code === currency || r.currency === currency) : null;
  const rawRate = currencyRateData ? (currencyRateData.inrRate || currencyRateData.rate) : null;
  
  // Adjust rate slightly based on product (Card usually cheaper than Cash, Sell has margins subtracted)
  const adjustedRate = rawRate
    ? (product === 'CASH_SELL' ? rawRate - 0.63 : product === 'CASH' ? rawRate + 0.63 : rawRate)
    : null;
  
  const inrEquivalent = adjustedRate && amount ? (parseFloat(amount) * adjustedRate) : 0;
  
  // Calculate rates and INR equivalents for extra currencies
  const getEffectiveRateForCurrency = (currCode: string) => {
    let bRate = 83.50;
    if (Array.isArray(rates) && rates.length > 0) {
      const found = rates.find((r: any) => r.currency?.code === currCode || r.currency === currCode);
      if (found && (found.inrRate || found.rate)) {
        bRate = Number(found.inrRate || found.rate);
      }
    } else {
      const fallbacks: Record<string, number> = {
        USD: 83.50, EUR: 89.20, GBP: 105.10, AED: 22.73, SGD: 61.80, CAD: 61.20, AUD: 54.80, THB: 2.45,
        JPY: 0.56, CHF: 92.40, NZD: 50.10, SAR: 22.20, QAR: 22.80, HKD: 10.75, MYR: 18.50, CNY: 11.50
      };
      if (fallbacks[currCode]) bRate = fallbacks[currCode];
    }

    if (product === 'CASH_SELL') return Math.max(0.01, Math.round((bRate - 0.63) * 100) / 100);
    if (product === 'CASH') return Math.round((bRate + 0.63) * 100) / 100;
    return bRate;
  };

  const extraCurrenciesCalculated = extraCurrencies.map((item) => {
    const itemRate = getEffectiveRateForCurrency(item.currency);
    const itemAmt = parseFloat(item.amount) || 0;
    const itemInr = itemAmt * itemRate;
    return {
      ...item,
      rate: itemRate,
      inrEquivalent: itemInr
    };
  });

  const totalExtraInr = extraCurrenciesCalculated.reduce((sum, item) => sum + item.inrEquivalent, 0);
  const totalCurrencyInrValue = (inrEquivalent || 0) + totalExtraInr;

  // Auto-remove applied offer if order total falls below the offer's minimum threshold
  useEffect(() => {
    if (appliedOffer) {
      const currentVal = totalCurrencyInrValue || 0;
      if (currentVal < appliedOffer.minAmount) {
        setAppliedOffer(null);
        setCouponInput('');
      }
    }
  }, [totalCurrencyInrValue, appliedOffer]);

  // Fee breakdown
  const parsedAmount = parseFloat(amount) || 0;
  const hasAnyCurrency = parsedAmount > 0 || extraCurrenciesCalculated.some(c => parseFloat(c.amount) > 0);

  const serviceCharge = hasAnyCurrency ? 150 : 0;
  const gst = totalCurrencyInrValue > 0 ? calculateForexGst(totalCurrencyInrValue) : 0;

  const appliedDiscount = appliedOffer ? appliedOffer.discountAmount : 0;

  const basePayableAmount = product === 'CASH_SELL'
    ? (totalCurrencyInrValue > 0 ? (totalCurrencyInrValue - serviceCharge - gst) : 0)
    : (totalCurrencyInrValue > 0 ? (totalCurrencyInrValue + serviceCharge + gst) : 0);

  const payableAmount = product === 'CASH_SELL'
    ? basePayableAmount
    : Math.max(0, basePayableAmount - appliedDiscount);

  const handleSelectOffer = (offer: typeof DUMMY_OFFERS[0]) => {
    if (appliedOffer?.code === offer.code) {
      // Already applied, do not remove. Removal is only handled via the explicit Remove button.
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
      gst,
      payableAmount,
    });

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    updateDraft({ checkoutStep: 2 });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAuthSuccess = (authenticatedUser?: any) => {
    setShowAuthModal(false);
    updateDraft({ 
      checkoutStep: 2,
      travellerName: authenticatedUser?.fullName || draftState.travellerName || '',
      phone: authenticatedUser?.phone || authenticatedUser?.mobile || draftState.phone || '',
      email: authenticatedUser?.email || draftState.email || '',
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const getCurrencyName = (code: string) => {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
      return displayNames.of(code) || code;
    } catch {
      return code;
    }
  };

  const currencyName = getCurrencyName(currency);
  const productName = product === 'CASH_SELL'
    ? 'Foreign Currency Notes Sell'
    : product === 'REMITTANCE'
      ? 'International Money Transfer'
      : product === 'CASH'
        ? 'Foreign Currency Notes'
        : product === 'CARD'
          ? 'Forex Card'
          : 'International Money Transfer';

  const selectedPurposeObj = transferPurposes.find(p => p.code === draftState.purposeCode);
  const selectedBeneficiary = savedBeneficiaries.find(b => b.id === draftState.beneficiaryId);

  const getEligibilityMessage = () => {
    if (product === 'CASH_SELL') {
      if (draftState.deliveryMethod === 'HOME_DELIVERY') {
        return <span>You are eligible for <strong className="text-gray-700">Doorstep Collection</strong></span>;
      }
      return <span>You are eligible for <strong className="text-gray-700">Branch Visit Encashment</strong></span>;
    }
    if (product === 'CARD') {
      return <span>Pre-payment required for <strong className="text-gray-700">Card Issuance</strong></span>;
    }
    if (product === 'REMITTANCE') {
      return <span>100% RBI LRS Compliant <strong className="text-gray-700">International Wire Transfer</strong></span>;
    }
    if (draftState.deliveryMethod === 'HOME_DELIVERY') {
      return <span>You are eligible for <strong className="text-gray-700">Pay On Delivery</strong></span>;
    }
    return <span>You are eligible for <strong className="text-gray-700">Pay At Branch</strong></span>;
  };

  return (
    <div className="bg-white/95 rounded-b-xl border-t border-slate-200/80 p-0 sm:p-6 shadow-md min-h-screen sm:min-h-0 text-left relative overflow-visible">
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none bg-cover bg-center z-0 opacity-40 rounded-b-xl"
        style={{ backgroundImage: `url('/card_bg.png')` }}
      />

      <div className="relative z-10">
      
      {/* Product Switcher Tabs (Issue 1 & 2) */}
      <div className="flex flex-wrap border border-gray-200 mb-6 bg-gray-100/80 p-1.5 rounded-2xl gap-1 shadow-inner">
        <button
          type="button"
          onClick={() => handleTabSwitch('CASH')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            product === 'CASH' ? 'bg-white text-blue-600 shadow-sm border border-gray-200 ring-1 ring-black/5' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <span>💵</span> Buy Notes
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('CARD')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            product === 'CARD' ? 'bg-white text-blue-600 shadow-sm border border-gray-200 ring-1 ring-black/5' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <span>💳</span> Forex Card
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('CASH_SELL')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            product === 'CASH_SELL' ? 'bg-white text-emerald-600 shadow-sm border border-gray-200 ring-1 ring-black/5' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <span>🔄</span> Sell Forex
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('REMITTANCE')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            product === 'REMITTANCE' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200 ring-1 ring-black/5' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <span>✈️</span> Send Remittance
        </button>
      </div>

      {/* Top Banner Info */}
      {/* Top Doorstep Delivery Ribbon */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-[13px] font-medium text-gray-700 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="mr-1 text-lg">🛵</span> Guaranteed Doorstep Delivery by <span className="font-bold text-gray-900 mx-0.5">{deliveryDay}, 9:00 PM</span> in 
          <span 
            className="text-blue-600 font-bold ml-1 cursor-pointer hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
            onClick={() => setIsCityModalOpen(true)}
          >
            {selectedCity} ▾
          </span>
          <button
            onClick={() => setIsDeliveryPolicyOpen(true)}
            className="ml-1 text-base hover:scale-110 transition-transform cursor-pointer"
            title="Click for Same-Day Delivery Policy"
          >
            👈
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Funnel Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Required Amount Card */}
          <Card className="shadow-sm border-gray-200 rounded-2xl overflow-visible">
            <div className="p-6 pb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-4">Required Amount</h2>
              
              {/* Highlight Exchange Rate & Total Conversion Prominently (Issue 6) */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/80 rounded-xl p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Interbank Rate:</span>
                  <span className="text-sm font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-md border border-blue-200/60 shadow-2xs">
                    1 {currency} = ₹{adjustedRate?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-200">
                  ✔ Zero Hidden Charges
                </span>
              </div>
              
              <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-4 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Luxury Currency Selector Dropdown */}
                  <div className="sm:col-span-6">
                    <CurrencyDropdown
                      value={currency}
                      onChange={(newCurr) => updateDraft({ currency: newCurr })}
                      ratesData={rates}
                      rateType={isSell ? 'sell' : isRemittance ? 'remittance' : 'buy'}
                      label="Select Currency"
                    />
                  </div>

                  {/* Amount Input */}
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1.5">
                      Forex Amount
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="1"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 pr-14 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                        value={amount}
                        onChange={e => updateDraft({ amount: e.target.value })}
                        placeholder="e.g. 1000"
                      />
                      <span className="absolute right-3 top-3 text-xs font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {currency}
                      </span>
                    </div>
                  </div>

                  {/* Working Minus / Clear Button */}
                  <div className="sm:col-span-1 flex items-center justify-end sm:justify-center">
                    <button 
                      type="button"
                      title={extraCurrencies.length > 0 ? "Remove this currency" : "Clear amount"}
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
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center font-bold text-sm transition-all shadow-2xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Live INR Conversion Result */}
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    {amount ? `${parseFloat(amount).toLocaleString('en-IN')} ${currency} @ ₹${adjustedRate?.toFixed(2)}` : 'Enter amount to calculate live total'}
                  </span>
                  <div className="text-right">
                    <span className="text-gray-500 font-medium mr-1.5">INR Value:</span>
                    <span className="font-black text-blue-700 text-sm sm:text-base">
                      ₹ {inrEquivalent ? inrEquivalent.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Currencies List */}
              {extraCurrenciesCalculated.map((c, idx) => (
                <div key={idx} className="mt-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 rounded-xl p-3.5 border border-blue-100 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="font-bold text-gray-900 text-sm">{getCurrencyName(c.currency)}</div>
                    <span className="text-xs font-semibold text-gray-800 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs">
                      {c.amount} {c.currency} = <strong className="text-blue-700">₹ {Math.round(c.inrEquivalent).toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="text-[11px] text-blue-600 font-bold">@ ₹{c.rate.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => updateExtraCurrencies(extraCurrencies.filter((_, i) => i !== idx))} 
                    className="text-red-500 hover:text-red-700 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors shadow-2xs shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="mt-5">
                <button 
                  onClick={() => setShowAddCurrencyModal(true)}
                  className="text-blue-600 font-bold text-[13px] flex items-center hover:underline"
                >
                  + Add Another Currency
                </button>
              </div>
            </div>
          </Card>

          {/* Fulfillment Options Card — SHOWN ONLY FOR CASH BUY, CASH SELL & CARD */}
          {!isRemittance && (
            <Card className="shadow-sm border-gray-200 rounded-2xl">
              <div className="p-6">
                <h2 className="text-[17px] font-bold text-gray-900 mb-2">Fulfillment Options</h2>
                <p className="text-[13px] text-gray-500 mb-6">
                  {product === 'CASH_SELL' ? 'Choose how you would like to hand over your foreign currency' : 'Choose how you would like to receive your foreign exchange'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Branch Pickup / Visit */}
                  <div 
                    onClick={() => updateDraft({ deliveryMethod: 'PICKUP' })}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${deliveryMethod === 'PICKUP' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="font-bold text-gray-900 mb-1">
                      {product === 'CASH_SELL' ? 'Branch Visit' : 'Branch Pickup'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {product === 'CASH_SELL' ? 'Visit our branch office to verify cash & get paid' : 'Collect notes/card directly from our branch office'}
                    </div>
                  </div>
                  
                  {/* Home Delivery / Home Collection */}
                  <div 
                    onClick={() => updateDraft({ deliveryMethod: 'HOME_DELIVERY' })}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${deliveryMethod === 'HOME_DELIVERY' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="font-bold text-gray-900 mb-1">
                      {product === 'CASH_SELL' ? 'Home Collection' : 'Home Delivery'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {product === 'CASH_SELL' ? 'Our executive will collect currency notes from your doorstep' : 'Get it delivered safely to your home or office address'}
                    </div>
                  </div>
                </div>

                {/* Warning when Doorstep is selected but under ₹25,000 threshold */}
                {deliveryMethod === 'HOME_DELIVERY' && totalCurrencyInrValue > 0 && totalCurrencyInrValue < 25000 && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl shrink-0">⚠️</span>
                      <div className="text-xs space-y-0.5">
                        <p className="font-extrabold text-amber-900">
                          Doorstep Delivery requires a minimum order value of ₹25,000.
                        </p>
                        <p className="text-amber-800 font-medium">
                          Your current order value is <strong>₹{Math.round(totalCurrencyInrValue).toLocaleString('en-IN')}</strong>. Please choose Branch Pickup (No minimum value) or add more currency.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateDraft({ deliveryMethod: 'PICKUP' })}
                      className="whitespace-nowrap px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-lg transition-colors shadow-2xs"
                    >
                      Switch to Branch Pickup
                    </button>
                  </div>
                )}

                {deliveryMethod === 'PICKUP' ? (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="block text-[13px] font-bold text-gray-900 mb-1">Select Pickup Branch</label>
                    <select 
                      value={branchId}
                      onChange={(e) => updateDraft({ branchId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white font-medium text-gray-700"
                    >
                      <option value="">Choose Branch</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.branchName} ({b.branchCity}) - {b.branchAddress}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  totalCurrencyInrValue >= 25000 && (
                    <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-blue-900 font-medium animate-in fade-in duration-200">
                      <span className="text-base">🚚</span>
                      <span>Guaranteed safe doorstep delivery. You will provide your delivery address and coordination contact in Step 4.</span>
                    </div>
                  )
                )}
              </div>
            </Card>
          )}

          {/* ─── REMITTANCE SPECIFIC FUNNEL (REORDERED & DYNAMIC) ─────────────────────────────── */}
          {isRemittance && (
            <>
              {/* 1. Transfer Details (Country, Purpose, Source of Funds, Relationship) */}
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-[17px] font-bold text-gray-900 mb-1">Transfer Details</h2>
                    <p className="text-[13px] text-gray-500">Select destination country and transfer information.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Destination Country */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-indigo-600" />
                        Destination Country *
                      </label>
                      <select
                        value={draftState.countryCode || ''}
                        onChange={e => updateDraft({ countryCode: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Destination Country</option>
                        {countries.map(c => (
                          <option key={c.id} value={c.countryCode}>
                            {c.countryName} ({c.currencyCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Purpose Selector */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        Purpose of Remittance *
                      </label>
                      <select
                        value={draftState.purposeCode || ''}
                        onChange={e => updateDraft({ purposeCode: e.target.value, destination: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Purpose</option>
                        {transferPurposes.map(p => (
                          <option key={p.id} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Source of Funds & Relationship */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Source of Funds</label>
                      <select
                        value={draftState.sourceOfFunds || ''}
                        onChange={e => updateDraft({ sourceOfFunds: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Source</option>
                        <option value="SALARY">Salary / Personal Income</option>
                        <option value="SAVINGS">Personal Savings</option>
                        <option value="BUSINESS">Business Income</option>
                        <option value="LOAN">Bank Education/Personal Loan</option>
                        <option value="GIFT">Gift / Family Contribution</option>
                        <option value="INVESTMENT">Investment Liquidation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Relationship with Beneficiary</label>
                      <select
                        value={draftState.relationship || ''}
                        onChange={e => updateDraft({ relationship: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Relationship</option>
                        <option value="SELF">Self</option>
                        <option value="SPOUSE">Spouse</option>
                        <option value="CHILD">Child</option>
                        <option value="PARENT">Parent</option>
                        <option value="SIBLING">Sibling</option>
                        <option value="FRIEND">Relative / Friend</option>
                        <option value="INSTITUTION">University / Institution</option>
                        <option value="BUSINESS">Vendor / Business Partner</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 2. Beneficiary Selection Card */}
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-[17px] font-bold text-gray-900">Beneficiary Details</h2>
                      <p className="text-[13px] text-gray-500">Select who will receive the funds abroad.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Beneficiary
                    </Button>
                  </div>

                  {/* Add New Beneficiary Inline Form */}
                  {showAddBeneficiary && (
                    <div className="border border-dashed border-indigo-300 rounded-xl p-4 bg-indigo-50/30 space-y-3 animate-in fade-in duration-200">
                      <p className="text-[12px] font-bold text-indigo-700 uppercase tracking-wider">New Foreign Beneficiary</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">Full Name *</label>
                          <input
                            value={newBenName}
                            onChange={e => setNewBenName(e.target.value)}
                            placeholder="e.g. Harvard University or John Doe"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">Bank Name *</label>
                          <input
                            value={newBenBank}
                            onChange={e => setNewBenBank(e.target.value)}
                            placeholder="e.g. Bank of America"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">IBAN / Account Number *</label>
                          <input
                            value={newBenAccount}
                            onChange={e => setNewBenAccount(e.target.value)}
                            placeholder="e.g. 123456789012"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">SWIFT / BIC Code *</label>
                          <input
                            value={newBenSwift}
                            onChange={e => setNewBenSwift(e.target.value.toUpperCase())}
                            placeholder="e.g. BOFAUS3N"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-mono uppercase font-bold"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">Bank Address</label>
                          <input
                            value={newBenAddress}
                            onChange={e => setNewBenAddress(e.target.value)}
                            placeholder="e.g. Boston, MA, USA"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-medium"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={handleAddNewBeneficiary}
                          disabled={isSavingBeneficiary || !newBenName || !newBenBank || !newBenAccount || !newBenSwift}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50"
                        >
                          {isSavingBeneficiary ? 'Saving...' : 'Save & Select Beneficiary'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowAddBeneficiary(false)}
                          className="text-gray-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Saved Beneficiaries List */}
                  {savedBeneficiaries.length > 0 ? (
                    <div className="space-y-2">
                      {savedBeneficiaries.map(ben => {
                        const handleSelectBen = () => {
                          const updates: any = { 
                            beneficiaryId: ben.id, 
                            beneficiaryName: ben.name 
                          };
                          if (ben.country) {
                            const matching = findMatchingCountry(ben.country);
                            if (matching) {
                              updates.countryCode = matching.countryCode;
                              updates.currency = matching.currencyCode;
                            }
                          }
                          updateDraft(updates);
                        };

                        return (
                          <div
                            key={ben.id}
                            onClick={handleSelectBen}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              draftState.beneficiaryId === ben.id
                                ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50/50'
                            }`}
                          >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                {ben.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{ben.name}</p>
                                <p className="text-[11px] text-gray-500 font-medium">{ben.bankName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-[11px] text-gray-600 font-bold">{ben.ibanOrAccountNumber}</p>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase">SWIFT: {ben.swiftCode}</p>
                            </div>
                          </div>
                          {draftState.beneficiaryId === ben.id && (
                            <div className="mt-2 flex items-center gap-1 text-indigo-600 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selected Beneficiary
                            </div>
                          )}
                        </div>
                      ); })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                      <Landmark className="w-8 h-8 mx-auto text-indigo-400 opacity-60" />
                      <p className="text-xs font-bold text-gray-700">No beneficiaries found.</p>
                      <p className="text-[11px] text-gray-500">Add your beneficiary account to continue with your transfer.</p>
                      <Button
                        size="sm"
                        onClick={() => setShowAddBeneficiary(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        + Add Beneficiary
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* 3. Assigned Forexmate Branch Card (Only for Cash Buy & Sell, NOT for Outward Remittance) */}
              {!isRemittance && (
                <Card className="shadow-sm border-gray-200 rounded-2xl">
                  <div className="p-6 space-y-3">
                    <div>
                      <h2 className="text-[17px] font-bold text-gray-900">Assigned Forexmate Branch</h2>
                      <p className="text-[13px] text-gray-500">This branch will verify your documents and process your compliance request.</p>
                    </div>
                    <select
                      value={branchId}
                      onChange={(e) => updateDraft({ branchId: e.target.value })}
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                    >
                      <option value="">Choose Assigned Branch</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.branchName} ({b.branchCity}) - {b.branchAddress}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>
              )}


              {/* 4. Dynamic Purpose-Specific Fields Card (Education / Medical / Travel) */}
              {draftState.purposeCode === 'TRAVEL' && (
                <Card className="shadow-sm border-gray-200 rounded-2xl animate-in fade-in duration-200">
                  <div className="p-6 space-y-4">
                    <h2 className="text-[17px] font-bold text-gray-900">Travel Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Departure Date *</label>
                        <input
                          type="date"
                          value={departureDate}
                          min={todayStr}
                          max={maxDepartureDateStr}
                          onClick={triggerDatePicker}
                          onChange={(e) => handleDepartureDateChange(e.target.value)}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Return Date (Optional)</label>
                        <input
                          type="date"
                          value={returnDate}
                          min={departureDate || todayStr}
                          onClick={triggerDatePicker}
                          onChange={(e) => handleReturnDateChange(e.target.value)}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {draftState.purposeCode === 'EDUCATION' && (
                <Card className="shadow-sm border-gray-200 rounded-2xl animate-in fade-in duration-200">
                  <div className="p-6 space-y-4">
                    <h2 className="text-[17px] font-bold text-gray-900">University / Education Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">University / College Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Harvard University"
                          value={draftState.universityName || ''}
                          onChange={(e) => updateDraft({ universityName: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Student ID / Roll No. (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. STU-2026-99"
                          value={draftState.studentId || ''}
                          onChange={(e) => updateDraft({ studentId: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {draftState.purposeCode === 'MEDICAL' && (
                <Card className="shadow-sm border-gray-200 rounded-2xl animate-in fade-in duration-200">
                  <div className="p-6 space-y-4">
                    <h2 className="text-[17px] font-bold text-gray-900">Hospital / Medical Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Hospital / Clinic Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Mayo Clinic"
                          value={draftState.hospitalName || ''}
                          onChange={(e) => updateDraft({ hospitalName: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Hospital Country</label>
                        <input
                          type="text"
                          placeholder="e.g. USA"
                          value={draftState.hospitalCountry || ''}
                          onChange={(e) => updateDraft({ hospitalCountry: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 5. Required Documents Preview Banner */}
              {selectedPurposeObj && (
                <div className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Required Documents Preview
                  </div>
                  <p className="text-xs text-indigo-700 font-medium">
                    Based on your selected purpose (<strong className="font-bold">{selectedPurposeObj.name}</strong>), you will be asked to upload the following documents after placing your order:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="bg-white border border-indigo-200 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      ✔ PAN Card
                    </span>
                    <span className="bg-white border border-indigo-200 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      ✔ Passport
                    </span>
                    {selectedPurposeObj.documentRequirements.map((d, i) => (
                      <span key={i} className="bg-white border border-indigo-200 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                        ✔ {d.docType.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Travel Details / Source of Currency Card — SHOWN ONLY FOR CASH SELL & CASH BUY / CARD */}
          {!isRemittance && (
            product === 'CASH_SELL' ? (
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Source of Foreign Currency</h2>
                  <p className="text-[13px] text-gray-500 mb-6 font-medium">Please declare the source of the foreign currency you wish to encash.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-950 mb-2">Select Source of Currency</label>
                      <select
                        value={['Returned from Overseas Travel', 'Salary Earned Abroad', 'Gift', 'Business Income', 'Savings'].includes(destination) ? destination : destination ? 'Other' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Other') {
                            updateDraft({ destination: '' });
                          } else {
                            updateDraft({ destination: val });
                          }
                        }}
                        className="w-full md:w-1/2 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-xs focus:border-emerald-500 focus:bg-white outline-none text-gray-700 font-bold"
                      >
                        <option value="">-- Choose Source --</option>
                        <option value="Returned from Overseas Travel">Returned from Overseas Travel</option>
                        <option value="Salary Earned Abroad">Salary Earned Abroad</option>
                        <option value="Gift">Gift</option>
                        <option value="Business Income">Business Income</option>
                        <option value="Savings">Savings</option>
                        <option value="Other">Other (Please specify)</option>
                      </select>
                    </div>

                    {/* Show specification field if destination is not in list but is not empty */}
                    {(destination && !['Returned from Overseas Travel', 'Salary Earned Abroad', 'Gift', 'Business Income', 'Savings'].includes(destination)) || 
                    (!destination && !['Returned from Overseas Travel', 'Salary Earned Abroad', 'Gift', 'Business Income', 'Savings'].includes(destination) && destination === '') ? (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-[13px] font-bold text-gray-950 mb-2">Specify Custom Source</label>
                        <input
                          type="text"
                          placeholder="Enter source of currency"
                          value={destination}
                          onChange={(e) => updateDraft({ destination: e.target.value })}
                          className="w-full md:w-1/2 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white outline-none text-gray-900 font-bold"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Travel Details</h2>
                  <p className="text-[13px] text-gray-500 mb-6">Air ticket required to support your travel to below countries</p>
                  
                  <div className="space-y-6">
                    
                    {/* Destination */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Add Travel Destination</label>
                      <div className="flex flex-wrap gap-2.5 items-center">
                        {destination && (
                          <div className="flex items-center bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-[13px] font-bold text-blue-900 shadow-2xs">
                            {destination} 
                            <button onClick={() => updateDraft({ destination: '' })} className="ml-2 text-gray-400 hover:text-red-600 font-bold text-xs">✕</button>
                          </div>
                        )}
                        {extraCountries.map((c, idx) => (
                          <div key={idx} className="flex items-center bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-[13px] font-semibold text-gray-800">
                            {c}
                            <button onClick={() => setExtraCountries(prev => prev.filter((_, i) => i !== idx))} className="ml-2 text-gray-400 hover:text-red-600 font-bold text-xs">✕</button>
                          </div>
                        ))}
                        
                        {!destination && (
                          <select 
                            value={destination}
                            onChange={(e) => updateDraft({ destination: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:border-blue-500 outline-none max-w-xs"
                          >
                            <option value="">Select Primary Country</option>
                            {DESTINATION_COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        <button 
                          onClick={() => setShowAddCountryModal(true)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-50 uppercase tracking-wide transition-colors"
                        >
                          + Add Country
                        </button>
                      </div>
                    </div>

                    {/* Dates — Fixed Date Inputs & Enforced 60-Day Travel Boundary (Issue 18) */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Add Travel Date</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Departure Date *</label>
                          <input 
                            type="date"
                            value={departureDate}
                            min={todayStr}
                            max={maxDepartureDateStr}
                            onClick={triggerDatePicker}
                            onChange={(e) => handleDepartureDateChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none w-full text-gray-800 font-medium cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Return Date</label>
                          <input 
                            type="date"
                            value={returnDate}
                            disabled={noReturnDate}
                            min={departureDate || todayStr}
                            onClick={triggerDatePicker}
                            onChange={(e) => handleReturnDateChange(e.target.value)}
                            className={`border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none w-full font-medium ${noReturnDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-800 bg-white cursor-pointer'}`}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between text-[11.5px] text-gray-500 pt-1">
                        {!departureDate && (
                          <p className="text-orange-700 font-semibold">⚠️ Travel departure date must be within 60 days of order date as per RBI LRS rules.</p>
                        )}
                        <label className={`flex items-center cursor-pointer ${!departureDate ? 'mt-3 md:mt-0' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={noReturnDate}
                            onChange={(e) => updateDraft({ noReturnDate: e.target.checked, returnDate: '' })}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 mr-2"
                          />
                          <span className="text-gray-700 font-medium text-[13px]">I don't have a return date yet</span>
                        </label>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Purpose of Travel</label>
                      <select 
                        value={purpose}
                        onChange={(e) => updateDraft({ purpose: e.target.value })}
                        className="w-full md:w-1/2 border border-gray-300 bg-white rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none uppercase font-bold text-gray-800"
                      >
                        <option value="">SELECT PURPOSE</option>
                        <option value="TOURISM">Leisure / Tourism</option>
                        <option value="BUSINESS">Business Travel</option>
                        <option value="EDUCATION">Education Abroad</option>
                        <option value="MEDICAL">Medical Treatment</option>
                        <option value="EMPLOYMENT">Employment Abroad</option>
                        <option value="EMIGRATION">Emigration</option>
                      </select>
                    </div>



                  </div>
                </div>
              </Card>
            )
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleQuote} 
              disabled={
                isLocking || 
                !amount || 
                (isRemittance ? (
                  !draftState.countryCode ||
                  !draftState.purposeCode ||
                  !draftState.beneficiaryId
                ) : (
                  !destination || 
                  (!isSell && (!departureDate || !purpose)) ||
                  (deliveryMethod === 'PICKUP' && !branchId) ||
                  (deliveryMethod === 'HOME_DELIVERY' && totalCurrencyInrValue < 25000)
                ))
              }
              className={`w-full md:w-1/3 text-white font-bold py-6 rounded-lg text-sm shadow-sm transition-all tracking-wider disabled:opacity-50 ${
                isSell ? 'bg-emerald-500 hover:bg-emerald-600' : isRemittance ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isLocking ? 'PROCESSING...' : 'CONTINUE'}
            </Button>

            {!isRemittance && deliveryMethod === 'HOME_DELIVERY' && totalCurrencyInrValue > 0 && totalCurrencyInrValue < 25000 && (
              <p className="text-[12px] font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg p-2.5 max-w-md shadow-2xs">
                ⚠️ Doorstep Delivery requires min. ₹25,000 order value. Please switch to Branch Pickup (No minimum value) or add more currency to proceed.
              </p>
            )}

            {isRemittance && (!amount || !draftState.countryCode || !draftState.purposeCode || !draftState.beneficiaryId) && (
              <p className="text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 max-w-md">
                💡 Please enter transfer amount, select destination country, purpose, and beneficiary to continue.
              </p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Summary */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Product Box */}
          <Card className="shadow-sm border-gray-200 rounded-xl">
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-gray-900 text-[15px] mb-1">{productName}</h3>
                <p className="text-[11px] text-gray-700 mb-1"><strong>Best</strong> Rates & <strong>Genuine</strong> {product === 'CASH' ? 'Notes' : 'Card'}</p>
                <button 
                  onClick={() => setIsKnowMoreOpen(true)} 
                  className="text-blue-600 text-[11px] font-bold hover:underline cursor-pointer"
                >
                  Know More ➔
                </button>
              </div>
              <div className="w-14 h-9 bg-green-50 rounded-md border border-green-200/50 flex flex-col justify-center items-center overflow-hidden relative shadow-sm">
                 <div className="absolute inset-0 bg-green-200 opacity-20 pattern-dots"></div>
                 <div className="text-[7px] font-bold text-green-800 z-10">{currency}</div>
                 <div className="text-[9px] font-bold text-green-700 z-10">NOTE</div>
              </div>
            </div>
          </Card>

          {/* Amount Breakup */}
          <Card className="shadow-sm border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-[15px]">Amount Breakup</h3>
            </div>
            
            <div className="p-4 space-y-2.5">
              {isRemittance ? (
                // REMITTANCE Breakup
                isCalcLoading ? (
                  <div className="text-center text-gray-400 text-sm py-4">Calculating...</div>
                ) : remCalc ? (
                  <>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-900 font-medium">Transfer Amount</span>
                      <span className="font-bold text-gray-900">{remCalc.foreignAmount} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-500 pl-2">
                      <span>• Rate: ₹{remCalc.exchangeRate?.toFixed(2)}</span>
                      <span>₹ {remCalc.inrSubtotal?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] pt-1">
                      <span className="text-gray-900 font-medium">Transfer Fee</span>
                      <span className="font-bold text-gray-900">₹ {remCalc.feeAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-b border-gray-200/60 pb-3">
                      <span className="text-gray-900 font-medium flex items-center gap-1">
                        TCS Tax
                        {remCalc.thresholdExceeded && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">Threshold Crossed</span>}
                      </span>
                      <span className="font-bold text-gray-900">₹ {remCalc.tcsAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 pb-1">
                      <div>
                        <span className="text-gray-900 font-bold block text-[13px]">Total Payable (INR)</span>
                        <span className="text-[10px] text-gray-500">Incl. Transfer Fee & TCS</span>
                      </div>
                      <span className="font-extrabold text-indigo-700 text-[17px]">₹ {remCalc.totalInr?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    {remCalc.thresholdExceeded && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-[11px] text-orange-700 font-medium">
                        ⚠️ Your cumulative LRS spending has exceeded ₹7 Lakhs. Higher TCS rate applies.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">
                    Enter amount, select country & purpose to see fee breakdown.
                  </div>
                )
              ) : (
                // CASH BUY / CASH SELL Breakup
                <>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-900 font-medium">Total Currency Value</span>
                    <span className="font-bold text-gray-900">₹ {Math.round(totalCurrencyInrValue).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-500 pl-2">
                    <span>• {amount || 0} {currency} @ {adjustedRate?.toFixed(2) || '0.00'}</span>
                    <span>₹ {inrEquivalent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  {extraCurrenciesCalculated.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] text-blue-600 font-medium pl-2">
                      <span>• {c.amount} {c.currency} @ {c.rate.toFixed(2)}</span>
                      <span>₹ {Math.round(c.inrEquivalent).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center text-[13px] pt-1">
                    <span className="text-gray-900 font-medium">Service Charge</span>
                    <span className="font-bold text-gray-900">₹ {serviceCharge}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[13px] border-b border-gray-200/60 pb-3">
                    <span className="text-gray-900 font-medium">GST</span>
                    <span className="font-bold text-gray-900">₹ {gst}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-[13px] text-emerald-700 font-extrabold pt-1">
                      <span className="flex items-center gap-1">
                        <span>Promo Code ({appliedOffer?.code})</span>
                      </span>
                      <span>- ₹ {appliedDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1.5 pb-1">
                    <div>
                      <span className="text-gray-900 font-bold block text-[13px]">
                        {product === 'CASH_SELL' ? 'Total Amount to Receive' : 'Total Payable Amount'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {product === 'CASH_SELL' ? 'After GST & Service charge' : 'Incl GST & Service charge'}
                      </span>
                    </div>
                    <span className="font-extrabold text-gray-900 text-[18px]">₹ {payableAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-[#f8f9fa] py-2.5 text-center border-t border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">{getEligibilityMessage()}</span>
            </div>
          </Card>

          {/* Offers Card */}
          <Card className="shadow-sm border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-[15px] flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-500 transform -rotate-45" />
                <span>Available Offers & Coupons</span>
              </h3>
              {appliedOffer && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Coupon Applied
                </span>
              )}
            </div>

            <div className="p-4 space-y-3.5">
              {/* Input bar */}
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl p-1 bg-gray-50/70 hover:bg-white transition-all focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 shadow-2xs">
                <div className="pl-1.5 opacity-60 text-gray-500">
                  <Ticket className="w-3.5 h-3.5 transform -rotate-45" />
                </div>
                <input 
                  type="text" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code" 
                  className="bg-transparent flex-1 min-w-0 py-1 px-1 text-[11px] font-mono font-bold focus:outline-none uppercase placeholder:font-sans placeholder:normal-case placeholder:text-[11px] placeholder:text-gray-400 text-gray-900"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (appliedOffer?.code !== couponInput) {
                      handleApplyInputCoupon();
                    }
                  }}
                  className={`font-extrabold text-[11px] px-3 py-1.5 rounded-lg transition-colors uppercase shrink-0 ${
                    appliedOffer?.code === couponInput
                      ? 'bg-emerald-600 text-white cursor-default shadow-2xs'
                      : 'bg-slate-900 hover:bg-amber-600 text-white cursor-pointer shadow-2xs'
                  }`}
                >
                  {appliedOffer?.code === couponInput ? 'APPLIED ✓' : 'APPLY'}
                </button>
              </div>

              {/* Notice error message */}
              {couponError && (
                <p className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}

              {/* Applied coupon success badge */}
              {appliedOffer && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
                  <div>
                    <span className="font-black font-mono block text-emerald-950">{appliedOffer.code} Applied</span>
                    <span className="text-[11px] text-emerald-700 font-medium">{appliedOffer.description}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setAppliedOffer(null);
                      setCouponInput('');
                      setCouponError(null);
                    }}
                    className="text-rose-600 font-bold hover:underline text-[11px] ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Selectable Dummy Offers */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                  Select an Offer Below
                </span>

                {DUMMY_OFFERS.map((offer) => {
                  const currentInrVal = inrEquivalent || 0;
                  const isEligible = currentInrVal >= offer.minAmount;
                  const isSelected = appliedOffer?.code === offer.code;

                  return (
                    <div 
                      key={offer.code}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-500/30'
                          : isEligible
                            ? 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-xs cursor-pointer'
                            : 'bg-gray-50/60 border-gray-200/70 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800">
                            {offer.code}
                          </span>
                          <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded uppercase">
                            {offer.tag}
                          </span>
                        </div>

                        {isEligible ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                handleSelectOffer(offer);
                              }
                            }}
                            className={`text-[11px] font-black px-3 py-1 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-2xs cursor-default'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-2xs cursor-pointer'
                            }`}
                          >
                            {isSelected ? 'APPLIED ✓' : 'APPLY'}
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-200/70 px-2 py-0.5 rounded">
                            Locked
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-gray-900 mt-1">
                        {offer.title}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {offer.description}
                      </p>

                      {!isEligible && (
                        <div className="mt-1.5 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                          <span>🔒 Add ₹ {(offer.minAmount - currentInrVal).toLocaleString('en-IN')} more to unlock</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </Card>

        </div>
      </div>

      </div>

      <CitySelectorModal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)} 
        onSelect={(city) => updateDraft({ city })} 
      />

      {/* Know More Modal (Issue 19) */}
      {isKnowMoreOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                <span>✨</span> Product Details & Guarantee
              </h3>
              <button onClick={() => setIsKnowMoreOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">✕</button>
            </div>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900">⚡ Zero Margin Live Exchange</p>
                <p className="text-xs text-blue-700">Real-time interbank conversion with complete transparency. No hidden commissions or bank markups.</p>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <p className="font-bold text-emerald-900">🛵 Guaranteed Doorstep Delivery</p>
                <p className="text-xs text-emerald-700">Order by 1:00 PM for same-day home or office delivery across major metro cities.</p>
              </div>
              <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                <p className="font-bold text-purple-900">🛡️ 100% RBI Regulated & Compliant</p>
                <p className="text-xs text-purple-700">Fully compliant under RBI Liberalized Remittance Scheme (LRS) and FEMA 1999 guidelines.</p>
              </div>
            </div>
            <Button onClick={() => setIsKnowMoreOpen(false)} className="w-full bg-gray-900 hover:bg-black font-bold text-white py-2.5 rounded-xl cursor-pointer">
              Got It
            </Button>
          </div>
        </div>
      )}

      {/* Add Currency Modal (Issue 8) */}
      {showAddCurrencyModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">+ Add Secondary Currency</h3>
              <button onClick={() => setShowAddCurrencyModal(false)} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <CurrencyDropdown
                  value={newCurrencyCode}
                  onChange={(code) => setNewCurrencyCode(code)}
                  ratesData={rates}
                  rateType={isSell ? 'sell' : isRemittance ? 'remittance' : 'buy'}
                  label="Select Secondary Currency"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Required Amount</label>
                <input 
                  type="number"
                  value={newCurrencyAmount}
                  onChange={(e) => setNewCurrencyAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-bold text-gray-900"
                  placeholder="e.g. 500"
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                Add Currency
              </Button>
              <Button variant="outline" onClick={() => setShowAddCurrencyModal(false)} className="rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Country Modal (Issue 14) */}
      {showAddCountryModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">+ Add Destination Country</h3>
              <button onClick={() => setShowAddCountryModal(false)} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 font-sans">Choose Additional Country</label>
              <select 
                value={selectedExtraCountry}
                onChange={(e) => setSelectedExtraCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold text-gray-800 focus:border-blue-500 outline-none"
              >
                {DESTINATION_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  if (selectedExtraCountry && !extraCountries.includes(selectedExtraCountry)) {
                    setExtraCountries(prev => [...prev, selectedExtraCountry]);
                  }
                  setShowAddCountryModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                Add Destination
              </Button>
              <Button variant="outline" onClick={() => setShowAddCountryModal(false)} className="rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Same Day Delivery Policy Modal */}
      <SameDayDeliveryModal 
        isOpen={isDeliveryPolicyOpen} 
        onClose={() => setIsDeliveryPolicyOpen(false)} 
      />

      {/* MTTPL Customer Fast Login / OTP Modal */}
      <CustomerAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
