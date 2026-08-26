import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CorporateSolutionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-3xl mx-auto text-center bg-white p-12 rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🏢</div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Corporate Forex Solutions</h1>
          <p className="text-xl text-gray-600 mb-8">Dedicated relationship managers and wholesale rates for enterprise travel and remittance needs. Coming soon.</p>
          <Link 
            href="/dashboard/support" 
            className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
          >
            Get in Touch
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
