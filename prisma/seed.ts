import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Mongolian business data...');
  
  // Clear existing data (but keep users for auth)
  await prisma.yellowBook.deleteMany();
  
  // Create admin user if not exists
  const adminEmail = 'admin@yellowbook.mn';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        role: 'admin',
      },
    });
    console.log('✅ Admin user created:', adminEmail);
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Монгол бизнесүүдийн өгөгдөл
  const yellowBookEntries = [
    {
      businessName: 'Хаан банк',
      category: 'Санхүү',
      phoneNumber: '7000-1111',
      address: 'Бага тойруу, Чингисийн өргөн чөлөө 9',
      city: 'Улаанбаатар',
      state: 'СХД',
      zipCode: '14192',
      description: 'Монголын хамгийн том банкуудын нэг. Олон улсын стандартын санхүүгийн үйлчилгээ үзүүлдэг.',
      website: 'https://khanbank.com',
      email: 'info@khanbank.com',
    },
    {
      businessName: 'Шангри-Ла зочид буудал',
      category: 'Зочид буудал',
      phoneNumber: '7799-8888',
      address: 'Олимпын гудамж 19',
      city: 'Улаанбаатар',
      state: 'СХД',
      zipCode: '14241',
      description: '5 одтой зочид буудал. Дэлхийн жишгийн үйлчилгээ, ресторан, конференц танхим бүхий.',
      website: 'https://shangri-la.com/ulaanbaatar',
      email: 'slub@shangri-la.com',
    },
    {
      businessName: 'Номин супермаркет',
      category: 'Худалдаа',
      phoneNumber: '7012-3456',
      address: 'Сөүлийн гудамж 8',
      city: 'Улаанбаатар',
      state: 'ХУД',
      zipCode: '14210',
      description: 'Монголын хамгийн том супермаркет сүлжээ. Хүнсний бүтээгдэхүүн, гэр ахуйн бараа.',
      website: 'https://nomin.mn',
      email: 'info@nomin.mn',
    },
    {
      businessName: 'Enerelt сургууль',
      category: 'Боловсрол',
      phoneNumber: '7011-5555',
      address: 'Энхтайвны өргөн чөлөө 47',
      city: 'Улаанбаатар',
      state: 'СБД',
      zipCode: '14253',
      description: 'Олон улсын жишигт нийцсэн хувийн сургууль. Англи хэл дээр суралцах боломжтой.',
      website: 'https://enerelt.edu.mn',
      email: 'info@enerelt.edu.mn',
    },
    {
      businessName: 'Сонгдо эмнэлэг',
      category: 'Эрүүл мэнд',
      phoneNumber: '7575-1100',
      address: 'Их Монгол улсын 16а',
      city: 'Улаанбаатар',
      state: 'БГД',
      zipCode: '14200',
      description: 'Солонгос-Монголын хамтарсан эмнэлэг. Орчин үеийн тоног төхөөрөмж, мэргэжлийн эмч нар.',
      website: 'https://songdo.mn',
      email: 'contact@songdo.mn',
    },
    {
      businessName: 'MCS coca cola',
      category: 'Үйлдвэрлэл',
      phoneNumber: '7011-9999',
      address: 'Амгалан 30',
      city: 'Улаанбаатар',
      state: 'СХД',
      zipCode: '14251',
      description: 'Кока Кола, Фанта зэрэг ундааны үйлдвэр. Монголд 1997 оноос хойш үйл ажиллагаа явуулж байна.',
      website: 'https://coca-cola.mn',
      email: 'info@coca-cola.mn',
    },
    {
      businessName: 'Өрхөн гоёо',
      category: 'Ресторан',
      phoneNumber: '7010-7777',
      address: 'Сөүлийн гудамж 3',
      city: 'Улаанбаатар',
      state: 'ХУД',
      zipCode: '14210',
      description: 'Монголын үндэсний хоолны ресторан. Хорхог, бууз, цуйван зэрэг үндэсний хоол.',
      website: 'https://orkhongoyo.mn',
      email: 'booking@orkhongoyo.mn',
    },
    {
      businessName: 'Модерн номын дэлгүүр',
      category: 'Худалдаа',
      phoneNumber: '7015-8888',
      address: 'Их тойруу, Сүхбаатарын талбай',
      city: 'Улаанбаатар',
      state: 'СБД',
      zipCode: '14192',
      description: 'Монгол болон гадаад номын хамгийн том дэлгүүр. Сурах бичиг, уран зохиол, хүүхдийн ном.',
      website: 'https://modernbook.mn',
      email: 'info@modernbook.mn',
    },
    {
      businessName: 'Sky resort',
      category: 'Амралт',
      phoneNumber: '7018-3000',
      address: 'Цагаан нуур',
      city: 'Дархан',
      state: 'ДАР',
      zipCode: '45000',
      description: 'Дарханы ойролцоо байрладаг амралтын газар. Цагаан нуур дээр сувиллын үйлчилгээ.',
      website: 'https://skyresort.mn',
      email: 'reservation@skyresort.mn',
    },
    {
      businessName: 'Эрдэнэт техникийн их сургууль',
      category: 'Боловсрол',
      phoneNumber: '7035-2200',
      address: 'Баруун хэсэг, 4-р хороолол',
      city: 'Эрдэнэт',
      state: 'ОРХ',
      zipCode: '65000',
      description: 'Орхон аймгийн том их сургууль. Технологийн болон бизнесийн чиглэлээр сургалт явуулдаг.',
      website: 'https://erdenet-tech.edu.mn',
      email: 'admission@erdenet-tech.edu.mn',
    },
  ];

  for (const entry of yellowBookEntries) {
    await prisma.yellowBook.create({
      data: entry,
    });
  }

  console.log(`✅ Seeded ${yellowBookEntries.length} yellow book entries`);

  // Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'javkhlangantulga17@gmail.com' },
    update: {
      role: 'admin',
    },
    create: {
      email: 'javkhlangantulga17@gmail.com',
      name: 'Admin User',
      role: 'admin',
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Created/Updated admin user: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
