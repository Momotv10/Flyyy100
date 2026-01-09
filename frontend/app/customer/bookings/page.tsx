
import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, User, Ticket, CheckCircle2, Clock, Download, Plus, ChevronRight } from 'lucide-react';
import { db } from '../../../services/mockDatabase';

const CustomerBookingsPage = ({ user, onNewBooking }: any) => {
  const bookings = db.getUserBookings(user.id);

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="text-right">
             <h2 className="text-5xl font-black text-[#002366] tracking-tighter">مرحباً، {user.name} 👋</h2>
             <p className="text-slate-400 font-bold text-xl mt-2">قائمة العمليات والحجوزات الإلكترونية الخاصة بك.</p>
          </div>
          <button 
            onClick={onNewBooking}
            className="bg-[#002366] text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-massive hover:scale-105 transition-all flex items-center gap-4"
          >
             <span>حجز رحلة جديدة</span>
             <Plus size={24} className="text-amber-500" />
          </button>
        </div>

        <div className="grid gap-8">
           {bookings.length > 0 ? (
             bookings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(b => (
               <motion.div 
                 key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-white p-10 rounded-[4rem] shadow-massive border-4 border-white hover:border-[#C5A059]/20 transition-all group overflow-hidden relative"
               >
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
                     {/* Flight Info */}
                     <div className="flex items-center gap-8 flex-1">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] p-5 flex items-center justify-center border shadow-inner">
                           <img src={b.flightSnapshot?.airlineLogo} className="max-w-full" alt="Airline" />
                        </div>
                        <div className="text-right">
                           <div className="flex items-center gap-4 mb-2">
                              <h4 className="text-3xl font-black text-[#002366] tracking-tighter">{b.flightSnapshot?.departure} ➔ {b.flightSnapshot?.arrival}</h4>
                              <span className="bg-indigo-50 text-[#002366] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{b.flightSnapshot?.flightNumber}</span>
                           </div>
                           <p className="text-slate-400 font-bold text-lg flex items-center gap-2"><Calendar size={20} className="text-amber-500" /> {new Date(b.flightSnapshot?.departureTime || '').toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                     </div>

                     {/* Traveler & Price */}
                     <div className="flex-1 border-x border-slate-50 px-12 hidden lg:block text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">المسافر الرئيسي</p>
                        <p className="text-2xl font-black text-[#002366]">{b.passengerName}</p>
                        <div className="mt-4 flex items-center gap-4 text-xs font-black text-indigo-600">
                           <span className="bg-indigo-50 px-3 py-1 rounded-lg">المبلغ: ${b.totalAmount}</span>
                           <span className="bg-emerald-50 px-3 py-1 rounded-lg text-emerald-600">مدفوع ✓</span>
                        </div>
                     </div>

                     {/* Status & Action */}
                     <div className="flex flex-col items-center lg:items-end gap-6 min-w-[200px]">
                        <div className={`px-8 py-3 rounded-2xl flex items-center gap-3 font-black text-sm shadow-sm ${
                          b.status === 'ready' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                           {b.status === 'ready' ? <CheckCircle2 size={18} /> : <Clock size={18} className="animate-pulse" />}
                           <span>{b.status === 'ready' ? 'تذكرة جاهزة' : 'قيد الإصدار'}</span>
                        </div>
                        
                        {b.status === 'ready' ? (
                          <a 
                            href={b.ticketFileUrl} download 
                            className="bg-[#002366] text-[#C5A059] px-10 py-5 rounded-[2rem] shadow-massive hover:bg-black transition-all flex items-center gap-4 text-lg font-black"
                          >
                             <span>تحميل التذكرة</span>
                             <Download size={24} />
                          </a>
                        ) : (
                          <div className="text-[10px] font-bold text-slate-400 text-center leading-relaxed">الموظف يقوم الآن بالإصدار من شركة الطيران، سيتم إشعارك فوراً.</div>
                        )}
                     </div>
                  </div>
               </motion.div>
             ))
           ) : (
             <div className="bg-white p-32 rounded-[5rem] shadow-massive text-center border-8 border-dashed border-slate-50">
                <div className="text-9xl mb-12 block grayscale opacity-10">🎫</div>
                <h3 className="text-4xl font-black text-slate-300 tracking-tighter">لا يوجد سجل عمليات حالياً</h3>
                <p className="text-slate-400 font-bold text-xl mt-4">ابدأ رحلتك الأولى مع STAMS اليوم.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingsPage;
