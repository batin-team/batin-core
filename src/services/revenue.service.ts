import { prisma } from "../db";
import { Prisma } from "@prisma/client";

export class RevenueService {
  /**
   * Calculates the split based on membership type and settings,
   * then creates Transaction and LedgerEntry records atomically.
   */
  static async recordTransactionAndSplits(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        payment: true,
        psychologist: {
          include: { user: true }
        }
      }
    });

    if (!session || !session.payment) {
      throw new Error(`Session or payment not found for ID: ${sessionId}`);
    }

    const payment = session.payment;
    const totalAmount = payment.totalAmount;
    const platformFee = payment.platformFee;
    const basePrice = totalAmount - platformFee;

    // Fetch settings from database or use defaults
    const memberSplitSetting = await prisma.platformSetting.findUnique({
      where: { key: "member_split" }
    });
    const partnerCommissionSetting = await prisma.platformSetting.findUnique({
      where: { key: "partner_commission" }
    });

    const memberSplit = memberSplitSetting ? parseFloat(memberSplitSetting.value) : 0.70;
    const partnerCommission = partnerCommissionSetting ? parseFloat(partnerCommissionSetting.value) : 0.15;

    const membershipType = session.psychologist.membershipType || "MEMBER";

    let providerShare = 0;
    let platformShare = 0;

    if (membershipType === "PARTNER") {
      platformShare = basePrice * partnerCommission + platformFee;
      providerShare = basePrice * (1 - partnerCommission);
    } else {
      // MEMBER
      providerShare = basePrice * memberSplit;
      platformShare = basePrice * (1 - memberSplit) + platformFee;
    }

    // Atomically create Transaction and LedgerEntries
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          sessionId: session.id,
          amount: new Prisma.Decimal(totalAmount),
          status: "SUCCESS",
          provider: session.psychologist.user.fullName
        }
      });

      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: transaction.id,
            type: "PROVIDER_SPLIT",
            amount: new Prisma.Decimal(providerShare.toFixed(2))
          },
          {
            transactionId: transaction.id,
            type: "PLATFORM_SPLIT",
            amount: new Prisma.Decimal(platformShare.toFixed(2))
          }
        ]
      });

      return transaction;
    });
  }

  /**
   * WU-003: Analytics Expansion
   * Calculate monthly stats, including retention rates, new users, and returning users.
   */
  static async getMonthlyStats(year: number, month: number) {
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Get all completed/confirmed sessions in the target month
    const activeSessionsInMonth = await prisma.session.findMany({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        scheduledAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        clientId: true,
        scheduledAt: true
      }
    });

    const activeUserIdsInMonth = Array.from(new Set(activeSessionsInMonth.map(s => s.clientId)));

    let newUsersCount = 0;
    let returningUsersCount = 0;

    for (const clientId of activeUserIdsInMonth) {
      // Find the first confirmed/completed session ever for this user
      const firstSession = await prisma.session.findFirst({
        where: {
          clientId,
          status: { in: ["CONFIRMED", "COMPLETED"] }
        },
        orderBy: { scheduledAt: "asc" },
        select: { scheduledAt: true }
      });

      if (firstSession) {
        const isNewInMonth = firstSession.scheduledAt >= startOfMonth && firstSession.scheduledAt <= endOfMonth;
        if (isNewInMonth) {
          newUsersCount++;
        } else {
          returningUsersCount++;
        }
      }
    }

    const totalActiveUsers = activeUserIdsInMonth.length;
    const retentionRate = totalActiveUsers > 0 ? (returningUsersCount / totalActiveUsers) * 100 : 0;

    // Get total revenue for the month
    const revenueSum = await prisma.payment.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "SUCCESS",
        paidAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    return {
      month: `${year}-${String(month).padStart(2, "0")}`,
      revenue: revenueSum._sum.totalAmount ?? 0,
      sessionVolume: activeSessionsInMonth.length,
      totalActiveUsers,
      newUsersCount,
      returningUsersCount,
      retentionRate: parseFloat(retentionRate.toFixed(2))
    };
  }
}
