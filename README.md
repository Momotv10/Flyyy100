
# STAMS | Aero Intelligence Enterprise ✈️⚖️

منظومة الربط التشغيلي الموحد لقطاع الطيران - الإصدار المؤسسي الذكي.

## 🚀 تشغيل النظام في 3 خطوات

### 1. إعداد المتغيرات
قم بإنشاء ملف `.env` في المجلد الرئيسي وأضف مفتاح Gemini API:
```env
API_KEY=your_gemini_api_key_here
```

### 2. البناء والتشغيل (Docker)
تأكد من وجود Docker مثبت على جهازك، ثم نفذ الأمر التالي:
```bash
docker-compose up --build -d
```

### 3. الوصول للنظام
- **واجهة العملاء والشركاء:** `http://localhost`
- **توثيق الـ API للمطورين:** `http://localhost:3000/api/docs`
- **محرك الذكاء الاصطناعي:** `http://localhost:8000`

---
## 🛠 التقنيات المستخدمة
- **Backend:** NestJS (Node.js) + Prisma ORM + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **AI Engine:** FastAPI (Python) + Google Gemini Pro Vision (OCR)
- **Real-time:** Socket.io (Websockets)
- **Infrastructure:** Docker & Redis

© 2024 STAMS Aero Intelligence.
