
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('verify-document')
  async verify(@Body() body: { image: string, mimeType?: string }) {
    return this.bookingService.verifyPassport(body.image, body.mimeType);
  }

  @UseGuards(JwtAuthGuard)
  @Post('finalize')
  async finalize(@Req() req: any, @Body() body: any) {
    return this.bookingService.finalizeBooking(req.user.id, body);
  }
}
