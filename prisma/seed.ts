import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.yellowBook.deleteMany();
  await prisma.user.deleteMany();

  // Create seed data
  const yellowBookEntries = [
    {
      businessName: "Joe's Pizza Palace",
      category: 'Restaurant',
      phoneNumber: '+1 (555) 123-4567',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      description: 'Authentic New York style pizza since 1985. Family owned and operated.',
      website: 'https://joespizza.example.com',
      email: 'info@joespizza.example.com',
    },
    {
      businessName: 'Smith & Associates Law Firm',
      category: 'Legal Services',
      phoneNumber: '+1 (555) 234-5678',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      description: 'Experienced attorneys specializing in business and family law.',
      website: 'https://smithlaw.example.com',
      email: 'contact@smithlaw.example.com',
    },
    {
      businessName: 'Green Thumb Garden Center',
      category: 'Home & Garden',
      phoneNumber: '+1 (555) 345-6789',
      address: '789 Elm Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      description: 'Your one-stop shop for plants, tools, and gardening supplies.',
      website: 'https://greenthumb.example.com',
      email: 'help@greenthumb.example.com',
    },
    {
      businessName: 'QuickFix Auto Repair',
      category: 'Automotive',
      phoneNumber: '+1 (555) 456-7890',
      address: '321 Maple Drive',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      description: 'Fast, reliable auto repair and maintenance services. All makes and models.',
      website: 'https://quickfixauto.example.com',
      email: 'service@quickfixauto.example.com',
    },
    {
      businessName: 'Wellness First Medical Clinic',
      category: 'Healthcare',
      phoneNumber: '+1 (555) 567-8901',
      address: '654 Pine Boulevard',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      description: 'Comprehensive primary care and preventive medicine for the whole family.',
      website: 'https://wellnessfirst.example.com',
      email: 'appointments@wellnessfirst.example.com',
    },
    {
      businessName: 'TechSolutions IT Services',
      category: 'Technology',
      phoneNumber: '+1 (555) 678-9012',
      address: '987 Cedar Lane',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      description: 'Expert IT support, network solutions, and cybersecurity services.',
      website: 'https://techsolutions.example.com',
      email: 'support@techsolutions.example.com',
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
