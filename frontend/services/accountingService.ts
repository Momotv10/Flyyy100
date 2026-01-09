
import { JournalEntry, JournalLine, Account, Booking, Flight } from '../types';

class AccountingService {
  private static instance: AccountingService;
  public static getInstance() {
    if (!this.instance) this.instance = new AccountingService();
    return this.instance;
  }

  private get db() { return (window as any).db; }

  /**
   * القيد المحاسبي الرباعي الاستراتيجي (Strategic Quadruple Entry)
   * يتم استدعاؤه آلياً عند نجاح عملية الدفع
   */
  generateBookingEntry(booking: Booking) {
    const fin = booking.financialsSnapshot;
    const lines: JournalLine[] = [];
    
    const flight = this.db.getFlights().find((f: Flight) => f.id === booking.flightId);
    const airlineId = flight?.airlineId || 'GEN';

    // مفاتيح الحسابات الموحدة
    const cashAcc = booking.paymentMethod === 'agent_balance' ? `2200-${booking.customerId?.slice(-4)}` : '1102';
    const salesAcc = '4100'; // مبيعات التذاكر
    const cogsAcc = '5100'; // تكلفة مبيعات التذاكر
    const supplierAcc = `2100-${airlineId.slice(-4)}`; // ذمم المورد (شركة الطيران)
    const agentCommAcc = '5200'; // مصروف العمولات
    const systemProfitAcc = '4300'; // أرباح النظام المحققة

    // 1. إثبات المبيعات واستلام النقدية
    lines.push({ accountId: cashAcc, accountName: 'الصندوق/الوكيل', debit: booking.totalAmount, credit: 0 });
    lines.push({ accountId: salesAcc, accountName: 'إيراد مبيعات التذاكر', debit: 0, credit: booking.totalAmount });

    // 2. إثبات تكلفة المبيعات والمستحق للمزود (المورد)
    lines.push({ accountId: cogsAcc, accountName: 'تكلفة مبيعات الطيران', debit: fin.costPrice, credit: 0 });
    lines.push({ accountId: supplierAcc, accountName: 'حساب المزود (Airline Account)', debit: 0, credit: fin.costPrice });

    // 3. إثبات عمولة الوكيل (إذا كان الحجز لوكيل مبيعات)
    if (fin.agentCommission > 0 && booking.customerId) {
      lines.push({ accountId: agentCommAcc, accountName: 'مصروف عمولات وكلاء', debit: fin.agentCommission, credit: 0 });
      // تضاف لحساب الوكيل كدائن (مستحق له)
      lines.push({ accountId: `2200-${booking.customerId.slice(-4)}`, accountName: 'حساب الوكيل (العمولة)', debit: 0, credit: fin.agentCommission });
    }

    // 4. إثبات صافي ربح النظام (التلقائية المالية المتقدمة)
    const netProfit = booking.totalAmount - fin.costPrice - fin.agentCommission;
    if (netProfit > 0) {
      lines.push({ accountId: systemProfitAcc, accountName: 'صافي أرباح العمليات', debit: 0, credit: netProfit });
    }

    const entry: JournalEntry = {
      id: `JE-${Date.now()}`,
      date: new Date().toISOString(),
      description: `قيد مبيعات تذكرة ${booking.bookingRef} - مسافر: ${booking.passengerName}`,
      reference: booking.bookingRef,
      lines: lines,
      createdBy: 'STAMS_AI_FINANCE'
    };

    // ترحيل القيد فوراً وتحديث الأرصدة في الوقت الحقيقي
    this.db.addJournalEntry(entry);
    lines.forEach(l => this.db.updateAccountBalance(l.accountId, l.debit, l.credit));
    
    console.log(`[STAMS-FINANCE] Quadruple Entry Posted for Ref: ${booking.bookingRef}`);
    return entry;
  }

  // Fix: Added registerAgentAccount to handle automatic sub-account creation for new travel agents
  registerAgentAccount(name: string, userId: string) {
    this.createSubAccount('2200', `حساب وكيل: ${name}`, userId);
  }

  createSubAccount(parentCode: string, name: string, subId: string) {
    const parent = this.db.getAccount(parentCode);
    const newId = `${parentCode}-${subId.slice(-4)}`;
    if (this.db.getAccount(newId)) return;

    const newAcc: Account = {
      id: newId,
      name: name,
      type: parent?.type || 'liability',
      category: parent?.category || 'current',
      balance: 0,
      parentId: parentCode,
      isSystem: false
    };
    this.db.addAccount(newAcc);
  }

  initializeChartOfAccounts() {
    const baseAccounts: Account[] = [
      { id: '1000', name: 'الأصول', type: 'asset', category: 'fixed', balance: 0, isSystem: true },
      { id: '1102', name: 'الصندوق والمحافظ', type: 'asset', category: 'current', balance: 0, parentId: '1000', isSystem: true },
      { id: '2000', name: 'الخصوم والالتزامات', type: 'liability', category: 'current', balance: 0, isSystem: true },
      { id: '2100', name: 'ذمم شركات الطيران (الموردين)', type: 'liability', category: 'current', balance: 0, parentId: '2000', isSystem: true },
      { id: '2200', name: 'ذمم وحسابات الوكلاء', type: 'liability', category: 'current', balance: 0, parentId: '2000', isSystem: true },
      { id: '4000', name: 'الإيرادات', type: 'revenue', category: 'operating', balance: 0, isSystem: true },
      { id: '4100', name: 'إيراد مبيعات التذاكر', type: 'revenue', category: 'operating', balance: 0, parentId: '4000', isSystem: true },
      { id: '4300', name: 'صافي أرباح العمليات', type: 'revenue', category: 'operating', balance: 0, parentId: '4000', isSystem: true },
      { id: '5000', name: 'المصروفات', type: 'expense', category: 'operating', balance: 0, isSystem: true },
      { id: '5100', name: 'تكلفة المبيعات (Cost of Sales)', type: 'expense', category: 'operating', balance: 0, parentId: '5000', isSystem: true },
      { id: '5200', name: 'مصروف عمولات الوكلاء', type: 'expense', category: 'operating', balance: 0, parentId: '5000', isSystem: true }
    ];

    baseAccounts.forEach(acc => {
      if (!this.db.getAccount(acc.id)) {
        this.db.addAccount(acc);
      }
    });
  }
}

export const accountingService = AccountingService.getInstance();
