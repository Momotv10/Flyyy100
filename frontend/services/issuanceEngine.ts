
// @google/genai guidelines followed: Using gemini-3-flash-preview for text extraction tasks.
import { GoogleGenAI, Type } from "@google/genai";
import { db } from './mockDatabase';
import { accountingService } from './accountingService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class IssuanceEngine {
  private static instance: IssuanceEngine;
  public static getInstance() {
    if (!this.instance) this.instance = new IssuanceEngine();
    return this.instance;
  }

  /**
   * معالجة رد الموظف يدوياً: تحليل النص المدخل لاستخراج بيانات التذكرة
   */
  async processStaffResponse(rawText: string, bookingRef: string) {
    console.log(`[Issuance AI] Analyzing staff manual response for ${bookingRef}: ${rawText}`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `بصفتك مساعد إداري خبير في قطاع الطيران، قم بتحليل النص التالي المدخل من قبل الموظف لاستخراج رقم الحجز (PNR) ورقم التذكرة الإلكترونية (Ticket Number).
        النص: "${rawText}"
        أعد النتيجة بتنسيق JSON حصراً كالتالي: { "pnr": "string", "ticketNumber": "string", "confirmed": boolean }`,
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.confirmed && (result.pnr || result.ticketNumber)) {
        this.updateBookingToIssued(bookingRef, result.pnr, result.ticketNumber);
        return { success: true, data: result };
      }
      return { success: false, message: "لم يتمكن الذكاء الاصطناعي من استخراج بيانات الإصدار بصورة مؤكدة." };
    } catch (error) {
      console.error("[Issuance AI] Staff Parsing Error:", error);
      throw error;
    }
  }

  /**
   * Webhook Handler: استقبال وتحليل رسالة المزود عبر الواتساب
   */
  async processProviderResponse(rawText: string, bookingRef: string) {
    console.log(`[Issuance AI] Analyzing provider message for ${bookingRef}: ${rawText}`);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت محلل بيانات طيران دقيق. النص التالي هو رد من موظف شركة طيران بخصوص طلب إصدار تذكرة.
        استخرج منها: رقم التذكرة الإلكترونية (Ticket Number) ورقم الحجز العالمي (PNR).
        النص: "${rawText}"
        أعد النتيجة بتنسيق JSON حصراً: { "pnr": "string", "ticketNumber": "string", "confirmed": boolean }`,
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.confirmed && (result.pnr || result.ticketNumber)) {
        this.updateBookingToIssued(bookingRef, result.pnr, result.ticketNumber);
        return { success: true, data: result };
      }
      
      return { success: false, message: "لم يتم العثور على بيانات إصدار واضحة في النص." };
    } catch (error) {
      console.error("[Issuance AI] Error parsing response:", error);
      throw error;
    }
  }

  private updateBookingToIssued(bookingRef: string, pnr: string, tkt: string) {
    const booking = db.getBookings().find(b => b.bookingRef === bookingRef);
    if (booking) {
      db.issueTicket(booking.id, pnr, tkt, 'https://stams.ai/storage/tkt_default.pdf');
      console.log(`[Issuance AI] ✅ Booking ${bookingRef} status updated to ISSUED via AI Parsing.`);
    }
  }
}

export const issuanceEngine = IssuanceEngine.getInstance();
