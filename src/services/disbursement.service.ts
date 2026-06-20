// Disbursement (payout) gateway integration.
//
// DUMMY IMPLEMENTATION: there is no real payment gateway yet. This service
// simulates a disbursement provider (e.g. Midtrans Iris / Xendit) so the full
// withdrawal flow can be exercised end-to-end. The dummy provider auto-confirms
// the transfer as successful and returns a fake reference.
//
// To go live, replace `createDisbursement` with a real API call and have the
// provider call POST /api/disbursements/webhook with the final status.

type DisbursementRequest = {
  withdrawalId: string;
  amount: number; // net amount to transfer to the bank account
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
};

export type DisbursementResult = {
  reference: string; // gateway reference id
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  failureReason?: string;
};

const USE_REAL_GATEWAY = process.env.DISBURSEMENT_GATEWAY === "real";

export async function createDisbursement(req: DisbursementRequest): Promise<DisbursementResult> {
  if (USE_REAL_GATEWAY) {
    // TODO: integrate real disbursement provider here. Should return PROCESSING
    // and let the webhook confirm COMPLETED/FAILED asynchronously.
    throw new Error("Real disbursement gateway is not configured yet.");
  }

  // Dummy provider: pretend the bank transfer succeeded instantly.
  return {
    reference: `DUMMY-DISB-${req.withdrawalId}`,
    status: "COMPLETED"
  };
}

type DisbursementWebhookPayload = {
  reference?: string;
  withdrawalId?: string;
  status?: string; // "COMPLETED" | "FAILED"
  failureReason?: string;
};

/** Normalizes an incoming (dummy) gateway webhook into a known result shape. */
export function parseDisbursementWebhook(payload: DisbursementWebhookPayload): {
  withdrawalId?: string;
  status: "COMPLETED" | "FAILED";
  failureReason?: string;
} {
  const status = payload.status === "FAILED" ? "FAILED" : "COMPLETED";
  return {
    withdrawalId: payload.withdrawalId,
    status,
    failureReason: payload.failureReason
  };
}
