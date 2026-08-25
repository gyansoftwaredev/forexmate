"use client";
import { useEffect, useState } from 'react';
import { getTestimonials } from '@/lib/api-public';

import Link from 'next/link';

export default function Testimonials() {
  const defaultReviews = [
    {
      name: "Ayush Jaiswal",
      location: "Lucknow, Uttar Pradesh",
      text: "I had to travel from Delhi to Lucknow last minute, but my forex card was scheduled for Delhi delivery. The customer service team seamlessly rerouted it to Lucknow.",
      avatar: "👨🏻",
      initial: false
    },
    {
      name: "Ashish Rana",
      location: "Noida, Uttar Pradesh",
      text: "Forexmate is highly recommended for anyone needing quick and reliable currency exchange at their doorstep, especially in urgent situations.",
      avatar: "A",
      initial: true
    },
    {
      name: "Shani Saroj",
      location: "Gurugram, Haryana",
      text: "Forexmate's exchange rates are among the best in the market, with complete transparency and no hidden charges.",
      avatar: "👨🏽",
      initial: false
    }
  ];

  const [reviews, setReviews] = useState(defaultReviews);

  useEffect(() => {
    getTestimonials()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data.map((t: any) => ({
            name: t.customerName,
            location: t.location || 'India',
            text: t.reviewText,
            avatar: t.avatarUrl || '👨🏻',
            initial: !t.avatarUrl
          })));
        }
      })
      .catch(err => console.error("Failed to load testimonials", err));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mb-20 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900">Forexmate Customer Reviews &amp; Testimonials</h2>
        <Link 
          href="/reviews"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
        >
          View All 44,000+ Reviews →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full py-2">
        {reviews.map((review, i) => (
          <Link
            key={i}
            href="/reviews"
            className="group relative w-full h-full bg-white border border-gray-200/90 hover:border-amber-400/80 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Gradient Line on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Subtle Background Glow on Hover */}
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-100/40 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex-grow flex flex-col">
              {/* Header: Avatar, Name, Location & Quote */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {review.initial ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full flex items-center justify-center text-xl font-black mr-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 shrink-0">
                      {review.avatar}
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-900 rounded-full flex items-center justify-center text-2xl mr-4 relative group-hover:scale-110 transition-all duration-300 shadow-2xs shrink-0">
                      {review.avatar}
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white text-[10px] font-black">
                        ✓
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors text-sm md:text-base leading-snug">
                      {review.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mb-1">{review.location}</p>
                    <div className="flex text-amber-400 text-sm tracking-wider group-hover:scale-105 transition-transform origin-left">
                      ★★★★★
                    </div>
                  </div>
                </div>

                <span className="text-3xl font-serif text-gray-200 group-hover:text-amber-400/60 transition-colors select-none font-bold shrink-0">
                  “
                </span>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed font-normal group-hover:text-gray-900 transition-colors flex-grow">
                "{review.text}"
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Customer
              </span>
              <span className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-xs font-black">
                ForexMate Review →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-6 text-sm font-semibold text-gray-600">
        Forexmate is Rated <span className="font-bold text-gray-900">4.7 out of 5 Stars.</span> Based on{' '}
        <Link href="/reviews" className="text-blue-600 font-bold hover:underline">
          37000+ Reviews
        </Link>
      </div>
    </div>
  );
}
