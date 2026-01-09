
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flight, User, UserRole, PaymentGatewayConfig } from '../types';
import { db } from '../services/mockDatabase';
import { bookingApi } from '../services/api-client';
import { paymentService } from '../services/paymentService';
import { CreditCard, ShieldCheck, Plane, User as UserIcon, ChevronRight, Lock, Loader2, Sparkles, MapPin, ReceiptText } from 'lucide-react';

interface Props {
  flight: Flight;
  travelerData: any;
  user: User;
  onConfirm: (method: string, gatewayId?: string) => void;
  onCancel: () => void;
}

const PaymentCheckoutView: React.FC<Props> = ({ flight, travelerData, user, onConfirm, onCancel }) => {
  const [selectedGateway, setSelectedGateway] = useState<string>('gw-1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  useEffect(() => {
    // استعادة البيانات الكاملة من localStorage عند تحميل الواجهة
    const saved = localStorage.getItem('pending_booking_data');
    if (saved) {
      setPendingData(JSON.parse(saved));
    }
  }, []);

  const currentTraveler = pendingData?.passenger || travelerData;
  const isAgent = user.role === UserRole.AGENT;
  const totalAmount = flight.prices.selling;
  const canPayWithBalance = isAgent && user.balance >= totalAmount;

  const handleFinalPayment = async () => {
    setIsProcessing(true);
    try {
      // 1. محاكاة معالجة الدفع عبر البوابة
      if (!isAgent) {
        await paymentService.processPayment(selectedGateway, totalAmount, currentTraveler.passportNumber);
      }

      // 2. استدعاء الـ API النهائي لحفظ الحجز وتفعيل القيود المحاسبية
      const bookingPayload = {
        flightId: flight.id,
        totalAmount: totalAmount,
        paymentMethod: isAgent ? 'agent_balance' : 'gateway',
        passenger: currentTraveler,
        visaRequested: false, // افتراضي
        phone: currentTraveler.whatsapp,
        email: currentTraveler.email
      };

      // الربط مع الباك اند (Service Bridge)
      const res = await bookingApi.finalize(bookingPayload);
      
      // 3. تنظيف الذاكرة والتوجه لصفحة النجاح
      localStorage.removeItem('pending_booking_data');
      onConfirm(bookingPayload.paymentMethod, selectedGateway);
      
    } catch (err: any) {
      alert("فشل إتمام العملية: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentTraveler) return <div className="p-20 text-center font-black">جاري استعادة بيانات الحجز...</div>;

  return (
    <div className="container mx-auto px-6 max-w-6xl animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#002366] text-[#C5A059] rounded-3xl flex items-center justify-center shadow-massive">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-[#002366] tracking-tight">المنصة الآمنة لإصدار التذاكر</h2>
            <p className="text-slate-400 font-bold mt-1">المرحلة النهائية: تأكيد الدفع وحجز المقعد رقمياً.</p>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3 font-black text-sm">
           <ShieldCheck size={20} /> حماية تشفير 256-bit مفعلة
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Payment Options */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-12 rounded-[4rem] shadow-massive border-4 border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[10rem]"></div>
            <h3 className="text-2xl font-black text-[#002366] mb-10 flex items-center gap-4 relative z-10">
              <CreditCard className="text-indigo-600" /> اختر وسيلة الدفع المفضلة
            </h3>
            
            <div className="space-y-5 relative z-10">
              {isAgent ? (
                <button 
                  disabled={!canPayWithBalance}
                  className={`w-full p-10 rounded-[2.5rem] border-4 transition-all text-right flex items-center gap-8 ${canPayWithBalance ? 'bg-indigo-50 border-[#002366] shadow-xl' : 'bg-rose-50 border-rose-100 opacity-60'}`}
                >
                   <span className="text-6xl p-6 bg-white rounded-[2rem] shadow-sm">💰</span>
                   <div className="flex-1">
                      <h5 className="font-black text-2xl text-[#002366]">الخصم من رصيد الوكالة</h5>
                      <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">المحفظة الرقمية الموحدة</p>
                      <p className="text-lg font-black text-indigo-600 mt-2">الرصيد المتاح: ${user.balance.toLocaleString()}</p>
                      {!canPayWithBalance && <p className="text-sm text-rose-500 font-black mt-2 animate-pulse">عفواً، الرصيد غير كافٍ لإتمام العملية.</p>}
                   </div>
                   <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center ${canPayWithBalance ? 'bg-[#002366] border-[#002366]' : 'border-slate-200'}`}>
                      {canPayWithBalance && <span className="text-white text-xl">✓</span>}
                   </div>
                </button>
              ) : (
                <div className="grid gap-4">
                  {[
                    { id: 'gw-1', name: 'جوالي - Jawaly Pay', logo: '📱' },
                    { id: 'gw-2', name: 'ون كاش - OneCash', logo: '💸' },
                    { id: 'gw-3', name: 'بطاقة ائتمان / مدى', logo: '💳' }
                  ].map(gw => (
                    <button 
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`p-8 rounded-[2.5rem] border-4 transition-all text-right flex items-center gap-8 ${
                        selectedGateway === gw.id ? 'bg-indigo-50 border-[#002366] shadow-xl' : 'bg-white border-slate-50 hover:border-indigo-100'
                      }`}
                    >
                      <span className="text-5xl p-5 bg-white rounded-3xl shadow-sm">{gw.logo}</span>
                      <div className="flex-1">
                        <h5 className="font-black text-xl text-[#002366]">{gw.name}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">بوابة دفع فورية ومعتمدة</p>
                      </div>
                      <div className={`w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center ${selectedGateway === gw.id ? 'bg-[#002366] border-[#002366]' : 'border-slate-100'}`}>
                        {selectedGateway === gw.id && <span className="text-white text-xl font-black">✓</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
             <button 
               onClick={handleFinalPayment}
               disabled={isProcessing || (isAgent && !canPayWithBalance)}
               className="flex-1 bg-[#002366] text-[#C5A059] py-8 rounded-[2.5rem] font-black text-2xl shadow-massive hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
             >
               {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <>إتمام عملية الحجز والدفع الآن <ChevronRight className="group-hover:translate-x-[-5px] transition-transform" /></>}
             </button>
             <button onClick={onCancel} className="px-10 py-8 bg-white border-4 border-slate-50 rounded-[2.5rem] font-black text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">إلغاء</button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
           <div className="bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                 <ReceiptText size={18} className="text-[#C5A059]" /> تفاصيل الطلب النهائي
              </h4>
              
              <div className="space-y-8">
                 {/* Flight Summary */}
                 <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">✈️</div>
                    <div>
                       <p className="text-sm font-black text-[#002366]">{flight.departureAirport} ➔ {flight.arrivalAirport}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{flight.flightNumber} | {flight.departureDate}</p>
                    </div>
                 </div>

                 {/* Passenger Summary (With OCR Success Indicator) */}
                 <div className="flex items-center gap-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 relative group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm relative">
                       <UserIcon size={24} />
                       <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                          <Sparkles size={10} />
                       </div>
                    </div>
                    <div>
                       <p className="text-sm font-black text-emerald-900">{currentTraveler.firstName} {currentTraveler.lastName}</p>
                       <p className="text-[10px] text-emerald-600 font-bold mt-1">رقم الجواز: {currentTraveler.passportNumber}</p>
                    </div>
                 </div>

                 <div className="pt-8 border-t-4 border-dashed border-slate-50 space-y-5">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-slate-400">سعر التذكرة (شامل):</span>
                       <span className="text-[#002366] font-black">${flight.prices.selling}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-slate-400">رسوم الإصدار الفوري:</span>
                       <span className="text-emerald-500 font-black">مجاناً</span>
                    </div>
                    <div className="pt-6 mt-4 border-t border-slate-50 flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">إجمالي السداد</p>
                          <p className="text-5xl font-black text-[#002366] tracking-tighter mt-1">${totalAmount}</p>
                       </div>
                       <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">USD</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white text-center">
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">بمجرد النقر على "إتمام الدفع"، سيتم خصم المبلغ وإصدار تذكرتكم الإلكترونية فورياً وتزويدكم بها عبر الواتساب والبريد.</p>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default PaymentCheckoutView;
