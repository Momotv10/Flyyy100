import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Fix: Accessing internal prisma method $connect via any cast
    await (this as any).$connect();
  }

  async onModuleDestroy() {
    // Fix: Accessing internal prisma method $disconnect via any cast
    await (this as any).$disconnect();
  }

  /**
   * دالة مساعدة لضمان تنفيذ العمليات المالية في معاملة واحدة
   */
  async executeInTransaction<T>(work: (tx: any) => Promise<T>): Promise<T> {
    // Fix: Accessing internal prisma method $transaction via any cast
    return (this as any).$transaction(work);
  }
}