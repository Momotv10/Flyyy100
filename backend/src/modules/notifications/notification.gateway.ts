
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`[Websocket] Client Connected: ${client.id}`);
  }

  /**
   * إرسال تنبيه حجز جديد لكافة المدراء المتصلين
   */
  notifyNewBooking(bookingData: any) {
    this.server.emit('new_booking_alert', {
      message: `حجز جديد برقم ${bookingData.bookingRef}`,
      amount: bookingData.totalAmount,
      timestamp: new Date(),
    });
  }

  /**
   * إرسال تنبيه نجاح الدفع
   */
  notifyPaymentSuccess(data: any) {
    this.server.emit('payment_confirmed', data);
  }
}
