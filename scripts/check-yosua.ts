import { prisma } from "../src/db";

async function main() {
  console.log("--- Querying Users named 'Yosua Satrio' ---");
  const users = await prisma.user.findMany({
    where: {
      fullName: {
        contains: "Yosua",
        mode: "insensitive"
      }
    }
  });
  console.log("Users found:", JSON.stringify(users, null, 2));

  for (const user of users) {
    console.log(`\n--- Sessions for user ${user.fullName} (${user.id}) ---`);
    const sessions = await prisma.session.findMany({
      where: { clientId: user.id },
      include: {
        assessment: true
      }
    });
    console.log("Sessions:", JSON.stringify(sessions, null, 2));

    console.log(`\n--- AssessmentResponses for user ${user.fullName} (${user.id}) ---`);
    const assessments = await prisma.assessmentResponse.findMany({
      where: { clientId: user.id }
    });
    console.log("Assessment Responses:", JSON.stringify(assessments, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
