
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { Booking } from '../types';
import { Phone, Mail, AlertCircle, Upload, CheckCircle2, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { providerId: string; }

const ProviderIssuanceManager: React.FC<Props> = ({ providerId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ticketData, setTicketData] = useState({ pnr: '', ticketNo: '' });

  useEffect(() => {
    const refresh = () => {
      // جلب الحجوزات التي تخص رحلات هذا المزود وحالتها "بانتظار الإصدار"
      const all = db.getBookings().filter(b => b.status === 'awaiting_issue');
      setBookings(all);
    };
    refresh();
    const inv = setInterval(refresh, 5000);
    return () => clearInterval(inv);
  }, [providerId]);

  const handleIssue = () => {
    if (!ticketData.pnr || !ticketData.ticketNo) return alert("يرجى إدخال بيانات التذكرة");
    db.issueTicket(selectedBooking!.id, ticketData.pnr, ticketData.ticketNo, 'https://stams.ai/tkt.pdf');
    setSelectedBooking(null);
    setTicketData({ pnr: '', ticketNo: '' });
    alert("تم إصدار التذكرة بنجاح وإرسالها للعميل! ✅");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-massive border-b-8 border-[#C5A059]">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#002147] text-[#C5A059] rounded-2xl flex items-center justify-center"><Ticket size={24}/></div>
            <div>
               <h3 className="text-2xl font-black text-[#002147]">طلبات الإصدار الواردة</h3>
               <p className="text-xs font-bold text-slate-400 mt-1">طلبات مدفوعة ومؤكدة بانتظار تزويد العميل بالـ PNR.</p>
            </div>
         </div>
      </div>

      <div className="grid gap-6">
        {bookings.map(b => (
          <div key={b.id} className="bg-white p-8 rounded-[3rem] border-4 border-white shadow-xl flex justify-between items-center group hover:border-[#002147] transition-all">
             <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">👤</div>
                <div>
                   <p className="font-black text-[#002147] text-xl">{b.passengerName}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.bookingRef} | {b.flightSnapshot?.flightNumber}</p>
                </div>
             </div>
             <div className="flex items-center gap-6">
                <div className="text-left">
                   <p className="text-[10px] font-black text-slate-300 uppercase">قيمة التذكرة</p>
                   <p className="text-xl font-black text-emerald-600">${b.totalAmount}</p>
                </div>
                <button onClick={() => setSelectedBooking(b)} className="bg-[#002147] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">فتح ملف الحجز</button>
             </div>
          </div>
        ))}
        {bookings.length === 0 && <div className="text-center py-20 text-slate-300 font-black opacity-30 text-5xl italic">لا توجد طلبات معلقة</div>}
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#002147]/90 backdrop-blur-md p-6">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[4rem] w-full max-w-6xl shadow-massive overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
               
               <div className="bg-slate-50 md:w-5/12 p-12 overflow-y-auto custom-scrollbar border-l">
                  <h4 className="text-2xl font-black text-[#002147] mb-10 border-b pb-6">وثائق السفر المدفوعة</h4>
                  <div className="space-y-10">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">صورة الجواز الرقمية</p>
                        <img src={selectedBooking.passportImage} className="w-full rounded-3xl border-4 border-white shadow-massive" alt="Passport" />
                     </div>

                     <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <h5 className="font-black text-[#002147] flex items-center gap-2"><Phone size={16} className="text-emerald-500" /> تواصل مباشر مع العميل</h5>
                        <div className="grid grid-cols-2 gap-4">
                           <a href={`https://wa.me/${selectedBooking.customerPhone}`} target="_blank" className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-emerald-100 transition-all">
                              <CheckCircle2 size={24} />
                              <span className="text-[10px] font-black">واتساب</span>
                           </a>
                           <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl flex flex-col items-center gap-2">
                              <Mail size={24} />
                              <span className="text-[10px] font-black">إيميل</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-16 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-12">
                       <div>
                          <h4 className="text-4xl font-black text-[#002147] tracking-tight">إصدار التذكرة</h4>
                          <p className="text-slate-400 font-bold mt-1 text-lg">يرجى إدخال البيانات الصادرة من نظام GDS.</p>
                       </div>
                       <button onClick={() => setSelectedBooking(null)} className="text-slate-200 hover:text-rose-500 transition-all text-3xl">✕</button>
                    </div>

                    <div className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase pr-4">رقم الحجز (PNR)</label>
                             <input type="text" value={ticketData.pnr} onChange={e => setTicketData({...ticketData, pnr: e.target.value.toUpperCase()})} className="w-full p-6 bg-slate-50 rounded-3xl font-black text-2xl text-[#002147] border-4 border-transparent focus:border-[#C5A059] outline-none transition-all" placeholder="XY7890" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase pr-4">رقم التذكرة الإلكتروني</label>
                             <input type="text" value={ticketData.ticketNo} onChange={e => setTicketData({...ticketData, ticketNo: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl font-black text-2xl text-[#002147] border-4 border-transparent focus:border-[#C5A059] outline-none transition-all" placeholder="00123456..." />
                          </div>
                       </div>
                       <div className="p-16 border-4 border-dashed border-slate-100 rounded-[3.5rem] text-center bg-slate-50/30 hover:bg-white hover:border-[#002147]/10 transition-all cursor-pointer group">
                          <Upload className="mx-auto text-slate-200 mb-6 group-hover:text-[#002147] transition-all" size={64} />
                          <p className="font-black text-slate-300 group-hover:text-[#002147] text-xl">ارفق ملف التذكرة بصيغة PDF</p>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleIssue}
                    className="w-full bg-[#002147] text-[#C5A059] py-8 rounded-[2.5rem] font-black text-2xl shadow-massive hover:bg-black transition-all transform active:scale-95 mt-12"
                  >
                    تأكيد الإصدار وإرسال الإشعار آلياً 🚀
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProviderIssuanceManager;
