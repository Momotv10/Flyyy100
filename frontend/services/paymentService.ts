
// Fix: Correcting the import source for PaymentGatewayConfig from types.ts
import { db } from './mockDatabase';
import { PaymentGatewayConfig } from '../types';

class PaymentService {
  private static instance: PaymentService;
  
  public static getInstance() {
    if (!this.instance) this.instance = new PaymentService();
    return this.instance;
  }

  /**
   * معالجة الدفع عبر البوابة المختارة
   */
  async processPayment(gatewayId: string, amount: number, reference: string): Promise<{success: boolean, transactionId: string}> {
    const gateways = (db as any).getPaymentGateways() as PaymentGatewayConfig[];
    const gateway = gateways.find(g => g.id === gatewayId);

    if (!gateway || !gateway.isActive) {
      throw new Error("بوابة الدفع هذه غير مفعلة حالياً.");
    }

    console.log(`[PaymentEngine] Connecting to ${gateway.name} API...`);
    console.log(`[PaymentEngine] Authorizing $${amount} for Ref: ${reference}`);

    // محاكاة الاتصال الفعلي بالـ API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `TXN-${Math.random().toString(36).toUpperCase().substr(2, 10)}`
        });
      }, 2000);
    });
  }
}

export const paymentService = PaymentService.getInstance();
