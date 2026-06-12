import { maskMetadata } from "../middleware/audit";
import { RevenueService } from "./revenue.service";
import { AssessmentService } from "./assessment.service";
import { prisma } from "../db";

describe("Batin High-Fidelity Backend Services", () => {
  describe("WU-001: Audit PII Masking", () => {
    it("should deeply redact password, email, phone, and address fields", () => {
      const dirtyMetadata = {
        user: {
          email: "test@example.com",
          phone: "0812345678",
          address: "123 Main St",
          passwordHash: "secret123"
        },
        otherData: "safe",
        nested: {
          key: "value",
          nestedEmail: "nested@email.com"
        }
      };

      const clean = maskMetadata(dirtyMetadata);

      expect(clean.user.email).toBe("[REDACTED]");
      expect(clean.user.phone).toBe("[REDACTED]");
      expect(clean.user.address).toBe("[REDACTED]");
      expect(clean.user.passwordHash).toBe("[REDACTED]");
      expect(clean.otherData).toBe("safe");
      expect(clean.nested.key).toBe("value");
      expect(clean.nested.nestedEmail).toBe("[REDACTED]");
    });
  });

  describe("WU-002: Financial Ledgering & Split Calculations", () => {
    let mockClient: any;
    let mockMemberProfile: any;
    let mockPartnerProfile: any;

    beforeAll(async () => {
      // Create users & profiles for testing split
      const memberUser = await prisma.user.create({
        data: {
          email: "member-test@batin.test",
          passwordHash: "password",
          fullName: "Member Psychologist",
          role: "PSYCHOLOGIST"
        }
      });

      mockMemberProfile = await prisma.psychologistProfile.create({
        data: {
          userId: memberUser.id,
          licenseNumber: "LIC-MEMBER-TEST",
          bio: "Clinician",
          experienceYears: 5,
          gender: "FEMALE",
          serviceMode: "ONLINE",
          pricePerSession: 300000,
          membershipType: "MEMBER"
        }
      });

      const partnerUser = await prisma.user.create({
        data: {
          email: "partner-test@batin.test",
          passwordHash: "password",
          fullName: "Partner Psychologist",
          role: "PSYCHOLOGIST"
        }
      });

      mockPartnerProfile = await prisma.psychologistProfile.create({
        data: {
          userId: partnerUser.id,
          licenseNumber: "LIC-PARTNER-TEST",
          bio: "Independent Clinician",
          experienceYears: 8,
          gender: "MALE",
          serviceMode: "BOTH",
          pricePerSession: 400000,
          membershipType: "PARTNER"
        }
      });

      mockClient = await prisma.user.create({
        data: {
          email: "client-test@batin.test",
          passwordHash: "password",
          fullName: "Client Test",
          role: "CLIENT"
        }
      });
    });

    afterAll(async () => {
      // Cleanup
      await prisma.ledgerEntry.deleteMany();
      await prisma.transaction.deleteMany();
      await prisma.payment.deleteMany();
      await prisma.session.deleteMany();
      await prisma.psychologistProfile.deleteMany({
        where: { id: { in: [mockMemberProfile.id, mockPartnerProfile.id] } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: [mockClient.id, mockMemberProfile.userId, mockPartnerProfile.userId] } }
      });
    });

    it("should calculate 70/30 split correctly for MEMBER psychologist", async () => {
      const session = await prisma.session.create({
        data: {
          clientId: mockClient.id,
          psychologistId: mockMemberProfile.id,
          sessionType: "ONLINE",
          scheduledAt: new Date(),
          assignmentMethod: "AUTO_ASSIGN",
          payment: {
            create: {
              amount: 335000, // 300000 + 35000 platform fee
              platformFee: 35000,
              totalAmount: 335000,
              status: "PENDING"
            }
          }
        },
        include: { payment: true }
      });

      // Mark payment SUCCESS
      await prisma.payment.update({
        where: { id: session.payment!.id },
        data: { status: "SUCCESS" }
      });

      const tx = await RevenueService.recordTransactionAndSplits(session.id);
      expect(tx.status).toBe("SUCCESS");

      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { transactionId: tx.id }
      });

      expect(ledgerEntries.length).toBe(2);

      const providerEntry = ledgerEntries.find(e => e.type === "PROVIDER_SPLIT");
      const platformEntry = ledgerEntries.find(e => e.type === "PLATFORM_SPLIT");

      // MEMBER: 70% of 300k = 210k provider
      // Platform: 30% of 300k (90k) + 35k platform fee = 125k platform
      expect(Number(providerEntry?.amount)).toBe(210000);
      expect(Number(platformEntry?.amount)).toBe(125000);
    });

    it("should calculate 85/15 split correctly for PARTNER psychologist", async () => {
      const session = await prisma.session.create({
        data: {
          clientId: mockClient.id,
          psychologistId: mockPartnerProfile.id,
          sessionType: "ONLINE",
          scheduledAt: new Date(),
          assignmentMethod: "SELF_SELECT",
          payment: {
            create: {
              amount: 435000, // 400000 + 35000 platform fee
              platformFee: 35000,
              totalAmount: 435000,
              status: "PENDING"
            }
          }
        },
        include: { payment: true }
      });

      // Mark payment SUCCESS
      await prisma.payment.update({
        where: { id: session.payment!.id },
        data: { status: "SUCCESS" }
      });

      const tx = await RevenueService.recordTransactionAndSplits(session.id);
      expect(tx.status).toBe("SUCCESS");

      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { transactionId: tx.id }
      });

      expect(ledgerEntries.length).toBe(2);

      const providerEntry = ledgerEntries.find(e => e.type === "PROVIDER_SPLIT");
      const platformEntry = ledgerEntries.find(e => e.type === "PLATFORM_SPLIT");

      // PARTNER: 85% of 400k = 340k provider
      // Platform: 15% of 400k (60k) + 35k platform fee = 95k platform
      expect(Number(providerEntry?.amount)).toBe(340000);
      expect(Number(platformEntry?.amount)).toBe(95000);
    });
  });

  describe("WU-003 & WU-008: Assessment Risk Scoring and Notifications", () => {
    let testClient: any;
    let testAdmin: any;

    beforeAll(async () => {
      testClient = await prisma.user.create({
        data: {
          email: "assessment-client@batin.test",
          passwordHash: "password",
          fullName: "Assessment Client",
          role: "CLIENT"
        }
      });
      testAdmin = await prisma.user.create({
        data: {
          email: "assessment-admin@batin.test",
          passwordHash: "password",
          fullName: "Assessment Admin",
          role: "ADMIN"
        }
      });
    });

    afterAll(async () => {
      await prisma.notification.deleteMany();
      await prisma.assessmentResponse.deleteMany();
      await prisma.user.deleteMany({
        where: { id: { in: [testClient.id, testAdmin.id] } }
      });
    });

    it("should score assessment and trigger admin notification if high-risk", async () => {
      const responses = {
        q1: 5,
        q2: 5,
        q3: 5 // Total = 15 (high risk threshold)
      };

      const result = await AssessmentService.submitAssessment(testClient.id, "Anxiety", responses);

      expect(result.score).toBe(15);
      expect(result.isHighRisk).toBe(true);

      // Check notification was sent to admin
      const notifications = await prisma.notification.findMany({
        where: { userId: testAdmin.id }
      });

      expect(notifications.length).toBeGreaterThan(0);
      const crisisAlert = notifications.find(n => n.type === "CRISIS_ALERT");
      expect(crisisAlert).toBeDefined();
      expect(crisisAlert?.message).toContain("Assessment Client");
    });
  });
});
