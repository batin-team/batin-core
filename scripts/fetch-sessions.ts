import { prisma } from "../src/db";

async function main() {
  const profile = await prisma.psychologistProfile.findFirst({
    where: { id: "psy-amanda" },
    include: { user: true }
  });
  if (!profile) {
    console.error("Profile not found");
    return;
  }

  const userId = profile.userId;
  console.log(`Psychologist userId is ${userId}`);

  console.log("Fetching from http://localhost:6969/api/psychologist/sessions...");
  try {
    const res = await fetch("http://localhost:6969/api/psychologist/sessions", {
      headers: {
        "x-user-id": userId
      }
    });
    const json = await res.json();
    console.log("API Response:", JSON.stringify(json, null, 2));
  } catch (e: any) {
    console.error("Fetch failed:", e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
