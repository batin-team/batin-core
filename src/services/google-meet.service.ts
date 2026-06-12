type MeetInput = {
  sessionId?: string;
  clientEmail?: string;
  psychologistEmail?: string;
  scheduledAt?: string;
};

export async function createMeetLink(input: MeetInput) {
  const sessionId = input.sessionId ?? "ses-1001";

  return {
    meetUrl: `https://meet.google.com/mock-${sessionId}`,
    eventId: `gcal-${sessionId}`,
    provider: "GOOGLE_CALENDAR_MOCK"
  };
}
