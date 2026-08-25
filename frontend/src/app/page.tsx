import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroForm from '@/components/HeroForm';
import RatesRibbon from '@/components/RatesRibbon';
import AlphaChatBot from '@/components/AlphaChatBot';

const ValueProps = dynamic(() => import('@/components/ValueProps'));
const ExploreProducts = dynamic(() => import('@/components/ExploreProducts'));
const TrustSection = dynamic(() => import('@/components/TrustSection'));
const Testimonials = dynamic(() => import('@/components/Testimonials'));
const PromoBanner = dynamic(() => import('@/components/PromoBanner'));
const MediaMentions = dynamic(() => import('@/components/MediaMentions'));
const FAQSection = dynamic(() => import('@/components/FAQSection'));

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Premium Multi-Tone Gradient Hero Background with Travel Imagery */}
      <div 
        className="absolute top-0 left-0 w-full h-[540px] border-b-4 border-orange-500 z-0 overflow-hidden bg-cover bg-right md:bg-right bg-no-repeat"
        style={{ backgroundImage: `url('/travel_hero.png')` }}
      >
        {/* Subtle color overlays to make sure the left-side text has incredible readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-transparent"></div>
        <div className="absolute top-[-50px] left-1/4 w-[500px] h-[500px] bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-[80px] right-1/4 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 relative z-10 pt-3">
        
        <HeroForm />
        <RatesRibbon />
        <ValueProps />
        <ExploreProducts />
        <TrustSection />
        <Testimonials />
        <PromoBanner />
        <MediaMentions />
        <FAQSection />

      </div>

      {/* Alpha AI Guide - Strictly Homepage Only */}
      <AlphaChatBot />

      {/* Footer */}
      <Footer />
    </div>
  );
}
