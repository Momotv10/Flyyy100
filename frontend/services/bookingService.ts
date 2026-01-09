
import { db } from './mockDatabase';
import { Flight, Booking, User, UserRole, BookingStatus } from '../types';
import { accountingService } from './accountingService';
import { notificationService } from './notificationService';

class BookingService {
  private static instance: BookingService;
  public static getInstance() {
    if (!this.instance) this.instance = new BookingService();
    return this.instance;
  }

  /**
   * إنشاء حجز جديد مع إدارة التوافر والعمليات المالية والخصم الذري للمقاعد
   */
  async createBooking(flightId: string, userId: string, payload: any) {
    // إصلاح: التأكد من وجود payload وصحة مصفوفة المسافرين لتجنب خطأ length
    if (!payload) throw new Error("بيانات الطلب غير مكتملة.");
    
    const passengers = payload.passengers || [];
    const { visaRequested, classType = 'economy', payNow = true } = payload;
    
    if (passengers.length === 0) {
      throw new Error("يجب إضافة مسافر واحد على الأقل لإتمام الحجز.");
    }

    // جلب الرحلة من قاعدة البيانات
    const flight = db.getFlights().find(f => f.id === flightId);
    if (!flight) throw new Error("عفواً، الرحلة غير موجودة في النظام.");

    // 1. التحقق من توفر المقاعد (Seat Inventory Check)
    const seatsAvailable = flight.seats[classType as keyof typeof flight.seats] || 0;
    if (seatsAvailable < passengers.length) {
      throw new Error(`عفواً، لا توجد مقاعد كافية في الدرجة ${classType}. المتبقي: ${seatsAvailable}`);
    }

    // 2. حساب المبالغ المالية
    const classInfo = flight.classes?.[classType as keyof typeof flight.classes];
    const unitPrice = classInfo?.sellingPrice || flight.prices.selling;
    const unitCost = classInfo?.costPrice || flight.prices.cost;
    const unitComm = classInfo?.agentCommission || flight.prices.agentCommission;
    
    const totalTicketAmount = unitPrice * passengers.length;
    const totalVisaAmount = visaRequested ? (flight.visaPrice || 0) * passengers.length : 0;
    const totalAmount = totalTicketAmount + totalVisaAmount;

    // 3. التحقق من سيولة الوكيل إذا كان هو من يقوم بالحجز
    const user = db.getAgents().find(u => u.id === userId) || (window as any).currentUser;
    if (user?.role === UserRole.AGENT && user.balance < totalAmount) {
      throw new Error("عفواً، رصيد الوكالة غير كافٍ لإتمام هذا الحجز. يرجى شحن المحفظة.");
    }

    // 4. إنشاء سجل الحجز
    const booking: Booking = {
      id: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      bookingRef: `RES-${Date.now().toString().substr(-6)}`,
      flightId: flight.id,
      customerId: userId,
      status: 'awaiting_issue',
      totalAmount: totalAmount,
      paymentConfirmed: payNow,
      paymentMethod: user?.role === UserRole.AGENT ? 'agent_balance' : 'gateway',
      createdAt: new Date().toISOString(),
      passengerName: `${passengers[0].firstName} ${passengers[0].lastName}`,
      passportNumber: passengers[0].passportNumber,
      passportNationality: passengers[0].nationality,
      passportExpiry: passengers[0].expiryDate,
      passportBirthDate: passengers[0].birthDate,
      passportImage: passengers[0].passportImage,
      customerPhone: payload.phone || user?.phone || '0000000000',
      flightSnapshot: {
        flightNumber: flight.flightNumber,
        departure: flight.departureAirport,
        arrival: flight.arrivalAirport,
        departureTime: flight.departureTime,
        airlineName: db.getAirlines().find(a => a.id === flight.airlineId)?.name,
        airlineLogo: db.getAirlines().find(a => a.id === flight.airlineId)?.logo,
        departureTimeFormatted: flight.departureTimeFormatted,
        arrivalTimeFormatted: flight.arrivalTimeFormatted
      },
      financialsSnapshot: {
        costPrice: unitCost * passengers.length,
        agentCommission: unitComm * passengers.length,
        systemNetProfit: (unitPrice - unitCost - unitComm) * passengers.length,
        totalAmount: totalAmount
      }
    };

    // 5. الخصم الذري من المخزون (Atomic Seat Deduction)
    if (classType === 'economy') flight.seats.economy -= passengers.length;
    else if (classType === 'business') flight.seats.business -= passengers.length;
    else if (classType === 'first') flight.seats.first -= passengers.length;

    // 6. حفظ الحجز في قاعدة البيانات
    db.addBooking(booking);

    // 7. تفعيل المحرك المالي (Financial Trigger)
    if (payNow) {
      accountingService.generateBookingEntry(booking);
      // إذا كان وكيل، نخصم من رصيده الفعلي في الـ User object أيضاً للسرعة في الواجهة
      if (user?.role === UserRole.AGENT) {
        user.balance -= totalAmount;
      }
    }

    // 8. إبلاغ المزود آلياً عبر الواتساب
    await notificationService.requestIssuanceFromProvider(booking);

    return booking;
  }

  async getBooking(id: string) {
    return db.getBookings().find(b => b.id === id);
  }
}

export const bookingService = BookingService.getInstance();
