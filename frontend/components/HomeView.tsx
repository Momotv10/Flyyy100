
import React, { useState } from 'react';
import { AIRPORTS } from '../services/airportData';
import { Plane, MapPin, Calendar, Search, ArrowRightLeft, Globe, ShieldCheck, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { bookingApi } from '../services/api-client';

interface Props {
  onSearch: (results: any[]) => void;
  onBookingStart: (flight: any) => void;
  currency: string;
}

const HomeView: React.FC<Props> = ({ onSearch, onBookingStart }) => {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    isRoundTrip: false
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      alert("يرجى إكمال معايير البحث (المغادرة، الوجهة، والتاريخ)");
      return;
    }

    setIsSearching(true);
    try {
      // الاتصال الفعلي بالباك-أند
      const response = await bookingApi.searchFlights({
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.date
      });
      
      // تمرير النتائج للمكون الأب لعرضها في ResultsView
      onSearch(response.data || []);
    } catch (error) {
      console.error("Search Error:", error);
      alert("عفواً، حدث خطأ أثناء جلب الرحلات. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSearching(false);
    }
  };

  const swapAirports = () => {
    setSearchParams(prev => ({ ...prev, from: prev.to, to: prev.from }));
  };

  return (
    <div className="relative min-h-[80vh]">
      <div className="container mx-auto px-6 pt-12 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <Star size={14} /> الخيار الأول لوكلاء السفر في الشرق الأوسط
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#002366] mb-6 leading-tight">
            سافر بذكاء، <span className="text-amber-500">احجز بيقين</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            المنصة الموحدة لربط شركات الطيران والوكلاء بنظام إصدار فوري مدعوم بالذكاء الاصطناعي.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative z-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-4 space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">مبدأ الرحلة</label>
              <div className="relative group">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#002366]" />
                <select 
                  value={searchParams.from}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#002366] focus:bg-white p-4 pr-12 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
                  onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                >
                  <option value="">من أين؟</option>
                  {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                </select>
              </div>
            </div>

            <div className="lg:col-span-1 flex justify-center pb-2">
              <button 
                onClick={swapAirports}
                className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-[#002366] hover:bg-[#002366] hover:text-white transition-all shadow-sm"
              >
                <ArrowRightLeft size={20} />
              </button>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الوجهة</label>
              <div className="relative group">
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#002366]" />
                <select 
                  value={searchParams.to}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#002366] focus:bg-white p-4 pr-12 rounded-2xl font-bold text-sm outline-none transition-all appearance-none"
                  onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                >
                  <option value="">إلى أين؟</option>
                  {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                </select>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ</label>
              <div className="relative group">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#002366]" />
                <input 
                  type="date" 
                  value={searchParams.date}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#002366] focus:bg-white p-4 pr-12 rounded-2xl font-bold text-sm outline-none transition-all"
                  onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <button 
                disabled={isSearching}
                onClick={handleSearch}
                className="w-full bg-[#002366] text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="animate-spin" /> : <Search size={20} />} 
                بحث الآن
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale">
          <div className="flex items-center gap-2 font-black text-xl"><ShieldCheck /> SECURE PAY</div>
          <div className="flex items-center gap-2 font-black text-xl"><Globe /> GLOBAL CONNECT</div>
          <div className="flex items-center gap-2 font-black text-xl">IATA CERTIFIED</div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
