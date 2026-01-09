
// @google/genai guidelines followed: Consistent data extraction from accounting entries.
import { db } from './mockDatabase';
import { DailyReport, MonthlyReport, BalanceSheetReport, JournalEntry, Booking, Account } from '../types';

class ReportingService {
  private static instance: ReportingService;
  public static getInstance() {
    if (!this.instance) this.instance = new ReportingService();
    return this.instance;
  }

  /**
   * 8.3.1 التقرير المالي اليومي
   */
  getDailyFinancialReport(dateStr: string): DailyReport {
    const entries = db.getJournalEntries().filter(e => e.date.startsWith(dateStr));
    const bookings = db.getBookings().filter(b => b.createdAt.startsWith(dateStr));

    const totalSales = entries.reduce((sum, e) => {
      const salesLine = e.lines.find(l => l.accountId === '4100');
      return sum + (salesLine?.credit || 0);
    }, 0);

    const netProfit = entries.reduce((sum, e) => {
      // استخدام كود حساب الأرباح 4300 المتوافق مع AccountingService
      const profitLine = e.lines.find(l => l.accountId === '4300');
      return sum + (profitLine?.debit || 0);
    }, 0);

    const receivables = entries.reduce((sum, e) => {
      const cashLine = e.lines.find(l => l.accountId === '1101' || l.accountId === '1102');
      return sum + (cashLine?.debit || 0);
    }, 0);

    const payables = entries.reduce((sum, e) => {
      const providerLine = e.lines.find(l => l.accountId.startsWith('2100'));
      return sum + (providerLine?.credit || 0);
    }, 0);

    return {
      date: dateStr,
      totalSales,
      bookingsCount: bookings.length,
      avgBookingValue: bookings.length > 0 ? totalSales / bookings.length : 0,
      accountsReceivable: receivables,
      accountsPayable: payables,
      netDailyProfit: netProfit
    };
  }

  /**
   * 8.3.2 التقرير المالي الشهري
   */
  getMonthlyFinancialReport(yearMonth: string): MonthlyReport {
    const [year, month] = yearMonth.split('-').map(Number);
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

    const currentBookings = db.getBookings().filter(b => b.createdAt.startsWith(yearMonth));
    const prevBookings = db.getBookings().filter(b => b.createdAt.startsWith(prevMonthStr));

    const currentRevenue = currentBookings.reduce((s, b) => s + b.totalAmount, 0);
    const prevRevenue = prevBookings.reduce((s, b) => s + b.totalAmount, 0);
    
    const airlineStats: { [key: string]: { total: number, count: number } } = {};
    currentBookings.forEach(b => {
      const name = b.flightSnapshot?.airlineName || 'Other';
      if (!airlineStats[name]) airlineStats[name] = { total: 0, count: 0 };
      airlineStats[name].total += b.totalAmount;
      airlineStats[name].count += 1;
    });

    const agentStats: { [key: string]: { total: number, commission: number } } = {};
    currentBookings.forEach(b => {
      if (b.paymentMethod === 'agent_balance' || b.paymentMethod === 'balance') {
        const name = b.customerId || 'Unknown Agent';
        if (!agentStats[name]) agentStats[name] = { total: 0, commission: 0 };
        agentStats[name].total += b.totalAmount;
        agentStats[name].commission += (b.financialsSnapshot?.agentCommission || 0);
      }
    });

    const totalCosts = currentBookings.reduce((s, b) => s + (b.financialsSnapshot?.costPrice || 0), 0);
    const totalCommissions = currentBookings.reduce((s, b) => s + (b.financialsSnapshot?.agentCommission || 0), 0);

    return {
      month: yearMonth,
      totalRevenue: currentRevenue,
      previousMonthRevenue: prevRevenue,
      growthRate: prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 100,
      topAirlines: Object.entries(airlineStats).map(([name, data]) => ({ name, ...data })).sort((a,b) => b.total - a.total),
      topAgents: Object.entries(agentStats).map(([name, data]) => ({ name, ...data })).sort((a,b) => b.total - a.total),
      costAnalysis: [
        { label: 'تكلفة الشراء', amount: totalCosts, percentage: currentRevenue > 0 ? (totalCosts/currentRevenue)*100 : 0 },
        { label: 'عمولات الوكلاء', amount: totalCommissions, percentage: currentRevenue > 0 ? (totalCommissions/currentRevenue)*100 : 0 },
        { label: 'صافي الربح', amount: currentRevenue - totalCosts - totalCommissions, percentage: currentRevenue > 0 ? ((currentRevenue - totalCosts - totalCommissions)/currentRevenue)*100 : 0 }
      ],
      netMonthlyProfit: currentRevenue - totalCosts - totalCommissions
    };
  }

  /**
   * 8.3.3 تقرير الميزانية العمومية والنسب المالية
   */
  getBalanceSheetReport(): BalanceSheetReport {
    const accounts = db.getAccounts();
    
    const assets = accounts.filter(a => a.type === 'asset');
    const liabilities = accounts.filter(a => a.type === 'liability');
    const equity = accounts.filter(a => a.type === 'equity');
    
    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
    const totalEquity = equity.reduce((s, a) => s + a.balance, 0);

    const currentAssets = assets.filter(a => a.category === 'current').reduce((s, a) => s + a.balance, 0);
    const currentLiabilities = liabilities.filter(a => a.category === 'operating' || a.category === 'current').reduce((s, a) => s + a.balance, 0);

    // حساب النسب المالية
    const liquidityRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
    
    // العائد على الاستثمار ROI (المبيعات / التكاليف)
    const totalSales = accounts.filter(a => a.id === '4100')[0]?.balance || 0;
    const totalCosts = accounts.filter(a => a.id === '5100')[0]?.balance || 0;
    const roi = totalCosts > 0 ? ((totalSales - totalCosts) / totalCosts) * 100 : 0;

    return {
      timestamp: new Date().toISOString(),
      totalAssets,
      totalLiabilities,
      totalEquity,
      currentAssets,
      currentLiabilities,
      ratios: {
        liquidityRatio,
        debtRatio,
        returnOnInvestment: roi
      },
      assetBreakdown: assets.filter(a => a.balance !== 0).map(a => ({ label: a.name, amount: a.balance })),
      liabilityBreakdown: liabilities.filter(a => a.balance !== 0).map(a => ({ label: a.name, amount: a.balance }))
    };
  }

  getSalesByPeriod(providerId: string, start: string, end: string) {
    const providerFlights = db.getProviderFlights(providerId);
    const flightIds = providerFlights.map(f => f.id);
    const bookings = db.getBookings().filter(b => 
      flightIds.includes(b.flightId) && 
      b.createdAt >= start && 
      b.createdAt <= end &&
      b.status === 'ready'
    );

    return {
      revenue: bookings.reduce((s, b) => s + (b.financialsSnapshot?.costPrice || 0), 0),
      count: bookings.length,
      cost: bookings.reduce((s, b) => s + (b.financialsSnapshot?.costPrice || 0), 0)
    };
  }

  getSalesByAirline(providerId: string) {
    const providerFlights = db.getProviderFlights(providerId);
    const flightIds = providerFlights.map(f => f.id);
    const bookings = db.getBookings().filter(b => flightIds.includes(b.flightId) && b.status === 'ready');
    
    const stats: { [key: string]: { total: number, count: number } } = {};
    bookings.forEach(b => {
      const name = b.flightSnapshot?.airlineName || 'Other';
      if (!stats[name]) stats[name] = { total: 0, count: 0 };
      stats[name].total += (b.financialsSnapshot?.costPrice || 0);
      stats[name].count += 1;
    });

    return Object.entries(stats).map(([name, data]) => ({ name, ...data }));
  }

  getPerformanceMetrics(providerId: string) {
    const providerFlights = db.getProviderFlights(providerId);
    const flightIds = providerFlights.map(f => f.id);
    const bookings = db.getBookings().filter(b => flightIds.includes(b.flightId));
    const completed = bookings.filter(b => b.status === 'ready');

    return {
      avgResponseTime: 45,
      completionRate: bookings.length > 0 ? (completed.length / bookings.length) * 100 : 100,
      efficiencyIndex: 'ممتاز'
    };
  }

  getStatementOfAccount(providerId: string) {
    const providerFlights = db.getProviderFlights(providerId);
    const flightIds = providerFlights.map(f => f.id);
    const bookings = db.getBookings().filter(b => flightIds.includes(b.flightId) && b.status === 'ready');

    return bookings.map(b => ({
      date: b.createdAt,
      description: `مبيعات تذكرة ${b.bookingRef}`,
      reference: b.bookingRef,
      debit: 0,
      credit: b.financialsSnapshot?.costPrice || 0
    })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const reportingService = ReportingService.getInstance();
