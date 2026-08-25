"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Star, ShieldCheck, CheckCircle2, ThumbsUp, MapPin, 
  Sparkles, ArrowRight, MessageSquare, Filter, Building2, 
  ExternalLink, Search, Award, TrendingUp, Users, Heart
} from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  product: 'CASH' | 'CARD' | 'REMITTANCE' | 'SELL';
  productLabel: string;
  date: string;
  title: string;
  text: string;
  verified: boolean;
  avatarBg: string;
  initials: string;
  likes: number;
}

const REVIEWS_DATABASE: ReviewItem[] = [
  {
    id: '1',
    name: 'Ayush Jaiswal',
    location: 'Lucknow, Uttar Pradesh',
    rating: 5,
    product: 'CARD',
    productLabel: 'Multi-Currency Forex Card',
    date: 'August 18, 2026',
    title: 'Seamless rerouting to Lucknow in emergency!',
    text: 'I had to travel from Delhi to Lucknow last minute, but my forex card was scheduled for Delhi delivery. The ForexMate customer service team seamlessly rerouted it to Lucknow within 12 hours. Zero stress and smooth activation in Singapore & Dubai.',
    verified: true,
    avatarBg: 'from-blue-600 to-indigo-600',
    initials: 'AJ',
    likes: 42
  },
  {
    id: '2',
    name: 'Ashish Rana',
    location: 'Noida, Sector 62',
    rating: 5,
    product: 'CASH',
    productLabel: 'Foreign Currency Cash Notes',
    date: 'August 14, 2026',
    title: 'Quick doorstep cash delivery in pristine condition',
    text: 'ForexMate is highly recommended for anyone needing quick and reliable currency exchange at their doorstep, especially in urgent situations. The executive was polite, carried counterfeit detector, and notes were crisp 2021+ series.',
    verified: true,
    avatarBg: 'from-amber-500 to-amber-700',
    initials: 'AR',
    likes: 38
  },
  {
    id: '3',
    name: 'Shani Saroj',
    location: 'Gurugram, Cyber City',
    rating: 5,
    product: 'REMITTANCE',
    productLabel: 'Outward Student Remittance',
    date: 'August 10, 2026',
    title: 'University tuition wired within 8 hours with SWIFT MT103',
    text: 'ForexMate’s exchange rates are among the best in the market, with complete transparency and zero hidden bank charges. Sent $18,500 USD for my daughter’s semester fee at UT Austin. Got the swift confirmation copy the exact same evening!',
    verified: true,
    avatarBg: 'from-emerald-600 to-teal-700',
    initials: 'SS',
    likes: 56
  },
  {
    id: '4',
    name: 'Dr. Meenakshi Sundaram',
    location: 'Bengaluru, Indiranagar',
    rating: 5,
    product: 'CARD',
    productLabel: 'Forex Travel Card',
    date: 'August 06, 2026',
    title: 'Zero markup in Europe on 8 countries tour',
    text: 'Used the ForexMate Visa Platinum card across Switzerland, France, and Italy. Real-time spends in Euro and CHF with zero cross-currency markup saved me over ₹14,000 compared to regular ICICI bank credit card. Instant reloading from mobile app!',
    verified: true,
    avatarBg: 'from-purple-600 to-indigo-700',
    initials: 'MS',
    likes: 29
  },
  {
    id: '5',
    name: 'Vikramaditya Roy',
    location: 'Kolkata, Salt Lake',
    rating: 5,
    product: 'SELL',
    productLabel: 'Sell Foreign Currency Cash',
    date: 'July 29, 2026',
    title: 'Instant bank transfer payout for leftover British Pounds',
    text: 'Had £1,400 GBP left after my UK business tour. Selected Branch Visit at Kolkata vault, surrendered cash notes and received ₹1,47,000 directly in my HDFC bank account via IMPS in less than 10 minutes. Super transparent buyback rate!',
    verified: true,
    avatarBg: 'from-rose-600 to-pink-700',
    initials: 'VR',
    likes: 31
  },
  {
    id: '6',
    name: 'Sneha Kulkarni',
    location: 'Pune, Baner',
    rating: 5,
    product: 'CASH',
    productLabel: 'Foreign Currency Notes',
    date: 'July 24, 2026',
    title: 'Best live rates compared to local exchange dealers',
    text: 'I compared rates across 4 local money changers in Pune and BookMyForex/ForexMate beat all of them by almost 80 paise per Euro. Delivered safely to my society with tamper-proof security pouch. Will definitely use again for all family holidays.',
    verified: true,
    avatarBg: 'from-cyan-600 to-blue-700',
    initials: 'SK',
    likes: 47
  },
  {
    id: '7',
    name: 'Rohan Malhotra',
    location: 'Delhi, South Extension',
    rating: 5,
    product: 'REMITTANCE',
    productLabel: 'Overseas Education Wire',
    date: 'July 18, 2026',
    title: 'Hassle-free LRS A2 clearance without physical bank branch visits',
    text: 'Our traditional bank asked for 3 branch visits and 4 days just to process the GIC payment for Canada student visa. On ForexMate, uploaded documents online and payment was cleared with RBI A2 compliance in one seamless flow.',
    verified: true,
    avatarBg: 'from-amber-600 to-orange-700',
    initials: 'RM',
    likes: 64
  },
  {
    id: '8',
    name: 'Ananya Deshmukh',
    location: 'Mumbai, Andheri West',
    rating: 5,
    product: 'CARD',
    productLabel: 'Multi-Currency Card',
    date: 'July 12, 2026',
    title: 'Loved the instant app lock and contactless NFC tap',
    text: 'The ForexMate travel card is a gamechanger for solo international travelers. The app lets you freeze card, set ATM limits, and convert between USD, SGD, and THB instantly without visiting any counter.',
    verified: true,
    avatarBg: 'from-violet-600 to-purple-800',
    initials: 'AD',
    likes: 22
  },
  {
    id: '9',
    name: 'Captain Rajiv Nambiar',
    location: 'Chennai, Anna Nagar',
    rating: 5,
    product: 'CASH',
    productLabel: 'Currency Notes (Japanese Yen)',
    date: 'July 05, 2026',
    title: 'Crisp 10,000 JPY notes for Tokyo vacation',
    text: 'Japanese Yen is difficult to find in large quantities at airport counters without massive 8% commission. ForexMate provided ¥300,000 JPY at interbank rates with zero commission. Exceptional service!',
    verified: true,
    avatarBg: 'from-emerald-700 to-green-800',
    initials: 'RN',
    likes: 35
  }
];

export default function ReviewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CASH' | 'CARD' | 'REMITTANCE' | 'SELL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredReviews = REVIEWS_DATABASE.filter(r => {
    const matchesCategory = selectedCategory === 'ALL' || r.product === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#071426] text-white pt-12 pb-16 px-4 md:px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-extrabold text-xs tracking-wider uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Rated 4.7 / 5.0 Across 44,000+ Verified Customer Reviews
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            ForexMate Customer <span className="text-amber-400">Reviews &amp; Ratings</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-medium">
            Over <strong>6.5 Lakh+ travelers, students, and businesses</strong> have trusted ForexMate to exchange over <strong>USD $1.7 Billion+</strong> with zero markup and guaranteed doorstep delivery.
          </p>

          {/* Aggregate Rating Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center space-y-1">
              <div className="flex justify-center text-amber-400 text-sm">★★★★★</div>
              <p className="font-black text-white text-xl">4.9 / 5.0</p>
              <p className="text-[11px] text-slate-300 font-bold uppercase">Google Reviews (Delhi NCR)</p>
              <span className="text-[10px] text-amber-300 font-semibold">7,650+ verified</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center space-y-1">
              <div className="flex justify-center text-amber-400 text-sm">★★★★★</div>
              <p className="font-black text-white text-xl">4.8 / 5.0</p>
              <p className="text-[11px] text-slate-300 font-bold uppercase">Google Play Store</p>
              <span className="text-[10px] text-amber-300 font-semibold">11,370+ reviews</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center space-y-1">
              <div className="flex justify-center text-amber-400 text-sm">★★★★★</div>
              <p className="font-black text-white text-xl">4.8 / 5.0</p>
              <p className="text-[11px] text-slate-300 font-bold uppercase">Trustpilot Global</p>
              <span className="text-[10px] text-amber-300 font-semibold">2,120+ ratings</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center space-y-1">
              <div className="flex justify-center text-amber-400 text-sm">★★★★★</div>
              <p className="font-black text-white text-xl">4.7 / 5.0</p>
              <p className="text-[11px] text-slate-300 font-bold uppercase">Apple App Store</p>
              <span className="text-[10px] text-amber-300 font-semibold">4,980+ reviews</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link 
              href="/buy-forex" 
              className="btn-gold px-8 py-3.5 rounded-xl font-extrabold text-xs md:text-sm text-slate-950 shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Book Forex Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/forex-cards" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3.5 rounded-xl font-extrabold text-xs md:text-sm transition-all"
            >
              Get Multi-Currency Card
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex-grow space-y-8">
        
        {/* Search & Category Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Reviews (44k+)' },
              { id: 'CASH', label: '💵 Currency Notes' },
              { id: 'CARD', label: '💳 Forex Travel Card' },
              { id: 'REMITTANCE', label: '✈️ Money Remittance' },
              { id: 'SELL', label: '🔄 Sell Forex' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, name, experience..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 outline-none bg-slate-50/50"
            />
          </div>

        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => {
            const isLiked = likedReviews[rev.id];
            const likeCount = rev.likes + (isLiked ? 1 : 0);

            return (
              <div 
                key={rev.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 p-5 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
              >
                <div className="space-y-3">
                  {/* Top Bar: User Info & Product Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${rev.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform`}>
                        {rev.initials}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                          {rev.name}
                        </h3>
                        <p className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {rev.location}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {rev.productLabel}
                    </span>
                  </div>

                  {/* Stars & Date */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex text-amber-400 text-sm">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">{rev.date}</span>
                  </div>

                  {/* Review Title */}
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                    "{rev.title}"
                  </h4>

                  {/* Review Text */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {rev.text}
                  </p>
                </div>

                {/* Card Footer: Verified Badge & Helpful Like Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Transaction
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleLike(rev.id)}
                    className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-colors ${
                      isLiked 
                        ? 'bg-amber-50 text-amber-800 border-amber-300' 
                        : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({likeCount})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges Bar */}
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-blue-500/10 border border-amber-200/60 rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">100% RBI Authorized</h3>
              <p className="text-xs text-slate-600 font-medium">Full FEMA compliance under Reserve Bank of India Category II License.</p>
            </div>

            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Zero Commission Guarantee</h3>
              <p className="text-xs text-slate-600 font-medium">Live interbank rates with zero hidden charges and frozen rate protection.</p>
            </div>

            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Same-Day Doorstep Delivery</h3>
              <p className="text-xs text-slate-600 font-medium">Available across 150+ Indian cities and 400+ vault partner branches.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
