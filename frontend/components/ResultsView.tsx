
import React, { useState, useMemo } from 'react';
import { Flight, Airline } from '../types';
import { db } from '../services/mockDatabase';
import FlightResultCard from './FlightResultCard';
import { Filter, SortAsc, MapPin, Calendar, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsViewProps {
  flights: Flight[];
  onBook: (flight: Flight) => void;
  onModifySearch: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ flights, onBook, onModifySearch }) => {
  const [sortBy, setSortBy] = useState<'price' | 'departure'>('price');
  const [filterAirline, setFilterAirline] = useState<string>('all');
  
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    if (!flights || flights.length === 0) return 5000;
    const prices = flights.map(f => f.prices?.selling).filter(p => p !== undefined) as number[];
    return prices.length > 0 ? Math.max(...prices) : 5000;
  });

  const airlines = useMemo(() => db.getAirlines(), []);

  const filteredFlights = useMemo(() => {
    let result = [...flights];
    if (filterAirline !== 'all') result = result.filter(f => f.airlineId === filterAirline);
    result = result.filter(f => (f.prices?.selling || 0) <= maxPrice);

    result.sort((a, b) => {
      if (sortBy === 'price') return (a.prices?.selling || 0) - (b.prices?.selling || 0);
      if (sortBy === 'departure') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      return 0;
    });

    return result;
  }, [flights, sortBy, filterAirline, maxPrice]);

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      {/* Dynamic Search Context Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 bg-white/60 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-massive"
      >
        <div className="flex items-center gap-10 text-right">
           <div className="hidden lg:block w-16 h-16 bg-[#002366] text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-900/30">✈️</div>
           <div>
              <h2 className="text-4xl font-black text-[#002366] tracking-tighter">الرحلات المستكشفة</h2>
              <div className="flex items-center gap-4 mt-2 text-slate-400 font-bold">
                 <span className="flex items-center gap-1"><MapPin size={14}/> {flights[0]?.departureAirport}</span>
                 <span className="text-indigo-200">➔</span>
                 <span className="flex items-center gap-1"><MapPin size={14}/> {flights[0]?.arrivalAirport}</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-2"></span>
                 <span className="flex items-center gap-1"><Calendar size={14}/> {flights[0]?.departureDate}</span>
              </div>
           </div>
        </div>
        <button 
          onClick={onModifySearch}
          className="px-10 py-5 bg-[#002366] text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3 transform active:scale-95"
        >
          ✏️ تعديل معايير البحث
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-8 h-fit lg:sticky lg:top-32 animate-in fade-in slide-in-from-right duration-700">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-massive border border-slate-50 space-y-10">
            <div>
              <h4 className="font-black text-lg mb-6 text-[#002366] flex items-center gap-3"><SortAsc size={20}/> فرز النتائج</h4>
              <div className="flex flex-col gap-3">
                <SortOption active={sortBy === 'price'} onClick={() => setSortBy('price')} label="الأقل سعراً" icon="💰" />
                <SortOption active={sortBy === 'departure'} onClick={() => setSortBy('departure')} label="الأقرب موعداً" icon="⏰" />
              </div>
            </div>

            <div className="border-t pt-8">
              <h4 className="font-black text-lg mb-6 text-[#002366] flex items-center gap-3"><Filter size={20}/> شركات الطيران</h4>
              <select 
                value={filterAirline}
                onChange={(e) => setFilterAirline(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-[#002366] transition-all"
              >
                <option value="all">جميع الشركات</option>
                {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-lg text-[#002366]">الميزانية القصوى</h4>
                <span className="font-black text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">${maxPrice}</span>
              </div>
              <input 
                type="range" min="0" max={5000} value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#002366]"
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#002366] to-[#001a4d] p-10 rounded-[3rem] text-white shadow-massive relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/20 transition-all"></div>
             <h5 className="text-2xl font-black mb-4 text-[#C5A059]">تنبيه الأسعار!</h5>
             <p className="text-xs font-bold text-indigo-100/80 leading-relaxed mb-8">هل ترغب بتنبيهك عند انخفاض سعر هذا المسار؟ فعل التنبيهات الآن.</p>
             <button className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black text-xs transition-all border border-white/10">تفعيل التنبيهات الذكية</button>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredFlights.length > 0 ? (
              filteredFlights.map((flight, index) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FlightResultCard 
                    flight={flight} 
                    isCheapest={index === 0 && sortBy === 'price'} 
                    onBook={() => onBook(flight)} 
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-40 bg-white rounded-[4rem] shadow-massive border-4 border-dashed border-slate-100"
              >
                 <span className="text-9xl mb-10 block grayscale opacity-10">🌍</span>
                 <h3 className="text-3xl font-black text-slate-300">لم نجد رحلات مطابقة</h3>
                 <p className="text-slate-400 font-bold mt-4">حاول تغيير التاريخ أو مطار المغادرة للحصول على نتائج أفضل.</p>
                 <button onClick={onModifySearch} className="mt-10 text-[#002366] font-black underline underline-offset-8 decoration-4 hover:text-indigo-600 transition-colors">إعادة ضبط البحث</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SortOption = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all border-2 ${
      active ? 'bg-[#002366] text-white border-[#002366] shadow-xl scale-[1.02]' : 'bg-white text-slate-400 border-slate-50 hover:border-indigo-100'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </button>
);

export default ResultsView;
