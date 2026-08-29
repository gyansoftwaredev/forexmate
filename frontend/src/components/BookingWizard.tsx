"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { calculateForexGst } from '@/lib/gstCalculator';

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  
  const currency = searchParams.get('currency') || 'USD';
  const amount = searchParams.get('amount') || '1000';
  const inr = searchParams.get('inr') || '0';
  const tab = searchParams.get('tab') || 'buy';
  const type = searchParams.get('type') || 'card';

  const inrVal = parseFloat(inr) || 0;
  const computedGst = calculateForexGst(inrVal);
  const totalPayable = inrVal + computedGst;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Left Column: Form Wizard */}
      <div className="flex-[2] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Stepper Header */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {[
            { num: 1, label: 'Order Details' },
            { num: 2, label: 'Traveler Info' },
            { num: 3, label: 'Delivery' },
            { num: 4, label: 'Payment' }
          ].map(s => (
            <div key={s.num} className={`flex-1 py-4 text-center font-bold text-sm ${step === s.num ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : step > s.num ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-400'}`}>
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs ${step === s.num ? 'bg-blue-100' : step > s.num ? 'bg-green-100' : 'bg-gray-200'}`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Order Details & Login */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">Verify your mobile number</h2>
            <p className="text-sm text-gray-600 mb-8">We need your mobile number to send order updates and delivery details.</p>
            
            <div className="max-w-md">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">MOBILE NUMBER</label>
              <div className="flex border-b border-gray-300 focus-within:border-blue-600 transition-colors pb-1 mb-6">
                <span className="text-lg font-bold text-gray-900 mr-2">+91</span>
                <input 
                  type="tel" 
                  maxLength={10}
                  placeholder="9876543210" 
                  className="w-full text-lg font-bold text-gray-900 focus:outline-none bg-transparent" 
                />
              </div>
              
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-lg py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                Send OTP
              </button>
              
              <div className="mt-6 text-xs text-gray-500 text-center">
                By proceeding, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> & <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Traveler Info (KYC) */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">Traveler Details (KYC)</h2>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 text-sm text-blue-800 flex items-start">
              <span className="mr-3 text-xl">ℹ️</span>
              As per RBI guidelines, foreign exchange can only be purchased for a valid travel purpose.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">TRAVELER'S FULL NAME (As per Passport)</label>
                <input type="text" className="w-full text-base font-bold text-gray-900 border-b border-gray-300 focus:border-blue-600 focus:outline-none pb-2 bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">PASSPORT NUMBER</label>
                <input type="text" className="w-full text-base font-bold text-gray-900 border-b border-gray-300 focus:border-blue-600 focus:outline-none pb-2 bg-transparent uppercase" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">PAN NUMBER</label>
                <input type="text" className="w-full text-base font-bold text-gray-900 border-b border-gray-300 focus:border-blue-600 focus:outline-none pb-2 bg-transparent uppercase" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">DATE OF DEPARTURE</label>
                <input type="date" className="w-full text-base font-bold text-gray-900 border-b border-gray-300 focus:border-blue-600 focus:outline-none pb-2 bg-transparent" />
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-900">← Back</button>
              <button 
                onClick={() => setStep(3)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                Continue to Delivery
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Delivery Options */}
        {step === 3 && (
          <div className="p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">How do you want your Forex?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="border-2 border-blue-600 bg-blue-50/50 rounded-xl p-6 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                <div className="text-3xl mb-3">🛵</div>
                <h3 className="font-extrabold text-lg mb-1">Doorstep Delivery</h3>
                <p className="text-sm text-gray-600">Get your forex delivered to your home or office within 4 hours.</p>
              </div>
              <div className="border-2 border-gray-200 hover:border-gray-300 rounded-xl p-6 cursor-pointer">
                <div className="text-3xl mb-3">🏦</div>
                <h3 className="font-extrabold text-lg mb-1">Branch Pickup</h3>
                <p className="text-sm text-gray-600">Collect your forex from any of our 500+ partnered branches.</p>
              </div>
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">DELIVERY ADDRESS / PINCODE</label>
              <input type="text" placeholder="Enter Pincode or Address" className="w-full text-base font-bold text-gray-900 border-b border-gray-300 focus:border-blue-600 focus:outline-none pb-2 bg-transparent" />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button onClick={() => setStep(2)} className="text-gray-500 font-bold hover:text-gray-900">← Back</button>
              <button 
                onClick={() => setStep(4)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">Payment Summary</h2>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-600">Order Amount</span>
                <span className="font-bold text-gray-900">₹{inr}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-600">GST (As per Govt. rules)</span>
                <span className="font-bold text-gray-900">₹{computedGst}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-600 flex items-center">Convenience Fee <span className="ml-2 text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded text-xs">FREE</span></span>
                <span className="font-bold text-gray-900 line-through text-gray-400">₹199</span>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="font-extrabold text-xl text-gray-900">Total Amount to Pay</span>
                <span className="font-extrabold text-2xl text-blue-600">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button onClick={() => setStep(3)} className="text-gray-500 font-bold hover:text-gray-900">← Back</button>
              <button 
                onClick={() => alert("Payment Gateway Mock!")}
                className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-lg px-10 py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center"
              >
                PAY SECURELY <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Order Summary Card */}
      <div className="flex-1">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-6">
          <h3 className="font-extrabold text-lg text-gray-900 mb-4 pb-4 border-b border-gray-100">Order Summary</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Product</span>
              <span className="font-bold text-gray-900 text-sm">
                {tab === 'buy' ? 'Buy' : 'Sell'} {currency} {type === 'card' ? 'Forex Card' : 'Notes'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Quantity</span>
              <span className="font-bold text-blue-600 text-lg">{currency} {amount}</span>
            </div>
          </div>
          
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
              <span>Total Value (in INR)</span>
            </div>
            <div className="font-extrabold text-3xl text-gray-900">₹{inr}</div>
          </div>

          <div className="mt-6 flex items-start text-xs text-gray-500">
            <span className="text-green-500 mr-2 text-lg">🛡️</span>
            <div>
              <strong className="text-gray-900 block mb-1">Lowest Rates Guaranteed</strong>
              We compare rates across 100s of money changers to give you the best deal.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
