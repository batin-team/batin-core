import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing data in dependency order
  console.log('Cleaning up database...');
  await prisma.supportTicket.deleteMany({});
  await prisma.ledgerEntry.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.providerLocation.deleteMany({});
  await prisma.providerDocument.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.platformSetting.deleteMany({});
  await prisma.crisisResource.deleteMany({});

  // 2. Hash password for all seed accounts
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Seed Platform Settings
  console.log('Seeding platform settings...');
  await prisma.platformSetting.createMany({
    data: [
      { key: 'member_split', value: '0.70' },
      { key: 'partner_commission', value: '0.15' }
    ]
  });

  // 4. Seed Crisis Resources
  console.log('Seeding crisis resources...');
  await prisma.crisisResource.createMany({
    data: [
      { name: '988 Suicide & Crisis Lifeline', contactInfo: 'Call or text 988 (Available 24/7)', location: 'National' },
      { name: 'Crisis Text Line', contactInfo: 'Text HOME to 741741', location: 'National' }
    ]
  });

  // 5. Seed Users
  console.log('Seeding users...');
  
  // Client User
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@example.com',
      passwordHash,
      role: 'CLIENT',
      fullName: 'Test Client',
      phone: '+62812345678',
      isVerified: true
    }
  });

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      fullName: 'System Administrator',
      isVerified: true
    }
  });

  // Corporate Sponsor User (registered as CLIENT but treated as CORPORATE on frontend)
  const corporateUser = await prisma.user.create({
    data: {
      email: 'corporate@example.com',
      passwordHash,
      role: 'CLIENT',
      fullName: 'ACME Corporate Sponsor',
      isVerified: true
    }
  });

  // Provider/Psychologist User
  const providerUser = await prisma.user.create({
    data: {
      email: 'psychologist@example.com',
      passwordHash,
      role: 'PROVIDER',
      fullName: 'Dr. Sarah Jenkins',
      isVerified: true
    }
  });

  // 6. Seed Provider profile details
  console.log('Seeding provider profiles...');
  const provider = await prisma.provider.create({
    data: {
      userId: providerUser.id,
      membershipType: 'MEMBER',
      professionalType: 'PSYCHOLOGIST',
      status: 'ACTIVE',
      specialties: ['Anxiety', 'Depression', 'CBT', 'Stress'],
      qualifications: ['Ph.D. in Clinical Psychology', 'Licensed Therapist Permit'],
      yearsOfExperience: 8,
      languages: ['English', 'Indonesian'],
      bio: 'Clinical Psychologist with 8 years of experience, specializing in cognitive behavioral therapy, anxiety treatments, and workplace stress.',
      hourlyRate: 120.00,
      rating: 4.8
    }
  });

  // 7. Seed Provider Clinic Locations
  console.log('Seeding provider clinic locations...');
  await prisma.providerLocation.createMany({
    data: [
      { providerId: provider.id, name: 'Downtown Wellness Clinic', address: 'Suite 404, 12 Broad St, Jakarta' },
      { providerId: provider.id, name: 'Kuningan Mental Health Center', address: 'Level 12, Tower B, Kuningan Place' }
    ]
  });

  // 8. Seed initial Support Tickets
  console.log('Seeding support tickets...');
  await prisma.supportTicket.createMany({
    data: [
      {
        userId: clientUser.id,
        subject: 'Appointment Rescheduling Error',
        message: 'My session with Dr. Jenkins failed to show calendar event.',
        status: 'OPEN'
      },
      {
        userId: clientUser.id,
        subject: 'Invoice copy request',
        message: 'Could you please send me a PDF invoice for my last completed payment?',
        status: 'IN_PROGRESS'
      }
    ]
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
