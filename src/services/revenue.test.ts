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

  describe("WU-002: Commission, Wallet Crediting & Ledgering (on completion)", () => {
    let mockClient: any;
    let mockMemberProfile: any;
    let mockPartnerProfile: any;

    beforeAll(async () => {
      // Single global commission rate of 20% drives all earnings now.
      await prisma.platformSetting.upsert({
        where: { key: "commission_rate" },
        update: { value: "0.20" },
        create: { key: "commission_rate", value: "0.20" }
      });

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
      await prisma.walletEntry.deleteMany();
      await prisma.withdrawal.deleteMany();
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

    it("applies the global commission, credits the wallet, and records the ledger on completion", async () => {
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
              status: "SUCCESS"
            }
          }
        },
        include: { payment: true }
      });

      const tx = await RevenueService.recordEarningOnCompletion(session.id);
      expect(tx.status).toBe("SUCCESS");

      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { transactionId: tx.id }
      });
      expect(ledgerEntries.length).toBe(2);

      const providerEntry = ledgerEntries.find(e => e.type === "PROVIDER_SPLIT");
      const platformEntry = ledgerEntries.find(e => e.type === "PLATFORM_SPLIT");

      // base 300k, 20% commission: provider 240k, platform 60k + 35k fee = 95k
      expect(Number(providerEntry?.amount)).toBe(240000);
      expect(Number(platformEntry?.amount)).toBe(95000);

      // Wallet credited with the provider share
      const balance = await RevenueService.getWalletBalance(mockMemberProfile.id);
      expect(balance).toBe(240000);
    });

    it("is idempotent — calling completion twice does not double-credit", async () => {
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
              status: "SUCCESS"
            }
          }
        },
        include: { payment: true }
      });

      await RevenueService.recordEarningOnCompletion(session.id);
      await RevenueService.recordEarningOnCompletion(session.id); // second call must be a no-op

      const transactions = await prisma.transaction.findMany({ where: { sessionId: session.id } });
      expect(transactions.length).toBe(1);

      // base 400k, 20% commission -> provider 320k credited exactly once
      const balance = await RevenueService.getWalletBalance(mockPartnerProfile.id);
      expect(balance).toBe(320000);
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
