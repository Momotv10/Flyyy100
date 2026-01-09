import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. الحماية (Security Hardening)
  app.use(helmet()); // حماية HTTP Headers
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // 2. منع هجمات DDoS (Rate Limiting)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: 100, // حد أقصى 100 طلب لكل IP
      message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.',
    }),
  );
  
  // 3. التحقق من صحة البيانات (Global Validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // 4. توثيق الـ API (Swagger UI)
  const config = new DocumentBuilder()
    .setTitle('STAMS Aero Intelligence API')
    .setDescription(
      'التوثيق الرسمي لمنظومة الربط التشغيلي الموحد لقطاع الطيران - إصدار المؤسسات',
    )
    .setVersion('2.5.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // 5. تشغيل السيرفر (مهم لـ Zeabur)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 STAMS Enterprise Engine is live on port ${port}`);
  console.log(`📝 API Documentation available at /api/docs`);
}

bootstrap();