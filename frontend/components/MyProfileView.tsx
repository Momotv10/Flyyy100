
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { User, UserProfile, SavedPassenger } from '../types';

interface Props { user: User; onBack: () => void; }

const MyProfileView: React.FC<Props> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'travelers' | 'passports'>('info');
  const [profile, setProfile] = useState<UserProfile>(db.getUserProfile(user.id));
  const [passengers, setPassengers] = useState<SavedPassenger[]>(db.getSavedPassengers(user.id));
  const [editingInfo, setEditingInfo] = useState({ 
    name: user.name, 
    phone: user.phone || '', 
    nationality: profile.nationality || '',
    birthDate: profile.birthDate || ''
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateUserProfile(user.id, { 
      birthDate: editingInfo.birthDate, 
      nationality: editingInfo.nationality 
    });
    alert("تم تحديث الملف الشخصي بنجاح! ✅");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-tajawal pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Header Profile Card */}
        <div className="bg-white p-12 rounded-[3.5rem] shadow-massive mb-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden border-b-8 border-[#C5A059]">
           <div className="w-32 h-32 bg-[#002147] rounded-[2.5rem] flex items-center justify-center text-6xl text-white shadow-2xl">
              {user.name.charAt(0)}
           </div>
           <div className="text-center md:text-right flex-1">
              <h2 className="text-4xl font-black text-[#002147] mb-2">{user.name}</h2>
              <p className="text-slate-400 font-bold text-lg">{user.email}</p>
              <div className="flex gap-4 mt-6 justify-center md:justify-start">
                 <span className="bg-indigo-50 text-[#1E3A8A] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">عميل مميز</span>
                 <span className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">موثق</span>
              </div>
           </div>
           <button onClick={onBack} className="bg-slate-50 p-4 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">خروج</button>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Tabs */}
          <aside className="lg:col-span-1 space-y-4">
             <TabBtn active={activeTab === 'info'} onClick={()=>setActiveTab('info')} label="بياناتي الأساسية" icon="👤" />
             <TabBtn active={activeTab === 'travelers'} onClick={()=>setActiveTab('travelers')} label="المسافرون الدائمون" icon="👥" />
             <TabBtn active={activeTab === 'passports'} onClick={()=>setActiveTab('passports')} label="حقيبة الجوازات" icon="🛡️" />
          </aside>

          {/* Tab Content */}
          <main className="lg:col-span-3">
             {activeTab === 'info' && (
               <div className="bg-white p-12 rounded-[3.5rem] shadow-massive animate-in fade-in slide-in-from-left duration-500">
                  <h3 className="text-2xl font-black text-[#002147] mb-8 border-b pb-4">إدارة المعلومات الشخصية</h3>
                  <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-8">
                     <InputField label="الاسم الكامل" value={editingInfo.name} onChange={(v:any)=>setEditingInfo({...editingInfo, name: v})} />
                     <InputField label="البريد الإلكتروني" value={user.email || ''} readOnly />
                     <InputField label="رقم الهاتف" value={editingInfo.phone} onChange={(v:any)=>setEditingInfo({...editingInfo, phone: v})} />
                     <InputField label="تاريخ الميلاد" type="date" value={editingInfo.birthDate} onChange={(v:any)=>setEditingInfo({...editingInfo, birthDate: v})} />
                     <InputField label="الجنسية" value={editingInfo.nationality} onChange={(v:any)=>setEditingInfo({...editingInfo, nationality: v})} />
                     <div className="md:col-span-2 pt-6">
                        <button type="submit" className="w-full bg-[#002147] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-[#C5A059] transition-all">حفظ التغييرات</button>
                     </div>
                  </form>
               </div>
             )}

             {activeTab === 'travelers' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-left duration-500">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black text-[#002147]">المسافرون المسجلون (العائلة والزملاء)</h3>
                     <button className="bg-[#C5A059] text-[#002147] px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:scale-105 transition-all">+ إضافة مسافر</button>
                  </div>
                  {passengers.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-white flex justify-between items-center group hover:border-indigo-50 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border">👤</div>
                          <div>
                             <h4 className="text-xl font-black text-[#002147]">{p.fullName}</h4>
                             <p className="text-xs font-bold text-slate-400">العلاقة: {p.relationship} | الجواز: {p.passportNumber}</p>
                          </div>
                       </div>
                       <button className="opacity-0 group-hover:opacity-100 p-3 bg-rose-50 text-rose-500 rounded-xl transition-all">🗑️ حذف</button>
                    </div>
                  ))}
                  {passengers.length === 0 && <EmptyState label="لا يوجد مسافرون محفوظون" />}
               </div>
             )}

             {activeTab === 'passports' && (
               <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left duration-500">
                  {profile.savedPassports.map(p => (
                    <div key={p.id} className="bg-[#002147] p-8 rounded-[3rem] shadow-massive text-white relative overflow-hidden group">
                       <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-10">
                             <span className="text-3xl">🛡️</span>
                             <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Primary</span>
                          </div>
                          <h4 className="text-2xl font-black text-[#C5A059] mb-1">{p.fullName}</h4>
                          <p className="font-mono text-xl tracking-widest opacity-80">{p.passportNumber.replace(/.(?=.{3})/g, '*')}</p>
                          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                             <div>
                                <p className="text-[8px] font-black uppercase text-indigo-300">ينتهي في</p>
                                <p className="font-bold text-sm">{p.expiryDate}</p>
                             </div>
                             <button className="text-[10px] font-black underline opacity-50 hover:opacity-100">تعديل</button>
                          </div>
                       </div>
                    </div>
                  ))}
                  <div className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-all">
                     <span className="text-4xl mb-4">➕</span>
                     <p className="font-black text-[#002147]">إضافة جواز سفر جديد</p>
                  </div>
               </div>
             )}
          </main>
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-6 p-6 rounded-[1.8rem] transition-all font-black text-sm ${active ? 'bg-[#002147] text-white shadow-massive -translate-x-3' : 'bg-white text-slate-400 hover:bg-indigo-50 shadow-md'}`}>
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </button>
);

const InputField = ({ label, value, onChange, type = "text", readOnly = false }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
    <input 
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)}
      className={`w-full p-5 rounded-2xl outline-none font-black text-sm border-2 transition-all ${readOnly ? 'bg-slate-50 border-transparent text-slate-400' : 'bg-white border-slate-100 focus:border-[#C5A059]'}`}
    />
  </div>
);

const EmptyState = ({ label }: any) => (
  <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-slate-100">
    <span className="text-6xl block mb-6 grayscale opacity-20">📂</span>
    <p className="font-black text-slate-300 text-xl">{label}</p>
  </div>
);

export default MyProfileView;
