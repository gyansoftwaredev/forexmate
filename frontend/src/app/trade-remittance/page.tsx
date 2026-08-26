import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TradeRemittancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-3xl mx-auto text-center bg-white p-12 rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">💼</div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Trade Remittance Services</h1>
          <p className="text-xl text-gray-600 mb-8">Streamlined cross-border payments for importers and exporters. Coming soon.</p>
          <Link 
            href="/dashboard/support" 
            className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md"
          >
            Contact Sales
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
