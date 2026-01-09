import { Booking } from '../types';

class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance() {
    if (!this.instance) this.instance = new NotificationService();
    return this.instance;
  }

  // Fix: Added requestIssuanceFromProvider to handle issuance notifications as expected by booking services
  async requestIssuanceFromProvider(booking: Booking) {
    return this.triggerPostPaymentAlerts(booking);
  }

  /**
   * زناد الإشعارات الشامل (Full Package Trigger)
   * يتم استدعاؤه فقط بعد نجاح السداد
   */
  async triggerPostPaymentAlerts(booking: Booking) {
    console.log(`[Notification Engine] Initializing alerts for ${booking.bookingRef}`);

    // 1. إشعار المزود (Supplier) - طلب إصدار فوري
    const supplierMsg = `
🚨 *طلب إصدار تذكرة جديد (مدفوع)* 🚨
المرجع: ${booking.bookingRef}
المسافر: ${booking.passengerName}
رقم الجواز: ${booking.passportNumber}
المسار: ${booking.flightSnapshot.departure} ➔ ${booking.flightSnapshot.arrival}

📦 *المرفقات المتاحة:*
- صورة الجواز الأساسية ✅
${booking.passportImage ? '- تم إرسال ملف الجواز.' : ''}
${booking.financialsSnapshot?.costPrice ? `- السعر المحتسب للمزود: $${booking.financialsSnapshot.costPrice}` : ''}

يرجى الرد برقم التذكرة والـ PNR فوراً.
    `;

    // 2. إشعار المدير العام (Admin) - ملخص العملية
    const adminMsg = `
💰 *إيراد جديد محقق* 💰
حجز رقم: ${booking.bookingRef}
المبلغ المستلم: $${booking.totalAmount}
صافي ربح المنظومة: $${booking.financialsSnapshot.systemNetProfit}
طريقة الدفع: ${booking.paymentMethod}
    `;

    // محاكاة إرسال الواتساب والبريد
    console.log("To Supplier:", supplierMsg);
    console.log("To Admin:", adminMsg);

    return true;
  }
}

export const notificationService = NotificationService.getInstance();