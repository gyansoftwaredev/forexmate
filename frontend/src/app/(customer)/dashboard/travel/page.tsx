"use client";

import React, { useState } from 'react';
import { 
  Plane, Calculator, Compass, ShieldCheck, CheckSquare, 
  Square, Calendar, Globe, ArrowRightLeft, CreditCard, Banknote 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TravelHubPage() {
  // Calculator State
  const [inrAmount, setInrAmount] = useState('50000');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const rateMap: Record<string, number> = {
    USD: 83.25,
    EUR: 90.15,
    GBP: 105.40,
    SGD: 61.50,
    AUD: 55.20
  };

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Verify passport validity is at least 6 months from travel date', completed: true },
    { id: '2', text: 'Submit PAN & Passport documents for KYC approval', completed: true },
    { id: '3', text: 'Purchase multi-currency Forex Card', completed: false },
    { id: '4', text: 'Convert cash up to $3,000 FEMA limit for minor expenses', completed: false },
    { id: '5', text: 'Keep digital invoice and travel insurance copies offline', completed: false },
    { id: '6', text: 'Check visa status & entry requirements for destination', completed: false }
  ]);

  // Trip Planner State
  const [destination, setDestination] = useState('United States');
  const [duration, setDuration] = useState('10');
  const [estimatedBudget, setEstimatedBudget] = useState('150000');

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const calculatedForeign = (Number(inrAmount) / rateMap[selectedCurrency]).toFixed(2);

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cashSplit = (Number(estimatedBudget) * 0.3).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    const cardSplit = (Number(estimatedBudget) * 0.7).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    toast.success(`Trip planned! Recommended split: ₹${cashSplit} in Cash, ₹${cardSplit} on Forex Card.`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Travel Hub</h1>
        <p className="text-gray-500 mt-1">Plan your foreign exchange budgets and check compliance guidelines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Calculator & Budget Planner */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Rates Calculator */}
          <Card className="border-gray-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Quick Currency Estimator
              </CardTitle>
              <CardDescription>Estimate currency requirements with live simulated market rates.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 block">Amount in INR (₹)</label>
                  <Input 
                    type="number"
                    value={inrAmount}
                    onChange={e => setInrAmount(e.target.value)}
                    placeholder="Enter INR amount"
                    className="rounded-lg border-gray-200 h-11"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 block">Convert To</label>
                  <select 
                    value={selectedCurrency}
                    onChange={e => setSelectedCurrency(e.target.value)}
                    className="w-full h-11 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar (Rate: 83.25)</option>
                    <option value="EUR">EUR - Euro (Rate: 90.15)</option>
                    <option value="GBP">GBP - British Pound (Rate: 105.40)</option>
                    <option value="SGD">SGD - Singapore Dollar (Rate: 61.50)</option>
                    <option value="AUD">AUD - Australian Dollar (Rate: 55.20)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Estimated Payout</p>
                    <h3 className="text-3xl font-black text-blue-900 mt-1">
                      {selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'GBP' ? '£' : ''} {Number(calculatedForeign).toLocaleString()}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-blue-100 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-bold uppercase">
                      Live Rate Applied
                    </span>
                    <p className="text-xs text-blue-600 mt-2 font-medium">1 {selectedCurrency} = ₹{rateMap[selectedCurrency]}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100/80 justify-end">
                  <Button 
                    className="bg-white border border-blue-200 text-blue-900 font-bold text-xs hover:bg-blue-50 rounded-lg"
                    onClick={() => window.location.href = `/buy-forex?tab=buy&currency=${selectedCurrency}&amount=${calculatedForeign}`}
                  >
                    💵 Order Cash Notes
                  </Button>
                  <Button 
                    className="btn-gold font-black text-slate-950 text-xs rounded-lg shadow-sm"
                    onClick={() => window.location.href = `/buy-forex?tab=card&currency=${selectedCurrency}&amount=${calculatedForeign}`}
                  >
                    💳 Order Forex Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Forex Planner */}
          <Card className="border-gray-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                Trip Forex Budget Planner
              </CardTitle>
              <CardDescription>Plan your cash versus card split recommendation for optimal convenience.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Destination</label>
                    <select 
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      className="w-full h-11 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Europe">Europe</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Trip Duration (Days)</label>
                    <Input 
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="rounded-lg border-gray-200 h-11"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Total Budget (INR)</label>
                    <Input 
                      type="number"
                      value={estimatedBudget}
                      onChange={e => setEstimatedBudget(e.target.value)}
                      className="rounded-lg border-gray-200 h-11"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg">
                    Calculate Recommended Split
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Checklist & FEMA limits */}
        <div className="space-y-8">
          
          {/* Active Pre-Departure Checklist */}
          <Card className="border-gray-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                Pre-departure Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {checklist.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    {item.completed ? (
                      <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs font-medium leading-relaxed ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FEMA Rules Guidelines */}
          <Card className="border-gray-200/80 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white border-0">
            <CardHeader className="border-b border-white/10 p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                FEMA Regulations
              </CardTitle>
              <CardDescription className="text-white/60">Reserve Bank of India regulatory compliance rules.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs leading-relaxed text-white/80">
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <Banknote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Cash Limit ($3,000 USD)</span>
                    Customers can acquire a maximum equivalent of $3,000 USD in physical currency notes per trip.
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start">
                  <CreditCard className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Forex Card Limit</span>
                    Remaining balance of the overall LRS quota can be carried in multi-currency prepaid travel cards.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Overall FY Limit (₹1 Crore)</span>
                    Liberalised Remittance Scheme limits total foreign exchange transactions to $250,000 equivalent per financial year.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
