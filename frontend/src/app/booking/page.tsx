import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { OrderWizard } from '@/components/orders/OrderWizard';
import { Suspense } from 'react';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#071426] font-sans text-slate-900 flex flex-col relative overflow-x-hidden">
      
      {/* Background Travel Image Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(7, 20, 38, 0.85) 0%, rgba(13, 27, 42, 0.70) 50%, rgba(7, 20, 38, 0.95) 100%), url('/full_travel_bg.png')` 
        }}
      />

      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full py-10 px-4 relative">
        <Suspense fallback={<div className="text-center p-10 font-bold text-slate-400">Initializing Order Engine...</div>}>
          <div className="shadow-2xl rounded-3xl overflow-hidden bg-white border border-white/20 ring-1 ring-black/10">
            <OrderWizard />
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
