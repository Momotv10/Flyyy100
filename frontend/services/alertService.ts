
import { db } from './mockDatabase';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface SmartAlert {
  id: string;
  type: 'inventory' | 'pricing' | 'opportunity';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionLabel?: string;
  suggestedPrice?: number;
  timestamp: string;
}

class AlertService {
  private static instance: AlertService;
  public static getInstance() {
    if (!this.instance) this.instance = new AlertService();
    return this.instance;
  }

  async getProviderAlerts(providerId: string): Promise<SmartAlert[]> {
    const alerts: SmartAlert[] = [];
    const providerFlights = db.getProviderFlights(providerId);

    for (const flight of providerFlights) {
      // 1. تنبيهات نقص المخزون (أقل من 10%)
      const totalSeats = flight.classes.economy.seats + flight.classes.business.seats + flight.classes.first.seats;
      const initialSeats = 150; // افتراضياً للتبسيط
      if (totalSeats > 0 && totalSeats < (initialSeats * 0.1)) {
        alerts.push({
          id: `inv-${flight.id}`,
          type: 'inventory',
          severity: 'high',
          title: 'المخزون حرج!',
          message: `رحلة ${flight.flightNumber} لم يتبق بها سوى ${totalSeats} مقعداً. يرجى إضافة مقاعد جديدة.`,
          actionLabel: 'إضافة مقاعد',
          timestamp: new Date().toISOString()
        });
      }

      // 2. تنبيهات الأسعار التنافسية (تحليل السوق)
      const marketPrices = db.getFlights()
        .filter(f => f.departureAirport === flight.departureAirport && f.arrivalAirport === flight.arrivalAirport && f.providerId !== providerId)
        .map(f => f.prices.selling);

      if (marketPrices.length > 0) {
        const avgPrice = marketPrices.reduce((a, b) => a + b, 0) / marketPrices.length;
        if (flight.prices.selling > avgPrice * 1.15) {
          alerts.push({
            id: `prc-${flight.id}`,
            type: 'pricing',
            severity: 'medium',
            title: 'سعر غير منافس',
            message: `سعر رحلتك ${flight.flightNumber} أعلى من متوسط السوق بـ 15%.`,
            suggestedPrice: Math.round(avgPrice),
            actionLabel: 'تعديل السعر',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // 3. تنبيهات مواسم الذروة (بناءً على تحليل التاريخ)
    const month = new Date().getMonth();
    if ([5, 6, 11].includes(month)) { // أشهر الصيف والشتاء
      alerts.push({
        id: 'season-alert',
        type: 'opportunity',
        severity: 'low',
        title: 'فرصة ذروة موسمية',
        message: 'نحن في موسم طلب عالٍ، ينصح بزيادة العروض للمسارات الدولية.',
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }
}

export const alertService = AlertService.getInstance();
