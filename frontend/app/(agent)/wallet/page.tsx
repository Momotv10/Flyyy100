
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, CreditCard, History, ArrowUpRight, 
  ArrowDownLeft, Plus, Download, TrendingUp, Filter 
} from 'lucide-react';

/**
 * Agent Wallet Hub
 * واجهة مالية متقدمة للوكلاء تتبع نظام القيد المزدوج في الباك اند
 */
const AgentWalletPage = ({ user }: any) => {
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#002366] tracking-tighter">المحفظة المالية الرقمية</h1>
          <p className="text-slate-400 font-bold text-lg mt-2">إدارة التدفقات النقدية والعمولات المكتسبة لوكالتكم.</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-[#002366] text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-black transition-all flex items-center gap-4">
              <Plus size={24} /> طلب شحن رصيد
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Core Financial Cards */}
        <div className="lg:col-span-8 space-y-8">
           <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#002366] p-10 rounded-[3.5rem] text-white shadow-massive relative overflow-hidden group">
                 <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                 <div className="flex justify-between items-start mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">الرصيد التشغيلي الحالي</span>
                    <Wallet className="text-[#C5A059]" size={28} />
                 </div>
                 <h2 className="text-6xl font-black tracking-tighter mb-4">${user?.balance.toLocaleString() || '0'}</h2>
                 <p className="text-xs font-bold text-indigo-200">الرصيد متاح للاستخدام الفوري في حجز التذاكر.</p>
                 <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                    <button className="text-xs font-black text-[#C5A059] flex items-center gap-2 hover:underline"><Download size={14} /> كشف حساب PDF</button>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[10px] font-black uppercase">حساب موثق</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white flex flex-col justify-center">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">العمولات المستحقة</p>
                       <h3 className="text-4xl font-black text-[#002366]">$1,450.00</h3>
                    </div>
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                       <TrendingUp size={28} />
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-slate-400">عمولات مؤكدة:</span>
                       <span className="text-[#002366]">$1,200.00</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-slate-400">قيد الانتظار:</span>
                       <span className="text-indigo-600">$250.00</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Ledger / Transaction History */}
           <div className="bg-white rounded-[3.5rem] shadow-massive border-4 border-white overflow-hidden">
              <div className="p-10 border-b flex justify-between items-center">
                 <h3 className="text-xl font-black text-[#002366] flex items-center gap-4">
                    <History size={24} className="text-indigo-600" /> آخر الحركات المالية
                 </h3>
                 <div className="flex bg-slate-50 p-1.5 rounded-xl border">
                    <FilterTab active={filterType === 'all'} label="الكل" onClick={() => setFilterType('all')} />
                    <FilterTab active={filterType === 'deduct'} label="حجوزات" onClick={() => setFilterType('deduct')} />
                    <FilterTab active={filterType === 'add'} label="شحن" onClick={() => setFilterType('add')} />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-right">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <tr>
                          <th className="p-8">العملية</th>
                          <th className="p-8">التاريخ</th>
                          <th className="p-8">المرجع</th>
                          <th className="p-8">المبلغ</th>
                          <th className="p-8">الحالة</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       <TransactionRow 
                          type="deduct" 
                          title="حجز تذكرة: سالم بن علي" 
                          date="اليوم، 10:45 AM" 
                          refNo="RES-88771" 
                          amount="-$450.00" 
                          status="Completed" 
                       />
                       <TransactionRow 
                          type="add" 
                          title="شحن رصيد - تحويل بنكي" 
                          date="أمس، 04:30 PM" 
                          refNo="TXN-99221" 
                          amount="+$5,000.00" 
                          status="Completed" 
                       />
                       <TransactionRow 
                          type="deduct" 
                          title="حجز تذكرة: فاطمة أحمد" 
                          date="02 ديسمبر، 09:15 AM" 
                          refNo="RES-88765" 
                          amount="-$320.00" 
                          status="Completed" 
                       />
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Secondary Info / Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white">
              <h4 className="text-xl font-black text-[#002366] mb-8">إدارة بطاقات الدفع</h4>
              <div className="space-y-4">
                 <PaymentCard brand="VISA" last4="8877" expiry="12/26" holder="احمد علي" color="bg-indigo-600" />
                 <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center gap-3 text-xs font-black text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                    <Plus size={16} /> إضافة بطاقة جديدة
                 </button>
              </div>
           </div>

           <div className="bg-amber-50 p-10 rounded-[3.5rem] border-4 border-amber-100/50">
              <h4 className="text-lg font-black text-amber-800 mb-4 flex items-center gap-3">
                 <CreditCard size={20} /> نصيحة مالية ذكية
              </h4>
              <p className="text-xs font-bold text-amber-700 leading-relaxed">
                 لاحظنا أن معدل استهلاك الرصيد في عطلات نهاية الأسبوع يزداد بنسبة 40%. ينصح بشحن المحفظة يوم الخميس لضمان استمرار الحجوزات الآلية.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const FilterTab = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${active ? 'bg-white text-[#002366] shadow-sm' : 'text-slate-400 hover:text-[#002366]'}`}>
    {label}
  </button>
);

const TransactionRow = ({ type, title, date, refNo, amount, status }: any) => (
  <tr className="hover:bg-slate-50 transition-colors group">
     <td className="p-8">
        <div className="flex items-center gap-4">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'add' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {type === 'add' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
           </div>
           <div>
              <p className="font-black text-sm text-[#002366]">{title}</p>
              <p className="text-[10px] font-bold text-slate-400">{date}</p>
           </div>
        </div>
     </td>
     <td className="p-8 font-bold text-xs text-slate-500">{date.split('،')[0]}</td>
     <td className="p-8 font-mono text-xs font-bold text-indigo-400">{refNo}</td>
     <td className={`p-8 font-black text-lg ${type === 'add' ? 'text-emerald-600' : 'text-[#002366]'}`}>{amount}</td>
     <td className="p-8">
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{status}</span>
     </td>
  </tr>
);

const PaymentCard = ({ brand, last4, holder, color }: any) => (
  <div className={`${color} p-6 rounded-3xl text-white shadow-xl relative overflow-hidden`}>
     <div className="flex justify-between items-start mb-8">
        <span className="font-black italic text-lg">{brand}</span>
        <div className="w-10 h-8 bg-amber-500/20 rounded-md"></div>
     </div>
     <p className="font-mono text-lg tracking-[0.2em] mb-4">**** **** **** {last4}</p>
     <div className="flex justify-between items-end">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{holder}</p>
        <span className="text-[10px] font-bold">12/26</span>
     </div>
  </div>
);

export default AgentWalletPage;
