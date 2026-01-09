
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, AccountType } from '../../../../types';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * قلب النظام المالي: معالجة الدفع وترحيل القيود (Post-to-Ledger)
   */
  async processBookingPayment(bookingId: string) {
    // Fix: Accessing $transaction via any cast
    return (this.prisma as any).$transaction(async (tx: any) => {
      // جلب الحجز مع تفاصيله المالية والشركاء
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { 
          customer: true, 
          flightSchedule: { include: { flight: { include: { airline: true } } } } 
        }
      });

      if (!booking) throw new BadRequestException('الحجز غير موجود');
      if (booking.paymentConfirmed) throw new BadRequestException('تمت معالجة الدفع مسبقاً لهذا الحجز');

      const sch = booking.flightSchedule;
      const amount = booking.totalAmount;
      const cost = booking.costSnapshot;
      const agentComm = booking.commissionSnapshot;
      const netProfit = booking.profitSnapshot;

      // هيكل الأكواد الحسابية الاستراتيجي
      const CODES = {
        CASH: '1101',           // الصندوق الرئيسي / البنوك
        SALES: '4101',          // مبيعات الطيران
        COGS: '5101',           // تكلفة مبيعات الطيران (COGS)
        SUPPLIER: `2101-${sch.flight.airlineId.slice(-4)}`, // ذمة المورد (شركة الطيران)
        AGENT: `2201-${booking.customerId.slice(-4)}`,      // ذمة الوكيل / محفظة العميل
        COMM_EXP: '5201',       // مصروف عمولات الوكلاء
        SYSTEM_REV: '4301'      // إيرادات أرباح النظام (صافي الربح)
      };

      // إنشاء القيد المحاسبي المركب (Journal Entry)
      const journalEntry = await tx.journalEntry.create({
        data: {
          description: `ترحيل مبيعات الحجز ${booking.bookingRef} - مسافر: ${booking.passengers?.[0]?.lastName || 'N/A'}`,
          referenceId: booking.id,
          date: new Date(),
          lines: {
            create: [
              // 1. إثبات المبيعات واستلام النقدية (أو الخصم من رصيد الوكيل)
              { accountCode: CODES.CASH, debit: amount, credit: 0 },
              { accountCode: CODES.SALES, debit: 0, credit: amount },

              // 2. إثبات تكلفة المبيعات (COGS) واستحقاق المورد (المزود)
              { accountCode: CODES.COGS, debit: cost, credit: 0 },
              { accountCode: CODES.SUPPLIER, debit: 0, credit: cost },

              // 3. إثبات عمولة الوكيل (إذا كان الحجز لوكيل)
              ...(booking.customer.role === UserRole.AGENT ? [
                { accountCode: CODES.COMM_EXP, debit: agentComm, credit: 0 },
                { accountCode: CODES.AGENT, debit: 0, credit: agentComm }
              ] : []),

              // 4. إثبات صافي ربح النظام في حساب الأرباح المحققة
              { accountCode: CODES.SYSTEM_REV, debit: 0, credit: netProfit }
            ]
          }
        }
      });

      // تحديث حالة الحجز إلى "مدفوع" وبانتظار الإصدار
      await tx.booking.update({
        where: { id: booking.id },
        data: { 
          paymentConfirmed: true, 
          status: 'PAID',
          paidAt: new Date()
        }
      });

      // إذا كان الدفع عبر رصيد الوكيل، نقوم بخصم المبلغ الإجمالي من محفظته
      if (booking.customer.role === UserRole.AGENT) {
        await tx.user.update({
          where: { id: booking.customer.id },
          data: { balance: { decrement: amount } }
        });
        
        // ثم نضيف له العمولة فوراً كمبلغ دائن (اختياري حسب سياسة النظام)
        await tx.user.update({
          where: { id: booking.customer.id },
          data: { balance: { increment: agentComm } }
        });
      }

      return { 
        success: true, 
        bookingRef: booking.bookingRef,
        journalEntryId: journalEntry.id,
        newBalance: booking.customer.role === UserRole.AGENT ? booking.customer.balance - amount + agentComm : null
      };
    });
  }

  /**
   * إنشاء حساب فرعي جديد لمورد أو وكيل
   */
  async createLedgerAccount(code: string, name: string, type: string) {
    // Fix: Accessing account model via any cast
    return (this.prisma as any).account.upsert({
      where: { code },
      update: { name },
      create: { code, name, type: type as AccountType, balance: 0 }
    });
  }

  /**
   * جلب شجرة الحسابات بالكامل
   */
  async getAccounts() {
    return (this.prisma as any).account.findMany();
  }

  /**
   * جلب قيود اليومية لفترة زمنية محددة
   */
  async getJournal(start: string, end: string) {
    return (this.prisma as any).journalEntry.findMany({
      where: {
        date: {
          gte: start ? new Date(start) : undefined,
          lte: end ? new Date(end) : undefined,
        },
      },
      include: { lines: true },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * تقرير ملخص يومي للعمليات المالية
   */
  async getDailySummary(date: string) {
    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);

    const entries = await (this.prisma as any).journalEntry.findMany({
      where: {
        date: { gte: d, lt: nextDay }
      },
      include: { lines: true }
    });

    let totalSales = 0;
    let netProfit = 0;

    entries.forEach((e: any) => {
      e.lines.forEach((l: any) => {
        if (l.accountCode === '4101') totalSales += l.credit;
        if (l.accountCode === '4301') netProfit += l.credit;
      });
    });

    return {
      date,
      totalSales,
      netProfit,
      entriesCount: entries.length
    };
  }
}
