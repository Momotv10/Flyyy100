
import React, { useState } from 'react';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'backup' | 'logs'>('general');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700 pb-20">
       <div className="flex justify-between items-end">
          <div>
            <h2 className="text-5xl font-black text-[#002147] tracking-tighter">إعدادات المنظومة</h2>
            <p className="text-slate-400 font-bold text-xl mt-2">التحكم في المعايير التقنية، البوابات الرقمية، والأمان.</p>
          </div>
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border">
             <button onClick={() => setActiveTab('general')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'general' ? 'bg-[#002147] text-white' : 'text-slate-400'}`}>عام</button>
             <button onClick={() => setActiveTab('whatsapp')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'whatsapp' ? 'bg-[#002147] text-white' : 'text-slate-400'}`}>الواتساب</button>
             <button onClick={() => setActiveTab('backup')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'backup' ? 'bg-[#002147] text-white' : 'text-slate-400'}`}>النسخ الاحتياطي</button>
          </div>
       </div>

       {activeTab === 'whatsapp' && (
         <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] shadow-massive border-4 border-white space-y-10">
               <div className="flex justify-between items-center border-b pb-8">
                  <h4 className="text-2xl font-black text-[#002147]">الربط مع WhatsApp Business 📱</h4>
                  <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">متصل ✅</span>
               </div>
               
               <div className="grid md:grid-cols-2 gap-8">
                  <SettingInput label="رقم الهاتف المعتمد" value="+967770000000" />
                  <SettingInput label="اسم العرض (Display Name)" value="STAMS Support" />
               </div>

               <div className="p-8 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100 space-y-4">
                  <h5 className="font-black text-[#002147] text-sm">حالة الـ Webhook</h5>
                  <div className="flex justify-between items-center">
                     <code className="text-[10px] font-mono text-indigo-400">https://api.stams.ai/v1/whatsapp/webhook</code>
                     <button className="text-[10px] font-black text-indigo-600 underline">اختبار الاتصال</button>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-4 bg-[#002147] p-10 rounded-[3rem] text-white shadow-massive">
               <h4 className="text-sm font-black text-[#C5A059] uppercase tracking-widest mb-6">ذكاء التوجيه الآلي</h4>
               <p className="text-xs font-bold leading-relaxed opacity-60">سيقوم النظام بتوجيه طلبات الحجز آلياً إلى الموظفين المربوطين في قاعدة البيانات. بمجرد استلام الرد، يقوم محرك الـ NLP بتحليل المحتوى وتحديث الحجز محاسبياً وإصدار التذكرة للعميل.</p>
               <button className="mt-10 w-full py-4 bg-[#C5A059] text-[#002147] rounded-2xl font-black text-xs shadow-xl">تحديث القوالب الذكية</button>
            </div>
         </div>
       )}

       {activeTab === 'general' && (
         <div className="bg-white p-12 rounded-[3.5rem] shadow-massive border-4 border-white text-center opacity-40">
            <span className="text-6xl mb-6 block">🌍</span>
            <h3 className="text-2xl font-black text-[#002147]">الإعدادات العامة (اللغة، العملة، التوقيت)</h3>
            <p className="text-slate-400 font-bold mt-2">هذه الخيارات مفعلة افتراضياً وفقاً لمعايير التشغيل الدولية.</p>
         </div>
       )}

       {activeTab === 'backup' && (
         <div className="bg-white p-12 rounded-[3.5rem] shadow-massive border-4 border-white">
            <div className="flex justify-between items-center mb-10">
               <h4 className="text-2xl font-black text-[#002147]">إدارة النسخ الاحتياطي (Auto-Backup) 🛡️</h4>
               <button className="bg-[#002147] text-white px-8 py-3 rounded-xl font-black text-xs">نسخة احتياطية فورية</button>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between p-6 bg-slate-50 rounded-2xl items-center border">
                  <div className="flex items-center gap-6">
                     <span className="text-2xl">📦</span>
                     <div>
                        <p className="font-black text-sm text-[#002147]">آخر نسخة ناجحة</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">اليوم - 04:30 AM</p>
                     </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1 rounded-full">Completed</span>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

const SettingInput = ({ label, value }: any) => (
  <div className="space-y-3">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
     <input type="text" readOnly value={value} className="w-full p-5 bg-slate-50 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:bg-white" />
  </div>
);

export default SystemSettings;
