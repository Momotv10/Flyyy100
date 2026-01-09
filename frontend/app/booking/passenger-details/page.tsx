
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronRight, Phone, Mail, Sparkles, Loader2, Info, AlertTriangle, FileUp } from 'lucide-react';
import PassportScanner from '../../../components/booking/PassportScanner';

interface Props {
  flight: any;
  onNext: (data: any) => void;
}

const PassengerDetailsPage: React.FC<Props> = ({ flight, onNext }) => {
  const [formData, setFormData] = useState<any>({
    firstName: '', lastName: '', passportNumber: '', nationality: '',
    expiryDate: '', birthDate: '', whatsapp: '', email: '', 
    passportImage: '', renewalImage: '', needsRenewal: false
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiScanResult = (data: any, passportImage: string, renewalImage?: string) => {
    setFormData((prev: any) => ({
      ...prev,
      ...data,
      passportImage,
      renewalImage: renewalImage || prev.renewalImage
    }));
  };

  const isFormValid = formData.firstName && formData.passportNumber && formData.whatsapp && formData.passportImage;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto py-10 px-4">
      {/* Flight Context Header */}
      <div className="bg-[#002366] p-10 rounded-[3.5rem] text-white flex items-center justify-between shadow-massive relative overflow-hidden">
         <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-[#002366] shadow-xl">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h2 className="text-3xl font-black tracking-tight">تأمين بيانات المسافر</h2>
               <p className="text-indigo-200 font-bold text-sm mt-1 uppercase tracking-widest">Aero Intelligence OCR Protocol</p>
            </div>
         </div>
         <div className="hidden lg:block text-left relative z-10">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">الرحلة: {flight.flightNumber}</p>
            <p className="text-xl font-black">{flight.departureAirport} ➔ {flight.arrivalAirport}</p>
         </div>
      </div>

      {/* Stage 1: AI Scanner */}
      <div className="space-y-6">
         <h3 className="text-xl font-black text-[#002366] px-4 flex items-center gap-3">
            <Sparkles size={20} className="text-indigo-600" /> ارفع وثيقة السفر للتحقق الذكي
         </h3>
         <PassportScanner 
           onScanComplete={handleAiScanResult} 
           onStatusChange={(s) => setIsAiLoading(s === 'scanning')} 
         />
      </div>

      {/* Stage 2: Data Review */}
      <AnimatePresence>
        {formData.passportImage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[4rem] shadow-massive border-4 border-white space-y-12"
          >
             <div className="flex items-center justify-between border-b pb-8">
                <h3 className="text-2xl font-black text-[#002366]">مراجعة البيانات الرقمية</h3>
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">تم التحقق آلياً ✓</span>
             </div>

             {formData.needsRenewal && !formData.renewalImage && (
               <div className="p-8 bg-rose-50 rounded-[2rem] border-4 border-rose-100 flex flex-col md:flex-row items-center gap-8 animate-pulse">
                  <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0">
                     <AlertTriangle size={32} />
                  </div>
                  <div className="flex-1 text-center md:text-right">
                     <p className="text-rose-800 font-black text-lg">تحذير: صلاحية الجواز حرجة!</p>
                     <p className="text-rose-600 font-bold text-sm mt-1">صلاحية جوازك أقل من 6 أشهر. يرجى رفع صورة صفحة التجديد للمتابعة.</p>
                  </div>
                  <button className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3">
                     <FileUp size={18} /> رفع صورة التجديد
                  </button>
               </div>
             )}

             <div className="grid md:grid-cols-2 gap-10">
                <FormInput label="الاسم الأول (بالجواز)" value={formData.firstName} onChange={(v:any)=>setFormData({...formData, firstName: v})} />
                <FormInput label="اللقب / العائلة" value={formData.lastName} onChange={(v:any)=>setFormData({...formData, lastName: v})} />
                <FormInput label="رقم الجواز" value={formData.passportNumber} onChange={(v:any)=>setFormData({...formData, passportNumber: v})} />
                <FormInput label="الجنسية" value={formData.nationality} onChange={(v:any)=>setFormData({...formData, nationality: v})} />
                
                <div className="md:col-span-2 grid md:grid-cols-2 gap-10 pt-10 border-t border-slate-50">
                   <FormInput label="رقم واتساب نشط (للتذاكر)" value={formData.whatsapp} onChange={(v:any)=>setFormData({...formData, whatsapp: v})} icon={<Phone size={18}/>} />
                   <FormInput label="البريد الإلكتروني" value={formData.email} onChange={(v:any)=>setFormData({...formData, email: v})} icon={<Mail size={18}/>} />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => onNext(formData)}
        disabled={!isFormValid || isAiLoading}
        className="w-full bg-[#002366] text-[#C5A059] py-8 rounded-[2.5rem] font-black text-2xl shadow-massive hover:bg-black transition-all flex items-center justify-center gap-4 transform active:scale-[0.98] disabled:opacity-50"
      >
        المتابعة للسداد الآمن <ChevronRight size={32} />
      </button>

      <div className="flex items-center justify-center gap-3 text-slate-300 font-bold text-xs uppercase tracking-[0.2em]">
         <Info size={14} /> سيتم حفظ البيانات في السجلات الرسمية فقط بعد نجاح عملية الدفع
      </div>
    </div>
  );
};

const FormInput = ({ label, value, onChange, icon, type = "text" }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
    <div className="relative">
      <input 
        type={type} value={value} 
        onChange={e => onChange(e.target.value.toUpperCase())}
        className="w-full bg-slate-50 p-6 rounded-3xl font-black text-lg border-4 border-transparent focus:border-[#002366] focus:bg-white outline-none transition-all text-[#002366] shadow-inner"
        placeholder={label}
      />
      {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
    </div>
  </div>
);

export default PassengerDetailsPage;
