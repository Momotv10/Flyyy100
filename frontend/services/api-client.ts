
import { db } from './mockDatabase';
import { extractPassportData } from './geminiService';
import { accountingService } from './accountingService';
import { notificationService } from './notificationService';
import { Booking } from '../types';

export const stamsApi = {
  post: async (path: string, data: any) => {
    console.log(`[STAMS-API] Processing ${path}...`);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Fix: Added support for /bookings/create-draft path in stamsApi to handle draft booking creation
    if (path === '/bookings/create-draft') {
      const { flightId, passengers, totalAmount, phone, email, flightSnapshot } = data;
      const p = passengers[0];
      const draftId = `DRF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const draft: Booking = {
        id: draftId,
        bookingRef: `RES-${Date.now().toString().slice(-6)}`,
        status: 'pending' as any,
        flightId,
        customerId: 'guest',
        passengerName: `${p.firstName} ${p.lastName}`,
        passportNumber: p.passportNumber,
        passportNationality: p.nationality,
        passportExpiry: p.expiryDate,
        customerPhone: phone,
        totalAmount,
        paymentConfirmed: false,
        paymentMethod: 'none',
        createdAt: new Date().toISOString(),
        flightSnapshot: flightSnapshot || {},
        financialsSnapshot: {
          costPrice: totalAmount * 0.8,
          agentCommission: 0,
          systemNetProfit: totalAmount * 0.2,
          totalAmount: totalAmount
        }
      };

      db.addBooking(draft);
      return { data: draft };
    }

    // الاعتماد النهائي بعد الدفع
    if (path === '/bookings/finalize') {
      const { bookingData } = data;
      
      const newBooking: Booking = {
        id: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        bookingRef: `RES-${Date.now().toString().slice(-6)}`,
        status: 'awaiting_issue',
        flightId: bookingData.flightId,
        customerId: (window as any).db.login?.id || 'guest',
        passengerName: `${bookingData.firstName} ${bookingData.lastName}`,
        passportNumber: bookingData.passportNumber,
        passportNationality: bookingData.nationality,
        passportExpiry: bookingData.expiryDate,
        passportImage: bookingData.passportImage,
        customerPhone: bookingData.whatsapp,
        totalAmount: bookingData.totalAmount,
        paymentConfirmed: true,
        paymentMethod: data.paymentDetails?.method || 'card',
        createdAt: new Date().toISOString(),
        flightSnapshot: bookingData.flightSnapshot,
        financialsSnapshot: {
          costPrice: bookingData.totalAmount * 0.8, // افتراض تكلفة
          agentCommission: 0,
          systemNetProfit: bookingData.totalAmount * 0.2,
          totalAmount: bookingData.totalAmount
        }
      };

      // 1. الحفظ في قاعدة البيانات (تظهر للمدير والمزود)
      db.addBooking(newBooking);

      // 2. القيد المحاسبي
      accountingService.generateBookingEntry(newBooking);

      // 3. إشعار المزود والمدير بالبيانات والصور
      await notificationService.triggerPostPaymentAlerts(newBooking);

      return { data: { success: true, bookingId: newBooking.id } };
    }

    if (path === '/bookings/verify-document') {
      const result = await extractPassportData(data.image, new Date().toISOString());
      return { data: { status: 'success', data: result } };
    }

    throw new Error(`Endpoint ${path} not found.`);
  }
};

export const bookingApi = {
  searchFlights: async (params: any) => ({ data: db.getFlights().filter(f => f.departureAirport === params.from && f.arrivalAirport === params.to) }),
  verifyDocument: async (base64: string) => (await stamsApi.post('/bookings/verify-document', { image: base64 })).data,
  // Fix: Added missing createDraft method to bookingApi to resolve the error in PassengerForm.tsx
  createDraft: async (data: any) => (await stamsApi.post('/bookings/create-draft', data)).data,
  finalize: async (data: any) => (await stamsApi.post('/bookings/finalize', data)).data,
};
