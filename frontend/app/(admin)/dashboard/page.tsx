
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, Users, Ticket, CreditCard, 
  ArrowUpRight, ArrowDownRight, Bell, Search, Settings 
} from 'lucide-react';

const salesData = [
  { date: '01/12', revenue: 45000, profit: 8000 },
  { date: '05/12', revenue: 52000, profit: 9200 },
  { date: '10/12', revenue: 48000, profit: 7500 },
  { date: '15/12', revenue: 61000, profit: 11000 },
  { date: '20/12', revenue: 55000, profit: 9800 },
  { date: '25/12', revenue: 72000, profit: 14500 },
  { date: '30/12', revenue: 85000, profit: 16200 },
];

const AdminDashboardPage = () => {
  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-700">
      
      {/* Dynamic Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#002366] tracking-tighter">مركز القيادة الاستراتيجي</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Real-time Intelligence Engine Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white p-2 rounded-2xl shadow-sm border flex items-center px-4 gap-3">
              <Search size={18} className="text-slate-300" />
              <input type="text" placeholder="بحث سريع عن حجز أو وكيل..." className="outline-none text-xs font-bold text-[#002366] w-48 bg-transparent" />
           </div>
           <button className="bg-white p-4 rounded-2xl shadow-sm border hover:bg-slate-50 relative group transition-all">
              <Bell size={24} className="text-slate-400 group-hover:text-[#002366]" />
              <span className="absolute top-4 right-4 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>
           </button>
        </div>
      </div>

      {/* High-Level Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="إجمالي المبيعات (M-T-D)" value="$1,245,000" change="+14.2%" up={true} icon={<TrendingUp />} />
        <MetricCard title="إجمالي الأرباح" value="$142,500" change="+8.7%" up={true} icon={<CreditCard />} />
        <MetricCard title="التذاكر الصادرة" value="2,842" change="-2.4%" up={false} icon={<Ticket />} />
        <MetricCard title="الوكلاء النشطون" value="184" change="+12" up={true} icon={<Users />} />
      </div>

      {/* Main Analytics Row */}
      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Sales & Profit Trends */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-xl font-black text-[#002366]">تحليل نمو التدفقات المالية (شهر ديسمبر)</h3>
            <div className="flex gap-2">
               <span className="flex items-center gap-2 text-[10px] font-black text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-600"></div> الإيرادات</span>
               <span className="flex items-center gap-2 text-[10px] font-black text-slate-400"><div className="w-2 h-2 rounded-full bg-amber-500"></div> صافي الربح</span>
            </div>
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={4} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={4} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Distribution / Side Insights */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-[#002366] p-10 rounded-[3.5rem] text-white shadow-massive relative overflow-hidden group">
              <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-10">الحالة التشغيلية للمنظومة</h4>
              <div className="space-y-6">
                 <ServiceStatus label="ربط شركات الطيران (API)" status="Healthy" value="99.9%" />
                 <ServiceStatus label="بوابة الدفع المركزية" status="High Load" value="94.2%" />
                 <ServiceStatus label="محرك الواتساب والـ NLP" status="Healthy" value="100%" />
                 <ServiceStatus label="محرك الـ OCR للجوازات" status="Healthy" value="98.5%" />
              </div>
              <button className="mt-12 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-3">
                 <Settings size={16} /> فتح سجلات الأداء
              </button>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] shadow-massive border-4 border-white">
              <h4 className="text-lg font-black text-[#002366] mb-8">أعلى المناطق مبيعاً</h4>
              <div className="space-y-6">
                 <RegionMetric label="اليمن (محلي ودولي)" value="65%" color="bg-indigo-600" />
                 <RegionMetric label="السعودية" value="15%" color="bg-emerald-500" />
                 <RegionMetric label="الإمارات" value="12%" color="bg-amber-500" />
                 <RegionMetric label="مصر" value="8%" color="bg-rose-500" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, up, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-4 border-white flex justify-between items-center group hover:border-[#002366]/5 transition-all">
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-[#002366] tracking-tighter">{value}</p>
      <div className={`flex items-center gap-1 text-[10px] font-black ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}
      </div>
    </div>
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-[#002366] group-hover:text-white transition-all transform group-hover:rotate-6">
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);

const ServiceStatus = ({ label, status, value }: any) => (
  <div className="flex justify-between items-center">
     <div>
        <p className="text-xs font-black text-indigo-100">{label}</p>
        <p className="text-[9px] font-bold text-indigo-300/60 uppercase">{status}</p>
     </div>
     <span className="text-xl font-black text-amber-500">{value}</span>
  </div>
);

const RegionMetric = ({ label, value, color }: any) => (
  <div>
     <div className="flex justify-between text-[10px] font-black mb-2">
        <span className="text-[#002366]">{label}</span>
        <span className="text-slate-400">{value}</span>
     </div>
     <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: value }}></div>
     </div>
  </div>
);

export default AdminDashboardPage;
