
import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { BookingService } from '../booking/booking.service';
import { FinanceService } from '../finance/finance.service';

@Controller('whatsapp/webhook')
export class WhatsappController {
  constructor(
    private readonly waService: WhatsappService,
    private readonly bookingService: BookingService,
    private readonly financeService: FinanceService
  ) {}

  /**
   * التحقق من الـ Webhook عند الإعداد (Meta Verification)
   */
  @Get()
  verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
      return challenge;
    }
    return 'Forbidden';
  }

  /**
   * استقبال الرسائل من الموظفين والعملاء
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleIncoming(@Body() payload: any) {
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message?.type === 'text') {
      const text = message.text.body;
      const from = message.from;

      // محرك تحليل القصد (Intent Recognition via Regex)
      // مثال للرد: "تم الإصدار RES-887766 PNR: ABC123 TKT: 0019988"
      const issueMatch = text.match(/تم الإصدار\s+(RES-\d+)\s+PNR:\s*(\w+)\s+TKT:\s*(\d+)/i);

      if (issueMatch) {
        const [, bookingRef, pnr, ticketNo] = issueMatch;
        
        // 1. تحديث حالة الحجز في قاعدة البيانات
        await this.bookingService.markAsIssued(bookingRef, pnr, ticketNo);

        // 2. إرسال إشعار للعميل
        // سيتم جلب هاتف العميل من الخدمة
        console.log(`AI Log: Booking ${bookingRef} issued via WhatsApp reply.`);
      }
    }

    return { status: 'success' };
  }
}
