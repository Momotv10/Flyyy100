
import React from 'react';
import { db } from '../services/mockDatabase';
import { User, Booking } from '../types';

interface Props {
  user: User;
  onNewBooking: () => void;
}

const MyBookingsView: React.FC<Props> = ({ user, onNewBooking }) => {
  const bookings = db.getUserBookings(user.id);

  return (
    <div className="container mx-auto px-6 py-40 max-w-6xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="text-right">
          <h2 className="text-5xl font-black text-[#1E3A8A] mb-4">مرحباً، {user.name} 👋</h2>
          <p className="text-slate-400 font-bold text-xl">هنا تجد جميع رحلاتك المحجوزة وتذاكرك الإلكترونية.</p>
        </div>
        <button 
          onClick={onNewBooking}
          className="bg-[#FACC15] text-[#1E3A8A] px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-4"
        >
          <span>حجز رحلة جديدة</span>
          <span className="text-2xl">✈️</span>
        </button>
      </div>

      <div className="grid gap-8">
        {bookings.length > 0 ? (
          bookings.map(b => <MyBookingCard key={b.id} booking={b} />)
        ) : (
          <div className="bg-white p-24 rounded-[3.5rem] shadow-massive text-center border-4 border-dashed border-slate-100">
             <span className="text-8xl mb-8 block opacity-10">🌍</span>
             <h3 className="text-3xl font-black text-slate-300">لم تقم بأي حجوزات بعد</h3>
             <p className="text-slate-400 font-bold mt-4">ابدأ مغامرتك القادمة الآن مع STAMS</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Fix: Use React.FC to correctly handle the 'key' property during list mapping
const MyBookingCard: React.FC<{ booking: Booking }> = ({ booking }) => (
  <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-white hover:border-[#FACC15] transition-all group overflow-hidden relative">
    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
      
      {/* Flight Main Info */}
      <div className="flex items-center gap-8 flex-1">
         <div className="w-20 h-20 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border shadow-inner">
            <img src={booking.flightSnapshot.airlineLogo} className="max-w-full" alt="Airline" />
         </div>
         <div className="text-right">
            <div className="flex items-center gap-3 mb-1">
               <h4 className="text-2xl font-black text-[#1E3A8A]">{booking.flightSnapshot.departure} ✈️ {booking.flightSnapshot.arrival}</h4>
               <span className="bg-indigo-50 text-[#1E3A8A] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{booking.flightSnapshot.flightNumber}</span>
            </div>
            <p className="text-slate-400 font-bold">{new Date(booking.flightSnapshot.departureTime).toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
         </div>
      </div>

      {/* Traveler Info */}
      <div className="flex-1 border-r border-slate-50 px-10 hidden lg:block">
         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">المسافر الرئيسي</span>
         <p className="font-black text-lg text-slate-800">{booking.passengerName}</p>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{booking.passportNumber}</p>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-8">
         <div className="text-center">
            <span className={`inline-block px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
               booking.status === 'ready' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'
            }`}>
               {booking.status === 'ready' ? 'تذكرة جاهزة' : 'قيد الإصدار'}
            </span>
            <p className="text-[9px] font-bold text-slate-300 mt-2">المرجع: {booking.bookingRef}</p>
         </div>
         
         {booking.status === 'ready' ? (
           <a 
             href={booking.ticketFileUrl} 
             download 
             className="bg-[#1E3A8A] text-white p-5 rounded-2xl shadow-xl hover:bg-black transition-all transform active:scale-90"
           >
              📥
           </a>
         ) : (
           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center animate-pulse">
              ⏳
           </div>
         )}
      </div>
    </div>
  </div>
);

export default MyBookingsView;
