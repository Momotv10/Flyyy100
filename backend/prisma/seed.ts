import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting System Seeding...');

  // 1. إنشاء حساب المدير العام (Default Admin)
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await (prisma as any).user.upsert({
    where: { username: 'admin@stams.com' },
    update: {},
    create: {
      username: 'admin@stams.com',
      password: adminPassword,
      name: 'المدير العام للمنظومة',
      role: 'ADMIN',
      balance: 0,
    },
  });
  console.log('✅ Admin Account Created');

  // 2. تهيئة المطارات الرئيسية
  const airports = [
    { code: 'RUH', city: 'الرياض', name: 'مطار الملك خالد الدولي', country: 'السعودية' },
    { code: 'DXB', city: 'دبي', name: 'مطار دبي الدولي', country: 'الإمارات' },
    { code: 'CAI', city: 'القاهرة', name: 'مطار القاهرة الدولي', country: 'مصر' },
    { code: 'IST', city: 'اسطنبول', name: 'مطار اسطنبول الجديد', country: 'تركيا' },
    { code: 'SAH', city: 'صنعاء', name: 'مطار صنعاء الدولي', country: 'اليمن' },
  ];

  for (const ap of airports) {
    await (prisma as any).airport.upsert({
      where: { code: ap.code },
      update: {},
      create: ap,
    });
  }
  console.log('✅ Airports Initialized');

  // 3. تهيئة شركات الطيران
  const airlines = [
    { name: 'الخطوط السعودية', iata: 'SV', logo: 'https://stams.ai/assets/logos/saudia.png', country: 'KSA' },
    { name: 'طيران الإمارات', iata: 'EK', logo: 'https://stams.ai/assets/logos/emirates.png', country: 'UAE' },
    { name: 'طيران بلقيس', iata: 'BQ', logo: 'https://stams.ai/assets/logos/bilqis.png', country: 'Yemen' },
  ];

  const createdAirlines = [];
  for (const air of airlines) {
    const a = await (prisma as any).airline.upsert({
      where: { iata: air.iata },
      update: {},
      create: { ...air, isActive: true, systemCommission: 10 },
    });
    createdAirlines.push(a);
  }
  console.log('✅ Airlines Initialized');

  // 4. إضافة رحلات نشطة (Active Schedules) للبحث
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await (prisma as any).flightSchedule.create({
    data: {
      flight: {
        create: {
          flightNumber: 'SV-100',
          departureAirport: 'RUH',
          arrivalAirport: 'DXB',
          airlineId: createdAirlines[0].id,
          aircraftType: 'Boeing 787',
          visaPrice: 50,
        }
      },
      departureTime: tomorrow,
      arrivalTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      economySeats: 120,
      businessSeats: 20,
      costPrice: 200,
      sellingPrice: 350,
      agentCommission: 25,
      systemCommission: 15,
      isActive: true,
    }
  });

  console.log('✅ Sample Flight Schedules Added');
  console.log('✨ Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    // Fix: Cast process to any to bypass 'exit' property not found on type 'Process' in some TS environments
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });