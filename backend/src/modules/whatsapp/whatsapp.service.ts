
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly FB_API_URL = `https://graph.facebook.com/v17.0/${process.env.WA_PHONE_NUMBER_ID}/messages`;
  private readonly ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;

  /**
   * إرسال رسالة نصية بسيطة أو تنبيه
   */
  async sendMessage(to: string, body: string) {
    try {
      await axios.post(
        this.FB_API_URL,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: body },
        },
        { headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` } },
      );
    } catch (error) {
      console.error('WA Send Error:', error.response?.data || error.message);
    }
  }

  /**
   * إرسال طلب إصدار للموظف مع صورة الجواز
   */
  async sendIssuanceRequest(staffPhone: string, bookingData: any, passportUrl: string) {
    const message = `
🌟 *طلب إصدار تذكرة جديد* 🌟
---------------------------
رقم الحجز: ${bookingData.bookingRef}
المسافر: ${bookingData.passengerName}
المسار: ${bookingData.route}
الرحلة: ${bookingData.flightNo}

يرجى الإصدار والرد بـ:
*تم الإصدار [PNR] [TICKET_NO]*
    `;

    try {
      await axios.post(
        this.FB_API_URL,
        {
          messaging_product: 'whatsapp',
          to: staffPhone,
          type: 'image',
          image: { link: passportUrl, caption: message },
        },
        { headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` } },
      );
    } catch (error) {
      console.error('WA Staff Request Error:', error.message);
    }
  }

  /**
   * إرسال التذكرة النهائية للعميل (PDF)
   */
  async sendTicketToCustomer(customerPhone: string, ticketUrl: string, bookingRef: string) {
    try {
      await axios.post(
        this.FB_API_URL,
        {
          messaging_product: 'whatsapp',
          to: customerPhone,
          type: 'document',
          document: {
            link: ticketUrl,
            filename: `Ticket-${bookingRef}.pdf`,
            caption: 'تذكرتك جاهزة! رحلة سعيدة من STAMS ✈️',
          },
        },
        { headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` } },
      );
    } catch (error) {
      console.error('WA Ticket Delivery Error:', error.message);
    }
  }
}
