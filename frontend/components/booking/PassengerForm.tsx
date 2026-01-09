
import React, { useState } from 'react';
import { ChevronRight, Loader2, Phone, Mail, ShieldCheck, Info } from 'lucide-react';
import PassportScanner from './PassportScanner';
import { bookingApi } from '../../services/api-client';

interface Props {
  flight: any;
  onNext: () => void;
}

const PassengerForm: React.FC<Props> = ({ flight, onNext }) => {
  const [formData, setFormData] = useState<any>({
    firstName: '', lastName: '', passportNumber: '', nationality: '',
    expiryDate: '', birthDate: '', whatsapp: '', email: '', passportImage: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = (data: any, passportImage: string) => {
    setFormData((prev: any) => ({
      ...prev,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      passportNumber: data.passportNumber || '',
      nationality: data.nationality || '',
      expiryDate: data.expiryDate || '',
      birthDate: data.birthDate || '',
      passportImage: passportImage
    }));
  };

  const handleCreateDraftAndRedirect = async () => {
    if (!formData.whatsapp || !formData.firstName) {
       return alert("يرجى إكمال بيانات المسافر ورقم الواتساب أولاً.");
    }
    
    setIsProcessing(true);
    try {
      // 1. إنشاء مسودة صامتة في الباك اند (No Side Effects inside API for /draft)
      const result: any = await bookingApi.createDraft({
        flightId: flight.id,
        passengers: [formData], 
        phone: formData.whatsapp,
        email: formData.email,
        totalAmount: flight.prices.selling,
        flightSnapshot: {
          flightNumber: flight.flightNumber,
          departure: flight.departureAirport,
          arrival: flight.arrivalAirport,
          departureTime: flight.departureTime
        }
      });

      if (result && result.id) {
        // 2. تأمين معرف المسودة محلياً لاستكمال الرحلة بعد الدخول
        localStorage.setItem('STAMS_PENDING_ID', result.id);
        console.log("[STAMS-UI] Draft secured successfully. ID: " + result.id);
        
        // 3. الانتقال للخطوة التالية (Login/Auth)
        onNext();
      } else {
        throw new Error("فشل النظام في تأمين المسودة. يرجى المحاولة لاحقاً.");
      }
    } catch (error: any) {
      alert(`عفواً، ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = formData.firstName && formData.passportNumber && formData.whatsapp;

  return (
    <div className="space-y-12">
      <div className="bg-amber-50 p-8 rounded-[2.5rem] border-4 border-amber-100 flex items-center gap-6">
         <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <ShieldCheck size={28} />
         </div>
         <p className="text-xs font-black text-amber-900 leading-relaxed uppercase tracking-tight">
            بروتوكول التأمين: سيتم حجز مقعدك لمدة 15 دقيقة كمسودة آمنة. يرجى إكمال تسجيل الدخول والسداد لتثبيت الحجز وإصدار التذكرة.
         </p>
      </div>

      <PassportScanner onScanComplete={handleScan} />

      <div className="grid md:grid-cols-2 gap-8 bg-white p-12 rounded-[3.5rem] border-4 border-slate-50 shadow-massive">
         <FormInput label="الاسم الأول (بالجواز)" value={formData.firstName} onChange={(v:any)=>setFormData({...formData, firstName: v})} />
         <FormInput label="اللقب / العائلة" value={formData.lastName} onChange={(v:any)=>setFormData({...formData, lastName: v})} />
         <FormInput label="رقم الجواز" value={formData.passportNumber} onChange={(v:any)=>setFormData({...formData, passportNumber: v})} />
         <FormInput label="الجنسية" value={formData.nationality} onChange={(v:any)=>setFormData({...formData, nationality: v})} />
         
         <div className="md:col-span-2 grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
           <FormInput label="رقم الواتساب للتواصل" value={formData.whatsapp} onChange={(v:any)=>setFormData({...formData, whatsapp: v})} icon={<Phone size={18}/>} />
           <FormInput label="البريد الإلكتروني" value={formData.email} onChange={(v:any)=>setFormData({...formData, email: v})} icon={<Mail size={18}/>} />
         </div>
      </div>

      <div className="flex flex-col gap-4">
         <button 
           onClick={handleCreateDraftAndRedirect}
           disabled={!isFormValid || isProcessing}
           className="w-full bg-[#002366] text-white py-8 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 shadow-massive hover:bg-black transition-all disabled:opacity-50 transform active:scale-[0.98]"
         >
           {isProcessing ? <Loader2 className="animate-spin" /> : <>إتمام الحجز وتأمين المقعد <ChevronRight /></>}
         </button>
         <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
            <Info size={12} /> لن يتم إرسال أي رسائل واتساب في هذه المرحلة
         </p>
      </div>
    </div>
  );
};

const FormInput = ({ label, value, onChange, icon, type = "text" }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
    <div className="relative">
      <input 
        type={type}
        value={value} 
        onChange={e => onChange(e.target.value.toUpperCase())}
        className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-4 border-transparent focus:border-[#002366] outline-none transition-all text-[#002366] shadow-inner"
        placeholder={label}
      />
      {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
    </div>
  </div>
);

export default PassengerForm;
