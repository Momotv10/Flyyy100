
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { AIRPORTS } from '../services/airportData';
import { Flight, Airline, ReturnDateOption, UserRole } from '../types';

const FlightManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [step, setStep] = useState(1);
  const [airlines] = useState<Airline[]>(db.getAirlines());
  const [flights, setFlights] = useState<Flight[]>(db.getFlights());
  
  // التحقق من هوية المستخدم للربط بالـ ProviderId
  const currentUser = (window as any).currentUser || { id: 'admin', role: UserRole.ADMIN };

  const [formData, setFormData] = useState<Partial<Flight>>({
    flightNumber: '',
    airlineId: '',
    departureAirport: '',
    arrivalAirport: '',
    departureTerminal: '1',
    arrivalTerminal: '1',
    aircraftType: 'Airbus A320',
    departureTime: '12:00',
    arrivalTime: '15:00',
    timeZoneOffset: 0,
    departureDate: new Date().toISOString().split('T')[0],
    arrivalDate: new Date().toISOString().split('T')[0],
    classes: {
      economy: { seats: 150, costPrice: 250, agentCommission: 20, systemCommission: 15, sellingPrice: 350 },
      business: { seats: 20, costPrice: 500, agentCommission: 40, systemCommission: 30, sellingPrice: 700 },
      first: { seats: 8, costPrice: 1200, agentCommission: 100, systemCommission: 50, sellingPrice: 1500 }
    },
    isRoundTrip: false,
    status: 'active'
  });

  const handleSave = () => {
    if (!formData.flightNumber || !formData.airlineId || !formData.departureAirport || !formData.arrivalAirport) {
      alert("يرجى إكمال البيانات الأساسية للرحلة أولاً.");
      return;
    }

    const economy = formData.classes?.economy;
    const summaryPrices = {
      cost: economy?.costPrice || 0,
      selling: economy?.sellingPrice || 0,
      agentCommission: economy?.agentCommission || 0,
      systemTax: economy?.systemCommission || 0,
      systemNetProfit: (economy?.sellingPrice || 0) - (economy?.costPrice || 0) - (economy?.agentCommission || 0)
    };

    const newFlight = {
      ...formData,
      id: `fl-${Date.now()}`,
      providerId: currentUser.id,
      prices: summaryPrices,
      seats: {
        economy: formData.classes?.economy.seats || 0,
        business: formData.classes?.business.seats || 0,
        first: formData.classes?.first.seats || 0
      },
      departureTimeFormatted: formData.departureTime,
      arrivalTimeFormatted: formData.arrivalTime,
      createdAt: new Date().toISOString(),
      durationMinutes: 180, // افتراضي للتبسيط
    } as Flight;

    db.addFlight(newFlight);
    setFlights(db.getFlights());
    setView('list');
    setStep(1);
    alert("تم اعتماد الرحلة ونشرها فوراً في محرك البحث! ✈️🚀");
  };

  const filteredFlights = currentUser.role === UserRole.ADMIN 
    ? flights 
    : flights.filter(f => f.providerId === currentUser.id);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-[#002147] tracking-tighter">
            {currentUser.role === UserRole.PROVIDER ? 'إدارة رحلات المزود' : 'جدولة الرحلات المركزية'}
          </h2>
          <p className="text-slate-400 font-bold text-lg">تحكم في المخزون، السعة، والأسعار التشغيلية.</p>
        </div>
        {view === 'list' && (
          <button onClick={() => setView('add')} className="bg-[#C5A059] text-[#002147] px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 transition-all">
            إضافة رحلة جديدة ➕
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="grid gap-6">
          {filteredFlights.length > 0 ? filteredFlights.map(f => {
            const airline = airlines.find(a => a.id === f.airlineId);
            return (
              <div key={f.id} className="bg-white p-8 rounded-[3rem] shadow-massive border-4 border-white flex justify-between items-center group hover:border-[#C5A059] transition-all">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border shadow-inner">
                    <img src={airline?.logo} className="max-w-full" alt="" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-[#002147]">{f.departureAirport} ✈️ {f.arrivalAirport}</h4>
                    <p className="text-slate-400 font-bold">رقم الرحلة: {f.flightNumber} | تاريخ الإقلاع: {f.departureDate}</p>
                  </div>
                </div>
                <div className="text-center px-10 border-r border-slate-100">
                   <p className="text-[10px] font-black text-slate-300 uppercase">المقاعد المتبقية</p>
                   <p className={`text-2xl font-black ${f.seats.economy < 20 ? 'text-rose-500' : 'text-emerald-600'}`}>{f.seats.economy} مقعد</p>
                </div>
                <div className="text-center px-10 border-r border-slate-100">
                  <p className="text-[10px] font-black text-slate-300 uppercase">سعر البيع (السياحية)</p>
                  <p className="text-2xl font-black text-[#002147]">${f.prices?.selling}</p>
                </div>
                <button onClick={() => db.deleteFlight(f.id)} className="text-rose-400 font-black text-xs hover:text-rose-600 transition-colors">إلغاء الرحلة</button>
              </div>
            );
          }) : (
            <div className="bg-slate-50 p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-100">
               <span className="text-8xl mb-8 block opacity-10">✈️</span>
               <p className="text-2xl font-black text-slate-300">لا توجد رحلات مجدولة حالياً لهذا المزود</p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-[3.5rem] shadow-massive border-8 border-slate-50 overflow-hidden">
          <div className="bg-[#002147] p-10 flex justify-between items-center text-white">
            <div className="flex gap-4">
              {[1,2,3].map(s => (
                <div key={s} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${step === s ? 'bg-[#C5A059] text-[#002147] scale-110 shadow-lg' : s < step ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                  {s < step ? '✓' : s}
                </div>
              ))}
            </div>
            <h3 className="text-2xl font-black text-[#C5A059]">
              {step === 1 && 'بيانات المسار والشركة'}
              {step === 2 && 'أوقات التشغيل'}
              {step === 3 && 'المخزون والأسعار'}
            </h3>
          </div>

          <div className="p-16">
            {step === 1 && (
              <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">شركة الطيران المشغلة</label>
                  <select value={formData.airlineId} onChange={e => setFormData({...formData, airlineId: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black text-lg border-2 border-transparent focus:border-[#C5A059]">
                    <option value="">اختر الشركة</option>
                    {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <InputField label="رقم الرحلة الرسمي" value={formData.flightNumber} onChange={(v: string) => setFormData({...formData, flightNumber: v.toUpperCase()})} icon="✈️" />
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">مطار المغادرة</label>
                  <select value={formData.departureAirport} onChange={e => setFormData({...formData, departureAirport: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black text-lg">
                    <option value="">اختر المطار</option>
                    {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">مطار الوصول</label>
                  <select value={formData.arrivalAirport} onChange={e => setFormData({...formData, arrivalAirport: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black text-lg">
                    <option value="">اختر المطار</option>
                    {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
                <InputField label="تاريخ الإقلاع" type="date" value={formData.departureDate} onChange={(v: string) => setFormData({...formData, departureDate: v})} />
                <InputField label="تاريخ الوصول" type="date" value={formData.arrivalDate} onChange={(v: string) => setFormData({...formData, arrivalDate: v})} />
                <InputField label="وقت الإقلاع" type="time" value={formData.departureTime} onChange={(v: string) => setFormData({...formData, departureTime: v})} />
                <InputField label="وقت الوصول" type="time" value={formData.arrivalTime} onChange={(v: string) => setFormData({...formData, arrivalTime: v})} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-in fade-in">
                <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-10">
                   <h4 className="font-black text-[#002147] border-b pb-4">تحديد سعة المقاعد والأسعار (Inventory Matrix)</h4>
                   {['economy', 'business', 'first'].map(cls => (
                     <div key={cls} className="grid grid-cols-4 gap-6 items-center">
                        <span className="font-black text-indigo-600 capitalize text-lg">{cls}</span>
                        <div className="space-y-2">
                           <p className="text-[8px] font-black text-slate-400 text-center uppercase">المقاعد</p>
                           <input type="number" value={(formData.classes as any)[cls].seats} onChange={e => {
                             const newClasses = { ...formData.classes };
                             (newClasses as any)[cls].seats = Number(e.target.value);
                             setFormData({...formData, classes: newClasses as any});
                           }} className="w-full p-4 bg-white rounded-xl outline-none font-black text-center shadow-sm border border-slate-100" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[8px] font-black text-slate-400 text-center uppercase">التكلفة (USD)</p>
                           <input type="number" value={(formData.classes as any)[cls].costPrice} onChange={e => {
                             const newClasses = { ...formData.classes };
                             (newClasses as any)[cls].costPrice = Number(e.target.value);
                             setFormData({...formData, classes: newClasses as any});
                           }} className="w-full p-4 bg-white rounded-xl outline-none font-black text-center shadow-sm border border-slate-100" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[8px] font-black text-amber-500 text-center uppercase">البيع (USD)</p>
                           <input type="number" value={(formData.classes as any)[cls].sellingPrice} onChange={e => {
                             const newClasses = { ...formData.classes };
                             (newClasses as any)[cls].sellingPrice = Number(e.target.value);
                             setFormData({...formData, classes: newClasses as any});
                           }} className="w-full p-4 bg-white rounded-xl outline-none font-black text-center shadow-sm border border-amber-100" />
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            <div className="mt-16 flex justify-between pt-10 border-t items-center">
              <button onClick={() => step === 1 ? setView('list') : setStep(s => s - 1)} className="px-10 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">
                <span>{step === 1 ? 'إلغاء' : '← السابق'}</span>
              </button>
              <button onClick={() => step === 3 ? handleSave() : setStep(s => s + 1)} className="bg-[#002147] text-white px-20 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-[#C5A059] hover:text-[#002147] transition-all transform active:scale-95">
                {step === 3 ? 'اعتماد ونشر الرحلة فوراً 🚀' : 'الخطوة التالية →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, icon, type = "text" }: any) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{label}</label>
    <div className="relative">
      {icon && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-30">{icon}</span>}
      <input 
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full p-5 rounded-2xl outline-none font-black text-lg border-2 border-transparent transition-all bg-slate-50 text-[#002147] focus:bg-white focus:border-[#C5A059] ${icon ? 'pr-16' : 'pr-6'}`}
      />
    </div>
  </div>
);

export default FlightManagement;
