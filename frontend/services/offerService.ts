
import { db } from './mockDatabase';
import { Flight } from '../types';

class OfferService {
  private static instance: OfferService;
  public static getInstance() {
    if (!this.instance) this.instance = new OfferService();
    return this.instance;
  }

  /**
   * الميزة الأولى: استخراج العرض الأفضل (الأرخص والأقرب تاريخاً)
   */
  getBestOffer(from: string, to: string, requestedDate: string, isRoundTrip: boolean): Flight | null {
    const allFlights = db.getFlights().filter(f => 
      f.departureAirport === from && 
      f.arrivalAirport === to && 
      f.isRoundTrip === isRoundTrip &&
      f.status === 'active' &&
      (f.seats.economy + f.seats.business + f.seats.first) > 0
    );

    if (allFlights.length === 0) return null;

    // 1. ترتيب حسب القرب التاريخي أولاً
    // 2. ثم الترتيب حسب السعر الأقل
    const sorted = allFlights.sort((a, b) => {
      const diffA = Math.abs(new Date(a.departureDate).getTime() - new Date(requestedDate).getTime());
      const diffB = Math.abs(new Date(b.departureDate).getTime() - new Date(requestedDate).getTime());
      
      if (diffA !== diffB) return diffA - diffB;
      return a.prices.selling - b.prices.selling;
    });

    // نعيد العرض الأول (الأرخص والأقرب)
    return sorted[0];
  }

  /**
   * الحصول على العروض البديلة في حال نفاد المقاعد
   */
  getNextBestOffers(from: string, to: string, requestedDate: string, currentFlightId: string): Flight[] {
    return db.getFlights().filter(f => 
      f.id !== currentFlightId &&
      f.departureAirport === from && 
      f.arrivalAirport === to &&
      f.status === 'active' &&
      (f.seats.economy + f.seats.business + f.seats.first) > 0
    ).sort((a, b) => a.prices.selling - b.prices.selling);
  }
}

export const offerService = OfferService.getInstance();
