
import React, { useState } from 'react';
import { db } from '../services/mockDatabase';
import { User, UserRole, AgentProfile, AgentDocument } from '../types';

const UserManagement: React.FC = () => {
  const [agents, setAgents] = useState<User[]>(db.getAgents());
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [view, setView] = useState<'list' | 'add'>('list');
  const [step, setStep] = useState(1);

  // Form State
  const [userData, setUserData] = useState({ username: '', password: '', phone: '' });
  const [profileData, setProfileData] = useState<Partial<AgentProfile>>({
    companyName: '',
    agentType: 'company',
    idNumber: '',
    address: '',
    responsiblePerson: '',
    documents: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc: AgentDocument = {
        id: `doc-${Date.now()}`,
        type: type as any,
        title: file.name,
        fileUrl: reader.result as string,
        uploadedAt: new Date().toISOString()
      };
      setProfileData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAgent = () => {
    db.addAgent(userData, profileData);
    setAgents(db.getAgents());
    setView('list');
    setStep(1);
    alert("تم إنشاء حساب الوكيل وتفعيل الملف المالي والوثائقي بنجاح! ⚖️");
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-[#002147] tracking-tighter">إدارة الوكلاء والشركاء</h2>
          <p className="text-slate-400 font-bold text-xl">منظومة التسجيل، التوثيق، والمراقبة المالية.</p>
        </div>
        {view === 'list' && (
          <button onClick={() => setView('add')} className="bg-[#C5A059] text-[#002147] px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-4">
            <span>إضافة وكيل جديد</span>
            <span className="text-2xl">👤</span>
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
             {agents.map(agent => (
               <div key={agent.id} onClick={() => setSelectedAgent(agent)} className={`p-6 rounded-[2.5rem] border-4 cursor-pointer transition-all ${selectedAgent?.id === agent.id ? 'bg-[#002147] text-white border-[#C5A059] shadow-2xl scale-105' : 'bg-white border-white shadow-xl'}`}>
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🏢</div>
                     <div>
                        <h4 className="font-black text-lg">{db.getAgentProfile(agent.id)?.companyName}</h4>
                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{agent.name}</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          <div className="lg:col-span-8">
             {selectedAgent ? (
               <div className="bg-white rounded-[3.5rem] shadow-massive border-8 border-slate-50 overflow-hidden animate-in slide-in-from-left">
                  <div className="bg-[#002147] p-10 text-white flex justify-between items-center">
                     <div>
                        <h3 className="text-3xl font-black text-[#C5A059]">{db.getAgentProfile(selectedAgent.id)?.companyName}</h3>
                        <p className="text-indigo-200 font-bold">الرصيد الحالي: ${selectedAgent.balance.toLocaleString()}</p>
                     </div>
                     <span className="bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">موثق ✓</span>
                  </div>
                  
                  <div className="p-12 space-y-12">
                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <h5 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">بيانات التواصل</h5>
                           <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                              <DataRow label="المسؤول" value={selectedAgent.name} />
                              <DataRow label="الهاتف" value={selectedAgent.phone} />
                              <DataRow label="العنوان" value={db.getAgentProfile(selectedAgent.id)?.address} />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h5 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">الوثائق القانونية</h5>
                           <div className="grid grid-cols-2 gap-4">
                              {db.getAgentProfile(selectedAgent.id)?.documents.map(doc => (
                                <div key={doc.id} onClick={() => window.open(doc.fileUrl)} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl cursor-pointer hover:bg-indigo-100 transition-all text-center">
                                   <span className="text-2xl block mb-2">📄</span>
                                   <p className="text-[10px] font-black text-[#002147] line-clamp-1">{doc.title}</p>
                                </div>
                              ))}
                              {db.getAgentProfile(selectedAgent.id)?.documents.length === 0 && <p className="text-[10px] text-slate-300 font-bold">لا توجد وثائق</p>}
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-[#002147] p-8 rounded-[2.5rem] flex justify-between items-center text-white">
                        <div>
                           <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">الربط البرمجي API</p>
                           <p className="font-mono text-xs opacity-50">{db.getAgentProfile(selectedAgent.id)?.apiKey || 'غير مفعل'}</p>
                        </div>
                        <button className="bg-[#C5A059] text-[#002147] px-6 py-2 rounded-xl text-[10px] font-black">تحديث المفتاح</button>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="h-full bg-white rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-20 text-center opacity-40">
                  <span className="text-8xl mb-8">👥</span>
                  <h3 className="text-2xl font-black text-slate-300">اختر وكيلاً لعرض ملفه الكامل</h3>
               </div>
             )}
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-[3.5rem] shadow-massive border-8 border-slate-50 overflow-hidden">
           <div className="bg-[#002147] p-10 flex justify-between items-center text-white">
              <div className="flex gap-4">
                 {[1,2,3,4].map(s => (
                   <div key={s} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step === s ? 'bg-[#C5A059] text-[#002147] scale-110 shadow-lg' : s < step ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                      {s < step ? '✓' : s}
                   </div>
                 ))}
              </div>
              <h3 className="text-2xl font-black text-[#C5A059]">
                 {step === 1 && 'البيانات الشخصية والمؤسسية'}
                 {step === 2 && 'إعدادات الحساب والأمان'}
                 {step === 3 && 'رفع الوثائق القانونية'}
                 {step === 4 && 'الربط المالي النهائي'}
              </h3>
           </div>

           <div className="p-16">
              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
                   <InputField label="اسم الوكالة / الشركة" value={profileData.companyName} onChange={(v:any)=>setProfileData({...profileData, companyName: v})} icon="🏢" />
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">نوع الوكيل</label>
                      <select value={profileData.agentType} onChange={e=>setProfileData({...profileData, agentType: e.target.value as any})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black border-2 border-transparent focus:border-[#C5A059]">
                         <option value="company">شركة / مؤسسة</option>
                         <option value="individual">فرد</option>
                      </select>
                   </div>
                   <InputField label="رقم السجل التجاري / الهوية" value={profileData.idNumber} onChange={(v:any)=>setProfileData({...profileData, idNumber: v})} icon="🆔" />
                   <InputField label="الشخص المسؤول" value={profileData.responsiblePerson} onChange={(v:any)=>setProfileData({...profileData, responsiblePerson: v})} icon="👤" />
                   <InputField label="العنوان الكامل" value={profileData.address} onChange={(v:any)=>setProfileData({...profileData, address: v})} icon="📍" />
                   <InputField label="رقم هاتف التواصل" value={userData.phone} onChange={(v:any)=>setUserData({...userData, phone: v})} icon="📱" />
                </div>
              )}

              {step === 2 && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
                   <InputField label="اسم المستخدم الفريد" value={userData.username} onChange={(v:any)=>setUserData({...userData, username: v.toLowerCase()})} icon="🔐" />
                   <InputField label="كلمة المرور القوية" type="password" value={userData.password} onChange={(v:any)=>setUserData({...userData, password: v})} icon="🔑" />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in">
                   <p className="text-slate-400 font-bold">يرجى رفع صور ضوئية واضحة للوثائق التالية لتوثيق الحساب:</p>
                   <div className="grid md:grid-cols-2 gap-6">
                      <UploadBox label="صورة الهوية / السجل" onUpload={(e)=>handleFileUpload(e, 'id_card')} hasFile={profileData.documents?.some(d=>d.type==='id_card')} />
                      <UploadBox label="عقد الوكالة المعتمد" onUpload={(e)=>handleFileUpload(e, 'contract')} hasFile={profileData.documents?.some(d=>d.type==='contract')} />
                   </div>
                   <div className="bg-slate-50 p-6 rounded-2xl">
                      <h6 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">الملفات المرفوعة ({profileData.documents?.length})</h6>
                      <div className="flex gap-4 flex-wrap">
                         {profileData.documents?.map(d => (
                           <span key={d.id} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black border shadow-sm flex items-center gap-2">
                             📄 {d.title}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-8 animate-in zoom-in">
                   <div className="bg-emerald-50 p-12 rounded-[3.5rem] border-4 border-dashed border-emerald-200 inline-block">
                      <span className="text-6xl block mb-6">⚖️</span>
                      <h4 className="text-2xl font-black text-emerald-800">تفعيل الربط المالي الآلي</h4>
                      <p className="text-emerald-600 font-bold mt-2 max-w-md">سيقوم النظام بإنشاء حساب أستاذ فرعي للوكيل تحت الكود (2102) وربطه بميزان المراجعة اللحظي.</p>
                   </div>
                   <div className="p-8 bg-slate-50 rounded-3xl max-w-lg mx-auto border shadow-inner">
                      <div className="flex justify-between font-black text-[#002147]">
                         <span>اسم الوكالة:</span>
                         <span>{profileData.companyName}</span>
                      </div>
                      <div className="flex justify-between font-black text-[#002147] mt-4">
                         <span>كود الحساب المالي المخصص:</span>
                         <span className="font-mono text-[#C5A059]">2102-NEW</span>
                      </div>
                   </div>
                </div>
              )}

              <div className="mt-16 flex justify-between pt-10 border-t items-center">
                 <button onClick={() => step === 1 ? setView('list') : setStep(s => s - 1)} className="px-10 py-5 rounded-2xl font-black text-slate-400 border">
                    {step === 1 ? 'إلغاء' : 'السابق'}
                 </button>
                 <button onClick={() => step === 4 ? handleSaveAgent() : setStep(s => s + 1)} className="bg-[#002147] text-white px-20 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-[#C5A059] transition-all">
                    {step === 4 ? 'إتمام التسجيل والربط المالي 🤝' : 'الخطوة التالية →'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DataRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-1 border-b border-white last:border-0">
     <span className="text-[10px] font-bold text-slate-400">{label}:</span>
     <span className="font-black text-[#002147] text-xs">{value || '---'}</span>
  </div>
);

const InputField = ({ label, value, onChange, icon, type = "text" }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
    <div className="relative">
      {icon && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-30">{icon}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className={`w-full p-5 rounded-2xl outline-none font-black text-lg border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-[#C5A059] transition-all shadow-inner ${icon ? 'pr-16' : 'pr-6'}`} />
    </div>
  </div>
);

const UploadBox = ({ label, onUpload, hasFile }: any) => (
  <div className={`relative p-8 rounded-[2.5rem] border-4 border-dashed transition-all text-center cursor-pointer ${hasFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onUpload} />
     <span className="text-4xl mb-4 block">{hasFile ? '✅' : '📤'}</span>
     <p className="font-black text-[#002147] text-sm">{label}</p>
     <p className="text-[9px] text-slate-400 font-bold mt-2">PDF, JPG, PNG (Max 5MB)</p>
  </div>
);

export default UserManagement;
