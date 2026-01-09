
import React, { useState } from 'react';
import { db } from '../services/mockDatabase';
import { Airline, AirlineStaff } from '../types';
import { Plus, ShieldCheck, Globe, Trash2, Building2, Users } from 'lucide-react';

const AirlineManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [airlines, setAirlines] = useState<Airline[]>(db.getAirlines());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-black text-[#002366]">إدارة شركات الطيران</h2>
          <p className="text-xs text-slate-400 font-bold mt-1">تحديد السياسات، العمولات، وشركاء التشغيل.</p>
        </div>
        <button onClick={() => setView('add')} className="bg-[#002366] text-white px-6 py-3 rounded text-xs font-bold flex items-center gap-2 hover:bg-blue-900 transition-all">
          <Plus size={16} /> إضافة شركة طيران
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {airlines.map(airline => (
          <div key={airline.id} className="enterprise-card p-6 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-6">
               <div className="w-16 h-16 bg-slate-50 rounded p-2 flex items-center justify-center border border-slate-100">
                  <img src={airline.logo} className="max-w-full grayscale group-hover:grayscale-0 transition-all" alt="" />
               </div>
               <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${airline.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                 {airline.isActive ? 'نشطة' : 'متوقفة'}
               </span>
            </div>
            
            <h3 className="text-lg font-black text-[#002366] mb-1">{airline.name}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-6">
              <Globe size={12} /> {airline.country} | {airline.iata}
            </div>

            <div className="mt-auto space-y-3 pt-6 border-t border-slate-100">
               <div className="flex justify-between text-xs">
                  <span className="text-slate-400">عمولة النظام:</span>
                  <span className="font-bold text-[#002366]">{airline.systemCommission}%</span>
               </div>
               <div className="flex justify-between text-xs">
                  <span className="text-slate-400">فريق الإصدار:</span>
                  <span className="font-bold text-blue-600">{airline.issueStaff.length} موظف</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AirlineManagement;
