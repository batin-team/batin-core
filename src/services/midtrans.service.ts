type SnapRequest = {
  orderId: string;
  amount: number;
};

type MidtransPayload = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  signature_key?: string;
};

export async function createSnapToken(request: SnapRequest) {
  return {
    orderId: request.orderId,
    amount: request.amount,
    snapToken: `mock-snap-token-${request.orderId}`,
    redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${request.orderId}`
  };
}

export function verifyMidtransWebhook(payload: MidtransPayload) {
  const isSuccess = payload.transaction_status === "settlement" || payload.transaction_status === "capture";

  return {
    orderId: payload.order_id,
    status: isSuccess ? "SUCCESS" : "PENDING",
    verified: Boolean(payload.signature_key) || process.env.NODE_ENV !== "production"
  };
}
