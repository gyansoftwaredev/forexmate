"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingUp, TrendingDown, Building2, Sparkles, ShieldCheck, ArrowRight, Zap, Globe, DollarSign } from 'lucide-react';
import API_URL, { authFetch } from '@/lib/api';

export default function DealerDashboard() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/treasury/positions`);
      const result = await res.json();
      
      if (res.ok) {
        setPositions(result.success ? result.data : (Array.isArray(result) ? result : []));
      } else {
        console.error('Failed to fetch positions:', res.statusText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-blue-500/5 border border-amber-200/90 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Interbank Treasury Desk
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                RBI Nostro & NOP Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
              Dealer Trading Terminal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Monitor live Net Open Positions (NOP), interbank wholesale liquidity, and Nostro exposure across all currency corridors.
            </p>
          </div>

          <button 
            onClick={fetchPositions} 
            disabled={loading}
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Positions'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Positions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {positions.map(pos => (
          <Card key={pos.id} className="border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden hover:border-amber-400 hover:shadow-md transition-all bg-white flex flex-col justify-between">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-4 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-black">{pos.currency?.code || 'FX'}</span>
                <span>{pos.currency?.name || 'Corridor'}</span>
              </CardTitle>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                pos.netOpenPosition >= 0 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {pos.netOpenPosition >= 0 ? '▲ LONG' : '▼ SHORT'}
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Net Open Position (NOP)</span>
                <div className="text-2xl font-mono font-black text-slate-900 mt-0.5">
                  {Number(pos.netOpenPosition).toLocaleString()}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex justify-between">
                <span>Bought: <strong className="text-emerald-700 font-mono">+{Number(pos.totalBought).toLocaleString()}</strong></span>
                <span>Sold: <strong className="text-red-600 font-mono">-{Number(pos.totalSold).toLocaleString()}</strong></span>
              </div>
            </CardContent>
          </Card>
        ))}

        {positions.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center flex flex-col items-center justify-center bg-white border border-slate-200/90 rounded-3xl p-8 shadow-2xs">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-2xs">
              📊
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">No Active Open Positions</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
              No interbank market trades or currency corridor exposures are currently active on this dealer profile.
            </p>
            <button
              onClick={() => window.location.href = '/rates'}
              className="px-6 py-3.5 bg-[#C59B27] hover:bg-[#b58c20] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>View Interbank Live Rates</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
