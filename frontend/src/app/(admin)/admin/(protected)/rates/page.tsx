"use client";

import { useEffect, useState } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Edit2, RefreshCw, X, Check, DollarSign, Settings2, Power, PlusCircle, Trash2, Globe, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const getFlag = (code: string) => {
  const flags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    AED: '🇦🇪',
    AUD: '🇦🇺',
    CAD: '🇨🇦',
    SGD: '🇸🇬',
    JPY: '🇯🇵',
    CHF: '🇨🇭',
    NZD: '🇳🇿',
    THB: '🇹🇭',
    MYR: '🇲🇾',
    SAR: '🇸🇦',
    QAR: '🇶🇦',
    CNY: '🇨🇳',
    HKD: '🇭🇰',
    SEK: '🇸🇪',
    NOK: '🇳🇴',
    DKK: '🇩🇰',
    KRW: '🇰🇷',
    IDR: '🇮🇩',
    VND: '🇻🇳',
    TRY: '🇹🇷',
    ZAR: '🇿🇦',
    BRL: '🇧🇷',
    RUB: '🇷🇺',
    MXN: '🇲🇽',
    PLN: '🇵🇱',
    HUF: '🇭🇺',
    CZK: '🇨🇿',
    ILS: '🇮🇱',
    CLP: '🇨🇱',
    PHP: '🇵🇭',
    KWD: '🇰🇼',
    BHD: '🇧🇭',
    OMR: '🇴🇲',
    INR: '🇮🇳',
    LKR: '🇱🇰',
    NPR: '🇳🇵',
    EGP: '🇪🇬'
  };
  return flags[code?.toUpperCase()] || '🌐';
};

const getCurrencyName = (code: string, fallbackName?: string) => {
  if (fallbackName && fallbackName !== code) return fallbackName;
  const names: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    AED: 'UAE Dirham',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    SGD: 'Singapore Dollar',
    JPY: 'Japanese Yen',
    CHF: 'Swiss Franc',
    NZD: 'New Zealand Dollar',
    THB: 'Thai Baht',
    MYR: 'Malaysian Ringgit',
    SAR: 'Saudi Riyal',
    QAR: 'Qatari Riyal',
    CNY: 'Chinese Yuan',
    HKD: 'Hong Kong Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    KRW: 'South Korean Won',
    IDR: 'Indonesian Rupiah',
    VND: 'Vietnamese Dong',
    TRY: 'Turkish Lira',
    ZAR: 'South African Rand',
    KWD: 'Kuwaiti Dinar',
    BHD: 'Bahraini Dinar',
    OMR: 'Omani Rial',
    INR: 'Indian Rupee'
  };
  return names[code?.toUpperCase()] || code;
};

export default function AdminRates() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Edit form states
  const [editingRate, setEditingRate] = useState<any | null>(null);
  const [inrRate, setInrRate] = useState<string>('');
  const [buyMargin, setBuyMargin] = useState<string>('');
  const [sellMargin, setSellMargin] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Add Currency Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newInrRate, setNewInrRate] = useState('');
  const [newBuyMargin, setNewBuyMargin] = useState('1.00');
  const [newSellMargin, setNewSellMargin] = useState('1.00');
  const [addingCurrency, setAddingCurrency] = useState(false);

  // Delete Currency Modal state
  const [deletingRate, setDeletingRate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRates();
    fetchProducts();

    const handleSync = () => {
      console.log('[Sync Hook] Refreshing admin rates list due to sync event');
      fetchRates();
      fetchProducts();
    };

    window.addEventListener('forexmate-sync', handleSync);
    return () => {
      window.removeEventListener('forexmate-sync', handleSync);
    };
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await authFetch(`${API_URL}/rates/products`).then(apiJson);
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const toggleProduct = async (id: string, currentStatus: boolean) => {
    try {
      const res = await authFetch(`${API_URL}/rates/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || 'Failed to update product status');
      } else {
        toast.success('Product status updated successfully.');
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update product status');
    }
  };

  const fetchRates = async () => {
    try {
      const data = await authFetch(`${API_URL}/rates`).then(apiJson);
      // Filter out base currency (INR) or sort USD and other currencies neatly
      const sorted = (data || []).sort((a: any, b: any) => {
        if (a.currency?.code === 'USD') return -1;
        if (b.currency?.code === 'USD') return 1;
        return a.currency?.code.localeCompare(b.currency?.code);
      });
      setRates(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch live exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (rate: any) => {
    setEditingRate(rate);
    setInrRate(rate.inrRate.toString());
    setBuyMargin((rate.marginBuyPct * 100).toString());
    setSellMargin((rate.marginSellPct * 100).toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/rates/${editingRate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inrRate: parseFloat(inrRate),
          marginBuyPct: parseFloat(buyMargin) / 100,
          marginSellPct: parseFloat(sellMargin) / 100,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || 'Failed to save rate updates');
      } else {
        toast.success(`Exchange rates updated for ${editingRate.currency?.code}`);
        setEditingRate(null);
        fetchRates();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('forexmate-sync'));
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save rate updates');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim() || !newInrRate) {
      alert('Please fill all required fields');
      return;
    }

    setAddingCurrency(true);
    try {
      const res = await authFetch(`${API_URL}/rates/currency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          name: newName.trim(),
          symbol: newSymbol.trim() || newCode.trim().toUpperCase(),
          inrRate: parseFloat(newInrRate),
          marginBuyPct: parseFloat(newBuyMargin || '1.00') / 100,
          marginSellPct: parseFloat(newSellMargin || '1.00') / 100,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add currency');
      }

      toast.success(`🎉 ${newCode.toUpperCase()} added successfully to live pricing engine!`);
      setShowAddModal(false);
      // Reset form
      setNewCode('');
      setNewName('');
      setNewSymbol('');
      setNewInrRate('');
      setNewBuyMargin('1.00');
      setNewSellMargin('1.00');

      fetchRates();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('forexmate-sync'));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add currency');
    } finally {
      setAddingCurrency(false);
    }
  };

  const handleDeleteCurrency = async () => {
    if (!deletingRate) return;

    setIsDeleting(true);
    try {
      const res = await authFetch(`${API_URL}/rates/currency/${deletingRate.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete currency');
      }

      toast.success(`🗑️ ${deletingRate.currency?.code} removed from pricing engine & customer portals.`);
      setDeletingRate(null);
      fetchRates();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('forexmate-sync'));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete currency');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('forexmate_token');
    localStorage.removeItem('forexmate_user');
    window.location.href = '/login';
  };

  return (
    <div className="p-10 w-full min-h-full space-y-8 bg-slate-50/50">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            Live Currency Pricing Engine
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure dynamic transaction exchange rates, manage buy/sell retail margins, and update database live quotes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Add Currency</span>
          </button>
          <button
            onClick={fetchRates}
            disabled={loading}
            className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all shadow-sm border border-indigo-100 flex items-center justify-center cursor-pointer"
            title="Refresh Rates"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-750 font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800 max-w-lg mx-auto">
          <div>
            <h4 className="font-bold text-sm">Failed to Load Exchange Rates</h4>
            <p className="text-xs text-red-650 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Dynamic Exchange Rates Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Dynamic Exchange Rates Grid</h3>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="px-3 py-1 font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              {rates.length} Currencies Configured
            </Badge>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
            >
              <PlusCircle size={13} /> Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-150">
                <th className="px-6 py-4">Currency</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Interbank Rate</th>
                <th className="px-6 py-4 text-emerald-700">Buy Margin</th>
                <th className="px-6 py-4 text-blue-700">Sell Margin</th>
                <th className="px-6 py-4 text-emerald-700">Customer Buy Rate (Bank Sell)</th>
                <th className="px-6 py-4 text-blue-700">Customer Sell Rate (Bank Buy)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Fetching live rates from Pricing Engine...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No active exchange rates loaded in the system database. Click <strong>+ Add Currency</strong> above to configure your first currency.
                  </td>
                </tr>
              ) : (
                rates.map((rate: any) => {
                  const buyRate = rate.inrRate * (1 - rate.marginBuyPct);
                  const sellRate = rate.inrRate * (1 + rate.marginSellPct);
                  const isBase = rate.currency?.code === 'INR';

                  return (
                    <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-sm text-indigo-600">
                        {getFlag(rate.currency?.code)} {rate.currency?.code}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm font-semibold">
                        {getCurrencyName(rate.currency?.code, rate.currency?.name)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-sm text-gray-900">
                        ₹{Number(rate.inrRate).toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-emerald-700 font-mono font-bold text-sm">
                        {(rate.marginBuyPct * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-blue-700 font-mono font-bold text-sm">
                        {(rate.marginSellPct * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 font-mono font-black text-sm text-emerald-700">
                        ₹{buyRate.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 font-mono font-black text-sm text-blue-700">
                        ₹{sellRate.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isBase && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(rate)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold rounded-lg text-xs transition-all border border-indigo-100 inline-flex items-center gap-1 cursor-pointer"
                              title="Edit Margin & Rate"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => setDeletingRate(rate)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-all border border-rose-200 inline-flex items-center gap-1 cursor-pointer"
                              title="Delete Currency"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Rules & Gating Control Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Product Catalog & Rules Engine</h3>
          </div>
          <Badge className="px-3 py-1 font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
            {products.length} Products Configured
          </Badge>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productsLoading ? (
              <div className="col-span-2 text-center py-6 text-gray-500 font-semibold text-xs">
                Fetching Forex products catalog...
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-gray-500 font-semibold text-xs">
                No products found.
              </div>
            ) : (
              products.map((prod) => {
                const isSell = prod.code === 'CASH_SELL';
                return (
                  <div 
                    key={prod.id} 
                    className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-sm ${
                      prod.isActive 
                        ? (isSell ? 'border-emerald-250 bg-emerald-50/10' : 'border-blue-250 bg-blue-50/10') 
                        : 'border-slate-200 bg-slate-50/30 grayscale opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-extrabold text-gray-900 text-sm">{prod.name}</h4>
                        <Badge className={`font-black uppercase text-[9px] ${
                          prod.isActive 
                            ? (isSell ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200') 
                            : 'bg-slate-150 text-slate-500'
                        }`}>
                          {prod.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-mono">CODE: {prod.code}</div>
                      <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">
                        {isSell 
                          ? 'Enables left-over foreign exchange encashment, KYC submission gating, home collection/branch visit fulfillment, and dealer assignments.' 
                          : 'Enables retail foreign exchange notes acquisition, multi-currency card purchase, home delivery/store pickup fulfillment, and cash reserves.'
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-2 border-t pt-3">
                      <button
                        onClick={() => toggleProduct(prod.id, prod.isActive)}
                        className={`w-full font-extrabold text-xs rounded-lg h-8 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          prod.isActive
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100'
                        }`}
                      >
                        <Power size={12} />
                        {prod.isActive ? 'Disable Product' : 'Enable Product'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <header className="px-6 py-5 border-b border-gray-150 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" /> Add New Currency
                </h4>
                <p className="text-xs text-gray-400 font-medium">Add a new foreign currency to live pricing, rates ticker, and customer portal.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleAddCurrency} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Currency Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. JPY, NZD, SAR"
                    value={newCode}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase();
                      setNewCode(code);
                      if (!newName) setNewName(getCurrencyName(code));
                    }}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 font-bold uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. ¥, NZ$, ﷼, Fr"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Currency Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japanese Yen, Saudi Riyal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Interbank Base Rate (in INR) *</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  placeholder="e.g. 0.58, 51.40, 22.80"
                  value={newInrRate}
                  onChange={(e) => setNewInrRate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Buy Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newBuyMargin}
                    onChange={(e) => setNewBuyMargin(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Sell Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newSellMargin}
                    onChange={(e) => setNewSellMargin(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 font-bold"
                  />
                </div>
              </div>

              {/* Real-time Rate Preview */}
              {newInrRate && Number(newInrRate) > 0 && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-1 text-xs">
                  <p className="font-extrabold text-emerald-900 uppercase tracking-wider text-[10px]">Calculated Live Quotes Preview</p>
                  <div className="flex justify-between font-mono font-bold text-slate-700">
                    <span>Customer Buy (Bank Sell): <strong className="text-emerald-700 font-black">₹{(Number(newInrRate) * (1 - Number(newBuyMargin || 0) / 100)).toFixed(4)}</strong></span>
                    <span>Customer Sell (Bank Buy): <strong className="text-blue-700 font-black">₹{(Number(newInrRate) * (1 + Number(newSellMargin || 0) / 100)).toFixed(4)}</strong></span>
                  </div>
                </div>
              )}

              <footer className="pt-4 border-t border-gray-150 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-gray-650 font-bold rounded-xl text-sm transition-all border border-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCurrency}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {addingCurrency ? 'Adding...' : <><PlusCircle size={16} /> Add Currency</>}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="font-extrabold text-gray-900 text-lg">
                Delete Currency: {deletingRate.currency?.code}?
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Are you sure you want to remove <strong>{deletingRate.currency?.name || deletingRate.currency?.code}</strong>? It will be removed from customer live rates tickers, calculator dropdowns, and pricing engine.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingRate(null)}
                className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-gray-700 font-bold rounded-xl text-sm transition-all border border-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrency}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : <><Trash2 size={15} /> Delete Currency</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rates Glassmorphic Slideover/Modal Overlay */}
      {editingRate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <header className="px-6 py-5 border-b border-gray-150 flex justify-between items-center bg-slate-55/10">
              <div>
                <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  Update {editingRate.currency?.code} Exchange Quote
                </h4>
                <p className="text-xs text-gray-400 font-medium">Manually override margin configurations and quotes.</p>
              </div>
              <button
                onClick={() => setEditingRate(null)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interbank Rate (INR)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={inrRate}
                  onChange={(e) => setInrRate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider text-emerald-700">Buy Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={buyMargin}
                    onChange={(e) => setBuyMargin(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider text-blue-700">Sell Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellMargin}
                    onChange={(e) => setSellMargin(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 font-bold"
                  />
                </div>
              </div>

              <footer className="pt-4 border-t border-gray-150 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-gray-650 font-bold rounded-xl text-sm transition-all border border-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

