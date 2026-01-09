
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Controller('api/v1/health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    let aiStatus = 'DOWN';
    try {
      // محاولة الوصول لمحرك بايثون
      const aiResponse = await axios.get(process.env.AI_SERVICE_URL || 'http://ai-service:8000/health');
      if (aiResponse.status === 200) aiStatus = 'CONNECTED';
    } catch (e) {
      aiStatus = 'DISCONNECTED';
    }

    try {
      // فحص قاعدة البيانات
      await (this.prisma as any).$queryRaw`SELECT 1`;
      
      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'CONNECTED',
        ai_engine: aiStatus,
        version: '2.5.0-production'
      };
    } catch (e) {
      return {
        status: 'CRITICAL',
        database: 'ERROR',
        ai_engine: aiStatus,
        error: e.message
      };
    }
  }
}
