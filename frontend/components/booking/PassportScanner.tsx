import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, RefreshCcw, FileUp, ShieldAlert } from 'lucide-react';
import { bookingApi } from '../../services/api-client';

interface Props {
  onScanComplete: (data: any, passportImage: string, renewalImage?: string) => void;
  onStatusChange?: (status: string) => void;
}

const PassportScanner: React.FC<Props> = ({ onScanComplete, onStatusChange }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'needs_renewal'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [passportBase64, setPassportBase64] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renewalInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('scanning');
    onStatusChange?.('scanning');
    setErrorMessage('');

    // تحويل الصورة لـ Base64 للعرض والتحليل
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setPassportBase64(reader.result as string);

      try {
        // استخدام جسر الخدمات بدلاً من axios المباشر
        // Fix: Casting response to any to resolve property access errors in a union type that might include Booking
        const response: any = await bookingApi.verifyDocument(base64);

        if (response.status === 'success' && response.data) {
          const data = response.data;
          setExtractedData(data);

          if (data.isExpired || data.isInvalidForTravel) {
            setStatus('needs_renewal');
            onStatusChange?.('needs_renewal');
          } else {
            setStatus('success');
            onStatusChange?.('success');
            onScanComplete(data, reader.result as string);
          }
        } else {
          setStatus('error');
          setErrorMessage(response.message || 'فشل استخراج البيانات. تأكد من وضوح الصورة.');
          onStatusChange?.('error');
        }
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setStatus('error');
        setErrorMessage('تعذر تحليل الوثيقة. يرجى التأكد من أن الصورة واضحة وتحتوي على منطقة MRZ.');
        onStatusChange?.('error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRenewalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setStatus('success');
      onStatusChange?.('success');
      onScanComplete(extractedData, passportBase64, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => fileInputRef.current?.click()}
            className="group h-72 border-4 border-dashed border-slate-200 rounded-[3.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#002366] hover:bg-indigo-50/20 transition-all p-10 text-center"
          >
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
            <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-[#002366] mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <UploadCloud size={48} />
            </div>
            <h4 className="text-2xl font-black text-[#002366]">ارفع صفحة بيانات الجواز</h4>
            <p className="text-sm text-slate-400 font-bold mt-2">سيتم التدقيق آلياً بواسطة Aero Intelligence AI</p>
          </motion.div>
        )}

        {status === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="h-72 bg-[#002366] rounded-[3.5rem] flex flex-col items-center justify-center p-10 relative overflow-hidden"
          >
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute left-0 right-0 h-1 bg-amber-400 shadow-[0_0_25px_rgba(245,158,11,1)] z-20"
            />
            <div className="relative z-10 text-center">
              <Loader2 className="text-amber-500 animate-spin mx-auto mb-6" size={56} />
              <h4 className="text-2xl font-black text-white">جاري الفحص الأمني الرقمي</h4>
              <p className="text-xs text-indigo-300 font-bold mt-4 uppercase tracking-[0.2em] animate-pulse">Running Deep Vision Analysis...</p>
            </div>
          </motion.div>
        )}

        {status === 'needs_renewal' && (
          <motion.div 
            key="needs_renewal"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="h-72 bg-rose-50 rounded-[3.5rem] border-4 border-rose-200 flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="w-20 h-20 bg-rose-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <ShieldAlert size={40} />
            </div>
            <h4 className="text-2xl font-black text-rose-800">جوازك منتهي أو صلاحيته حرجة</h4>
            <p className="text-sm text-rose-600 font-bold mt-2 mb-8">يرجى رفع صورة صفحة التجديد أو التمديد للمتابعة.</p>
            <input type="file" ref={renewalInputRef} className="hidden" onChange={handleRenewalUpload} accept="image/*" />
            <button 
              onClick={() => renewalInputRef.current?.click()}
              className="flex items-center gap-3 bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all"
            >
              <FileUp size={20} /> ارفع صفحة التجديد
            </button>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="h-72 bg-emerald-50 rounded-[3.5rem] border-4 border-emerald-500 flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="text-2xl font-black text-emerald-800">تم التحقق بنجاح!</h4>
            <p className="text-emerald-600 font-bold mt-2">تمت قراءة البيانات وحقنها في الاستمارة.</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="h-72 bg-slate-50 rounded-[3.5rem] border-4 border-slate-200 flex flex-col items-center justify-center p-10 text-center"
          >
            <AlertCircle className="text-rose-500 mb-6" size={48} />
            <h4 className="text-xl font-black text-[#002366]">فشل التحليل</h4>
            <p className="text-sm text-slate-500 font-bold mt-1 mb-8 max-w-sm">{errorMessage}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="flex items-center gap-3 bg-[#002366] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg"
            >
              <RefreshCcw size={16} /> إعادة المحاولة
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassportScanner;