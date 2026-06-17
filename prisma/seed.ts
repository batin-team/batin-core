import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const specializations = ["Kecemasan", "Depresi", "Trauma", "Karier", "Relasi", "Keluarga"];

const psychologists = [
  {
    id: "psy-amanda",
    name: "Dr. Amanda Putri, M.Psi",
    title: "Psikolog Klinis Dewasa",
    gender: "FEMALE" as const,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=80",
    bio: "Berpengalaman menangani kecemasan, burnout, dan transisi hidup dewasa muda dengan pendekatan CBT dan mindfulness.",
    experienceYears: 9,
    specializations: ["Kecemasan", "Depresi", "Karier"],
    serviceMode: "BOTH" as const,
    rating: 4.9,
    pricePerSession: 350000,
    nextSlot: "Jumat, 09.00",
    homeCity: "Jakarta Selatan",
    homeLat: -6.2607,
    homeLng: 106.7816,
    availableSlots: ["2026-06-05T09:00", "2026-06-05T13:00", "2026-06-06T10:30", "2026-06-08T16:00"]
  },
  {
    id: "psy-raka",
    name: "Raka Adinata, M.Psi",
    title: "Konselor Keluarga",
    gender: "MALE" as const,
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=320&q=80",
    bio: "Fokus pada konseling relasi, keluarga, dan komunikasi pasangan dengan pendekatan sistemik.",
    experienceYears: 7,
    specializations: ["Relasi", "Keluarga", "Trauma"],
    serviceMode: "OFFLINE" as const,
    rating: 4.8,
    pricePerSession: 325000,
    nextSlot: "Sabtu, 13.00",
    homeCity: "Tangerang",
    homeLat: -6.1783,
    homeLng: 106.6319,
    availableSlots: ["2026-06-05T13:00", "2026-06-06T13:00", "2026-06-07T09:00", "2026-06-08T10:30"]
  },
  {
    id: "psy-maya",
    name: "Maya Lestari, M.Psi",
    title: "Psikolog Anak & Remaja",
    gender: "FEMALE" as const,
    avatarUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=320&q=80",
    bio: "Mendampingi remaja dan orang tua untuk isu emosi, akademik, dan adaptasi sosial.",
    experienceYears: 6,
    specializations: ["Kecemasan", "Keluarga", "Trauma"],
    serviceMode: "ONLINE" as const,
    rating: 4.7,
    pricePerSession: 300000,
    nextSlot: "Senin, 16.00",
    homeCity: "Bandung",
    homeLat: -6.9175,
    homeLng: 107.6191,
    availableSlots: ["2026-06-05T16:00", "2026-06-06T09:00", "2026-06-08T16:00", "2026-06-09T13:00"]
  },
  {
    id: "psy-nadia",
    name: "Nadia Rahman, M.Psi",
    title: "Psikolog Klinis Remaja",
    gender: "FEMALE" as const,
    avatarUrl: "https://images.unsplash.com/photo-1588622300477-208fba3c7f95?auto=format&fit=crop&w=320&q=80",
    bio: "Membantu isu trauma, kecemasan sosial, dan regulasi emosi remaja dengan pendekatan trauma-informed.",
    experienceYears: 8,
    specializations: ["Trauma", "Kecemasan", "Relasi"],
    serviceMode: "BOTH" as const,
    rating: 4.85,
    pricePerSession: 340000,
    nextSlot: "Jumat, 10.30",
    homeCity: "Depok",
    homeLat: -6.4025,
    homeLng: 106.7942,
    availableSlots: ["2026-06-05T10:30", "2026-06-06T16:00", "2026-06-07T13:00", "2026-06-09T09:00"]
  },
  {
    id: "psy-bagus",
    name: "Bagus Wiratama, M.Psi",
    title: "Psikolog Industri & Karier",
    gender: "MALE" as const,
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=320&q=80",
    bio: "Fokus pada burnout, konflik kerja, career coaching, dan strategi pengambilan keputusan profesional.",
    experienceYears: 10,
    specializations: ["Karier", "Kecemasan", "Relasi"],
    serviceMode: "ONLINE" as const,
    rating: 4.82,
    pricePerSession: 360000,
    nextSlot: "Sabtu, 09.00",
    homeCity: "Jakarta Pusat",
    homeLat: -6.1865,
    homeLng: 106.8341,
    availableSlots: ["2026-06-06T09:00", "2026-06-07T10:30", "2026-06-08T13:00"]
  },
  {
    id: "psy-citra",
    name: "Citra Wulandari, M.Psi",
    title: "Konselor Pernikahan",
    gender: "FEMALE" as const,
    avatarUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=320&q=80",
    bio: "Mendampingi pasangan dan keluarga untuk komunikasi, konflik relasi, dan pemulihan kepercayaan.",
    experienceYears: 11,
    specializations: ["Relasi", "Keluarga", "Trauma"],
    serviceMode: "OFFLINE" as const,
    rating: 4.88,
    pricePerSession: 375000,
    nextSlot: "Minggu, 13.00",
    homeCity: "Bekasi",
    homeLat: -6.2383,
    homeLng: 106.9756,
    availableSlots: ["2026-06-06T10:30", "2026-06-07T13:00", "2026-06-09T16:00"]
  }
];

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data
  await prisma.review.deleteMany();
  await prisma.sessionNotes.deleteMany();
  await prisma.sessionAttendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.session.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.psychologistSpecialization.deleteMany();
  await prisma.specialization.deleteMany();
  await prisma.psychologistProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.article.deleteMany();
  await prisma.cmsCategory.deleteMany();
  await prisma.bookingLock.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.crisisResource.deleteMany();

  // 2. Seed Settings
  console.log("Seeding settings...");
  await prisma.platformSetting.createMany({
    data: [
      { key: "member_split", value: "0.70" },
      { key: "partner_commission", value: "0.15" }
    ]
  });

  // 3. Seed Crisis Resources
  console.log("Seeding crisis resources...");
  await prisma.crisisResource.createMany({
    data: [
      { name: "988 Suicide & Crisis Lifeline", contactInfo: "Call or text 988 (Available 24/7)", location: "National" },
      { name: "Crisis Text Line", contactInfo: "Text HOME to 741741", location: "National" }
    ]
  });

  // 4. Seed Specializations
  console.log("Seeding specializations...");
  const specMap: Record<string, string> = {};
  for (const specName of specializations) {
    const spec = await prisma.specialization.create({
      data: {
        name: specName,
        description: `Spesialisasi penanganan masalah ${specName.toLowerCase()}`
      }
    });
    specMap[specName] = spec.id;
  }

  // 5. Seed Users and Psychologists
  console.log("Seeding psychologists...");
  for (const psy of psychologists) {
    const email = `${psy.id}@batin.test`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "password", // Raw text 'password' is used in mock login checks
        fullName: psy.name,
        role: "PSYCHOLOGIST",
        avatarUrl: psy.avatarUrl,
        phone: "081234567890",
        isVerified: true
      }
    });

    const profile = await prisma.psychologistProfile.create({
      data: {
        id: psy.id,
        userId: user.id,
        licenseNumber: `LIC-${psy.id.toUpperCase()}-12345`,
        bio: psy.bio,
        experienceYears: psy.experienceYears,
        gender: psy.gender,
        serviceMode: psy.serviceMode,
        pricePerSession: psy.pricePerSession,
        isVerified: true,
        isActive: true,
        averageRating: psy.rating,
        homeAddress: psy.homeCity,
        homeLat: psy.homeLat,
        homeLng: psy.homeLng
      }
    });

    for (const specName of psy.specializations) {
      const specId = specMap[specName];
      if (specId) {
        await prisma.psychologistSpecialization.create({
          data: {
            psychologistId: profile.id,
            specializationId: specId
          }
        });
      }
    }

    // Create Default AvailabilitySlots: Monday - Friday (days 1-5)
    const defaultSlots = [
      { start: "08:00", end: "09:00" },
      { start: "10:00", end: "11:00" },
      { start: "13:00", end: "14:00" },
      { start: "14:30", end: "15:30" },
      { start: "16:00", end: "17:00" }
    ];

    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
      for (const slot of defaultSlots) {
        await prisma.availabilitySlot.create({
          data: {
            psychologistId: profile.id,
            dayOfWeek,
            startTime: slot.start,
            endTime: slot.end,
            isRecurring: true
          }
        });
      }
    }
  }

  // 6. Seed Default Client User
  console.log("Seeding default client...");
  await prisma.user.create({
    data: {
      email: "client@batin.test",
      passwordHash: "password",
      fullName: "Client Batin",
      role: "CLIENT",
      phone: "08111222333",
      isVerified: true
    }
  });

  // 7. Seed Default Admin User
  console.log("Seeding default admin...");
  await prisma.user.create({
    data: {
      email: "admin@batin.test",
      passwordHash: "password",
      fullName: "Admin Batin",
      role: "ADMIN",
      phone: "08999888777",
      isVerified: true
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
