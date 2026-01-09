
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, Loader2, ChevronRight, ReceiptText, Sparkles, MapPin } from 'lucide-react';
import { bookingApi } from '../../../services/api-client';

interface Props {
  onSuccess: (bid: string) => void;
  onCancel: () => void;
}

const PaymentPage: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [pendingData, setPendingData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pending_booking_data');
    if (saved) setPendingData(JSON.parse(saved));
  }, []);

  const handleFinalPayment = async () => {
    if (!pendingData) return;
    setIsProcessing(true);
    try {
      // 1. محاكاة المصادقة مع بوابة الدفع البنكية
      await new Promise(r => setTimeout(r, 2000));
      
      // 2. الحفظ النهائي في PostgreSQL وتفعيل إشعارات الواتساب للمزود
      // يتم الآن إنشاء سجل الحجز رسمياً برتبة "PAID"
      const res: any = await bookingApi.finalize({ 
        bookingData: pendingData,
        paymentDetails: { 
          method: paymentMethod,
          timestamp: new Date().toISOString()
        }
      });

      if (res.success) {
        localStorage.removeItem('pending_booking_data');
        onSuccess(res.bookingId);
      }
    } catch (e) {
      alert("عفواً، فشلت عملية السداد البنكي. يرجى التحقق من رصيد البطاقة.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pendingData) return <div className="h-screen flex items-center justify-center font-black">جلسة غير صالحة.</div>;

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-20 px-6 font-tajawal">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
           <div>
              <h2 className="text-5xl font-black text-[#002366] tracking-tighter">تأكيد السداد والطلب</h2>
              <p className="text-slate-400 font-bold mt-2 flex items-center gap-2"><Lock size={16}/> بوابة سداد معتمدة ومشفرة عالمياً</p>
           </div>
           <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3 font-black text-sm">
             <ShieldCheck size={20} /> تشفير STAMS SSL نشط ✅
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-bottom duration-700">
             <div className="bg-white p-12 rounded-[4rem] shadow-massive border-4 border-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[10rem]"></div>
                <h3 className="text-2xl font-black text-[#002366] mb-12 flex items-center gap-4 relative z-10">
                  <CreditCard className="text-indigo-600" /> تفاصيل وسيلة الدفع
                </h3>
                
                <div className="space-y-8 relative z-10">
                   <div className="grid grid-cols-3 gap-6">
                      <PaymentBtn active={paymentMethod === 'card'} icon="💳" label="بطاقة بنكية" onClick={()=>setPaymentMethod('card')} />
                      <PaymentBtn active={paymentMethod === 'jawaly'} icon="📱" label="جوالي" onClick={()=>setPaymentMethod('jawaly')} />
                      <PaymentBtn active={paymentMethod === 'onecash'} icon="💸" label="ون كاش" onClick={()=>setPaymentMethod('onecash')} />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">رقم البطاقة / الحساب الرقمي</label>
                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full p-6 bg-slate-50 rounded-[2rem] font-mono text-xl shadow-inner border-none focus:ring-4 ring-indigo-100 transition-all text-[#002366]" />
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                  onClick={handleFinalPayment}
                  disabled={isProcessing}
                  className="flex-1 bg-[#002366] text-[#C5A059] py-8 rounded-[2.5rem] font-black text-2xl shadow-massive hover:bg-black transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <>تأكيد السداد وإصدار التذكرة <ChevronRight className="group-hover:translate-x-[-5px] transition-transform" /></>}
                </button>
                <button onClick={onCancel} className="px-12 py-8 bg-white border-4 border-slate-50 rounded-[2.5rem] font-black text-slate-400 hover:text-rose-500 transition-all">إلغاء العملية</button>
             </div>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-32 animate-in slide-in-from-right duration-700">
             <div className="bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10 flex items-center gap-3 border-b pb-6">
                   <ReceiptText size={18} className="text-[#C5A059]" /> تفاصيل الرحلة النهائية
                </h4>
                <div className="space-y-8">
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">✈️</div>
                      <div>
                         <p className="text-sm font-black text-[#002366]">{pendingData.flightSnapshot?.departure} ➔ {pendingData.flightSnapshot?.arrival}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{pendingData.flightSnapshot?.flightNumber}</p>
                      </div>
                   </div>
                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Sparkles size={24}/></div>
                      <div>
                         <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-2">المسافر الرئيسي</p>
                         <p className="text-lg font-black text-emerald-900 truncate max-w-[150px]">{pendingData.firstName} {pendingData.lastName}</p>
                      </div>
                   </div>
                   <div className="pt-8 border-t-4 border-dashed border-slate-50 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">المبلغ الإجمالي</p>
                        <p className="text-5xl font-black text-[#002366] tracking-tighter mt-1">${pendingData.totalAmount}</p>
                      </div>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">USD</span>
                   </div>
                </div>
             </div>
             <div className="mt-8 bg-[#002366] p-8 rounded-[2.5rem] text-center">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.2em] leading-relaxed">بمجرد السداد، سيتم إشعار المزود فوراً لإصدار تذكرتكم.</p>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const PaymentBtn = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${active ? 'bg-indigo-50 border-[#002366] shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}>
     <span className="text-3xl">{icon}</span>
     <span className="text-[10px] font-black uppercase">{label}</span>
  </button>
);

export default PaymentPage;
