
import React, { useState } from 'react';
import { db } from '../services/mockDatabase';
import { Provider, Airline, ProviderType, SettlementPeriod } from '../types';

const ProviderManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [step, setStep] = useState(1);
  const [providers, setProviders] = useState<Provider[]>(db.getProviders());
  const [airlines] = useState<Airline[]>(db.getAirlines());

  // Form State
  const [formData, setFormData] = useState<Partial<Provider>>({
    name: '', type: 'airline_company', email: '', phone: '', whatsapp: '',
    address: '', country: '', authorizedAirlines: [],
    financials: { paymentMethod: 'bank_transfer', settlementPeriod: 'weekly', minPaymentAmount: 100 }
  });
  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const generateCredentials = () => {
    const user = formData.name?.toLowerCase().replace(/\s+/g, '_') || 'provider';
    const pass = Math.random().toString(36).slice(-8);
    setUsername(user);
    setTempPassword(pass);
  };

  const handleToggleAirline = (air: Airline) => {
    const exists = formData.authorizedAirlines?.find(a => a.airlineId === air.id);
    if (exists) {
      setFormData({
        ...formData,
        authorizedAirlines: formData.authorizedAirlines?.filter(a => a.airlineId !== air.id)
      });
    } else {
      setFormData({
        ...formData,
        authorizedAirlines: [
          ...(formData.authorizedAirlines || []),
          { 
            airlineId: air.id, 
            airlineName: air.name, 
            systemCommission: 5, 
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 31536000000).toISOString().split('T')[0] 
          }
        ]
      });
    }
  };

  const handleSave = () => {
    db.addProvider(formData, username);
    setProviders(db.getProviders());
    setView('list');
    setStep(1);
    alert("تم إنشاء حساب المزود، ربطه مالياً، وإرسال بيانات الدخول آلياً! 🚀");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-[#002147] tracking-tighter">إدارة المزودين الشركاء</h2>
          <p className="text-slate-400 font-bold text-xl">تحكم في شركات الطيران الموكلة والاتفاقيات المالية.</p>
        </div>
        {view === 'list' && (
          <button onClick={() => { generateCredentials(); setView('add'); }} className="bg-[#C5A059] text-[#002147] px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 transition-all">
            إضافة مزود جديد 🤝
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[3rem] shadow-massive border-4 border-white hover:border-[#C5A059] transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -z-10 opacity-50"></div>
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-[#002147] text-[#C5A059] rounded-2xl flex items-center justify-center text-3xl">🏗️</div>
                  <div>
                    <h3 className="text-xl font-black text-[#002147]">{p.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.type === 'airline_company' ? 'شركة طيران' : 'مكتب سياحة'}</p>
                  </div>
               </div>
               <div className="space-y-4 border-t pt-6">
                  <div className="flex justify-between items-center text-xs">
                     <span className="font-bold text-slate-400">الشركات الموكلة:</span>
                     <span className="font-black text-indigo-600">{p.authorizedAirlines.length} شركات</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="font-bold text-slate-400">رقم الحساب:</span>
                     <span className="font-mono font-black text-[#C5A059]">
                       {db.getAccount(`2103-${p.id.slice(-4)}`)?.id || '---'}
                     </span>
                  </div>
               </div>
            </div>
          ))}
          {providers.length === 0 && <div className="col-span-full py-20 text-center opacity-20 text-8xl grayscale">🤝</div>}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-[3.5rem] shadow-massive border-8 border-slate-50 overflow-hidden">
           {/* Step Indicator */}
           <div className="bg-[#002147] p-10 flex justify-between items-center text-white">
              <div className="flex gap-4">
                 {[1,2,3,4].map(s => (
                   <div key={s} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${step === s ? 'bg-[#C5A059] text-[#002147] scale-110 shadow-lg' : s < step ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                      {s < step ? '✓' : s}
                   </div>
                 ))}
              </div>
              <h3 className="text-2xl font-black text-[#C5A059]">
                 {step === 1 && 'البيانات الأساسية'}
                 {step === 2 && 'شركات الطيران الموكلة'}
                 {step === 3 && 'الإعدادات المالية'}
                 {step === 4 && 'تفعيل الحساب'}
              </h3>
           </div>

           <div className="p-16">
              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
                   <InputField label="اسم المزود (شركة أو فرد)" value={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} icon="🏗️" />
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">نوع المزود</label>
                      <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value as ProviderType})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black">
                         <option value="airline_company">شركة طيران</option>
                         <option value="travel_agency">مكتب سياحة</option>
                         <option value="group_agent">وكيل جماعي</option>
                      </select>
                   </div>
                   <InputField label="البريد الإلكتروني" value={formData.email} onChange={(v:any)=>setFormData({...formData, email: v})} icon="📧" />
                   <InputField label="رقم الهاتف" value={formData.phone} onChange={(v:any)=>setFormData({...formData, phone: v})} icon="📱" />
                   <InputField label="الدولة" value={formData.country} onChange={(v:any)=>setFormData({...formData, country: v})} icon="🌍" />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in">
                   <p className="text-slate-400 font-bold mb-6">اختر شركات الطيران المسموح لهذا المزود ببيع تذاكرها وتحديد العمولات:</p>
                   <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                      {airlines.map(air => {
                        const isSelected = formData.authorizedAirlines?.find(a => a.airlineId === air.id);
                        return (
                          <div key={air.id} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex justify-between items-center ${isSelected ? 'bg-indigo-50 border-[#1E3A8A]' : 'bg-white border-slate-50'}`} onClick={() => handleToggleAirline(air)}>
                             <div className="flex items-center gap-4">
                                <img src={air.logo} className="w-10 h-10 object-contain" alt="" />
                                <span className="font-black text-[#002147]">{air.name}</span>
                             </div>
                             {isSelected && (
                               <div onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    value={isSelected.systemCommission} 
                                    onChange={e => {
                                      const newAuth = formData.authorizedAirlines?.map(a => 
                                        a.airlineId === air.id ? { ...a, systemCommission: Number(e.target.value) } : a
                                      );
                                      setFormData({...formData, authorizedAirlines: newAuth});
                                    }}
                                    className="w-16 p-2 bg-white rounded-lg text-center font-black text-xs border"
                                  />
                                  <span className="text-[10px] font-black text-slate-400">%</span>
                               </div>
                             )}
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase pr-4">طريقة الدفع للمزود</label>
                      <select value={formData.financials?.paymentMethod} onChange={e=>setFormData({...formData, financials: {...formData.financials!, paymentMethod: e.target.value as any}})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black">
                         <option value="bank_transfer">تحويل بنكي</option>
                         <option value="digital_wallet">محفظة رقمية</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase pr-4">فترة التسوية</label>
                      <select value={formData.financials?.settlementPeriod} onChange={e=>setFormData({...formData, financials: {...formData.financials!, settlementPeriod: e.target.value as SettlementPeriod}})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black">
                         <option value="weekly">أسبوعي</option>
                         <option value="bi_weekly">نصف شهري</option>
                         <option value="monthly">شهري</option>
                      </select>
                   </div>
                   <InputField label="بيانات الدفع (رقم الحساب / المحفظة)" value={formData.financials?.accountNumber || formData.financials?.walletNumber} onChange={(v:any)=>setFormData({...formData, financials: {...formData.financials!, accountNumber: v}})} icon="💳" />
                   <InputField label="الحد الأدنى للدفع (USD)" type="number" value={String(formData.financials?.minPaymentAmount)} onChange={(v:any)=>setFormData({...formData, financials: {...formData.financials!, minPaymentAmount: Number(v)}})} />
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-12 animate-in zoom-in">
                   <div className="bg-slate-50 p-12 rounded-[3.5rem] border-4 border-dashed border-slate-100 max-w-xl mx-auto">
                      <h4 className="text-xl font-black text-[#002147] mb-8 uppercase tracking-widest">بيانات دخول المزود</h4>
                      <div className="space-y-6">
                         <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm">
                            <span className="text-xs font-bold text-slate-400">اسم المستخدم:</span>
                            <span className="font-mono font-black text-[#1E3A8A]">{username}</span>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm">
                            <span className="text-xs font-bold text-slate-400">كلمة المرور المؤقتة:</span>
                            <span className="font-mono font-black text-emerald-600">{tempPassword}</span>
                         </div>
                      </div>
                      <p className="mt-8 text-xs font-bold text-slate-400">سيتم إرسال هذه البيانات تلقائياً إلى: {formData.email}</p>
                   </div>
                   <div className="flex items-center justify-center gap-4 text-emerald-500 font-black">
                      <span className="text-2xl">🛡️</span>
                      <span>الحساب جاهز للتفعيل والربط المالي الفوري</span>
                   </div>
                </div>
              )}

              <div className="mt-16 flex justify-between pt-10 border-t items-center">
                 <button onClick={() => step === 1 ? setView('list') : setStep(s => s - 1)} className="px-10 py-5 rounded-2xl font-black text-slate-400 border">
                    {step === 1 ? 'إلغاء' : 'السابق'}
                 </button>
                 <button onClick={() => step === 4 ? handleSave() : setStep(s => s + 1)} className="bg-[#002147] text-white px-20 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-[#C5A059] transition-all">
                    {step === 4 ? 'إتمام التسجيل والربط المالي 🤝' : 'الخطوة التالية →'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, icon, type = "text" }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
    <div className="relative">
      {icon && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-30">{icon}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className={`w-full p-5 rounded-2xl outline-none font-black text-lg border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-[#C5A059] transition-all ${icon ? 'pr-16' : 'pr-6'}`} />
    </div>
  </div>
);

export default ProviderManagement;
