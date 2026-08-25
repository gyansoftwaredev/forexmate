export interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  country: string;
  symbol: string;
  fallbackRate: number;
}

export const ALL_CURRENCIES_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', flag: '🇺🇸', country: 'United States', symbol: '$', fallbackRate: 83.50 },
  EUR: { code: 'EUR', name: 'Euro', flag: '🇪🇺', country: 'European Union', symbol: '€', fallbackRate: 89.20 },
  GBP: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', country: 'United Kingdom', symbol: '£', fallbackRate: 105.10 },
  AED: { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', country: 'United Arab Emirates', symbol: 'AED', fallbackRate: 22.73 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', country: 'Singapore', symbol: 'S$', fallbackRate: 61.80 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', country: 'Canada', symbol: 'C$', fallbackRate: 61.20 },
  AUD: { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', country: 'Australia', symbol: 'A$', fallbackRate: 54.80 },
  THB: { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', country: 'Thailand', symbol: '฿', fallbackRate: 2.45 },
  JPY: { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', country: 'Japan', symbol: '¥', fallbackRate: 0.55 },
  CHF: { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', country: 'Switzerland', symbol: 'CHF', fallbackRate: 94.20 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', country: 'New Zealand', symbol: 'NZ$', fallbackRate: 50.40 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', country: 'Hong Kong', symbol: 'HK$', fallbackRate: 10.65 },
  SEK: { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', country: 'Sweden', symbol: 'kr', fallbackRate: 7.90 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', country: 'Norway', symbol: 'kr', fallbackRate: 7.80 },
  DKK: { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', country: 'Denmark', symbol: 'kr', fallbackRate: 11.95 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', country: 'Malaysia', symbol: 'RM', fallbackRate: 17.80 },
  ZAR: { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', country: 'South Africa', symbol: 'R', fallbackRate: 4.40 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', country: 'Saudi Arabia', symbol: 'SAR', fallbackRate: 22.25 },
  QAR: { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', country: 'Qatar', symbol: 'QAR', fallbackRate: 22.90 },
  OMR: { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', country: 'Oman', symbol: 'OMR', fallbackRate: 216.80 },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', country: 'Kuwait', symbol: 'KWD', fallbackRate: 272.50 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', country: 'Bahrain', symbol: 'BHD', fallbackRate: 221.40 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', country: 'China', symbol: '¥', fallbackRate: 11.50 },
  KRW: { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', country: 'South Korea', symbol: '₩', fallbackRate: 0.062 },
  VND: { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', country: 'Vietnam', symbol: '₫', fallbackRate: 0.0033 },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', country: 'Indonesia', symbol: 'Rp', fallbackRate: 0.0053 },
  LKR: { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', country: 'Sri Lanka', symbol: 'Rs', fallbackRate: 0.27 },
  NPR: { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵', country: 'Nepal', symbol: 'NPR', fallbackRate: 0.62 },
  MVR: { code: 'MVR', name: 'Maldivian Rufiyaa', flag: '🇲🇻', country: 'Maldives', symbol: 'Rf', fallbackRate: 5.40 },
  TRY: { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', country: 'Turkey', symbol: '₺', fallbackRate: 2.50 },
  EGP: { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', country: 'Egypt', symbol: 'E£', fallbackRate: 1.70 },
  PHP: { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', country: 'Philippines', symbol: '₱', fallbackRate: 1.45 },
  INR: { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', country: 'India', symbol: '₹', fallbackRate: 1.00 },
  RUB: { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', country: 'Russia', symbol: '₽', fallbackRate: 0.92 },
  MXN: { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', country: 'Mexico', symbol: 'Mex$', fallbackRate: 4.85 },
  BRL: { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', country: 'Brazil', symbol: 'R$', fallbackRate: 16.40 },
  PLN: { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', country: 'Poland', symbol: 'zł', fallbackRate: 20.80 },
  HUF: { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', country: 'Hungary', symbol: 'Ft', fallbackRate: 0.23 },
  CZK: { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', country: 'Czech Republic', symbol: 'Kč', fallbackRate: 3.55 },
  ILS: { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱', country: 'Israel', symbol: '₪', fallbackRate: 22.40 },
  CLP: { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', country: 'Chile', symbol: 'CLP$', fallbackRate: 0.088 },
  COP: { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', country: 'Colombia', symbol: 'COL$', fallbackRate: 0.021 },
  PEN: { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪', country: 'Peru', symbol: 'S/', fallbackRate: 22.10 },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', country: 'Pakistan', symbol: 'Rs', fallbackRate: 0.30 },
  BDT: { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', country: 'Bangladesh', symbol: '৳', fallbackRate: 0.71 },
};

export const ALL_CURRENCIES_LIST: CurrencyInfo[] = Object.values(ALL_CURRENCIES_MAP);

export function getCurrencyFlag(code: string): string {
  const upper = (code || '').toUpperCase();
  return ALL_CURRENCIES_MAP[upper]?.flag || '🇺🇸';
}

export function getCurrencyName(code: string): string {
  const upper = (code || '').toUpperCase();
  return ALL_CURRENCIES_MAP[upper]?.name || upper;
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  const upper = (code || '').toUpperCase();
  return ALL_CURRENCIES_MAP[upper] || {
    code: upper,
    name: upper,
    flag: '🇺🇸',
    country: 'Global',
    symbol: upper,
    fallbackRate: 83.50
  };
}
