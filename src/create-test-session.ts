import { prisma } from "./db";

async function main() {
  // Get the client user
  const client = await prisma.user.findFirst({ where: { role: "CLIENT" } });
  if (!client) {
    console.error("No client user found. Please run seed.ts first.");
    process.exit(1);
  }

  // Get the first psychologist profile
  const psy = await prisma.psychologistProfile.findFirst({ include: { user: true } });
  if (!psy) {
    console.error("No psychologist found. Please run seed.ts first.");
    process.exit(1);
  }

  console.log(`Creating test session for client: ${client.fullName} with psy: ${psy.user.fullName}`);

  // Create a session with COMPLETED status
  const session = await prisma.session.create({
    data: {
      id: "ses-0998",
      clientId: client.id,
      psychologistId: psy.id,
      sessionType: "ONLINE",
      status: "COMPLETED",
      scheduledAt: new Date("2024-12-15T10:00:00+07:00"),
      clientIssues: ["Kecemasan", "Stress"],
      googleMeetUrl: "https://meet.google.com/abc-defg-hij",
      assignmentMethod: "SELF_SELECT",
      payment: {
        create: {
          amount: psy.pricePerSession,
          platformFee: Math.floor(psy.pricePerSession * 0.1),
          totalAmount: psy.pricePerSession,
          status: "SUCCESS",
          paymentMethod: "BANK_TRANSFER"
        }
      }
    }
  });

  console.log(`Created test session with ID: ${session.id}`);
  console.log(`Visit: http://localhost:3000/dashboard/client/${session.id}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
