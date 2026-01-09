
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { User, Booking, Flight, UserRole } from '../types';
import { 
  LayoutDashboard, Search, Users, BarChart3, Terminal, LogOut, 
  Wallet, Bell, Menu, TrendingUp, CreditCard, ChevronRight, Plus, 
  History, UserPlus, ArrowUpRight
} from 'lucide-react';
import HomeView from './HomeView';
import ResultsView from './ResultsView';
import TravelerEntryView from './TravelerEntryView';
import AgentApiPlayground from './AgentApiPlayground';

interface Props { 
  user: User; 
  onBack: () => void; 
  onNewBooking: () => void;
}

const AgentDashboard: React.FC<Props> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'customers' | 'wallet' | 'api'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(db.getAgentDashboardStats(user.id));
  const [bookings, setBookings] = useState<Booking[]>(db.getUserBookings(user.id));
  
  // Search Logic State
  const [searchView, setSearchView] = useState<'form' | 'results' | 'booking'>('form');
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-tajawal overflow-hidden">
      
      {/* Sidebar - Enterprise Navy */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-[#002366] text-white transition-all duration-500 flex flex-col z-50 shadow-2xl overflow-hidden`}>
        <div className="h-24 flex items-center px-8 border-b border-white/5 gap-4">
          <div className="w-12 h-12 bg-[#C5A059] rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
             <LayoutDashboard size={24} className="text-[#002366]" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight leading-none">STAMS</span>
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1">Agent Portal</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<TrendingUp size={22} />} label="نظرة عامة" isOpen={isSidebarOpen} />
          <SidebarItem active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setSearchView('form'); }} icon={<Search size={22} />} label="محرك الحجز" isOpen={isSidebarOpen} />
          <SidebarItem active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={22} />} label="المحفظة المالية" isOpen={isSidebarOpen} />
          <SidebarItem active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<Users size={22} />} label="قاعدة المسافرين" isOpen={isSidebarOpen} />
          <SidebarItem active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Terminal size={22} />} label="بوابة المطورين" isOpen={isSidebarOpen} />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={onBack} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all group">
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-black text-sm">خروج آمن</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-12 shrink-0 z-40 shadow-sm">
          <div className="flex items-center gap-8">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all">
               <Menu size={24} />
            </button>
            <div className="flex flex-col">
               <h2 className="text-xl font-black text-[#002366]">مرحباً، {user.name}</h2>
               <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">وكالة مبيعات معتمدة | رقم: AGT-2024</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Wallet Quick View */}
            <div className="hidden lg:flex items-center bg-slate-50 border-2 border-white rounded-[1.5rem] px-6 py-3 gap-4 shadow-sm">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={18} />
               </div>
               <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase leading-none">رصيد الوكالة</span>
                  <span className="text-lg font-black text-[#002366] mt-1">${user.balance.toLocaleString()}</span>
               </div>
               <button onClick={() => setActiveTab('wallet')} className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-black transition-all">
                  <Plus size={16} />
               </button>
            </div>

            <div className="flex items-center gap-6 border-r pr-8 border-slate-100">
               <button className="relative p-3 text-slate-400 hover:text-[#002366] transition-all">
                  <Bell size={24} />
                  <span className="absolute top-2 left-2 w-3 h-3 bg-rose-500 rounded-full border-4 border-white"></span>
               </button>
               <div className="w-12 h-12 bg-[#002366] rounded-2xl flex items-center justify-center text-white font-black shadow-xl">
                  {user.name.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-12 bg-[#F8FAFC] custom-scrollbar">
          
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-black text-[#002366] tracking-tighter">ملخص العمليات</h1>
                    <p className="text-slate-400 font-bold text-lg mt-2">تحليل أداء مبيعات الوكالة والتدفقات المالية.</p>
                  </div>
                  <button onClick={() => { setActiveTab('search'); setSearchView('form'); }} className="bg-[#002366] text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-900/20 flex items-center gap-4 hover:scale-105 transition-all">
                     <Plus size={24} /> حجز رحلة جديدة
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <MetricCard label="إجمالي المبيعات" value={`$${stats.monthlySales.toLocaleString()}`} icon={<BarChart3 />} up change="+14%" />
                  <MetricCard label="الحجوزات النشطة" value={stats.totalBookings} icon={<TrendingUp />} up change="+8" />
                  <MetricCard label="عمولات مستحقة" value={`$${stats.monthlyCommission.toLocaleString()}`} icon={<Wallet />} up change="+22%" />
                  <MetricCard label="المسافرون المسجلون" value={stats.activeCustomers} icon={<Users />} change="Stable" />
               </div>

               <div className="grid lg:grid-cols-12 gap-10">
                  {/* Recent Activity */}
                  <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-[#002366]">أحدث طلبات الحجز</h3>
                        <button className="text-xs font-black text-indigo-600 flex items-center gap-2">عرض الكل <ChevronRight size={14}/></button>
                     </div>
                     <div className="space-y-4">
                        {bookings.slice(0, 5).map(b => (
                          <div key={b.id} className="flex justify-between items-center p-6 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all">
                                   <TrendingUp size={24} />
                                </div>
                                <div>
                                   <p className="text-lg font-black text-[#002366]">{b.passengerName}</p>
                                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{b.bookingRef} | {b.flightSnapshot?.departure} ➔ {b.flightSnapshot?.arrival}</p>
                                </div>
                             </div>
                             <div className="text-left">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest shadow-sm ${b.status === 'ready' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                   {b.status === 'ready' ? 'تم الإصدار' : 'قيد المعالجة'}
                                </span>
                                <p className="text-lg font-black text-[#002366] mt-3">${b.totalAmount}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Wallet & Quick Info */}
                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-[#002366] p-10 rounded-[3rem] text-white shadow-massive relative overflow-hidden group">
                        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10">المحفظة الرقمية</h4>
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-amber-500">الرصيد التشغيلي</p>
                           <p className="text-5xl font-black tracking-tighter">${user.balance.toLocaleString()}</p>
                        </div>
                        <div className="mt-12 flex gap-4">
                           <button onClick={() => setActiveTab('wallet')} className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-3">
                              <History size={16} /> السجل
                           </button>
                           <button onClick={() => setActiveTab('wallet')} className="flex-1 bg-[#C5A059] text-[#002366] py-4 rounded-2xl font-black text-xs shadow-xl transition-all">
                              شحن الرصيد
                           </button>
                        </div>
                     </div>

                     <div className="bg-white p-8 rounded-[3rem] shadow-massive border-4 border-white">
                        <h4 className="text-lg font-black text-[#002366] mb-6 flex items-center gap-3">
                           <Users size={20} className="text-indigo-600" /> اختصارات سريعة
                        </h4>
                        <div className="space-y-3">
                           <QuickAction label="إضافة مسافر جديد" icon={<UserPlus size={18}/>} />
                           <QuickAction label="تصدير كشف حساب" icon={<History size={18}/>} />
                           <QuickAction label="الربط البرمجي API" icon={<Terminal size={18}/>} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               {searchView === 'form' && (
                  <div className="bg-white p-12 rounded-[3.5rem] shadow-massive border-4 border-white">
                     <div className="flex items-center gap-6 mb-12 border-b pb-8">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                           <Search size={28} />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-[#002366]">محرك الحجز الفوري للوكلاء</h2>
                           <p className="text-slate-400 font-bold mt-1">ابحث عن أفضل الأسعار والرحلات لعملائك بضغطة زر.</p>
                        </div>
                     </div>
                     <HomeView 
                        onSearch={(results) => { setSearchResults(results); setSearchView('results'); }} 
                        onBookingStart={(flight) => { setSelectedFlight(flight); setSearchView('booking'); }} 
                        currency="USD" 
                     />
                  </div>
               )}
               {searchView === 'results' && (
                  <ResultsView 
                     flights={searchResults} 
                     onBook={(f) => { setSelectedFlight(f); setSearchView('booking'); }} 
                     onModifySearch={() => setSearchView('form')} 
                  />
               )}
               {searchView === 'booking' && selectedFlight && (
                  <TravelerEntryView 
                     flight={selectedFlight} 
                     onConfirm={() => setActiveTab('overview')} 
                     onBack={() => setSearchView('results')} 
                  />
               )}
            </div>
          )}

          {activeTab === 'api' && <AgentApiPlayground apiKey="STAMS-AGT-TEST-KEY" />}
          
          {/* Placeholder for Wallet Detail */}
          {activeTab === 'wallet' && (
            <div className="bg-white p-24 rounded-[3.5rem] shadow-massive border-4 border-white text-center flex flex-col items-center">
               <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8">💳</div>
               <h2 className="text-4xl font-black text-[#002147]">إدارة الرصيد والتحويلات</h2>
               <p className="text-slate-400 font-bold text-xl mt-4 max-w-xl">وكالتكم تملك رصيداً بقيمة <span className="text-[#002147]">${user.balance.toLocaleString()}</span>. يمكنك شحن الرصيد عبر التحويل البنكي المباشر أو المحافظ الرقمية المعتمدة.</p>
               <button className="mt-12 bg-[#002147] text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">طلب شحن رصيد جديد</button>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white p-24 rounded-[3.5rem] shadow-massive border-4 border-white text-center flex flex-col items-center">
               <div className="w-32 h-32 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8">👥</div>
               <h2 className="text-4xl font-black text-[#002147]">قاعدة بيانات المسافرين</h2>
               <p className="text-slate-400 font-bold text-xl mt-4 max-w-xl">إدارة المسافرين المحفوظين لتسريع عملية الحجز لعملائك الدائمين.</p>
               <button className="mt-12 bg-[#002147] text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">إضافة مسافر للقاعدة</button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label, isOpen }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-white/10 text-white shadow-xl border-r-4 border-amber-500 rounded-r-none' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
  >
    <span className="shrink-0">{icon}</span>
    {isOpen && <span className="text-sm font-black">{label}</span>}
  </button>
);

const MetricCard = ({ label, value, icon, change, up }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-4 border-white flex justify-between items-center group hover:border-indigo-600/10 transition-all">
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-[#002366] tracking-tighter">{value}</p>
      <div className={`flex items-center gap-1 text-[10px] font-black ${up ? 'text-emerald-500' : 'text-slate-400'}`}>
         {up ? <ArrowUpRight size={14}/> : null} {change}
      </div>
    </div>
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-[#002366] group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm">
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);

const QuickAction = ({ label, icon }: any) => (
  <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-600 hover:bg-white transition-all group">
     <div className="flex items-center gap-4">
        <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">{icon}</span>
        <span className="text-xs font-black text-slate-600 group-hover:text-[#002366]">{label}</span>
     </div>
     <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
  </button>
);

export default AgentDashboard;
