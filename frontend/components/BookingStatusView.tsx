
import React, { useState, useEffect } from 'react';
import { Booking, Flight } from '../types';
import { db } from '../services/mockDatabase';

interface Props {
  bookingId: string;
  onFinish: () => void;
}

const BookingStatusView: React.FC<Props> = ({ bookingId, onFinish }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const b = db.getBookings().find(x => x.id === bookingId);
      if (b) {
        setBooking({ ...b });
        const f = db.getFlights().find(x => x.id === b.flightId);
        if (f) setFlight(f);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [bookingId]);

  if (!booking || !flight) return null;

  return (
    <div className="container mx-auto px-6 py-40 max-w-4xl animate-in fade-in duration-700">
      <div className="bg-white p-12 md:p-20 rounded-[3.5rem] shadow-massive border-8 border-slate-50 relative overflow-hidden text-center">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-[#1E3A8A]"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10">
          <div className="text-8xl mb-8 animate-bounce">✈️</div>
          <h2 className="text-5xl font-black text-[#1E3A8A] mb-4">حالة الحجز: {booking.status === 'ready' ? 'تذكرة جاهزة!' : 'قيد المعالجة'}</h2>
          <p className="text-slate-400 font-bold text-xl mb-12">المرجع: <span className="text-indigo-600 font-mono">{booking.bookingRef}</span></p>

          {/* Stepper */}
          <div className="max-w-2xl mx-auto mb-16 space-y-8">
             <StatusStep 
               active={true} 
               done={true} 
               label="تم تأكيد الدفع" 
               desc="تم خصم المبلغ وتحديث السجلات المالية بنجاح" 
               icon="✅" 
             />
             <StatusStep 
               active={true} 
               done={true} 
               label="تدقيق البيانات بالذكاء الاصطناعي" 
               desc="تمت مطابقة بيانات الجواز والتحقق من الصلاحية" 
               icon="🤖" 
             />
             <StatusStep 
               active={true} 
               done={booking.status === 'ready'} 
               label="إصدار التذكرة النهائية" 
               desc={booking.status === 'ready' ? "تم إصدار التذكرة وإرسالها للواتساب" : "الموظف المختص يقوم الآن بإصدار التذكرة من شركة الطيران"} 
               icon={booking.status === 'ready' ? "🎟️" : "⏳"} 
               loading={booking.status !== 'ready'}
             />
          </div>

          {booking.status === 'ready' ? (
            <div className="space-y-6 animate-in zoom-in duration-500">
               <a 
                 href={booking.ticketFileUrl || '#'} 
                 download={`Ticket-${booking.bookingRef}.pdf`}
                 className="inline-flex items-center gap-4 bg-emerald-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-massive hover:bg-emerald-600 transition-all transform active:scale-95"
               >
                 <span>تحميل التذكرة الآن (PDF)</span>
                 <span className="text-3xl">📥</span>
               </a>
               <p className="text-emerald-600 font-bold">نسخة احتياطية أرسلت أيضاً إلى رقمك: {booking.customerPhone}</p>
            </div>
          ) : (
            <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
               <p className="text-[#1E3A8A] font-black text-lg">بإمكانك إغلاق هذه الصفحة، سنقوم بإشعارك فور جاهزية التذكرة.</p>
            </div>
          )}

          <button 
            onClick={onFinish}
            className="mt-12 text-slate-300 font-bold hover:text-[#1E3A8A] transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusStep = ({ active, done, label, desc, icon, loading }: any) => (
  <div className={`flex gap-6 text-right items-start ${!active ? 'opacity-30' : ''}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0 transition-colors ${
      done ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-indigo-100 text-[#1E3A8A]'
    }`}>
      {loading ? <div className="loader-dots scale-50"><div></div><div></div><div></div></div> : icon}
    </div>
    <div className="flex-1 pt-1">
      <h4 className={`text-xl font-black ${done ? 'text-emerald-700' : 'text-[#1E3A8A]'}`}>{label}</h4>
      <p className="text-sm font-bold text-slate-400 mt-1">{desc}</p>
    </div>
  </div>
);

export default BookingStatusView;
