
import React from 'react';
import { db } from '../services/mockDatabase';
import { reportingService } from '../services/reportingService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Ticket, Users, CreditCard, Bell, ChevronRight, ArrowUpRight
} from 'lucide-react';
import AirlineManagement from './AirlineManagement';
import FlightManagement from './FlightManagement';
import BookingsManagement from './BookingsManagement';
import FinancialManagement from './FinancialManagement';
import UserManagement from './UserManagement';

const AdminDashboard = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'airlines' | 'flights' | 'bookings' | 'finance' | 'users'>('overview');
  const stats = db.getAdminStats();
  const dailyReport = reportingService.getDailyFinancialReport(new Date().toISOString().split('T')[0]);

  return (
    <div className="flex h-screen bg-[#F4F7FA] overflow-hidden font-tajawal">
      {/* Sidebar */}
      <aside className="w-80 bg-[#002366] text-white p-8 flex flex-col shadow-2xl">
        <div className="mb-12">
          <h2 className="text-2xl font-black text-amber-500 tracking-tighter">STAMS HUB</h2>
          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">Enterprise Command Center</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <SidebarBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="نظرة عامة" icon={<TrendingUp size={20}/>} />
          <SidebarBtn active={activeTab === 'airlines'} onClick={() => setActiveTab('airlines')} label="شركات الطيران" icon={<Ticket size={20}/>} />
          <SidebarBtn active={activeTab === 'flights'} onClick={() => setActiveTab('flights')} label="جدولة الرحلات" icon={<TrendingUp size={20}/>} />
          <SidebarBtn active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} label="منصة الإصدار" icon={<Bell size={20}/>} />
          <SidebarBtn active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label="المركز المالي" icon={<CreditCard size={20}/>} />
          <SidebarBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="إدارة الوكلاء" icon={<Users size={20}/>} />
        </nav>

        <button onClick={onBack} className="mt-auto py-4 bg-rose-500/10 text-rose-400 font-bold rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-xs">خروج آمن</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-[#002366] tracking-tighter">ملخص الأداء اليومي</h1>
                <p className="text-slate-400 font-bold mt-2">بيانات حية من محركات التشغيل والذكاء المالي.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <MetricCard label="مبيعات اليوم" value={`$${dailyReport.totalSales.toLocaleString()}`} change="+12%" up icon={<TrendingUp/>} />
              <MetricCard label="حجوزات نشطة" value={stats.bookingsToday} change="+5" up icon={<Ticket/>} />
              <MetricCard label="صافي الربح" value={`$${dailyReport.netDailyProfit.toLocaleString()}`} change="+8%" up icon={<CreditCard/>} />
              <MetricCard label="الوكلاء الجدد" value={stats.activeAgents} change="+2" up icon={<Users/>} />
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white">
                  <h3 className="text-xl font-black text-[#002366] mb-12">تحليل التدفقات النقدية</h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[] /* سيتم ربطه بـ salesData من reportingService */}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#002366" strokeWidth={4} fillOpacity={0.1} fill="#002366" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="lg:col-span-4 bg-[#002366] p-10 rounded-[3.5rem] text-white shadow-massive">
                  <h3 className="text-xl font-black mb-8">حالة الربط البرمجي</h3>
                  <div className="space-y-6">
                     <StatusItem label="محرك OCR" status="Online" value="99.2%" />
                     <StatusItem label="بوابة واتساب" status="Online" value="100%" />
                     <StatusItem label="بوابة الدفع" status="Healthy" value="98.5%" />
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'airlines' && <AirlineManagement />}
        {activeTab === 'flights' && <FlightManagement />}
        {activeTab === 'bookings' && <BookingsManagement />}
        {activeTab === 'finance' && <FinancialManagement />}
        {activeTab === 'users' && <UserManagement />}
      </main>
    </div>
  );
};

const SidebarBtn = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-white/10 text-white shadow-lg border-r-4 border-amber-500 font-black' : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'}`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const MetricCard = ({ label, value, change, up, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-4 border-white flex justify-between items-center group hover:border-[#002366]/10 transition-all">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-[#002366] tracking-tighter mt-1">{value}</p>
      <p className={`text-[10px] font-black mt-2 ${up ? 'text-emerald-500' : 'text-rose-500'}`}>{up ? '↑' : '↓'} {change}</p>
    </div>
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-[#002366] group-hover:text-white transition-all">
      {icon}
    </div>
  </div>
);

const StatusItem = ({ label, status, value }: any) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="text-xs font-black text-indigo-100">{label}</p>
      <p className="text-[10px] font-bold text-indigo-300/60 uppercase">{status}</p>
    </div>
    <span className="text-xl font-black text-amber-500">{value}</span>
  </div>
);

export default AdminDashboard;
