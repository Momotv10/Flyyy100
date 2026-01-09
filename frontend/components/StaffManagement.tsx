
import React, { useState } from 'react';
import { db } from '../services/mockDatabase';
import { User, UserRole } from '../types';

const StaffManagement: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
       <div>
          <h2 className="text-5xl font-black text-[#002147] tracking-tighter">إدارة الموظفين والمهام</h2>
          <p className="text-slate-400 font-bold text-xl mt-2">إنشاء حسابات الموظفين وتخصيص الصلاحيات التشغيلية.</p>
       </div>

       <div className="bg-white p-14 rounded-[3.5rem] shadow-massive border-4 border-white text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-5xl">👨‍💻</div>
          <h3 className="text-2xl font-black text-[#002147] mb-4">وحدة التحكم في الصلاحيات قيد التنفيذ</h3>
          <p className="text-slate-400 font-bold max-w-md mx-auto leading-relaxed">بإمكانك حالياً إضافة الموظفين من واجهة "إدارة شركات الطيران" لربطهم بعمليات الإصدار المالية آلياً.</p>
          <button className="mt-10 bg-[#002147] text-[#C5A059] px-10 py-4 rounded-2xl font-black text-sm shadow-xl">إضافة موظف عام +</button>
       </div>
    </div>
  );
};

export default StaffManagement;
