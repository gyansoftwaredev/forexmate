"use client";

import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { calculateForexGst } from '@/lib/gstCalculator';
import { 
  CheckCircle2, Edit3, User, Phone, Mail, CreditCard, Globe, Calendar, 
  ShieldCheck, ArrowRight, Building2, Download, Sparkles, ChevronDown, 
  Info, Landmark 
} from 'lucide-react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { getActiveBranches } from '@/lib/api-public';
import { ALL_CURRENCIES_MAP, getCurrencyFlag, getCurrencyName } from '@/lib/currencyMetadata';
import { useRates } from '@/hooks/useRates';
import { useAuth } from '@/context/AuthContext';


interface RbiDocRequirement {
  id: string;
  name: string;
  accept: string;
  icon: string;
  required: boolean;
}

const RBI_DOCS_BY_PURPOSE: Record<string, RbiDocRequirement[]> = {
  EDUCATION: [
    { id: 'pan_card', name: 'Pan Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '💳', required: true },
    { id: 'passport_front', name: "Student's passport (front page)", accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'passport_back', name: "Student's passport (back page)", accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'admission_letter', name: 'I-20 / Admission Letter From University', accept: '.pdf,.jpg,.jpeg,.png', icon: '📜', required: true },
    { id: 'air_ticket', name: 'One Way Air Ticket', accept: '.pdf,.jpg,.jpeg,.png', icon: '✈️', required: true },
    { id: 'student_visa', name: 'Valid Student Visa', accept: '.pdf,.jpg,.jpeg,.png', icon: '🎓', required: false },
  ],
  TOURISM: [
    { id: 'pan_card', name: 'Pan Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '💳', required: true },
    { id: 'passport_front', name: 'Passport (front page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'passport_back', name: 'Passport (back page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'air_ticket', name: 'Confirmed Air Ticket', accept: '.pdf,.jpg,.jpeg,.png', icon: '✈️', required: true },
    { id: 'tourist_visa', name: 'Valid Tourist Visa Copy', accept: '.pdf,.jpg,.jpeg,.png', icon: '🌴', required: false },
  ],
  BUSINESS: [
    { id: 'pan_card', name: 'Pan Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '💳', required: true },
    { id: 'passport_front', name: 'Passport (front page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'passport_back', name: 'Passport (back page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'invitation_letter', name: 'Business Invitation Letter / Conference Pass', accept: '.pdf,.jpg,.jpeg,.png', icon: '🏢', required: true },
    { id: 'business_visa', name: 'Valid Business Visa', accept: '.pdf,.jpg,.jpeg,.png', icon: '💼', required: true },
  ],
  MEDICAL: [
    { id: 'pan_card', name: 'Pan Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '💳', required: true },
    { id: 'passport_front', name: "Patient's Passport (front page)", accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'passport_back', name: "Patient's Passport (back page)", accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'hospital_letter', name: 'Hospital Appointment / Doctor Letter', accept: '.pdf,.jpg,.jpeg,.png', icon: '🏥', required: true },
  ],
  EMPLOYMENT: [
    { id: 'pan_card', name: 'Pan Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '💳', required: true },
    { id: 'passport_front', name: 'Passport (front page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'passport_back', name: 'Passport (back page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'employment_letter', name: 'Employment Offer Letter / Work Contract', accept: '.pdf,.jpg,.jpeg,.png', icon: '🏢', required: true },
  ],
  EMIGRATION: [
    { id: 'pan_card', name: 'Pan Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '💳', required: true },
    { id: 'passport_front', name: 'Passport (front page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'passport_back', name: 'Passport (back page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'emigration_visa', name: 'Permanent Residency / Emigration Visa Copy', accept: '.pdf,.jpg,.jpeg,.png', icon: '🌐', required: true },
  ],
  PERSONAL: [
    { id: 'pan_card', name: 'Pan Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '💳', required: true },
    { id: 'passport_front', name: 'Passport (front page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'passport_back', name: 'Passport (back page)', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛂', required: true },
    { id: 'air_ticket', name: 'Confirmed Air Ticket Copy', accept: '.pdf,.jpg,.jpeg,.png', icon: '✈️', required: true },
  ]
};

const ALL_COUNTRIES_LIST = [
  'United States of America (USA)', 'United Kingdom (UK)', 'United Arab Emirates (UAE)',
  'Europe (Schengen Area)', 'Canada', 'Australia', 'Singapore', 'Thailand',
  'Japan', 'Switzerland', 'New Zealand', 'Saudi Arabia', 'Qatar', 'Hong Kong',
  'Malaysia', 'Vietnam', 'Indonesia', 'South Korea', 'Turkey', 'Oman',
  'Bahrain', 'Kuwait', 'Mauritius', 'Maldives', 'Sri Lanka', 'Egypt',
  'South Africa', 'Georgia', 'Azerbaijan', 'Nepal'
];

export function MultiCountrySelect({ 
  selectedCountries, 
  onChange 
}: { 
  selectedCountries: string[]; 
  onChange: (countries: string[]) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = ALL_COUNTRIES_LIST.filter(c => 
    c.toLowerCase().includes(search.toLowerCase()) && !selectedCountries.includes(c)
  );

  const addCountry = (country: string) => {
    onChange([...selectedCountries, country]);
    setSearch('');
    setIsOpen(false);
  };

  const removeCountry = (country: string) => {
    onChange(selectedCountries.filter(c => c !== country));
  };

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[42px] px-3 py-1.5 border border-slate-300 rounded-xl bg-white flex flex-wrap items-center gap-1.5 cursor-pointer shadow-2xs focus-within:border-amber-500"
      >
        {selectedCountries.map((c) => (
          <span 
            key={c}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeCountry(c);
              }}
              className="text-red-500 hover:text-red-700 font-bold text-xs"
              title="Remove country"
            >
              ✕
            </button>
            <span>{c}</span>
          </span>
        ))}

        <input
          type="text"
          placeholder={selectedCountries.length === 0 ? "Select Countries..." : "Search countries..."}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[120px] outline-none text-xs font-bold text-slate-900 bg-transparent py-1"
        />

        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto scrollbar-thin p-1 space-y-0.5 animate-in fade-in duration-150">
            {filtered.length > 0 ? (
              filtered.map((country) => (
                <div
                  key={country}
                  onClick={() => addCountry(country)}
                  className="px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-900 cursor-pointer rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>{country}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 font-medium text-center">
                No matching countries found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function validateIndianPan(panStr: string): { isValid: boolean; message: string } {
  const cleanPan = panStr.trim().toUpperCase();
  if (!cleanPan) {
    return { isValid: false, message: 'PAN number is required' };
  }
  if (cleanPan.length < 10) {
    return { isValid: false, message: 'PAN must be exactly 10 characters long' };
  }
  
  const panRegex = /^[A-Z]{3}[ABCFGHLJPT][A-Z]{1}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleanPan)) {
    return { isValid: false, message: 'Invalid PAN format. Example: ABCDE1234F' };
  }

  const letters = cleanPan.slice(0, 5);
  const digits = cleanPan.slice(5, 9);
  if (/^(.)\1{4}$/.test(letters)) {
    return { isValid: false, message: 'Repetitive letter patterns (e.g. AAAAA) are invalid' };
  }
  if (/^(.)\1{3}$/.test(digits)) {
    return { isValid: false, message: 'Repetitive digit patterns (e.g. 0000) are invalid' };
  }

  return { isValid: true, message: 'Valid Indian PAN card' };
}

export function BookMyForexCheckoutEngine() {
  const { sessionId, draftState, updateDraft, clearSession } = useTransactionStore();
  const { user } = useAuth();
  const currentStep = draftState.checkoutStep || 2; // Default to step 2 when continuing from step 1

  // Product Detection
  const product = draftState.product || 'CASH';
  const isSell = product === 'CASH_SELL';
  const isRemittance = product === 'REMITTANCE';
  const isCard = product === 'CARD';
  const isCash = product === 'CASH';

  // Customer Details State - Only prefill if user is logged in or already entered in draftState
  const [travellerName, setTravellerName] = useState(draftState.travellerName || user?.fullName || '');
  const [phone, setPhone] = useState(draftState.phone || user?.phone || '');
  const [email, setEmail] = useState(draftState.email || user?.email || '');
  const [pan, setPan] = useState(draftState.pan || '');
  const [panTouched, setPanTouched] = useState(false);
  const [panValidation, setPanValidation] = useState<{ isValid: boolean; message: string }>({ isValid: false, message: '' });
  
  // Travel Specific State
  const [destinationCountries, setDestinationCountries] = useState<string[]>(() => {
    if (Array.isArray(draftState.destinations) && draftState.destinations.length > 0) {
      return draftState.destinations;
    }
    const initDest = draftState.destination || 'United States of America (USA)';
    if (initDest.includes('(')) return [initDest];
    if (initDest === 'USA') return ['United States of America (USA)'];
    if (initDest === 'UAE') return ['United Arab Emirates (UAE)'];
    if (initDest === 'UK') return ['United Kingdom (UK)'];
    if (initDest === 'Europe') return ['Europe (Schengen Area)'];
    return [initDest];
  });
  const [startDate, setStartDate] = useState(draftState.departureDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(draftState.returnDate || '');
  const [noReturnDate, setNoReturnDate] = useState(draftState.noReturnDate || false);
  const [travelPurpose, setTravelPurpose] = useState(draftState.purpose || 'EDUCATION');

  // Sell Specific State (Bank details for instant INR payout)
  const [payoutBank, setPayoutBank] = useState(draftState.payoutBank || '');
  const [payoutAccountHolder, setPayoutAccountHolder] = useState(draftState.payoutAccountHolder || user?.fullName || '');
  const [payoutAccountNo, setPayoutAccountNo] = useState(draftState.payoutAccountNo || '');
  const [payoutConfirmAccountNo, setPayoutConfirmAccountNo] = useState(draftState.payoutConfirmAccountNo || '');
  const [payoutIfsc, setPayoutIfsc] = useState(draftState.payoutIfsc || '');
  const [payoutAccountType, setPayoutAccountType] = useState<'SAVINGS' | 'CURRENT'>(draftState.payoutAccountType || 'SAVINGS');
  const [sourceOfForex, setSourceOfForex] = useState(draftState.sourceOfForex || 'Returned from Overseas Travel');

  // Remittance Specific State (Overseas Beneficiary & Remitter Status)
  const [remitterResidentStatus, setRemitterResidentStatus] = useState(draftState.remitterResidentStatus || 'RESIDENT_INDIAN');
  const [benName, setBenName] = useState(draftState.beneficiaryName || '');
  const [benCountry, setBenCountry] = useState(draftState.beneficiaryCountry || '');
  const [benBank, setBenBank] = useState(draftState.beneficiaryBank || '');
  const [benAccount, setBenAccount] = useState(draftState.beneficiaryAccount || '');
  const [benSwift, setBenSwift] = useState(draftState.beneficiarySwift || '');
  const [benAddress, setBenAddress] = useState(draftState.beneficiaryAddress || '');
  const [benRelationship, setBenRelationship] = useState(draftState.beneficiaryRelationship || 'University / College');
  const [remittanceLrsConfirmed, setRemittanceLrsConfirmed] = useState(false);

  // Sync user profile if user loads after mount
  useEffect(() => {
    if (user) {
      if (!travellerName && user.fullName) setTravellerName(user.fullName);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);
      if (!payoutAccountHolder && user.fullName) setPayoutAccountHolder(user.fullName);
      if (!coordPhone && user.phone) setCoordPhone(user.phone);
    }
  }, [user]);

  // Document Uploads State for Step 3
  const IDENTITY_DOC_IDS = ['pan_card', 'passport_front', 'passport_back'];
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: number }>>(draftState.uploadedDocs || {});
  const [isIndianNational, setIsIndianNational] = useState<boolean>(true);
  const [noVisaRequired, setNoVisaRequired] = useState<boolean>(false);
  const [confirmDocPossession, setConfirmDocPossession] = useState<boolean>(false);

  // Step 4 Handover & Logistics State
  const effectiveDeliveryMethod = draftState.deliveryMethod || 'PICKUP';
  const isBranchPickup = ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'].includes(effectiveDeliveryMethod);
  const [coordPhone, setCoordPhone] = useState(draftState.phone || user?.phone || '');
  const [streetAddress, setStreetAddress] = useState(draftState.deliveryAddress || '');
  const [deliveryCity, setDeliveryCity] = useState(draftState.city || 'Delhi');
  const [deliveryState, setDeliveryState] = useState(draftState.state || 'Delhi');
  const [pincode, setPincode] = useState(draftState.pincode || '');
  const [landmark, setLandmark] = useState(draftState.landmark || '');
  const [confirmPresence, setConfirmPresence] = useState(false);

  // Branch Pickup / Visit state
  const [pickupDate, setPickupDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('10:00 AM - 1:00 PM');
  const [pickupBranch, setPickupBranch] = useState<string>(draftState.deliveryBranch || 'Delhi Connaught Place Vault Branch');
  const [selectedBranchObj, setSelectedBranchObj] = useState<any>(null);

  useEffect(() => {
    getActiveBranches()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const found = data.find((b: any) => b.id === draftState.branchId) || 
                        data.find((b: any) => (b.branchCity || '').toLowerCase() === (draftState.city || '').toLowerCase()) ||
                        data[0];
          if (found) {
            setSelectedBranchObj(found);
            setPickupBranch(`${found.branchName} (${found.branchCity}) - ${found.branchAddress}`);
          }
        }
      })
      .catch(() => {});
  }, [draftState.branchId, draftState.city]);


  // Step 5 Review State
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('UPI');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(
    draftState.appliedDiscount || draftState.appliedOffer?.discountAmount || 0
  );
  const [addSimCard, setAddSimCard] = useState<boolean>(false);
  const [rateTimerSeconds, setRateTimerSeconds] = useState<number>(300);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string>(draftState.bookingRef || '');

  // Rate Timer countdown
  useEffect(() => {
    if (currentStep === 5 && !isOrderConfirmed && rateTimerSeconds > 0) {
      const timer = setInterval(() => {
        setRateTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, isOrderConfirmed, rateTimerSeconds]);

  const formatTimerMinSec = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      alert("Please enter a discount code.");
      return;
    }
    if (couponCode.trim().toUpperCase() === 'BMF500' || couponCode.trim().toUpperCase() === 'FIRSTFOREX') {
      setAppliedDiscount(500);
      alert("🎉 Coupon Applied! ₹500 Discount added to your order.");
    } else {
      alert("⚠️ Invalid Coupon Code. Try using 'BMF500'");
    }
  };

  // Load user profile & saved KYC docs
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name && !draftState.travellerName) {
          setTravellerName(u.name);
          setPayoutAccountHolder(u.name);
        }
        if (u.phone && !draftState.phone) setPhone(u.phone);
        if (u.email && !draftState.email) setEmail(u.email);
        if (u.pan && !draftState.pan) setPan(u.pan);
      }

      const savedKycStr = localStorage.getItem('user_saved_kyc');
      if (savedKycStr) {
        const savedKyc = JSON.parse(savedKycStr);
        setUploadedDocs(prev => ({ ...savedKyc, ...prev }));
      }
    } catch (_) {}
  }, []);

  const handleFileUpload = (docId: string, file: File | null) => {
    if (!file) return;
    const docData = { name: file.name, size: file.size };
    const updated = { ...uploadedDocs, [docId]: docData };
    setUploadedDocs(updated);
    updateDraft({ uploadedDocs: updated });

    if (IDENTITY_DOC_IDS.includes(docId)) {
      try {
        const savedKycStr = localStorage.getItem('user_saved_kyc') || '{}';
        const savedKyc = JSON.parse(savedKycStr);
        savedKyc[docId] = docData;
        localStorage.setItem('user_saved_kyc', JSON.stringify(savedKyc));
      } catch (_) {}
    }
  };

  const handleRemoveFile = (docId: string) => {
    const updated = { ...uploadedDocs };
    delete updated[docId];
    setUploadedDocs(updated);
    updateDraft({ uploadedDocs: updated });

    if (IDENTITY_DOC_IDS.includes(docId)) {
      try {
        const savedKycStr = localStorage.getItem('user_saved_kyc') || '{}';
        const savedKyc = JSON.parse(savedKycStr);
        delete savedKyc[docId];
        localStorage.setItem('user_saved_kyc', JSON.stringify(savedKyc));
      } catch (_) {}
    }
  };

  // Rates & Math calculations
  const { data: rates } = useRates();

  const getEffectiveRateForCurrency = (currCode: string): number => {
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
    if (isSell) return Math.max(0.01, Math.round((bRate - 0.63) * 100) / 100);
    if (isCash) return Math.round((bRate + 0.63) * 100) / 100;
    if (isRemittance) return Math.round((bRate + 0.10) * 100) / 100;
    return Math.round(bRate * 100) / 100;
  };

  const primaryCurrency = draftState.currency || 'USD';
  const primaryAmount = parseFloat(draftState.amount || '1000') || 0;
  const primaryRate = getEffectiveRateForCurrency(primaryCurrency);
  const primaryInr = primaryAmount * primaryRate;

  const extraCurrenciesList: { currency: string; amount: string }[] = Array.isArray(draftState.extraCurrencies) ? draftState.extraCurrencies : [];

  const extraCurrenciesCalculated = extraCurrenciesList.map((item) => {
    const itemRate = getEffectiveRateForCurrency(item.currency);
    const itemAmt = parseFloat(item.amount) || 0;
    const itemInr = itemAmt * itemRate;
    return {
      currency: item.currency,
      amount: itemAmt,
      rate: itemRate,
      inrValue: itemInr
    };
  });

  const totalCurrencyInr = primaryInr + extraCurrenciesCalculated.reduce((acc, c) => acc + c.inrValue, 0);
  
  // Fee & Tax rules per product
  const serviceCharge = isSell ? 0 : isRemittance ? 0 : 150;
  const deliveryCharge = (!isBranchPickup && !isRemittance && !isSell) ? 150 : 0;
  const gst = isSell ? 0 : calculateForexGst(totalCurrencyInr);
  const discountVal = draftState.appliedOffer?.discountAmount || appliedDiscount || 0;
  const simCharge = (addSimCard && !isSell) ? 235 : 0;
  
  // Total to pay / receive
  const finalTotalPayable = isSell 
    ? 0 
    : Math.max(0, totalCurrencyInr + serviceCharge + deliveryCharge + gst + simCharge - discountVal);
  const netInrPayout = Math.round(totalCurrencyInr);

  // Sync state changes
  const syncCustomerDetails = () => {
    updateDraft({
      travellerName,
      phone,
      email,
      pan,
      remitterResidentStatus,
      destinations: destinationCountries,
      destination: destinationCountries.join(', '),
      departureDate: startDate,
      returnDate: endDate,
      noReturnDate,
      purpose: travelPurpose,
      payoutBank,
      payoutAccountHolder,
      payoutAccountNo,
      payoutIfsc,
      payoutAccountType,
      sourceOfForex,
      beneficiaryName: benName,
      beneficiaryCountry: benCountry,
      beneficiaryBank: benBank,
      beneficiaryAccount: benAccount,
      beneficiarySwift: benSwift,
      beneficiaryAddress: benAddress,
      beneficiaryRelationship: benRelationship,
    });
  };

  // Step Continues
  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travellerName.trim()) {
      alert("Please enter Name.");
      return;
    }
    if (!phone.trim()) {
      alert("Please enter Phone number.");
      return;
    }
    if (!email.trim()) {
      alert("Please enter Email address.");
      return;
    }
    if (!pan.trim()) {
      alert("Please enter PAN number.");
      return;
    }
    const panCheck = validateIndianPan(pan);
    if (!panCheck.isValid) {
      alert(`Invalid PAN: ${panCheck.message}`);
      return;
    }
    if (!isSell && !isRemittance && destinationCountries.length === 0) {
      alert("Please select at least one Destination Country.");
      return;
    }
    syncCustomerDetails();
    updateDraft({ checkoutStep: 3 });
  };

  const handleStep3Continue = () => {
    if (isSell) {
      if (!payoutAccountNo.trim()) {
        alert("Please enter Bank Account Number for INR payout.");
        return;
      }
      if (payoutAccountNo !== payoutConfirmAccountNo) {
        alert("Account Numbers do not match! Please check again.");
        return;
      }
      if (!payoutIfsc.trim() || payoutIfsc.length !== 11) {
        alert("Please enter valid 11-digit IFSC code (e.g. HDFC0001234).");
        return;
      }
    } else if (isRemittance) {
      if (!benName.trim() || !benBank.trim() || !benAccount.trim() || !benSwift.trim()) {
        alert("Please complete all overseas beneficiary and bank wire details.");
        return;
      }
    } else {
      if (showDocsSection && !confirmDocPossession) {
        alert("Please confirm that you possess valid documents under RBI guidelines.");
        return;
      }
    }
    syncCustomerDetails();
    updateDraft({ checkoutStep: 4 });
  };

  const showDocsSection = travelPurpose !== 'EDUCATION' || isIndianNational;

  const handleStep4Continue = async () => {
    if (isRemittance) {
      if (!remittanceLrsConfirmed) {
        alert("Please agree to the RBI Liberalised Remittance Scheme (LRS) A2 declaration.");
        return;
      }
    } else {
      if (!coordPhone.trim()) {
        alert("Please enter Phone Number.");
        return;
      }
      if (isBranchPickup) {
        if (!pickupDate) {
          alert("Please select a Preferred Date.");
          return;
        }
        if (!confirmPresence) {
          alert(isSell 
            ? "Please confirm that you will visit the branch personally with cash notes & PAN card." 
            : "Please confirm that the traveller will visit the branch personally with original ID."
          );
          return;
        }
      } else {
        if (!streetAddress.trim()) {
          alert("Please enter Street Address.");
          return;
        }
        if (!pincode.trim()) {
          alert("Please enter Pin Code.");
          return;
        }
        if (!confirmPresence) {
          alert(isSell
            ? "Please confirm you will be present to hand over currency notes to our verified executive."
            : "Please confirm you will be present yourself to collect the order."
          );
          return;
        }
      }
    }

    const prefix = isSell ? 'FXM-SELL' : isRemittance ? 'FXM-WIRE' : isCard ? 'FXM-CARD' : 'FXM-BUY';
    const generatedRef = bookingRef || `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(generatedRef);
    
    updateDraft({ 
      checkoutStep: 5, 
      deliveryAddress: isBranchPickup 
        ? `Branch: ${pickupBranch} (Date: ${pickupDate}, Slot: ${pickupTimeSlot})`
        : `${streetAddress}, ${landmark ? landmark + ', ' : ''}${deliveryCity}, ${deliveryState} - ${pincode}`,
      pincode: isBranchPickup ? '110001' : pincode,
      landmark: isBranchPickup ? '' : landmark,
      city: deliveryCity,
      state: deliveryState,
      bookingRef: generatedRef,
    });
  };

  const handleFinalPlaceOrder = async () => {
    const prefix = isSell ? 'ORD-SELL' : isRemittance ? 'ORD-WIRE' : isCard ? 'ORD-CARD' : 'ORD';
    const generatedRef = bookingRef || `${prefix}-${Date.now()}`;
    setBookingRef(generatedRef);

    // Call backend direct checkout API to create real Prisma Order in PostgreSQL database
    try {
      const allItemsPayload = [
        {
          currency: primaryCurrency,
          amount: primaryAmount,
          rate: primaryRate,
          inrValue: Math.round(primaryInr),
          productName: isSell 
            ? `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Currency Notes Sell` 
            : isRemittance
              ? `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Wire Remittance`
              : isCard
                ? `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Forex Card Load`
                : `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Currency Notes`
        },
        ...extraCurrenciesCalculated.map(c => ({
          currency: c.currency,
          amount: c.amount,
          rate: c.rate,
          inrValue: Math.round(c.inrValue),
          productName: `${c.amount.toLocaleString('en-IN')} ${c.currency} ${isSell ? 'Sell' : 'Load'}`
        }))
      ];

      await fetch(`${API_URL}/orders/direct-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify({
          orderNumber: generatedRef,
          travellerName: travellerName || user?.fullName || 'Customer',
          phone: phone || user?.phone || '9876543210',
          email: email || user?.email || 'customer@forexmate.in',
          pan: pan || user?.pan || '',
          product: product,
          deliveryMethod: isRemittance ? 'WIRE_TRANSFER' : isBranchPickup ? 'BRANCH_PICKUP' : 'HOME_DELIVERY',
          branchId: draftState.branchId || undefined,
          deliveryAddress: isBranchPickup ? `Branch: ${pickupBranch}` : `${streetAddress}, ${landmark ? landmark + ', ' : ''}${deliveryCity}, ${deliveryState} - ${pincode}`,
          city: deliveryCity,
          state: deliveryState,
          pincode: isBranchPickup ? '110001' : pincode,
          landmark: isBranchPickup ? '' : landmark,
          departureDate: startDate || undefined,
          returnDate: endDate || undefined,
          purpose: travelPurpose,
          destination: destinationCountries.join(', '),
          paymentOption: isSell ? 'PAYOUT_TO_BANK' : selectedPaymentMode,
          totalAmountInr: isSell ? netInrPayout : Math.round(finalTotalPayable),
          items: allItemsPayload,
          payoutBank,
          payoutAccountNo,
          payoutIfsc,
          payoutAccountHolder,
          beneficiaryName: benName,
          beneficiaryCountry: benCountry,
          beneficiaryBank: benBank,
          beneficiaryAccount: benAccount,
          beneficiarySwift: benSwift,
          beneficiaryRelationship: benRelationship
        })
      });
    } catch (err) {
      console.warn('Direct checkout API sync notice:', err);
    }

    // Also call backend transaction-engine if sessionId exists
    if (sessionId) {
      try {
        await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idempotencyKey: `checkout_${generatedRef}` })
        });
      } catch (err) {
        console.warn('Backend session checkout notice:', err);
      }
    }

    // Save order locally for instant dashboard fidelity
    try {
      const allOrderItems = [
        {
          product: { 
            name: isSell 
              ? `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Currency Notes Sell` 
              : isRemittance
                ? `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Wire Remittance`
                : isCard
                  ? `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Forex Card Load`
                  : `${primaryAmount.toLocaleString('en-IN')} ${primaryCurrency} Currency Notes`
          },
          amount: primaryAmount,
          currency: { code: primaryCurrency },
          rate: primaryRate,
          inrEquivalent: Math.round(primaryInr)
        },
        ...extraCurrenciesCalculated.map(c => ({
          product: { name: `${c.amount.toLocaleString('en-IN')} ${c.currency} ${isSell ? 'Sell' : 'Load'}` },
          amount: c.amount,
          currency: { code: c.currency },
          rate: c.rate,
          inrEquivalent: Math.round(c.inrValue)
        }))
      ];

      const newOrder = {
        id: `ord_${generatedRef.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        orderNumber: generatedRef,
        createdAt: new Date().toISOString(),
        items: allOrderItems,
        totalAmountInr: isSell ? netInrPayout : Math.round(finalTotalPayable),
        status: isSell ? 'READY_FOR_CASH_HANDOVER' : isRemittance ? 'WAITING_WIRE_SETTLEMENT' : isBranchPickup ? 'READY_FOR_PICKUP' : 'PAYMENT_PENDING',
        deliveryMethod: isRemittance ? 'WIRE_TRANSFER' : isBranchPickup ? 'BRANCH_PICKUP' : 'HOME_DELIVERY',
        branchName: pickupBranch || 'Connaught Place Vault Branch, Delhi',
        travellerName,
        phone,
        email,
        userId: user?.id,
        userEmail: user?.email || email,
        customerEmail: email,
        mobile: phone,
        paymentOption: isSell ? 'PAYOUT_TO_BANK' : selectedPaymentMode,
        product
      };

      const existingOrders = JSON.parse(localStorage.getItem('local_user_orders') || '[]');
      localStorage.setItem('local_user_orders', JSON.stringify([newOrder, ...existingOrders.filter((o: any) => o.orderNumber !== generatedRef)]));
    } catch (e) {
      console.error(e);
    }

    setIsOrderConfirmed(true);
    updateDraft({
      checkoutStep: 5,
      paymentOption: isSell ? 'PAYOUT_TO_BANK' : selectedPaymentMode,
      bookingRef: generatedRef,
      status: 'CONVERTED'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-3 sm:px-6 space-y-4">
      
      {/* --- SECTION 1: ORDER DETAILS SUMMARY HEADER --- */}
      <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm ${currentStep === 1 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-emerald-200 bg-emerald-50/20'}`}>
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  1 &nbsp;{isSell ? 'Sell Order Details' : isRemittance ? 'Remittance Wire Details' : isCard ? 'Forex Card Config' : 'Order Details'}
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">Completed</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5 flex flex-wrap items-center gap-1">
                <span><strong>{primaryAmount.toLocaleString('en-IN')} {primaryCurrency}</strong> @ ₹{primaryRate.toFixed(2)}</span>
                {extraCurrenciesCalculated.map((c, i) => (
                  <span key={i}> + <strong>{c.amount.toLocaleString('en-IN')} {c.currency}</strong> @ ₹{c.rate.toFixed(2)}</span>
                ))}
                <span>• {isSell ? 'Payout to Receive:' : 'Total Payable:'} <strong className="text-slate-900">₹{(isSell ? netInrPayout : Math.round(finalTotalPayable)).toLocaleString('en-IN')}</strong> • City: {draftState.city || 'Delhi'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateDraft({ checkoutStep: 1 })}
            className="flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* --- SECTION 2: CUSTOMER / SELLER / REMITTER DETAILS --- */}
      <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${currentStep === 2 ? 'border-amber-400 ring-2 ring-amber-400/20' : currentStep > 2 ? 'border-emerald-200' : 'border-slate-200 opacity-60'}`}>
        
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep > 2 ? 'bg-emerald-100 text-emerald-700' : currentStep === 2 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-500'}`}>
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {isSell ? 'Seller Details' : isRemittance ? 'Remitter (Sender in India) Details' : isCard ? 'Cardholder Details' : 'Customer Details'}
              </h3>
              {currentStep > 2 && (
                <p className="text-xs text-slate-600 font-bold mt-0.5 flex items-center gap-2">
                  <span>👤 {travellerName}</span>
                  <span>•</span>
                  <span>📱 {phone}</span>
                </p>
              )}
            </div>
          </div>

          {currentStep > 2 && (
            <button
              type="button"
              onClick={() => updateDraft({ checkoutStep: 2 })}
              className="flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {currentStep === 2 && (
          <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
            
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-900 font-medium leading-relaxed shadow-2xs">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p>
                {isSell 
                  ? "As per RBI FEMA regulations, foreign currency sell requires verified PAN & bank details of the currency seller for instant INR credit."
                  : isRemittance
                    ? "Remittance requires verified Indian PAN & resident status under RBI Liberalised Remittance Scheme ($250,000 USD Annual Allowance)."
                    : "The details provided below must be that of the person purchasing foreign currency and travelling abroad. Payment must be made from their account."}
              </p>
            </div>

            <form onSubmit={handleStep2Continue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isSell ? 'Seller Full Name' : isRemittance ? 'Remitter (Sender) Name' : isCard ? 'Cardholder Full Name' : "Traveller's Name"} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Full name as on PAN"
                      value={travellerName}
                      onChange={(e) => {
                        setTravellerName(e.target.value);
                        if (isSell) setPayoutAccountHolder(e.target.value);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

              </div>

              <div className={`grid grid-cols-1 ${isRemittance || isSell ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 pt-2`}>
                
                {/* PAN Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${panTouched && panValidation.isValid ? 'text-emerald-500' : panTouched && !panValidation.isValid ? 'text-red-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="e.g. ABCDE1234F"
                      value={pan}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        setPan(val);
                        const res = validateIndianPan(val);
                        setPanValidation(res);
                        if (val.length === 10) setPanTouched(true);
                      }}
                      onBlur={() => {
                        setPanTouched(true);
                        setPanValidation(validateIndianPan(pan));
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs font-extrabold uppercase tracking-wider outline-none bg-white shadow-2xs transition-all placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 ${
                        panTouched && panValidation.isValid
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900'
                          : panTouched && !panValidation.isValid
                          ? 'border-red-500 ring-2 ring-red-500/20 text-slate-900'
                          : 'border-slate-300 focus:border-amber-500 text-slate-900'
                      }`}
                    />
                  </div>
                  {panTouched && (
                    <div className="mt-1">
                      {panValidation.isValid ? (
                        <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                          ✓ {panValidation.message}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                          ⚠️ {panValidation.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Conditional Fields: Sell Forex Source vs Buy/Card Travel Countries vs Remitter Resident Status */}
                {isSell ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Source of Foreign Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sourceOfForex}
                      onChange={(e) => setSourceOfForex(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs cursor-pointer"
                    >
                      <option value="Returned from Overseas Travel">Returned from Overseas Travel</option>
                      <option value="Salary Earned Abroad">Salary Earned Abroad</option>
                      <option value="Gift from Relative">Gift from Relative</option>
                      <option value="Business Income">Business / Freelance Income</option>
                      <option value="Personal Savings">Personal Unspent Savings</option>
                    </select>
                  </div>
                ) : isRemittance ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Remitter Resident Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={remitterResidentStatus}
                      onChange={(e) => {
                        setRemitterResidentStatus(e.target.value);
                        updateDraft({ remitterResidentStatus: e.target.value });
                      }}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:bg-white outline-none bg-white shadow-2xs cursor-pointer transition-colors"
                    >
                      <option value="RESIDENT_INDIAN">Resident Indian Individual (LRS Eligible)</option>
                      <option value="NRI_NRE_NRO">Non-Resident Indian (NRI / NRE / NRO)</option>
                      <option value="FOREIGN_NATIONAL">Foreign National Resident in India</option>
                      <option value="CORPORATE_ENTITY">Corporate / Business Entity</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Destination Countries <span className="text-red-500">*</span>
                      </label>
                      <MultiCountrySelect
                        selectedCountries={destinationCountries}
                        onChange={setDestinationCountries}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Travel Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Action Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="btn-gold px-8 py-3 rounded-xl font-extrabold text-sm text-slate-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span>Continue to Step 3</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>
        )}
      </div>

      {/* --- SECTION 3: PRODUCT-SPECIFIC STEP (BANK PAYOUT / BENEFICIARY / KYC) --- */}
      <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${currentStep === 3 ? 'border-amber-400 ring-2 ring-amber-400/20' : currentStep > 3 ? 'border-emerald-200' : 'border-slate-200 opacity-60'}`}>
        
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep > 3 ? 'bg-emerald-100 text-emerald-700' : currentStep === 3 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-500'}`}>
              {currentStep > 3 ? '✓' : '3'}
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {isSell 
                ? 'Bank Account for INR Payout' 
                : isRemittance 
                  ? 'Overseas Beneficiary & Bank Details' 
                  : 'Statutory Eligibility & KYC'}
            </h3>
          </div>

          {currentStep > 3 && (
            <button
              type="button"
              onClick={() => updateDraft({ checkoutStep: 3 })}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {currentStep === 3 && (
          <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
            
            {/* SELL FOREX: BANK ACCOUNT FOR INR PAYOUT */}
            {isSell ? (
              <div className="space-y-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-950 font-medium shadow-2xs">
                  <Landmark className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Instant INR Bank Payout:</strong> Enter your Indian bank account details below. Upon currency note verification at branch or doorstep, your funds will be instantly credited via NEFT/IMPS.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-2xl p-5 space-y-4 bg-white shadow-2xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Bank Name */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        BANK NAME <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={payoutBank}
                        onChange={(e) => setPayoutBank(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs cursor-pointer"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                        <option value="Bank of Baroda">Bank of Baroda</option>
                        <option value="IndusInd Bank">IndusInd Bank</option>
                      </select>
                    </div>

                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        ACCOUNT HOLDER NAME (AS PER PAN) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={payoutAccountHolder}
                        onChange={(e) => setPayoutAccountHolder(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                      />
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        ACCOUNT NUMBER <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Enter Account Number"
                        value={payoutAccountNo}
                        onChange={(e) => setPayoutAccountNo(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs font-mono"
                      />
                    </div>

                    {/* Re-enter Account Number */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        RE-ENTER ACCOUNT NUMBER <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Re-enter Account Number to Confirm"
                        value={payoutConfirmAccountNo}
                        onChange={(e) => setPayoutConfirmAccountNo(e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs font-mono ${
                          payoutConfirmAccountNo && payoutAccountNo !== payoutConfirmAccountNo ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                        }`}
                      />
                    </div>

                    {/* IFSC Code */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        IFSC CODE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        placeholder="e.g. HDFC0001234"
                        value={payoutIfsc}
                        onChange={(e) => setPayoutIfsc(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-extrabold uppercase tracking-wider text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs font-mono"
                      />
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        ACCOUNT TYPE
                      </label>
                      <div className="flex gap-4 pt-1.5 text-xs font-bold">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="payoutAccType"
                            checked={payoutAccountType === 'SAVINGS'}
                            onChange={() => setPayoutAccountType('SAVINGS')}
                            className="text-amber-500"
                          />
                          <span>Savings Account</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="payoutAccType"
                            checked={payoutAccountType === 'CURRENT'}
                            onChange={() => setPayoutAccountType('CURRENT')}
                            className="text-amber-500"
                          />
                          <span>Current Account</span>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : isRemittance ? (
              /* REMITTANCE: OVERSEAS BENEFICIARY DETAILS */
              <div className="space-y-5">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-indigo-950 font-medium shadow-2xs">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Direct Bank Wire:</strong> Funds are transferred directly from RBI Authorised Dealer Escrow to the foreign university or recipient bank account with SWIFT MT103 tracking.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-2xl p-5 space-y-4 bg-white shadow-2xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Beneficiary Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                          RECIPIENT NAME <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {benName.length}/15 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        value={benName}
                        onChange={(e) => setBenName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                      />
                    </div>

                    {/* Beneficiary Country */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        DESTINATION COUNTRY <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={benCountry}
                        onChange={(e) => setBenCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs cursor-pointer"
                      >
                        {ALL_COUNTRIES_LIST.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Beneficiary Bank Name */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        OVERSEAS BANK NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={benBank}
                        onChange={(e) => setBenBank(e.target.value)}
                        placeholder="e.g. Bank of America, Barclays, UBS"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                      />
                    </div>

                    {/* IBAN / Account Number */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        IBAN / ACCOUNT NUMBER <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={benAccount}
                        onChange={(e) => setBenAccount(e.target.value.replace(/[^A-Z0-9]/gi, ''))}
                        placeholder="e.g. GB29NWBK60161331926819 or 004589214785"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs font-mono"
                      />
                    </div>

                    {/* SWIFT / BIC Code */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        SWIFT / BIC CODE (8 OR 11 CHARS) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={benSwift}
                        onChange={(e) => setBenSwift(e.target.value.toUpperCase())}
                        placeholder="e.g. BOFAUS3N"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs font-mono uppercase"
                      />
                    </div>

                    {/* Relationship with Remitter */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        RELATIONSHIP WITH SENDER <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={benRelationship}
                        onChange={(e) => setBenRelationship(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs cursor-pointer"
                      >
                        <option value="University / College">University / College (Tuition Fee)</option>
                        <option value="Self (Own Overseas Account)">Self (Own Overseas Account)</option>
                        <option value="Child / Dependent">Child / Dependent Student</option>
                        <option value="Parent / Relative">Parent / Close Relative</option>
                        <option value="Hospital / Medical Institution">Hospital / Medical Clinic</option>
                        <option value="Other Vendor">Vendor / Service Provider</option>
                      </select>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* BUY CASH & FOREX CARD: STATUTORY ELIGIBILITY & KYC */
              <div className="space-y-5">
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-950 font-medium leading-relaxed shadow-2xs">
                  <Edit3 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p>
                    Please verify your statutory eligibility and upload required identity documents under RBI Liberalised Remittance Scheme guidelines.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                      PURPOSE OF TRAVEL <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={travelPurpose}
                      onChange={(e) => setTravelPurpose(e.target.value)}
                      className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs cursor-pointer"
                    >
                      <option value="EDUCATION">Education / Overseas Studies</option>
                      <option value="TOURISM">Leisure / Holiday / Tourism</option>
                      <option value="BUSINESS">Business Travel / Conference</option>
                      <option value="MEDICAL">Medical Treatment</option>
                      <option value="EMPLOYMENT">Employment Abroad</option>
                      <option value="EMIGRATION">Emigration / PR</option>
                      <option value="PERSONAL">Personal Visit</option>
                    </select>
                  </div>

                  {/* Document Uploads Grid */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                      STATUTORY KYC DOCUMENTS (RBI LRS)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(RBI_DOCS_BY_PURPOSE[travelPurpose] || RBI_DOCS_BY_PURPOSE.TOURISM).map((doc) => {
                        const isUploaded = !!uploadedDocs[doc.id];
                        return (
                          <div
                            key={doc.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isUploaded 
                                ? 'bg-emerald-50/60 border-emerald-300' 
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl shrink-0">{doc.icon}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {isUploaded ? `✓ ${uploadedDocs[doc.id].name}` : doc.required ? 'Mandatory' : 'Optional'}
                                </p>
                              </div>
                            </div>

                            {isUploaded ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(doc.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-white rounded-lg border border-red-200 shadow-2xs shrink-0"
                              >
                                Remove
                              </button>
                            ) : (
                              <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs shrink-0 transition-colors">
                                Upload
                                <input
                                  type="file"
                                  accept={doc.accept}
                                  onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmDocPossession}
                        onChange={(e) => setConfirmDocPossession(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-amber-500 rounded focus:ring-0"
                      />
                      <span className="text-xs text-slate-800 font-semibold">
                        I confirm that I possess the original PAN card, Passport and required statutory travel documents for verification.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Continue Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleStep3Continue}
                className="btn-gold px-8 py-3 rounded-xl font-extrabold text-sm text-slate-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>Continue to Step 4</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* --- SECTION 4: HANDOVER / DELIVERY / SETTLEMENT LOGISTICS --- */}
      <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${currentStep === 4 ? 'border-amber-400 ring-2 ring-amber-400/20' : currentStep > 4 ? 'border-emerald-200' : 'border-slate-200 opacity-60'}`}>
        
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep > 4 ? 'bg-emerald-100 text-emerald-700' : currentStep === 4 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-500'}`}>
              {currentStep > 4 ? '✓' : '4'}
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {isSell ? 'Forex Handover Details' : isRemittance ? 'Regulatory Declarations (LRS A2)' : 'Order Handover & Delivery'}
            </h3>
          </div>

          {currentStep > 4 && (
            <button
              type="button"
              onClick={() => updateDraft({ checkoutStep: 4 })}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {currentStep === 4 && (
          <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
            
            {isRemittance ? (
              /* REMITTANCE STEP 4: LRS A2 DECLARATIONS */
              <div className="space-y-5">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2 text-xs text-purple-950 font-medium shadow-2xs">
                  <div className="flex items-center gap-2 font-black text-purple-900 text-sm">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                    RBI Liberalised Remittance Scheme (LRS) Form A2 Declaration
                  </div>
                  <p>
                    I hereby declare that the total amount of foreign exchange purchased from or remitted through all sources in India during the current financial year (April 1 to March 31) including this order does not exceed USD 250,000 (US Dollars Two Hundred and Fifty Thousand Only), which is the limit prescribed by the Reserve Bank of India under Liberalised Remittance Scheme.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-2xl p-4 bg-white space-y-3 shadow-2xs">
                  <h4 className="font-extrabold text-slate-900 text-xs">Remittance Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Sender PAN</span>
                      <span className="font-black text-slate-900">{pan || 'ABCDE1234F'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Beneficiary</span>
                      <span className="font-black text-slate-900">{benName}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Sending Amount</span>
                      <span className="font-black text-indigo-700">{primaryAmount} {primaryCurrency}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={remittanceLrsConfirmed}
                    onChange={(e) => setRemittanceLrsConfirmed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-indigo-600 rounded focus:ring-0"
                  />
                  <span className="text-xs text-slate-800 font-semibold">
                    I declare and accept the RBI LRS Form A2 terms and certify that the beneficiary details and purpose of transfer are authentic.
                  </span>
                </label>
              </div>
            ) : isBranchPickup ? (
              /* BRANCH PICKUP / VISIT UI */
              <div className="border border-slate-300 rounded-2xl p-4 sm:p-5 space-y-4 bg-white shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs tracking-wide">
                    {isSell ? 'Branch Visit Details for Cash Surrender' : 'Branch Pickup Details'}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Zero Delivery Fee
                  </span>
                </div>

                {/* Vault Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      {selectedBranchObj?.branchName || pickupBranch}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold">
                      {selectedBranchObj?.workingHours || 'Open Mon - Sat'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {selectedBranchObj?.branchAddress ? `${selectedBranchObj.branchAddress}, ${selectedBranchObj.branchCity}` : 'Connaught Place, New Delhi - 110001'}
                  </p>
                  {selectedBranchObj?.phone && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      📞 Branch Phone: {selectedBranchObj.phone}
                    </p>
                  )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      COORDINATION PHONE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={coordPhone}
                      onChange={(e) => setCoordPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      VISIT DATE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs cursor-pointer"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={confirmPresence}
                    onChange={(e) => setConfirmPresence(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-amber-500 rounded focus:ring-0"
                  />
                  <span className="text-xs text-slate-800 font-semibold">
                    {isSell 
                      ? "I confirm that I will visit the branch personally with physical currency notes & original PAN card."
                      : "I confirm that the traveller will visit the branch personally with original PAN & Passport."}
                  </span>
                </label>
              </div>
            ) : (
              /* DOORSTEP DELIVERY / COLLECTION UI */
              <div className="border border-slate-300 rounded-2xl p-4 sm:p-5 space-y-4 bg-white shadow-2xs">
                <h4 className="font-extrabold text-slate-900 text-xs tracking-wide">
                  {isSell ? 'Doorstep Cash Collection Details' : 'Doorstep Delivery Address'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      CONTACT PHONE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={coordPhone}
                      onChange={(e) => setCoordPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      STREET ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House/Flat No., Street, Area"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      CITY <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      PIN CODE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 110001"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-white shadow-2xs"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={confirmPresence}
                    onChange={(e) => setConfirmPresence(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-amber-500 rounded focus:ring-0"
                  />
                  <span className="text-xs text-slate-800 font-semibold">
                    {isSell
                      ? "I confirm that I will be personally present to hand over currency notes to the verified executive."
                      : "I confirm that I will be personally present to collect the order with original ID."}
                  </span>
                </label>
              </div>
            )}

            {/* Step 4 Review Order Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleStep4Continue}
                className="btn-gold px-8 py-3.5 rounded-xl font-extrabold text-sm text-slate-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Review Order & Summary
              </button>
            </div>

          </div>
        )}
      </div>

      {/* --- SECTION 5: REVIEW, SETTLEMENT & INSTANT CONFIRMATION RECEIPT --- */}
      <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${currentStep === 5 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200 opacity-60'}`}>
        
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isOrderConfirmed ? 'bg-emerald-100 text-emerald-700 font-black' : currentStep === 5 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-500'}`}>
              {isOrderConfirmed ? '✓' : '5'}
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {isOrderConfirmed 
                ? 'Order Confirmed' 
                : isSell 
                  ? 'Review Sell Order & Confirm Payout' 
                  : isRemittance 
                    ? 'Review Wire Transfer & Settle' 
                    : 'Review Details & Make Payment'}
            </h3>
          </div>
        </div>

        {currentStep === 5 && (
          isOrderConfirmed ? (
            /* --- ORDER CONFIRMED RECEIPT SCREEN --- */
            <div className="p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
                ✓
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-display font-extrabold text-slate-900">
                  {isSell ? 'Sell Order Booked Successfully!' : isRemittance ? 'Remittance Wire Transfer Booked!' : 'Order Booked Successfully!'}
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Booking Reference ID: <span className="text-amber-600">{bookingRef || 'FXM-984210'}</span>
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 shadow-2xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs font-extrabold text-slate-900">
                  <span>Item Summary</span>
                  <span>Amount (INR)</span>
                </div>

                <div className="space-y-1 text-xs font-medium text-slate-700">
                  <div className="flex justify-between">
                    <span>{primaryAmount.toLocaleString('en-IN')} {primaryCurrency} {isSell ? 'Sell Notes' : isRemittance ? 'Wire Transfer' : isCard ? 'Card Load' : 'Notes'} @ ₹{primaryRate.toFixed(2)}</span>
                    <span className="font-bold text-slate-900">₹{Math.round(primaryInr).toLocaleString('en-IN')}</span>
                  </div>

                  {extraCurrenciesCalculated.map((c, i) => (
                    <div key={i} className="flex justify-between text-amber-900/80">
                      <span>{c.amount.toLocaleString('en-IN')} {c.currency} {isSell ? 'Sell' : 'Load'} @ ₹{c.rate.toFixed(2)}</span>
                      <span className="font-bold text-slate-900">₹{Math.round(c.inrValue).toLocaleString('en-IN')}</span>
                    </div>
                  ))}

                  {isSell ? (
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="flex justify-between text-emerald-800 font-bold">
                        <span>Payout Mode</span>
                        <span>Instant Direct IMPS / NEFT</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Credit Bank</span>
                        <span>{payoutBank} (A/C: ****{payoutAccountNo.slice(-4) || '1234'})</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {simCharge > 0 && (
                        <div className="flex justify-between">
                          <span>International SIM Card</span>
                          <span className="font-bold text-slate-900">₹{simCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Service Fee</span>
                        <span className="font-bold text-slate-900">₹{serviceCharge}</span>
                      </div>
                      {!isBranchPickup && (
                        <div className="flex justify-between">
                          <span>Delivery Charges</span>
                          <span className="font-bold text-slate-900">₹{deliveryCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>GST (Tax)</span>
                        <span className="font-bold text-slate-900">₹{gst}</span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Discount Applied</span>
                          <span>- ₹{appliedDiscount}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>{isSell ? 'Total Payout to Receive' : 'Total Paid'}</span>
                  <span className="text-base text-emerald-700">
                    ₹{(isSell ? netInrPayout : Math.round(finalTotalPayable)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                📩 Confirmation SMS & WhatsApp message has been sent to <strong>{phone}</strong> with order instructions.
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-xl border border-slate-300 font-extrabold text-xs text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Download Order Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearSession();
                    window.location.href = isSell ? '/sell-forex' : isRemittance ? '/remittance' : isCard ? '/forex-cards' : '/buy-forex';
                  }}
                  className="px-6 py-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Book Another Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearSession();
                    window.location.href = '/dashboard/orders';
                  }}
                  className="btn-gold px-8 py-3 rounded-xl font-extrabold text-xs text-slate-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            /* --- REVIEW DETAILS SCREEN --- */
            <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
              
              {/* Rate Guarantee Timer Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-amber-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Guaranteed Live Exchange Rate Locked for:</span>
                </div>
                <div className="font-mono text-sm font-black text-amber-700 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
                  ⏱ {formatTimerMinSec(rateTimerSeconds)}
                </div>
              </div>

              {/* SELL FOREX SUMMARY CARD */}
              {isSell ? (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-2xs">
                    <h4 className="font-extrabold text-slate-900 text-sm">Sell Order Summary</h4>
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between text-slate-700">
                        <span>Currency to Surrender:</span>
                        <span className="font-bold text-slate-900">{primaryAmount} {primaryCurrency}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Guaranteed Buyback Rate:</span>
                        <span className="font-bold text-emerald-700">₹{primaryRate.toFixed(2)} per 1 {primaryCurrency}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Crediting Bank Account:</span>
                        <span className="font-bold text-slate-900">{payoutBank} (A/C: ****{payoutAccountNo.slice(-4) || '1234'})</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Account Holder:</span>
                        <span className="font-bold text-slate-900">{payoutAccountHolder}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between text-sm font-black text-slate-900">
                        <span>Total INR You Will Receive:</span>
                        <span className="text-emerald-700 text-base">₹{netInrPayout.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Button for Sell */}
                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleFinalPlaceOrder}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-extrabold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      <span>Confirm Sell Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* BUY CASH, CARD & REMITTANCE PAYMENT SELECTION */
                <div className="space-y-6">
                  
                  {/* SIM Card option for travellers */}
                  {!isRemittance && (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0 font-bold">
                          📱
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">International Travel SIM Card</h5>
                          <p className="text-xs text-slate-500 max-w-lg font-medium">
                            Zero roaming charges. Unlimited data & incoming calls in 150+ countries.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 text-sm">₹235</span>
                        <button
                          type="button"
                          onClick={() => setAddSimCard(!addSimCard)}
                          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all ${
                            addSimCard 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {addSimCard ? '✓ Added' : '+ Add SIM'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Mode Selection */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {isRemittance ? 'Select Remittance Settlement Mode' : 'Select Payment Mode'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'UPI', label: 'UPI (Instant / QR)', icon: '⚡', desc: 'GPay, PhonePe, Paytm' },
                        { id: 'NET_BANKING', label: 'Net Banking', icon: '🏦', desc: '50+ Indian Banks' },
                        { id: 'CREDIT_CARD', label: 'Debit / Credit Card', icon: '💳', desc: 'Visa, Master, RuPay' },
                        { id: 'BANK_TRANSFER', label: 'NEFT / RTGS Wire', icon: '🏛️', desc: 'Escrow Virtual A/C' },
                      ].map((mode) => (
                        <div
                          key={mode.id}
                          onClick={() => setSelectedPaymentMode(mode.id as any)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedPaymentMode === mode.id
                              ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{mode.icon}</span>
                            <span className="text-xs font-bold text-slate-900">{mode.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium mt-1 pl-6">{mode.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Breakdown Card */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between text-slate-700">
                      <span>Total Foreign Exchange:</span>
                      <span className="font-bold text-slate-900">₹{Math.round(totalCurrencyInr).toLocaleString('en-IN')}</span>
                    </div>
                    {simCharge > 0 && (
                      <div className="flex justify-between text-slate-700">
                        <span>International SIM:</span>
                        <span className="font-bold text-slate-900">₹{simCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-700">
                      <span>Service Fee:</span>
                      <span className="font-bold text-slate-900">₹{serviceCharge}</span>
                    </div>
                    {!isBranchPickup && (
                      <div className="flex justify-between text-slate-700">
                        <span>Delivery Charges:</span>
                        <span className="font-bold text-slate-900">₹{deliveryCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-700">
                      <span>GST (Tax):</span>
                      <span className="font-bold text-slate-900">₹{gst}</span>
                    </div>
                    {discountVal > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Discount Voucher:</span>
                        <span>- ₹{discountVal}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t flex justify-between text-sm font-black text-slate-900">
                      <span>Final Total Payable:</span>
                      <span className="text-emerald-700 text-base">₹{Math.round(finalTotalPayable).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Make Payment / Confirm Wire Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleFinalPlaceOrder}
                      className="btn-gold px-10 py-4 rounded-xl font-extrabold text-sm text-slate-950 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      <span>{isRemittance ? 'Authorize & Initiate Wire Transfer' : 'Make Payment'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          )
        )}
      </div>

    </div>
  );
}
