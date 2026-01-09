
import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../../../types';

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('accounts')
  async getChartOfAccounts() {
    return this.financeService.getAccounts();
  }

  @Get('journal')
  async getLedger(@Query('start') start: string, @Query('end') end: string) {
    return this.financeService.getJournal(start, end);
  }

  @Post('accounts')
  async createAccount(@Body() body: any) {
    return this.financeService.createLedgerAccount(body.code, body.name, body.type);
  }

  @Get('reports/daily')
  async getDailyReport(@Query('date') date: string) {
    return this.financeService.getDailySummary(date);
  }
}
