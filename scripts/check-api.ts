import { prisma } from "../src/db";
// no import needed for getTimeRangeForSession

async function main() {
  const profile = await prisma.psychologistProfile.findFirst({
    where: { id: "psy-amanda" },
    include: { user: true }
  });
  if (!profile) {
    console.error("Profile not found");
    return;
  }

  const [list, slots] = await Promise.all([
    prisma.session.findMany({
      where: { psychologistId: profile.id },
      include: {
        client: true,
        payment: true,
        notes: true,
        attendance: true,
        assessment: true
      },
      orderBy: { scheduledAt: "desc" }
    }),
    prisma.availabilitySlot.findMany({
      where: { psychologistId: profile.id }
    })
  ]);

  const listWithAssessment = await Promise.all(
    list.map(async (s) => {
      let assessment = s.assessment;
      if (!assessment) {
        assessment = await prisma.assessmentResponse.findFirst({
          where: { clientId: s.clientId },
          orderBy: { createdAt: "desc" }
        });
      }
      return { ...s, assessment };
    })
  );

  const formatted = listWithAssessment.map((s) => ({
    id: s.id,
    clientName: s.client.fullName,
    sessionType: s.sessionType,
    status: s.status,
    scheduledAt: s.scheduledAt.toISOString(),
    amount: s.payment?.totalAmount ?? 0,
    location: s.meetingLocation || undefined,
    meetUrl: s.googleMeetUrl || undefined,
    clientIssues: s.clientIssues,
    clientNotes: s.clientNotes || undefined,
    hasNotes: !!s.notes,
    hasAttendance: !!s.attendance,
    createdAt: s.createdAt.toISOString(),
    assessment: s.assessment ? {
      id: s.assessment.id,
      score: s.assessment.score,
      summary: s.assessment.summary,
      isHighRisk: s.assessment.isHighRisk,
      responses: s.assessment.responses
    } : undefined
  }));

  console.log("Formatted sessions response:", JSON.stringify(formatted, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
