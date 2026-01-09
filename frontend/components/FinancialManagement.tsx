
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { Account, JournalEntry, DailyReport, MonthlyReport, BalanceSheetReport } from '../types';
import { accountingService } from '../services/accountingService';
import { reportingService } from '../services/reportingService';

const FinancialManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coa' | 'ledger' | 'smart_reports' | 'balance_sheet' | 'audit'>('smart_reports');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyReport | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null);

  useEffect(() => {
    refreshReports();
  }, [reportDate, reportMonth, activeTab]);

  const refreshReports = () => {
    setDailyData(reportingService.getDailyFinancialReport(reportDate));
    setMonthlyData(reportingService.getMonthlyFinancialReport(reportMonth));
    setBalanceSheet(reportingService.getBalanceSheetReport());
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-[#002147] tracking-tighter">المركز المالي الاستراتيجي</h2>
          <p className="text-slate-400 font-bold text-xl">تحليل الأداء اليومي والشهري بالذكاء المحاسبي.</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl shadow-sm border overflow-x-auto max-w-full">
           <TabButton active={activeTab === 'smart_reports'} onClick={() => setActiveTab('smart_reports')} label="محرك التقارير" icon="📊" />
           <TabButton active={activeTab === 'balance_sheet'} onClick={() => setActiveTab('balance_sheet')} label="الميزانية العمومية" icon="⚖️" />
           <TabButton active={activeTab === 'coa'} onClick={() => setActiveTab('coa')} label="شجرة الحسابات" icon="🌳" />
           <TabButton active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} label="دفتر اليومية" icon="📖" />
        </div>
      </div>

      {activeTab === 'smart_reports' && (
        <div className="space-y-12">
          {/* Daily Report Section */}
          <section className="animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm border">
               <h4 className="text-2xl font-black text-[#002147]">التقرير اليومي التفصيلي 📅</h4>
               <input 
                 type="date" 
                 value={reportDate} 
                 onChange={(e) => setReportDate(e.target.value)} 
                 className="p-3 bg-slate-50 rounded-xl font-black text-xs outline-none border focus:border-[#C5A059]" 
               />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
               <ReportCard label="إجمالي المبيعات" value={`$${dailyData?.totalSales.toLocaleString()}`} color="text-indigo-600" />
               <ReportCard label="عدد الحجوزات" value={dailyData?.bookingsCount} color="text-slate-600" />
               <ReportCard label="متوسط الحجز" value={`$${dailyData?.avgBookingValue.toFixed(0)}`} color="text-slate-400" />
               <ReportCard label="مستحقات القبض" value={`$${dailyData?.accountsReceivable.toLocaleString()}`} color="text-emerald-600" />
               <ReportCard label="مستحقات الدفع" value={`$${dailyData?.accountsPayable.toLocaleString()}`} color="text-rose-600" />
               <ReportCard label="صافي الربح" value={`$${dailyData?.netDailyProfit.toLocaleString()}`} color="text-[#C5A059]" />
            </div>
          </section>

          {/* Monthly Insights Section */}
          <section className="grid lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom duration-700 delay-200">
             <div className="lg:col-span-8 space-y-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-massive border-4 border-white">
                   <div className="flex justify-between items-center mb-10">
                      <h4 className="text-xl font-black text-[#002147]">ملخص الأداء الشهري والمقارنة 📈</h4>
                      <input 
                        type="month" 
                        value={reportMonth} 
                        onChange={(e) => setReportMonth(e.target.value)} 
                        className="p-3 bg-slate-50 rounded-xl font-black text-xs outline-none" 
                      />
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-10 items-center">
                      <div className="space-y-6">
                         <div className="flex justify-between items-end border-b pb-4">
                            <span className="text-slate-400 font-bold">مبيعات الشهر الحالي:</span>
                            <span className="text-3xl font-black text-[#002147]">${monthlyData?.totalRevenue.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-end border-b pb-4">
                            <span className="text-slate-400 font-bold">مبيعات الشهر السابق:</span>
                            <span className="text-xl font-black text-slate-400">${monthlyData?.previousMonthRevenue.toLocaleString()}</span>
                         </div>
                         <div className="pt-4 flex items-center gap-4">
                            <span className="text-sm font-black text-slate-500">نسبة النمو:</span>
                            <span className={`text-2xl font-black ${monthlyData?.growthRate! >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                               {monthlyData?.growthRate! >= 0 ? '↑' : '↓'} {Math.abs(monthlyData?.growthRate || 0).toFixed(1)}%
                            </span>
                         </div>
                      </div>
                      
                      <div className="bg-[#002147] p-8 rounded-[2.5rem] text-white">
                         <h5 className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-6">تحليل التكاليف والربحية (%)</h5>
                         <div className="space-y-4">
                            {monthlyData?.costAnalysis.map((item, i) => (
                              <div key={i}>
                                 <div className="flex justify-between text-[10px] font-bold mb-2">
                                    <span>{item.label}</span>
                                    <span>{item.percentage.toFixed(1)}%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#C5A059]" style={{ width: `${item.percentage}%` }}></div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Top Performers Table */}
                <div className="bg-white p-10 rounded-[3rem] shadow-massive border-4 border-white overflow-hidden">
                   <h4 className="text-xl font-black text-[#002147] mb-8">أعلى شركات الطيران مبيعاً ✈️</h4>
                   <table className="w-full text-right">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                         <tr>
                            <th className="p-4">الشركة</th>
                            <th className="p-4 text-center">عدد التذاكر</th>
                            <th className="p-4 text-left">إجمالي المبيعات</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {monthlyData?.topAirlines.map((air, i) => (
                           <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-black text-sm text-[#002147]">{air.name}</td>
                              <td className="p-4 text-center font-bold text-slate-400">{air.count}</td>
                              <td className="p-4 text-left font-black text-emerald-600">${air.total.toLocaleString()}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-10">
                <div className="bg-[#C5A059] p-10 rounded-[3rem] shadow-massive text-[#002147]">
                   <h4 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">صافي الربح الشهري</h4>
                   <p className="text-6xl font-black tracking-tighter mb-4">${monthlyData?.netMonthlyProfit.toLocaleString()}</p>
                   <p className="text-xs font-bold leading-relaxed">هذا المبلغ يمثل صافي الربح بعد خصم تكاليف الموردين وعمولات الوكلاء.</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-massive border-4 border-white">
                   <h4 className="text-lg font-black text-[#002147] mb-6">أعلى الوكلاء أداءً 🏆</h4>
                   <div className="space-y-6">
                      {monthlyData?.topAgents.map((agent, i) => (
                        <div key={i} className="flex justify-between items-center group">
                           <div className="flex items-center gap-4">
                              <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">{i+1}</span>
                              <div>
                                 <p className="font-black text-xs text-[#002147]">{db.getAgentProfile(agent.name)?.companyName || 'عميل مباشر'}</p>
                                 <p className="text-[9px] text-slate-400 font-bold">عمولات: ${agent.commission.toLocaleString()}</p>
                              </div>
                           </div>
                           <span className="font-black text-xs text-indigo-600">${agent.total.toLocaleString()}</span>
                        </div>
                      ))}
                      {monthlyData?.topAgents.length === 0 && <p className="text-center py-10 text-slate-300 font-bold">لا يوجد نشاط وكلاء</p>}
                   </div>
                </div>
             </div>
          </section>
        </div>
      )}

      {activeTab === 'balance_sheet' && balanceSheet && (
        <div className="space-y-12 animate-in fade-in duration-700">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <RatioCard label="نسبة السيولة" value={balanceSheet.ratios.liquidityRatio.toFixed(2)} sub="الهدف: > 1.0" color="text-emerald-600" />
              <RatioCard label="نسبة المديونية" value={`${(balanceSheet.ratios.debtRatio * 100).toFixed(1)}%`} sub="نسبة الالتزامات للأصول" color="text-amber-600" />
              <RatioCard label="العائد على الاستثمار (ROI)" value={`${balanceSheet.ratios.returnOnInvestment.toFixed(1)}%`} sub="كفاءة تشغيل رأس المال" color="text-indigo-600" />
           </div>

           <div className="grid lg:grid-cols-2 gap-10">
              {/* Assets Section */}
              <div className="bg-white p-10 rounded-[3rem] shadow-massive border-4 border-white">
                 <div className="flex justify-between items-center mb-8">
                    <h4 className="text-2xl font-black text-[#002147]">الأصول (Assets) 🏦</h4>
                    <span className="font-black text-emerald-600 text-xl">${balanceSheet.totalAssets.toLocaleString()}</span>
                 </div>
                 <div className="space-y-4">
                    {balanceSheet.assetBreakdown.map((item, i) => (
                       <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                          <span className="font-bold text-slate-600">{item.label}</span>
                          <span className="font-black text-[#002147]">${item.amount.toLocaleString()}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Liabilities & Equity Section */}
              <div className="space-y-10">
                 <div className="bg-white p-10 rounded-[3rem] shadow-massive border-4 border-white">
                    <div className="flex justify-between items-center mb-8">
                       <h4 className="text-2xl font-black text-[#002147]">الخصوم (Liabilities) 📉</h4>
                       <span className="font-black text-rose-500 text-xl">${balanceSheet.totalLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="space-y-4">
                       {balanceSheet.liabilityBreakdown.map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                             <span className="font-bold text-slate-600">{item.label}</span>
                             <span className="font-black text-[#002147]">${item.amount.toLocaleString()}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-[#002147] p-10 rounded-[3rem] shadow-massive text-white">
                    <div className="flex justify-between items-center">
                       <h4 className="text-2xl font-black text-[#C5A059]">حقوق الملكية (Equity) 💎</h4>
                       <span className="font-black text-white text-3xl">${balanceSheet.totalEquity.toLocaleString()}</span>
                    </div>
                    <p className="text-indigo-200 text-xs font-bold mt-4">إجمالي رأس المال والأرباح المتراكمة في النظام.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'coa' && <CoaView accounts={db.getAccounts()} />}
      {activeTab === 'ledger' && <LedgerView journal={db.getJournalEntries()} />}
    </div>
  );
};

// Sub-components
const ReportCard = ({ label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-right">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-xl font-black ${color} tracking-tighter`}>{value}</p>
  </div>
);

const RatioCard = ({ label, value, sub, color }: any) => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-massive border-4 border-white text-center">
     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
     <p className={`text-4xl font-black ${color} tracking-tighter mb-2`}>{value}</p>
     <p className="text-[10px] font-bold text-slate-400">{sub}</p>
  </div>
);

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-3 whitespace-nowrap ${active ? 'bg-[#002147] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

const CoaView = ({ accounts }: { accounts: Account[] }) => (
  <div className="bg-white rounded-[3.5rem] shadow-massive border-8 border-slate-50 overflow-hidden">
     <div className="p-8 bg-slate-50/50 border-b flex justify-between items-center">
        <h4 className="font-black text-[#002147]">هيكل الحسابات الموحد</h4>
     </div>
     <div className="overflow-x-auto">
        <table className="w-full text-right">
           <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr><th className="p-6">الكود</th><th className="p-6">اسم الحساب</th><th className="p-6">الرصيد</th></tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {accounts.sort((a,b)=>a.id.localeCompare(b.id)).map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/50">
                   <td className="p-6 font-mono text-xs text-indigo-400">{acc.id}</td>
                   <td className={`p-6 font-black ${!acc.parentId ? 'text-lg text-[#002147]' : 'pr-12 text-sm text-slate-500'}`}>{acc.name}</td>
                   <td className="p-6 text-left font-black text-lg">${Math.abs(acc.balance).toLocaleString()}</td>
                </tr>
              ))}
           </tbody>
        </table>
     </div>
  </div>
);

const LedgerView = ({ journal }: { journal: any[] }) => (
  <div className="space-y-6">
     {journal.map(entry => (
       <div key={entry.id} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-white">
          <div className="bg-[#002147] p-6 text-white flex justify-between items-center">
             <span className="font-black text-sm">{entry.description}</span>
             <span className="text-[10px] opacity-50">{new Date(entry.date).toLocaleString()}</span>
          </div>
          <div className="p-6">
             {entry.lines.map((l: any, i: number) => (
               <div key={i} className="flex justify-between py-2 border-b border-slate-50 last:border-0 text-xs">
                  <span className="font-bold text-slate-600">{l.accountName}</span>
                  <div className="flex gap-10">
                     <span className="font-black text-emerald-600 w-24 text-left">{l.debit > 0 ? `$${l.debit}` : ''}</span>
                     <span className="font-black text-rose-500 w-24 text-left">{l.credit > 0 ? `$${l.credit}` : ''}</span>
                  </div>
               </div>
             ))}
          </div>
       </div>
     ))}
  </div>
);

export default FinancialManagement;
