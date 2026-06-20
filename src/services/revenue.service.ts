import { prisma } from "../db";
import { Prisma } from "@prisma/client";

// Default global commission rate (platform's cut) if the setting is missing.
const DEFAULT_COMMISSION_RATE = 0.20;

export class RevenueService {
  /** Reads a numeric platform setting, falling back to `fallback` when absent/invalid. */
  static async getNumericSetting(key: string, fallback: number): Promise<number> {
    const setting = await prisma.platformSetting.findUnique({ where: { key } });
    if (!setting) return fallback;
    const parsed = parseFloat(setting.value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  /**
   * Records commission + provider earning when a session is COMPLETED.
   *
   * The platform keeps a single global commission rate (configurable in admin)
   * of the base price; the remainder is credited to the psychologist's wallet.
   * The platform also keeps the fixed platform fee in full.
   *
   * Idempotent: if a Transaction already exists for this session, it does nothing,
   * so it is safe to call from every completion check.
   */
  static async recordEarningOnCompletion(sessionId: string) {
    const existing = await prisma.transaction.findFirst({ where: { sessionId } });
    if (existing) return existing; // already recorded — avoid double crediting

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        payment: true,
        psychologist: { include: { user: true } }
      }
    });

    if (!session || !session.payment) {
      throw new Error(`Session or payment not found for ID: ${sessionId}`);
    }

    const payment = session.payment;
    const totalAmount = payment.totalAmount;
    const platformFee = payment.platformFee;
    const basePrice = totalAmount - platformFee;

    const commissionRate = await RevenueService.getNumericSetting("commission_rate", DEFAULT_COMMISSION_RATE);

    const commission = basePrice * commissionRate;
    const providerShare = basePrice - commission;
    const platformShare = commission + platformFee;

    // Atomically: ledger record (reporting) + wallet credit (psychologist balance)
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

      await tx.walletEntry.create({
        data: {
          psychologistId: session.psychologistId,
          type: "EARNING",
          amount: new Prisma.Decimal(providerShare.toFixed(2)),
          sessionId: session.id,
          description: `Komisi sesi selesai (${(commissionRate * 100).toFixed(0)}% komisi platform)`
        }
      });

      return transaction;
    });
  }

  /** Current wallet balance for a psychologist = sum of all wallet entry amounts. */
  static async getWalletBalance(psychologistId: string): Promise<number> {
    const agg = await prisma.walletEntry.aggregate({
      where: { psychologistId },
      _sum: { amount: true }
    });
    return Number(agg._sum.amount ?? 0);
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
