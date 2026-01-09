
import { Controller, Get, Post, Body, UseGuards, Query, Req } from '@nestjs/common';
import { FlightService } from './flight.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../../../types';

@Controller('api/v1/flights')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Post('airline')
  @Roles(UserRole.ADMIN)
  async addAirline(@Body() body: any) {
    return this.flightService.createAirline(body);
  }

  @Get('airlines')
  async getAirlines() {
    return this.flightService.getAirlines();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  async addFlight(@Req() req: any, @Body() body: any) {
    // Assuming providers have a provider profile linked
    const user = await this.flightService.createFlight(req.user.providerId || req.user.id, body);
    return user;
  }

  @Get('search')
  async search(@Query() query: any) {
    return this.flightService.getAllFlights(query);
  }
}
