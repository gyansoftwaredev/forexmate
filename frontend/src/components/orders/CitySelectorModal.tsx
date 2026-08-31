import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, X } from 'lucide-react';
import { getActiveCities } from '@/lib/api-public';


const popularCities = [
  { name: 'Delhi', state: 'Delhi (NCT)', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=120&h=120&fit=crop&q=80' },
  { name: 'Bangalore', state: 'Karnataka', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=120&h=120&fit=crop&q=80' },
  { name: 'Mumbai', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=120&h=120&fit=crop&q=80' },
  { name: 'Pune', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=120&h=120&fit=crop&q=80' },
  { name: 'Hyderabad', state: 'Telangana', img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=120&h=120&fit=crop&q=80' },
  { name: 'Chennai', state: 'Tamil Nadu', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=120&h=120&fit=crop&q=80' }
];

const allCities = [
  { name: 'Agra', state: 'Uttar Pradesh', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=120&h=120&fit=crop&q=80' },
  { name: 'Ahmedabad', state: 'Gujarat', img: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=120&h=120&fit=crop&q=80' },
  { name: 'Amritsar', state: 'Punjab', img: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=120&h=120&fit=crop&q=80' },
  { name: 'Anand', state: 'Gujarat', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=120&h=120&fit=crop&q=80' },
  { name: 'Aurangabad', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=120&fit=crop&q=80' },
  { name: 'Bareilly', state: 'Uttar Pradesh', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=120&h=120&fit=crop&q=80' },
  { name: 'Bhopal', state: 'Madhya Pradesh', img: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=120&h=120&fit=crop&q=80' },
  { name: 'Bhubaneswar', state: 'Odisha', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=120&h=120&fit=crop&q=80' },
  { name: 'Chandigarh', state: 'Chandigarh', img: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=120&h=120&fit=crop&q=80' },
  { name: 'Coimbatore', state: 'Tamil Nadu', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=120&h=120&fit=crop&q=80' },
  { name: 'Dehradun', state: 'Uttarakhand', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=120&h=120&fit=crop&q=80' },
  { name: 'Dilsukh Nagar', state: 'Telangana', img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=120&h=120&fit=crop&q=80' },
  { name: 'Ernakulam', state: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=120&h=120&fit=crop&q=80' },
  { name: 'Faridabad', state: 'Haryana', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=120&h=120&fit=crop&q=80' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=120&h=120&fit=crop&q=80' },
  { name: 'Goa', state: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=120&h=120&fit=crop&q=80' },
  { name: 'Guntur', state: 'Andhra Pradesh', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=120&h=120&fit=crop&q=80' },
  { name: 'Gurgaon', state: 'Haryana', img: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=120&h=120&fit=crop&q=80' },
  { name: 'Guwahati', state: 'Assam', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=120&h=120&fit=crop&q=80' },
  { name: 'Gwalior', state: 'Madhya Pradesh', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=120&h=120&fit=crop&q=80' },
  { name: 'Indore', state: 'Madhya Pradesh', img: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=120&h=120&fit=crop&q=80' },
  { name: 'Jaipur', state: 'Rajasthan', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=120&h=120&fit=crop&q=80' },
  { name: 'Jalandhar', state: 'Punjab', img: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=120&h=120&fit=crop&q=80' },
  { name: 'Kochi', state: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=120&h=120&fit=crop&q=80' },
  { name: 'Kolkata', state: 'West Bengal', img: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=120&h=120&fit=crop&q=80' },
  { name: 'Lucknow', state: 'Uttar Pradesh', img: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=120&h=120&fit=crop&q=80' },
  { name: 'Ludhiana', state: 'Punjab', img: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=120&h=120&fit=crop&q=80' },
  { name: 'Madurai', state: 'Tamil Nadu', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=120&h=120&fit=crop&q=80' },
  { name: 'Mangalore', state: 'Karnataka', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=120&h=120&fit=crop&q=80' },
  { name: 'Mysore', state: 'Karnataka', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=120&h=120&fit=crop&q=80' },
  { name: 'Nagpur', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=120&h=120&fit=crop&q=80' },
  { name: 'Nashik', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=120&h=120&fit=crop&q=80' },
  { name: 'Noida', state: 'Uttar Pradesh', img: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=120&h=120&fit=crop&q=80' },
  { name: 'Patna', state: 'Bihar', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=120&h=120&fit=crop&q=80' },
  { name: 'Surat', state: 'Gujarat', img: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=120&h=120&fit=crop&q=80' },
  { name: 'Thane', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=120&h=120&fit=crop&q=80' },
  { name: 'Thiruvananthapuram', state: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=120&h=120&fit=crop&q=80' },
  { name: 'Udaipur', state: 'Rajasthan', img: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=120&h=120&fit=crop&q=80' },
  { name: 'Vadodara', state: 'Gujarat', img: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=120&h=120&fit=crop&q=80' },
  { name: 'Varanasi', state: 'Uttar Pradesh', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=120&h=120&fit=crop&q=80' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=120&h=120&fit=crop&q=80' },
];

function CityAvatar({ src, name }: { src?: string; name: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 flex items-center justify-center font-black text-xs">
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name} 
      onError={() => setError(true)} 
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
    />
  );
}

export function CitySelectorModal({ 
  isOpen, 
  onClose, 
  onSelect,
  onSelectCity
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSelect?: (city: string) => void,
  onSelectCity?: (city: string) => void
}) {
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [dbCities, setDbCities] = useState<any[]>([]);

  const handleSelectCity = (cityName: string) => {
    if (typeof onSelect === 'function') onSelect(cityName);
    if (typeof onSelectCity === 'function') onSelectCity(cityName);
    onClose();
  };

  useEffect(() => {
    setMounted(true);
    getActiveCities()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbCities(data);
        }
      })
      .catch(() => {});
  }, []);

  const mergedAllCities = useMemo(() => {
    const list = [...allCities];
    dbCities.forEach((dbc: any) => {
      if (
        !list.some(c => c.name.toLowerCase() === dbc.name.toLowerCase()) &&
        !popularCities.some(c => c.name.toLowerCase() === dbc.name.toLowerCase())
      ) {
        list.push({
          name: dbc.name,
          state: dbc.state || 'India',
          img: undefined as any
        });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [dbCities]);

  if (!isOpen || !mounted) return null;

  const filteredPopular = popularCities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase()));
  const filteredAll = mergedAllCities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase()));


  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200">
        
        {/* Header with Title & Close button */}
        <div className="p-4 px-5 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Select Delivery City</span>
            </h3>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar & Detect Location */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search city name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-amber-500 rounded-xl outline-none text-xs text-slate-900 font-medium transition-colors shadow-2xs bg-slate-50/80 focus:bg-white"
                autoFocus
              />
            </div>
            <button 
              onClick={() => handleSelectCity('Delhi')}
              className="flex items-center text-amber-700 font-extrabold text-xs shrink-0 hover:bg-amber-100/70 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-600" /> Detect
            </button>
          </div>
        </div>

        {/* Lists Container */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          
          {/* Popular Cities */}
          {filteredPopular.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center px-3 py-2 bg-white sticky top-0 z-10 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-amber-700">Popular Cities</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredPopular.map(city => (
                  <div 
                    key={city.name} 
                    onClick={() => handleSelectCity(city.name)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-amber-50/60 cursor-pointer rounded-xl group transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg overflow-hidden mr-3 bg-slate-100 border border-slate-200 shrink-0">
                        <CityAvatar src={city.img} name={city.name} />
                      </div>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-amber-700 transition-colors">{city.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{city.state}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Cities */}
          {filteredAll.length > 0 && (
            <div>
              <div className="flex justify-between items-center px-3 py-2 bg-white sticky top-0 z-10 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-amber-700">{search ? 'Search Results' : 'All Cities'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</span>
              </div>
              <div className="grid grid-cols-1 gap-1 mt-1">
                {filteredAll.map(city => (
                  <div 
                    key={city.name} 
                    onClick={() => handleSelectCity(city.name)}
                    className="flex justify-between items-center px-3 py-2 hover:bg-amber-50/60 cursor-pointer rounded-xl group transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded-lg overflow-hidden mr-3 bg-slate-100 border border-slate-200 shrink-0">
                        <CityAvatar src={city.img} name={city.name} />
                      </div>
                      <span className="font-bold text-slate-800 text-xs group-hover:text-amber-700">{city.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{city.state}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredPopular.length === 0 && filteredAll.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="bg-slate-100 p-3 rounded-full mb-3">
                 <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No cities found</h3>
              <p className="text-slate-500 text-xs">We couldn't find a city matching "{search}"</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
