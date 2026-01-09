
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { reportingService } from '../services/reportingService';
import { alertService, SmartAlert } from '../services/alertService';
import { User, Flight, Provider, Booking } from '../types';
// Add missing Loader2 import from lucide-react
import { Loader2 } from 'lucide-react';
import ProviderIssuanceManager from './ProviderIssuanceManager';
import ProviderInventoryManager from './ProviderInventoryManager';
import FlightManagement from './FlightManagement'; // إعادة استخدام نموذج إضافة الرحلات

interface Props { user: User; onBack: () => void; }

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-[#C5A059] text-[#002147] shadow-lg font-black' : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

const SummaryStat = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-4 border-white flex justify-between items-center group hover:scale-105 transition-all">
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
     </div>
     <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
        {icon}
     </div>
  </div>
);

const ProviderDashboard: React.FC<Props> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'orders' | 'inventory' | 'add_flight' | 'reports'>('summary');
  const [provider, setProvider] = useState<Provider | null>(null);
  const [stats, setStats] = useState(db.getProviderStats(user.id));
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  useEffect(() => {
    const p = db.getProviderById(user.id);
    if (p) setProvider(p);
    refreshAllData();
  }, [user.id]);

  const refreshAllData = async () => {
    setStats(db.getProviderStats(user.id));
    setIsLoadingAlerts(true);
    const newAlerts = await alertService.getProviderAlerts(user.id);
    setAlerts(newAlerts);
    setIsLoadingAlerts(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-tajawal overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-[#002147] text-white p-8 flex flex-col shadow-2xl z-20 overflow-hidden relative">
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-3xl"></div>
        
        <div className="mb-12 text-center relative z-10">
           <div className="w-20 h-20 bg-[#C5A059] text-[#002147] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl transform -rotate-3">🏗️</div>
           <h2 className="text-2xl font-black text-[#C5A059] tracking-tighter">
             {provider?.name || 'لوحة المزود'}
             <span className="text-white text-[10px] block opacity-40 font-bold uppercase tracking-widest mt-1">Provider Intelligence HUB</span>
           </h2>
        </div>
        
        <nav className="space-y-3 flex-1 relative z-10">
          <TabBtn active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} label="نظرة عامة" icon="📊" />
          <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} label="طلبات الإصدار" icon="🎟️" />
          <TabBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} label="إدارة المخزون" icon="📋" />
          <TabBtn active={activeTab === 'add_flight'} onClick={() => setActiveTab('add_flight')} label="إضافة رحلة" icon="➕" />
          <TabBtn active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="التقارير والذكاء" icon="📈" />
        </nav>

        <button onClick={onBack} className="mt-auto py-5 bg-rose-500/10 text-rose-400 font-black rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-xs border border-rose-500/20 relative z-10">خروج آمن للمزود</button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 md:p-20 overflow-y-auto custom-scrollbar bg-slate-pro relative">
        
        {activeTab === 'summary' && (
          <div className="animate-in fade-in slide-in-from-bottom duration-700 space-y-12">
             <div className="flex justify-between items-end">
                <div>
                   <h1 className="text-4xl font-black text-[#002147] tracking-tighter">ملخص الأداء التشغيلي</h1>
                   <p className="text-slate-400 font-bold text-lg mt-1">إحصائيات حية وتنبيهات الذكاء الاصطناعي للمزود.</p>
                </div>
                <div className="flex gap-4">
                   <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border font-bold text-xs">اليوم: {new Date().toLocaleDateString('ar-YE')}</div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SummaryStat label="إجمالي المبيعات" value={`$${stats.totalSales.toLocaleString()}`} icon="💰" color="text-emerald-600" />
                <SummaryStat label="طلبات الإصدار" value={stats.activeOrders} icon="⌛" color="text-amber-600" />
                <SummaryStat label="الرحلات النشطة" value={stats.totalFlights} icon="✈️" color="text-indigo-600" />
                <SummaryStat label="الرصيد المستحق" value={`$${stats.balance.toLocaleString()}`} icon="⚖️" color="text-[#C5A059]" />
             </div>

             <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                   {/* Smart Alerts Section */}
                   <div className="bg-white p-10 rounded-[3rem] shadow-massive border-4 border-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[10rem]"></div>
                      <div className="flex justify-between items-center mb-10 relative z-10">
                        <h4 className="text-2xl font-black text-[#002147] flex items-center gap-4">
                           <span className="p-3 bg-indigo-50 rounded-2xl">🤖</span> تنبيهات محرك STAMS الذكي
                        </h4>
                        {/* Fix: Added Loader2 import from lucide-react */}
                        {isLoadingAlerts && <Loader2 className="animate-spin text-slate-300" />}
                      </div>
                      <div className="space-y-4 relative z-10">
                        {alerts.map(alert => (
                          <div key={alert.id} className={`p-8 rounded-[2.5rem] border-2 flex justify-between items-center transition-all hover:scale-[1.02] ${alert.severity === 'high' ? 'bg-rose-50 border-rose-100 shadow-sm shadow-rose-200/50' : 'bg-amber-50 border-amber-100'}`}>
                             <div className="flex items-center gap-8">
                                <span className="text-4xl shadow-xl bg-white p-4 rounded-3xl">{alert.type === 'inventory' ? '📦' : '🏷️'}</span>
                                <div>
                                   <p className="font-black text-[#002147] text-lg">{alert.title}</p>
                                   <p className="text-xs font-bold text-slate-500 mt-1 max-w-md leading-relaxed">{alert.message}</p>
                                </div>
                             </div>
                             <button className="bg-[#002147] text-white px-8 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-black transition-all">{alert.actionLabel}</button>
                          </div>
                        ))}
                        {alerts.length === 0 && !isLoadingAlerts && <p className="text-center py-20 text-slate-300 font-black">لا توجد تنبيهات حيوية حالياً</p>}
                      </div>
                   </div>
                </div>
                
                <div className="lg:col-span-4 bg-[#002147] p-10 rounded-[3rem] text-white shadow-massive flex flex-col justify-center text-center">
                   <h4 className="text-xl font-black text-[#C5A059] mb-4">كفاءة الاستجابة للإصدار</h4>
                   <div className="text-6xl font-black mb-6">98%</div>
                   <p className="text-xs font-bold text-indigo-200 leading-relaxed opacity-60">أداء ممتاز! استجابتك لطلبات الإصدار خلال الـ 24 ساعة الماضية تفوق معدل السوق.</p>
                   <div className="mt-10 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '98%' }}></div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'orders' && <ProviderIssuanceManager providerId={user.id} />}
        {activeTab === 'inventory' && <ProviderInventoryManager providerId={user.id} />}
        {activeTab === 'add_flight' && <FlightManagement />}
        {activeTab === 'reports' && (
          <div className="h-full flex flex-col items-center justify-center p-20 bg-white rounded-[3.5rem] shadow-massive border-4 border-dashed border-slate-100 text-center">
             <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center text-6xl mb-8">📈</div>
             <h3 className="text-3xl font-black text-[#002147]">محرك التقارير المتقدم للمزود</h3>
             <p className="text-slate-400 font-bold text-xl mt-4 max-w-xl">تحليل الأرباح، المسارات الأكثر طلباً، وتوقعات الطلب الموسمية. سيتم إطلاق النسخة الكاملة قريباً.</p>
             <button className="mt-10 bg-[#002147] text-[#C5A059] px-12 py-4 rounded-2xl font-black text-sm">تصدير بيانات المبيعات الحالية</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderDashboard;
