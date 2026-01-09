
/**
 * STAMS Central API Configuration
 * يدير هذا الملف الروابط الأساسية لبيئات التطوير والإنتاج
 */

const IS_PROD = process.env.NODE_ENV === 'production';

export const API_CONFIG = {
  // عنوان محرك NestJS (العمليات المالية والتحكم)
  BACKEND_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  
  // عنوان محرك Python FastAPI (الذكاء الاصطناعي و OCR)
  AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000',
  
  // إعدادات الـ Timeout للطلبات الثقيلة (مثل معالجة الصور)
  AI_REQUEST_TIMEOUT: 30000, // 30 ثانية
};
