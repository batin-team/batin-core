type BookingConfirmationInput = {
  sessionId: string;
  meetUrl?: string;
};

export async function sendBookingConfirmation(input: BookingConfirmationInput) {
  return {
    provider: "EMAIL_MOCK",
    sent: true,
    template: "booking-confirmation",
    ...input
  };
}
