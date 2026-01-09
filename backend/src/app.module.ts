
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './modules/auth/auth.service';
import { BookingService } from './modules/booking/booking.service';
import { FinanceService } from './modules/finance/finance.service';
import { FlightService } from './modules/flight/flight.service';
import { WhatsappService } from './modules/whatsapp/whatsapp.service';
import { BookingController } from './modules/booking/booking.controller';
import { FlightController } from './modules/flight/flight.controller';
import { FinanceController } from './modules/finance/finance.controller';
import { WhatsappController } from './modules/whatsapp/whatsapp.controller';
import { HealthController } from './modules/health/health.controller';
import { OcrClient } from './common/ai/ocr.client';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'STAMS_SECRET_KEY_2024',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    BookingController,
    FlightController,
    FinanceController,
    WhatsappController,
    HealthController,
  ],
  providers: [
    PrismaService,
    AuthService,
    BookingService,
    FinanceService,
    FlightService,
    WhatsappService,
    OcrClient,
  ],
  exports: [PrismaService, AuthService],
})
export class AppModule {}
