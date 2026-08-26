import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CorporateForexPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Enterprise Forex Solutions</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-10">
            Dedicated forex management for corporate clients. Streamline business remittances, import/export payments, and employee travel forex.
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6">Request a Corporate Account</h2>
            <p className="text-gray-600 mb-6">Contact our B2B desk to get customized pricing, API access, and dedicated account management.</p>
            <Link 
              href="/dashboard/support" 
              className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-md"
            >
              Contact Sales Team
            </Link>
            <p className="text-sm text-gray-500 mt-4">or call us at 1800-FOREX-B2B</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-3 border-b pb-2">Business Remittances</h3>
              <p className="text-gray-600 mb-4">Make payments for overseas services, software, server hosting, and more with streamlined invoicing and GST-compliant receipts.</p>
              <ul className="text-sm text-gray-500 list-disc list-inside">
                <li>Same-day TT processing</li>
                <li>Favorable corporate margins</li>
                <li>Auto-generated Form 15CA/CB support</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-3 border-b pb-2">Employee Travel</h3>
              <p className="text-gray-600 mb-4">Equip your workforce with multi-currency forex cards and cash notes for international business trips.</p>
              <ul className="text-sm text-gray-500 list-disc list-inside">
                <li>Bulk card issuance</li>
                <li>Centralized dashboard for tracking expenses</li>
                <li>Unspent currency buyback program</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
