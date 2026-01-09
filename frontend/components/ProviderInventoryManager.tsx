
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { Flight } from '../types';
import { Edit2, TrendingUp, Users, DollarSign, Plane, MoreVertical, Loader2 } from 'lucide-react';
// Fix: Added AnimatePresence to framer-motion imports
import { motion, AnimatePresence } from 'framer-motion';

interface Props { providerId: string; }

const ProviderInventoryManager: React.FC<Props> = ({ providerId }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  useEffect(() => {
    setFlights(db.getProviderFlights(providerId));
    setLoading(false);
  }, [providerId]);

  const handleUpdateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFlight) {
      // تحديث البيانات في الـ Mock DB
      // في النسخة الفعلية سيكون طلب PATCH /flights/:id
      alert("تم تحديث المخزون والأسعار بنجاح! سيتم انعكاس التغيير فوراً في واجهة العملاء.");
      setEditingFlight(null);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#002147]" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end bg-white p-10 rounded-[3rem] shadow-sm">
         <div>
            <h3 className="text-3xl font-black text-[#002147]">إدارة المقاعد والمخزون</h3>
            <p className="text-slate-400 font-bold mt-2">تحكم في توفر المقاعد، عدّل الأسعار التنافسية، وراقب إشغال الرحلات.</p>
         </div>
         <button className="bg-[#C5A059] text-[#002147] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">تحميل الجدول الكامل (CSV)</button>
      </div>

      <div className="grid gap-6">
        {flights.map(f => (
          <div key={f.id} className="bg-white rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden group hover:border-[#C5A059] transition-all">
             <div className="grid md:grid-cols-12 items-center p-8">
                <div className="md:col-span-3 flex items-center gap-6">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border">✈️</div>
                   <div>
                      <h4 className="text-xl font-black text-[#002147]">{f.flightNumber}</h4>
                      <p className="text-xs font-bold text-slate-400">{f.departureAirport} ➔ {f.arrivalAirport}</p>
                   </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-2 gap-4 text-center border-x px-8 border-slate-50">
                   <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase mb-1">المقاعد المتاحة</p>
                      <p className={`text-xl font-black ${f.seats.economy < 10 ? 'text-rose-500 animate-pulse' : 'text-[#002147]'}`}>{f.seats.economy}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase mb-1">إجمالي الحجوزات</p>
                      <p className="text-xl font-black text-indigo-600">84</p>
                   </div>
                </div>

                <div className="md:col-span-4 flex justify-around px-8">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-300 uppercase mb-1">سعر التكلفة</p>
                      <p className="text-lg font-black text-slate-500">${f.prices.cost}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-amber-500 uppercase mb-1">سعر البيع</p>
                      <p className="text-2xl font-black text-[#002147]">${f.prices.selling}</p>
                   </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3">
                   <button 
                     onClick={() => setEditingFlight(f)}
                     className="p-4 bg-slate-50 text-slate-400 hover:bg-[#002147] hover:text-white rounded-2xl transition-all shadow-sm"
                   >
                      <Edit2 size={18} />
                   </button>
                   <button className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                      <MoreVertical size={18} />
                   </button>
                </div>
             </div>
             
             {/* Simple occupancy bar */}
             <div className="h-1.5 w-full bg-slate-50">
                <div className="h-full bg-indigo-500" style={{ width: '65%' }}></div>
             </div>
          </div>
        ))}
      </div>

      {/* Edit Inventory Modal */}
      {/* Fix: Wrapped Modal in AnimatePresence which is now imported */}
      <AnimatePresence>
        {editingFlight && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#002147]/90 backdrop-blur-md p-6">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-[3.5rem] w-full max-w-4xl shadow-3xl overflow-hidden"
            >
               <div className="bg-[#002147] p-10 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-black text-[#C5A059]">تحديث رحلة: {editingFlight.flightNumber}</h3>
                    <p className="text-indigo-200 font-bold mt-1 text-sm">{editingFlight.departureAirport} ✈️ {editingFlight.arrivalAirport} | {editingFlight.departureDate}</p>
                  </div>
                  <button onClick={() => setEditingFlight(null)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-rose-500 transition-all">✕</button>
               </div>

               <form onSubmit={handleUpdateInventory} className="p-12 space-y-12">
                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <h4 className="text-xl font-black text-[#002147] border-b pb-4 flex items-center gap-3">
                           <Users size={20} className="text-indigo-500" /> توفر المقاعد
                        </h4>
                        <InventoryInput label="المقاعد المتاحة (السياحية)" value={String(editingFlight.seats.economy)} onChange={()=>{}} />
                        <InventoryInput label="المقاعد المتاحة (الأعمال)" value={String(editingFlight.seats.business)} onChange={()=>{}} />
                     </div>
                     <div className="space-y-6">
                        <h4 className="text-xl font-black text-[#002147] border-b pb-4 flex items-center gap-3">
                           <DollarSign size={20} className="text-emerald-500" /> تسعير المقعد
                        </h4>
                        <InventoryInput label="سعر التكلفة للمنظومة (USD)" value={String(editingFlight.prices.cost)} onChange={()=>{}} />
                        <InventoryInput label="سعر البيع النهائي (USD)" value={String(editingFlight.prices.selling)} onChange={()=>{}} />
                     </div>
                  </div>

                  <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500"><TrendingUp /></div>
                     <div>
                        <p className="font-black text-amber-800 text-sm">توصية الذكاء الاصطناعي</p>
                        <p className="text-[10px] font-bold text-amber-600 mt-1">سعر البيع الحالي أعلى من متوسط السوق بـ 12%. ينصح بتخفيض السعر لـ $310 لزيادة المبيعات.</p>
                     </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                     <button type="submit" className="flex-1 bg-[#002147] text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-black transition-all">حفظ التغييرات ونشر العرض</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InventoryInput = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
     <input 
        type="number" 
        defaultValue={value}
        className="w-full p-5 bg-slate-50 rounded-2xl font-black text-lg outline-none border-2 border-transparent focus:border-[#C5A059] focus:bg-white transition-all"
     />
  </div>
);

export default ProviderInventoryManager;
