import { psychologists, type Psychologist } from "../shared";

type MatchingInput = {
  specialization_ids?: string[];
  specializations?: string[];
  preferred_gender?: "FEMALE" | "MALE";
  scheduled_at?: string;
  meeting_lat?: number;
  meeting_lng?: number;
};

export function matchPsychologist(
  input: MatchingInput,
  mode: "ONLINE" | "OFFLINE",
  psychologistsList?: Psychologist[]
): Psychologist & { assignmentScore: number; travelMinutes?: number } {
  const requested = input.specializations ?? input.specialization_ids ?? [];
  const list = psychologistsList ?? psychologists;

  let filteredList = list;
  if (input.scheduled_at) {
    try {
      const scheduledDate = new Date(input.scheduled_at);
      const wibTime = new Date(scheduledDate.getTime() + 7 * 60 * 60 * 1000);
      const dateStr = wibTime.toISOString().split("T")[0];
      const timeStr = wibTime.toISOString().split("T")[1].substring(0, 5);
      const slotKey = `${dateStr}T${timeStr}`;
      filteredList = list.filter((p) => p.availableSlots.includes(slotKey));
    } catch (e) {
      console.error("Error matching availability slot:", e);
    }
  }

  const candidates = filteredList
    .filter((psychologist) => psychologist.serviceMode === "BOTH" || psychologist.serviceMode === mode)
    .filter((psychologist) => !input.preferred_gender || psychologist.gender === input.preferred_gender)
    .filter((psychologist) => requested.length === 0 || requested.some((item) => psychologist.specializations.includes(item)))
    .map((psychologist, index) => ({
      ...psychologist,
      travelMinutes: mode === "OFFLINE" ? 24 + index * 16 : undefined,
      assignmentScore: psychologist.rating * 10 - index
    }))
    .filter((psychologist) => mode === "ONLINE" || (psychologist.travelMinutes ?? 999) <= 60);

  const sorted = candidates.sort((a, b) => {
    if (mode === "OFFLINE") {
      return (a.travelMinutes ?? 999) - (b.travelMinutes ?? 999) || b.rating - a.rating;
    }

    return b.assignmentScore - a.assignmentScore;
  });

  const defaultPsy = list[0] || psychologists[0];
  return sorted[0] ?? { ...defaultPsy, assignmentScore: defaultPsy.rating * 10 };
}
