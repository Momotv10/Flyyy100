
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { Booking, Flight, Airline } from '../types';
import { notificationService } from '../services/notificationService';
import { issuanceEngine } from '../services/issuanceEngine';

const BookingsManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(db.getBookings());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [issueData, setIssueData] = useState({ pnr: '', ticketNumber: '', note: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'issued'>('pending');

  useEffect(() => {
    const interval = setInterval(() => {
      setBookings(db.getBookings());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualIssue = async () => {
    if (!selectedBooking || !issueData.pnr || !issueData.ticketNumber) {
      alert("يرجى إدخال كافة البيانات المطلوبة.");
      return;
    }
    setIsProcessing(true);
    // محاكاة معالجة الرد يدوياً عبر المحرك الذكي
    const rawResponse = `PNR: ${issueData.pnr}, Ticket: ${issueData.ticketNumber}. Issued manually by staff. Note: ${issueData.note}`;
    await issuanceEngine.processStaffResponse(rawResponse, selectedBooking.bookingRef);
    
    setBookings(db.getBookings());
    setSelectedBooking(null);
    setIssueData({ pnr: '', ticketNumber: '', note: '' });
    setIsProcessing(false);
    alert("تم اعتماد الإصدار وتنبيه العميل والقييد محاسبياً! ✅");
  };

  const pendingBookings = bookings.filter(b => b.status === 'awaiting_issue');
  const issuedBookings = bookings.filter(b => b.status === 'ready');
  const displayList = activeTab === 'pending' ? pendingBookings : issuedBookings;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-[#002147] tracking-tighter">منصة الإصدار الذكي</h2>
          <p className="text-slate-400 font-bold text-xl">متابعة الحجوزات، الإصدار اليدوي، ومراقبة محرك الـ NLP.</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl shadow-sm border">
           <button onClick={() => setActiveTab('pending')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'pending' ? 'bg-[#002147] text-white' : 'text-slate-400'}`}>المعلقة ({pendingBookings.length})</button>
           <button onClick={() => setActiveTab('issued')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'issued' ? 'bg-[#002147] text-white' : 'text-slate-400'}`}>تم الإصدار ({issuedBookings.length})</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Sidebar List */}
        <div className="lg:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {displayList.map(b => (
            <div 
              key={b.id} 
              onClick={() => setSelectedBooking(b)}
              className={`p-6 rounded-[2.5rem] cursor-pointer transition-all border-4 ${
                selectedBooking?.id === b.id ? 'bg-[#002147] text-white border-[#C5A059] shadow-2xl scale-105' : 'bg-white text-[#002147] border-white shadow-xl'
              }`}
            >
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black opacity-50">{b.bookingRef}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${b.status === 'ready' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {b.status === 'ready' ? 'تم الإصدار' : 'بانتظار الرد'}
                </span>
              </div>
              <h4 className="font-black text-lg">{b.passengerName}</h4>
              <p className="text-[10px] opacity-40 font-bold">{b.flightSnapshot?.flightNumber} | {b.flightSnapshot?.departure} ➔ {b.flightSnapshot?.arrival}</p>
            </div>
          ))}
          {displayList.length === 0 && <div className="text-center py-20 text-slate-300 font-black">لا توجد سجلات حالياً</div>}
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-8">
           {selectedBooking ? (
             <div className="bg-white rounded-[3.5rem] shadow-massive border-8 border-slate-50 overflow-hidden animate-in slide-in-from-left">
                {/* User & Flight Summary */}
                <div className="bg-[#002147] p-8 text-white flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-black">{selectedBooking.passengerName}</h3>
                      <p className="text-[#C5A059] font-bold text-xs">جواز سفر: {selectedBooking.passportNumber}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs opacity-50 font-bold">المبلغ المدفوع</p>
                      <p className="text-2xl font-black text-[#C5A059]">${selectedBooking.totalAmount}</p>
                   </div>
                </div>

                <div className="p-10 space-y-8">
                   {/* Documents */}
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">صورة الوثيقة الأساسية</p>
                         <div className="h-48 bg-slate-50 rounded-3xl overflow-hidden border-2 border-dashed flex items-center justify-center">
                            <img src={selectedBooking.passportImage} className="max-w-full max-h-full object-contain" alt="Passport" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">حالة الرحلة</p>
                         <div className="h-48 bg-indigo-50/30 rounded-3xl p-6 border-2 border-indigo-50">
                            <div className="space-y-4">
                               <div className="flex justify-between">
                                  <span className="text-xs font-bold text-indigo-400">الرحلة:</span>
                                  <span className="font-black text-[#002147]">{selectedBooking.flightSnapshot?.flightNumber}</span>
                               </div>
                               <div className="flex justify-between">
                                  <span className="text-xs font-bold text-indigo-400">الموعد:</span>
                                  <span className="font-black text-[#002147]">{selectedBooking.flightSnapshot?.departureTime}</span>
                               </div>
                               <div className="flex justify-between">
                                  <span className="text-xs font-bold text-indigo-400">المزود:</span>
                                  <span className="font-black text-emerald-600">{selectedBooking.flightSnapshot?.airlineName}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Issuance Action Form */}
                   <div className="bg-slate-50 p-10 rounded-[2.5rem] border-4 border-white shadow-inner space-y-6">
                      <h4 className="font-black text-[#002147] text-xl">إدخال بيانات التذكرة الصادرة</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase pr-4">رقم الـ PNR</label>
                            <input 
                              type="text" 
                              value={issueData.pnr}
                              onChange={e => setIssueData({...issueData, pnr: e.target.value.toUpperCase()})}
                              placeholder="مثال: XY7890" 
                              className="w-full p-4 rounded-xl outline-none font-black text-lg border-2 border-transparent focus:border-[#C5A059]"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase pr-4">رقم التذكرة الإلكترونية</label>
                            <input 
                              type="text" 
                              value={issueData.ticketNumber}
                              onChange={e => setIssueData({...issueData, ticketNumber: e.target.value})}
                              placeholder="مثال: 001234567890" 
                              className="w-full p-4 rounded-xl outline-none font-black text-lg border-2 border-transparent focus:border-[#C5A059]"
                            />
                         </div>
                         <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase pr-4">ملاحظات إضافية (اختياري)</label>
                            <textarea 
                              value={issueData.note}
                              onChange={e => setIssueData({...issueData, note: e.target.value})}
                              placeholder="أي تعليمات خاصة للمسافر..." 
                              className="w-full p-4 rounded-xl outline-none font-black text-sm border-2 border-transparent focus:border-[#C5A059] h-20"
                            />
                         </div>
                      </div>
                      
                      <div className="pt-4 flex gap-4">
                         <button 
                           onClick={handleManualIssue}
                           disabled={isProcessing}
                           className="flex-1 bg-[#1E3A8A] text-white py-6 rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all transform active:scale-95"
                         >
                            {isProcessing ? 'جارٍ المعالجة والقييد المالي...' : 'تأكيد الإصدار والقييد المالي 🚀'}
                         </button>
                         <button className="bg-white text-slate-400 p-6 rounded-2xl border hover:bg-rose-50 hover:text-rose-500 transition-all">
                            🗑️ إلغاء الحجز
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[3.5rem] border-4 border-dashed border-slate-100 text-center">
                <span className="text-8xl opacity-10 mb-8">🎫</span>
                <h3 className="text-2xl font-black text-slate-300">نظام إدارة التذاكر</h3>
                <p className="text-slate-400 font-bold mt-4">اختر حجزاً لمراجعة المستندات أو إتمام عملية الإصدار والقييد المالي.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BookingsManagement;
