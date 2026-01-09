# تعليمات تشغيل مشروع STAMS على Zeabur

تم تجهيز هذا المشروع ليعمل بسلاسة على منصة **Zeabur** باستخدام تقنية Docker.

## هيكلية المشروع المحدثة
- `frontend/`: واجهة المستخدم (React + Vite).
- `backend/`: محرك النظام (NestJS + Prisma).
- `ai-service/`: خدمة الذكاء الاصطناعي (Python FastAPI).

## خطوات النشر على Zeabur:

1. **رفع المشروع**: قم برفع مجلد المشروع بالكامل إلى مستودع GitHub الخاص بك.
2. **إنشاء مشروع جديد**: في لوحة تحكم Zeabur، اختر "Create Project".
3. **إضافة الخدمات**:
   - قم بربط مستودع GitHub.
   - سيتعرف Zeabur تلقائياً على الخدمات الثلاث (frontend, backend, ai-service) بناءً على ملف `zeabur.json`.
4. **إضافة قاعدة البيانات**:
   - من قائمة "Service"، اختر "Prebuilt Service" ثم "PostgreSQL".
   - سيقوم Zeabur بتوليد `POSTGRES_URL` تلقائياً.
5. **إعداد المتغيرات البيئية (Environment Variables)**:
   - في خدمة `backend`: تأكد من وجود `DATABASE_URL` (يتم ربطه بـ PostgreSQL).
   - في خدمة `ai-service`: أضف متغير `GEMINI_API_KEY` الخاص بك.
   - في خدمة `frontend`: أضف `NEXT_PUBLIC_API_URL` ليشير إلى رابط خدمة الـ backend التي سيوفرها Zeabur.

## ملاحظات هامة:
- تم إنشاء ملفات `Dockerfile` لكل خدمة لضمان بيئة تشغيل معزولة ومستقرة.
- تم بناء `schema.prisma` بناءً على تحليل الكود لضمان عمل قاعدة البيانات بشكل صحيح.
- خدمة الذكاء الاصطناعي مبرمجة لاستخدام **Google Gemini** لمعالجة صور الجوازات.
