
import React, { useState } from 'react';
import { Flight } from '../types';
import { db } from '../services/mockDatabase';
import { Plane, Clock, ShieldCheck, ChevronDown, BaggageClaim, Info, Users, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  flight: Flight;
  isCheapest: boolean;
  onBook: (classType: string) => void;
}

const FlightResultCard: React.FC<Props> = ({ flight, isCheapest, onBook }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showClassSelection, setShowClassSelection] = useState(false);
  const airline = db.getAirlines().find(a => a.id === flight.airlineId);

  return (
    <div className={`bg-white rounded-[3rem] overflow-hidden transition-all hover:shadow-2xl border-4 ${isCheapest ? 'border-[#C5A059]/30 shadow-massive' : 'border-white shadow-xl'}`}>
      {isCheapest && (
        <div className="bg-[#C5A059] text-[#002366] text-[10px] font-black uppercase tracking-[0.2em] py-2 px-10 flex items-center gap-3">
           <ShieldCheck size={14} />
           <span>أفضل عرض سعري متاح للوجهة</span>
        </div>
      )}

      <div className="p-10">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          {/* Airline Branding */}
          <div className="md:col-span-3 flex items-center gap-8">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl p-4 flex items-center justify-center border shadow-inner">
                <img src={airline?.logo} className="max-w-full" alt={airline?.name} />
             </div>
             <div>
                <h4 className="font-black text-[#002366] text-lg leading-none mb-2">{flight.flightNumber}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{airline?.name}</p>
             </div>
          </div>

          {/* Route Path */}
          <div className="md:col-span-5 flex justify-between items-center px-6 relative">
             <div className="text-center">
                <p className="text-3xl font-black text-[#002366] tracking-tighter">{flight.departureTimeFormatted}</p>
                <p className="text-xs font-black text-slate-400 uppercase mt-1">{flight.departureAirport}</p>
             </div>
             
             <div className="flex-1 flex flex-col items-center px-10">
                <div className="w-full flex items-center gap-3 mb-2">
                   <div className="h-[2px] bg-slate-100 flex-1 rounded-full"></div>
                   <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                      <Plane size={18} className="text-[#002366] opacity-30" />
                   </motion.div>
                   <div className="h-[2px] bg-slate-100 flex-1 rounded-full"></div>
                </div>
                <span className="text-[9px] font-black text-[#002366] bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">مباشرة</span>
             </div>

             <div className="text-center">
                <p className="text-3xl font-black text-[#002366] tracking-tighter">{flight.arrivalTimeFormatted}</p>
                <p className="text-xs font-black text-slate-400 uppercase mt-1">{flight.arrivalAirport}</p>
             </div>
          </div>

          {/* Pricing & CTA */}
          <div className="md:col-span-4 flex items-center gap-8 justify-end border-r border-slate-50 pr-8">
             <div className="text-right">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">يبدأ من</span>
                <span className="text-4xl font-black text-[#002366] tracking-tighter">${flight.prices.selling.toLocaleString()}</span>
             </div>

             <div className="flex flex-col gap-3 min-w-[140px]">
                <button 
                  onClick={() => setShowClassSelection(!showClassSelection)} 
                  className="w-full bg-[#002366] text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
                >
                  اختر العرض
                </button>
                <button 
                 onClick={() => setShowDetails(!showDetails)}
                 className="text-[10px] font-black text-slate-400 hover:text-[#002366] flex justify-center items-center gap-2 transition-colors"
                >
                  {showDetails ? 'إخفاء التفاصيل' : 'تفاصيل الرحلة'} 
                  <ChevronDown size={14} className={`transition-transform duration-500 ${showDetails ? 'rotate-180' : ''}`} />
                </button>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showClassSelection && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#F8FAFC] border-t border-slate-100 overflow-hidden"
          >
             <div className="p-10 grid md:grid-cols-2 gap-6">
                <ClassOption 
                  title="الدرجة السياحية" 
                  price={flight.classes?.economy.sellingPrice || flight.prices.selling} 
                  seats={flight.seats.economy} 
                  icon={<Users size={20}/>} 
                  onSelect={() => onBook('economy')}
                />
                {flight.seats.business > 0 && (
                  <ClassOption 
                    title="درجة رجال الأعمال" 
                    price={flight.classes?.business.sellingPrice || flight.prices.selling * 1.8} 
                    seats={flight.seats.business} 
                    icon={<Briefcase size={20}/>} 
                    onSelect={() => onBook('business')}
                    recommended
                  />
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 p-10 border-t border-slate-100 overflow-hidden"
          >
             <div className="grid md:grid-cols-4 gap-8">
                <DetailBox icon={<BaggageClaim size={20} />} label="الأمتعة المشحونة" value="30 كجم للراكب" />
                <DetailBox icon={<Clock size={20} />} label="مدة الطيران" value="2س 30د (تقريباً)" />
                <DetailBox icon={<ShieldCheck size={20} />} label="سياسة التغيير" value="متاحة (رسوم تطبق)" />
                <DetailBox icon={<Info size={20} />} label="رقم الطائرة" value={flight.aircraftType || 'Jet'} />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ClassOption = ({ title, price, seats, icon, onSelect, recommended }: any) => (
  <button 
    onClick={onSelect}
    className={`p-8 rounded-[2rem] border-4 transition-all text-right flex justify-between items-center group
      ${recommended ? 'bg-[#002366] text-white border-[#C5A059]' : 'bg-white border-slate-100 hover:border-[#002366]'}
    `}
  >
     <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${recommended ? 'bg-[#C5A059] text-[#002366]' : 'bg-slate-50 text-[#002366]'}`}>
           {icon}
        </div>
        <div>
           <h5 className="font-black text-lg">{title}</h5>
           <p className={`text-[10px] font-bold ${recommended ? 'text-indigo-200' : 'text-slate-400'} uppercase tracking-widest mt-1`}>
             متبقي {seats} مقاعد فقط
           </p>
        </div>
     </div>
     <div className="text-left">
        <p className="text-3xl font-black tracking-tighter">${price.toLocaleString()}</p>
        <span className={`text-[9px] font-black uppercase ${recommended ? 'text-[#C5A059]' : 'text-indigo-600'}`}>حجز فوري</span>
     </div>
  </button>
);

const DetailBox = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
     <div className="text-[#002366] opacity-30">{icon}</div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
        <p className="text-sm font-black text-[#002366]">{value}</p>
     </div>
  </div>
);

export default FlightResultCard;
