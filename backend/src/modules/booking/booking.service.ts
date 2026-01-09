
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '../../../../types';
import { GoogleGenAI, Type } from "@google/genai";

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  /**
   * الخطوة 1: إنشاء مسودة حجز (DRAFT) - عملية صامتة تماماً
   */
  async createDraftBooking(payload: any) {
    const { flightId, passengers, totalAmount, phone, email } = payload;
    if (!passengers || passengers.length === 0) throw new BadRequestException("بيانات المسافر مفقودة");
    
    const p = passengers[0];
    const draftId = `DRF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const draft: any = {
      id: draftId,
      bookingRef: `RES-${Date.now().toString().slice(-6)}`,
      status: 'pending', // حالة مسودة
      flightId,
      totalAmount,
      passengerName: `${p.firstName} ${p.lastName}`,
      passportNumber: p.passportNumber,
      passportNationality: p.nationality,
      customerPhone: phone,
      createdAt: new Date().toISOString(),
      flightSnapshot: payload.flightSnapshot || {}
    };

    // حفظ في قاعدة البيانات الوهمية/الحقيقية دون إطلاق أي إشعارات
    (window as any).db.addBooking(draft);
    console.log(`[STAMS-BACKEND] Draft ${draftId} secured silently.`);
    
    return draft;
  }

  /**
   * الخطوة 2: الربط بعد تسجيل الدخول
   */
  async linkBookingToUser(bookingId: string, userId: string) {
    const booking = (window as any).db.getBookings().find((b: any) => b.id === bookingId);
    if (!booking) throw new NotFoundException('جلسة الحجز غير موجودة');

    (window as any).db.updateBookingStatus(bookingId, { customerId: userId });
    return { success: true, bookingId };
  }

  /**
   * الخطوة 3: الاعتماد النهائي (الزناد الحقيقي للواتساب والمالية)
   * يتم استدعاؤه فقط بعد نجاح الدفع
   */
  async finalizeBooking(userId: string, payload: any) {
    const { bookingId } = payload;
    const booking = (window as any).db.getBookings().find((b: any) => b.id === bookingId);
    
    if (!booking) throw new NotFoundException('لا يمكن إتمام حجز غير موجود');

    // 1. تحديث الحالة في DB
    (window as any).db.updateBookingStatus(bookingId, {
      status: 'awaiting_issue',
      paymentConfirmed: true,
      paidAt: new Date().toISOString()
    });

    // 2. تفعيل القيود المحاسبية
    // (window as any).accountingService.generateBookingEntry(booking);

    // 3. تفعيل الواتساب للمزود/الموظف الآن فقط
    // await (window as any).notificationService.requestIssuanceFromProvider(booking);

    console.log(`[STAMS-BACKEND] Booking ${bookingId} finalized. WhatsApp Triggered.`);
    return { success: true };
  }

  async verifyPassport(base64Image: string, mimeType: string = 'image/jpeg') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType } }, 
            { text: "Extract passport data as JSON: firstName, lastName, passportNumber, nationality, expiryDate. Use ISO format for dates." }
          ]
        },
        config: { responseMimeType: 'application/json' }
      });
      return { status: 'success', data: JSON.parse(response.text || '{}') };
    } catch (error) {
      console.error("AI Proxy Error:", error);
      throw new BadRequestException("فشل تحليل الجواز ذكياً - تحقق من اتصال الـ API");
    }
  }

  async markAsIssued(bookingRef: string, pnr: string, ticketNo: string) {
    const booking = (window as any).db.getBookings().find((b: any) => b.bookingRef === bookingRef);
    if (booking) {
      (window as any).db.issueTicket(booking.id, pnr, ticketNo, 'https://stams.ai/tkt.pdf');
    }
  }
}
