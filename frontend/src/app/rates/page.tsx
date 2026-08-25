"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLiveRates } from '@/lib/api-public';
import { getCurrencyFlag } from '@/lib/currencyMetadata';
import Link from 'next/link';

export default function RatesPage() {
  const [rates, setRates] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getLiveRates()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const apiRates = data
            .filter((item: any) => item.currency.code !== 'INR')
            .map((item: any) => ({
              currency: item.currency.code,
              name: item.currency.name,
              buyRate: (item.inrRate + 0.63).toFixed(2),
              sellRate: (item.inrRate - 0.63).toFixed(2),
              cardRate: item.inrRate.toFixed(2),
              updatedAt: new Date(item.updatedAt).toLocaleString()
            }))
            .sort((a, b) => a.currency.localeCompare(b.currency));

          setRates(apiRates);
          if (apiRates.length > 0) {
            setLastUpdated(apiRates[0].updatedAt);
          }
        }
      })
      .catch(err => console.error("Failed to load rates:", err));
  }, []);

  const filteredRates = rates.filter(r => 
    r.currency.toLowerCase().includes(search.toLowerCase()) || 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold mb-4">Live Foreign Exchange Rates</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Check real-time exchange rates for over 40 currencies. Lock your rate today and avoid market fluctuations.
            </p>
            {lastUpdated && (
              <p className="text-sm text-green-600 font-medium mt-4">
                🟢 Last Updated: {lastUpdated}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <input 
              type="text"
              placeholder="Search currency (e.g., USD, Euro)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link href="/buy-forex">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-4 whitespace-nowrap">
                Start Transaction
              </button>
            </Link>
          </div>

          {/* Rates Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="p-4 font-bold border-b">Currency</th>
                    <th className="p-4 font-bold border-b text-right">Buy Notes (₹)</th>
                    <th className="p-4 font-bold border-b text-right">Sell Notes (₹)</th>
                    <th className="p-4 font-bold border-b text-right">Forex Card (₹)</th>
                    <th className="p-4 font-bold border-b text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        {rates.length === 0 ? 'Loading live rates...' : 'No currencies matched your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredRates.map((rate, idx) => (
                      <tr key={rate.currency} className={`hover:bg-gray-50 transition-colors ${idx !== filteredRates.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg mr-3 shadow-2xs">
                              {getCurrencyFlag(rate.currency)}
                            </div>
                            <div>
                              <div className="font-extrabold text-gray-900">{rate.currency}</div>
                              <div className="text-xs text-gray-500 font-medium">{rate.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium text-gray-900">₹{rate.buyRate}</td>
                        <td className="p-4 text-right font-medium text-gray-900">₹{rate.sellRate}</td>
                        <td className="p-4 text-right font-medium text-blue-600">₹{rate.cardRate}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link href={`/buy-forex?tab=buy&type=notes&currency=${rate.currency}`}>
                              <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-md transition-colors shadow-xs">
                                Buy
                              </button>
                            </Link>
                            <Link href={`/buy-forex?tab=sell&type=notes&currency=${rate.currency}`}>
                              <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-md transition-colors shadow-xs">
                                Sell
                              </button>
                            </Link>
                            <Link href={`/buy-forex?tab=buy&type=card&currency=${rate.currency}`}>
                              <button className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold py-1.5 px-2.5 rounded-md transition-colors border border-indigo-200">
                                Card
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
