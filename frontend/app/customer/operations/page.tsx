
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, CheckCircle2, Clock, Download, Plus, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const OperationsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const data = (window as any).db.getUserBookings(user.id);
      setBookings(data);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-20 px-6 font-tajawal">
      <div className="container mx-auto max-w-6xl">
        
        <div className="flex justify-between items-end mb-16">
          <div>
             <h2 className="text-5xl font-black text-[#002366] tracking-tighter">سجل العمليات</h2>
             <p className="text-slate-400 font-bold text-xl mt-2">متابعة حالة التذاكر والتحميل المباشر.</p>
          </div>
          <button className="bg-[#002366] text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl flex items-center gap-4">
             حجز رحلة جديدة <Plus size={24} />
          </button>
        </div>

        <div className="space-y-6">
           {bookings.map(b => (
             <motion.div 
               key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white flex flex-col md:flex-row justify-between items-center gap-8"
             >
                <div className="flex items-center gap-8 flex-1">
                   <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border">✈️</div>
                   <div>
                      <h4 className="text-2xl font-black text-[#002366]">{b.flightSnapshot?.departure} ➔ {b.flightSnapshot?.arrival}</h4>
                      <p className="text-slate-400 font-bold">{b.passengerName} | <span className="font-mono text-indigo-600">{b.bookingRef}</span></p>
                   </div>
                </div>

                <div className="flex items-center gap-10">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-300 uppercase mb-1">حالة التذكرة</p>
                      <div className={`px-5 py-2 rounded-full text-[10px] font-black flex items-center gap-2 ${
                        b.status === 'ready' || b.status === 'ISSUED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                         {b.status === 'ready' || b.status === 'ISSUED' ? <CheckCircle2 size={14} /> : <Clock size={14} className="animate-spin" />}
                         {b.status === 'ready' || b.status === 'ISSUED' ? 'جاهزة للتحميل' : 'قيد الإصدار'}
                      </div>
                   </div>

                   { (b.status === 'ready' || b.status === 'ISSUED') ? (
                     <a href={b.ticketFileUrl} download className="bg-[#002366] text-[#C5A059] p-6 rounded-2xl shadow-xl hover:scale-110 transition-all">
                        <Download size={24} />
                     </a>
                   ) : (
                     <div className="p-6 bg-slate-50 text-slate-300 rounded-2xl">
                        <Download size={24} />
                     </div>
                   )}
                </div>
             </motion.div>
           ))}

           {bookings.length === 0 && (
             <div className="bg-white p-32 rounded-[5rem] text-center border-4 border-dashed border-slate-100">
                <span className="text-9xl opacity-5 grayscale block mb-10">🎫</span>
                <p className="text-3xl font-black text-slate-300">لا يوجد سجل عمليات حالياً</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default OperationsPage;
