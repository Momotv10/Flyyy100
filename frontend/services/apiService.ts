
import { db } from './mockDatabase';
import { Flight, Booking, UserRole } from '../types';
import { offerService } from './offerService';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error_code?: string;
  timestamp: string;
}

class ApiService {
  private static instance: ApiService;
  private requestLogs: { [key: string]: number[] } = {};
  private readonly RATE_LIMIT = 60; // 60 طلب في الدقيقة

  public static getInstance() {
    if (!this.instance) this.instance = new ApiService();
    return this.instance;
  }

  /**
   * محاكاة Middleware للتحقق من الصلاحية ومعدل الطلبات
   */
  private async validateRequest(apiKey: string): Promise<string> {
    // 1. التحقق من وجود المفتاح وربطه بوكيل نشط
    const agentProfile = db.getAgents().map(u => db.getAgentProfile(u.id)).find(p => p?.apiKey === apiKey && p.apiEnabled);
    if (!agentProfile) throw new Error("Unauthorized: مفتاح الـ API غير صالح أو تم إيقافه.");

    // 2. محاكاة Rate Limiting
    const now = Date.now();
    if (!this.requestLogs[apiKey]) this.requestLogs[apiKey] = [];
    this.requestLogs[apiKey] = this.requestLogs[apiKey].filter(t => now - t < 60000);
    
    if (this.requestLogs[apiKey].length >= this.RATE_LIMIT) {
      throw new Error("Too Many Requests: تم تجاوز الحد المسموح للطلبات (60 طلب/دقيقة).");
    }
    
    this.requestLogs[apiKey].push(now);
    return agentProfile.userId;
  }

  /**
   * 1. نقطة البحث عن الرحلات: POST /api/v1/flights/search
   */
  async searchFlights(apiKey: string, criteria: { from: string, to: string, date: string, isRoundTrip: boolean }): Promise<ApiResponse<Flight[]>> {
    try {
      await this.validateRequest(apiKey);
      
      // محاكاة البحث: إذا لم يوجد في التاريخ المحدد، نبحث عن أقرب تواريخ
      let results = db.getFlights().filter(f => 
        f.departureAirport === criteria.from && 
        f.arrivalAirport === criteria.to && 
        f.departureDate === criteria.date &&
        f.status === 'active'
      );

      if (results.length === 0) {
        // خوارزمية الأقرب تاريخاً
        const bestOffer = offerService.getBestOffer(criteria.from, criteria.to, criteria.date, criteria.isRoundTrip);
        results = bestOffer ? [bestOffer] : [];
      }

      return {
        status: 'success',
        data: results,
        message: results.length > 0 ? "تم العثور على رحلات متوفرة." : "لا توجد رحلات مطابقة، يرجى تغيير معايير البحث.",
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return { status: 'error', message: err.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * 2. نقطة إنشاء حجز: POST /api/v1/bookings
   */
  async createBooking(apiKey: string, bookingData: any): Promise<ApiResponse<Partial<Booking>>> {
    try {
      const agentId = await this.validateRequest(apiKey);
      const agent = db.getAgents().find(a => a.id === agentId);
      const flight = db.getFlights().find(f => f.id === bookingData.flightId);

      if (!flight) throw new Error("Flight Not Found: الرحلة المطلوبة غير موجودة.");
      
      const totalAmount = flight.prices.selling + (bookingData.visaRequested ? flight.visaPrice : 0);
      
      if (agent && agent.balance < totalAmount) {
        throw new Error("Insufficient Balance: رصيد الوكيل غير كافٍ لإتمام الحجز عبر الـ API.");
      }

      // محاكاة معالجة البيانات والصور
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        bookingRef: `API-${Date.now().toString().substr(-6)}`,
        flightId: flight.id,
        customerId: agentId,
        passengerName: bookingData.traveler.fullName,
        passportNumber: bookingData.traveler.passportNumber,
        passportNationality: bookingData.traveler.nationality,
        passportExpiry: bookingData.traveler.expiryDate,
        passportImage: bookingData.passportImageBase64, // تخزين الصورة المرفوعة
        customerPhone: bookingData.contact.whatsapp,
        status: 'awaiting_issue',
        totalAmount: totalAmount,
        paymentConfirmed: true,
        paymentMethod: 'api_balance_deduction',
        createdAt: new Date().toISOString(),
        flightSnapshot: {
          flightNumber: flight.flightNumber,
          departure: flight.departureAirport,
          arrival: flight.arrivalAirport,
          departureTime: flight.departureTime
        },
        financialsSnapshot: {
          costPrice: flight.prices.cost,
          agentCommission: flight.prices.agentCommission,
          systemNetProfit: flight.prices.systemNetProfit,
          totalAmount: totalAmount
        }
      };

      db.addBooking(newBooking);

      return {
        status: 'success',
        data: {
          id: newBooking.id,
          bookingRef: newBooking.bookingRef,
          status: newBooking.status,
          totalAmount: newBooking.totalAmount
        },
        message: "تم إنشاء الحجز بنجاح وخصم القيمة من الرصيد.",
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return { status: 'error', message: err.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * 3. نقطة استعلام حالة الحجز: GET /api/v1/bookings/{id}
   */
  async getBookingStatus(apiKey: string, bookingId: string): Promise<ApiResponse<Booking>> {
    try {
      const agentId = await this.validateRequest(apiKey);
      const booking = db.getBookings().find(b => b.id === bookingId && b.customerId === agentId);
      
      if (!booking) throw new Error("Booking Not Found: لا يوجد حجز بهذا الرقم تابع لحسابكم.");

      return {
        status: 'success',
        data: booking,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return { status: 'error', message: err.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * 4. نقطة تحميل التذكرة: GET /api/v1/bookings/{id}/ticket
   */
  async downloadTicket(apiKey: string, bookingId: string): Promise<ApiResponse<{ pdf_url: string }>> {
    try {
      const agentId = await this.validateRequest(apiKey);
      const booking = db.getBookings().find(b => b.id === bookingId && b.customerId === agentId);
      
      if (!booking) throw new Error("Booking Not Found.");
      if (booking.status !== 'ready') throw new Error("Ticket Not Ready: التذكرة لم تصدر بعد.");

      return {
        status: 'success',
        data: { pdf_url: booking.ticketFileUrl || '' },
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return { status: 'error', message: err.message, timestamp: new Date().toISOString() };
    }
  }
}

export const apiService = ApiService.getInstance();
