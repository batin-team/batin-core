export type ServiceMode = "ONLINE" | "OFFLINE" | "BOTH";

export type Psychologist = {
  id: string;
  name: string;
  title: string;
  gender: "FEMALE" | "MALE";
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  specializations: string[];
  serviceMode: ServiceMode;
  rating: number;
  pricePerSession: number;
  nextSlot: string;
  homeCity: string;
  homeLat: number;
  homeLng: number;
  availableSlots: string[];
};

export type SessionStatus = "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type Session = {
  id: string;
  clientName: string;
  psychologistId: string;
  sessionType: "ONLINE" | "OFFLINE";
  status: SessionStatus;
  scheduledAt: string;
  amount: number;
  meetUrl?: string;
  location?: string;
};

export const specializations = ["Kecemasan", "Depresi", "Trauma", "Karier", "Relasi", "Keluarga"];

export const psychologists: Psychologist[] = [
  {
    id: "psy-amanda",
    name: "Dr. Amanda Putri, M.Psi",
    title: "Psikolog Klinis Dewasa",
    gender: "FEMALE",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=80",
    bio: "Berpengalaman menangani kecemasan, burnout, dan transisi hidup dewasa muda dengan pendekatan CBT dan mindfulness.",
    experienceYears: 9,
    specializations: ["Kecemasan", "Depresi", "Karier"],
    serviceMode: "BOTH",
    rating: 4.9,
    pricePerSession: 350000,
    nextSlot: "Jumat, 09.00",
    homeCity: "Jakarta Selatan",
    homeLat: -6.2607,
    homeLng: 106.7816,
    availableSlots: ["2026-06-05T09:00", "2026-06-05T13:00", "2026-06-06T10:30", "2026-06-08T16:00"]
  },
  {
    id: "psy-raka",
    name: "Raka Adinata, M.Psi",
    title: "Konselor Keluarga",
    gender: "MALE",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=320&q=80",
    bio: "Fokus pada konseling relasi, keluarga, dan komunikasi pasangan dengan pendekatan sistemik.",
    experienceYears: 7,
    specializations: ["Relasi", "Keluarga", "Trauma"],
    serviceMode: "OFFLINE",
    rating: 4.8,
    pricePerSession: 325000,
    nextSlot: "Sabtu, 13.00",
    homeCity: "Tangerang",
    homeLat: -6.1783,
    homeLng: 106.6319,
    availableSlots: ["2026-06-05T13:00", "2026-06-06T13:00", "2026-06-07T09:00", "2026-06-08T10:30"]
  },
  {
    id: "psy-maya",
    name: "Maya Lestari, M.Psi",
    title: "Psikolog Anak & Remaja",
    gender: "FEMALE",
    avatarUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=320&q=80",
    bio: "Mendampingi remaja dan orang tua untuk isu emosi, akademik, dan adaptasi sosial.",
    experienceYears: 6,
    specializations: ["Kecemasan", "Keluarga", "Trauma"],
    serviceMode: "ONLINE",
    rating: 4.7,
    pricePerSession: 300000,
    nextSlot: "Senin, 16.00",
    homeCity: "Bandung",
    homeLat: -6.9175,
    homeLng: 107.6191,
    availableSlots: ["2026-06-05T16:00", "2026-06-06T09:00", "2026-06-08T16:00", "2026-06-09T13:00"]
  },
  {
    id: "psy-nadia",
    name: "Nadia Rahman, M.Psi",
    title: "Psikolog Klinis Remaja",
    gender: "FEMALE",
    avatarUrl: "https://images.unsplash.com/photo-1588622300477-208fba3c7f95?auto=format&fit=crop&w=320&q=80",
    bio: "Membantu isu trauma, kecemasan sosial, dan regulasi emosi remaja dengan pendekatan trauma-informed.",
    experienceYears: 8,
    specializations: ["Trauma", "Kecemasan", "Relasi"],
    serviceMode: "BOTH",
    rating: 4.85,
    pricePerSession: 340000,
    nextSlot: "Jumat, 10.30",
    homeCity: "Depok",
    homeLat: -6.4025,
    homeLng: 106.7942,
    availableSlots: ["2026-06-05T10:30", "2026-06-06T16:00", "2026-06-07T13:00", "2026-06-09T09:00"]
  },
  {
    id: "psy-bagus",
    name: "Bagus Wiratama, M.Psi",
    title: "Psikolog Industri & Karier",
    gender: "MALE",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=320&q=80",
    bio: "Fokus pada burnout, konflik kerja, career coaching, dan strategi pengambilan keputusan profesional.",
    experienceYears: 10,
    specializations: ["Karier", "Kecemasan", "Relasi"],
    serviceMode: "ONLINE",
    rating: 4.82,
    pricePerSession: 360000,
    nextSlot: "Sabtu, 09.00",
    homeCity: "Jakarta Pusat",
    homeLat: -6.1865,
    homeLng: 106.8341,
    availableSlots: ["2026-06-06T09:00", "2026-06-07T10:30", "2026-06-08T13:00"]
  },
  {
    id: "psy-citra",
    name: "Citra Wulandari, M.Psi",
    title: "Konselor Pernikahan",
    gender: "FEMALE",
    avatarUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=320&q=80",
    bio: "Mendampingi pasangan dan keluarga untuk komunikasi, konflik relasi, dan pemulihan kepercayaan.",
    experienceYears: 11,
    specializations: ["Relasi", "Keluarga", "Trauma"],
    serviceMode: "OFFLINE",
    rating: 4.88,
    pricePerSession: 375000,
    nextSlot: "Minggu, 13.00",
    homeCity: "Bekasi",
    homeLat: -6.2383,
    homeLng: 106.9756,
    availableSlots: ["2026-06-06T10:30", "2026-06-07T13:00", "2026-06-09T16:00"]
  }
];

export const sessions: Session[] = [
  {
    id: "ses-1001",
    clientName: "Nadia Prameswari",
    psychologistId: "psy-amanda",
    sessionType: "ONLINE",
    status: "CONFIRMED",
    scheduledAt: "2026-06-05T09:00:00+07:00",
    amount: 385000,
    meetUrl: "https://meet.google.com/mock-batin-1001"
  },
  {
    id: "ses-1002",
    clientName: "Bima Saputra",
    psychologistId: "psy-raka",
    sessionType: "OFFLINE",
    status: "PENDING_PAYMENT",
    scheduledAt: "2026-06-06T13:00:00+07:00",
    amount: 357500,
    location: "Klinik Batin, Jakarta Selatan"
  },
  {
    id: "ses-0998",
    clientName: "Sinta Maharani",
    psychologistId: "psy-maya",
    sessionType: "ONLINE",
    status: "COMPLETED",
    scheduledAt: "2026-05-29T16:00:00+07:00",
    amount: 330000,
    meetUrl: "https://meet.google.com/mock-batin-0998"
  }
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function findPsychologist(id: string) {
  return psychologists.find((psychologist) => psychologist.id === id);
}

export function toSlotKey(date: string, time: string) {
  return `${date}T${time}`;
}

function getJakartaDateTimeParts(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(value);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second")
  };
}

export function getTodayBookingDateStr(now = new Date()) {
  const { year, month, day } = getJakartaDateTimeParts(now);
  return `${year}-${month}-${day}`;
}

export function getSlotStartTime(time: string) {
  return time.split(" - ")[0]?.trim() || time.trim();
}

export function isPastBookingSlot(date: string, time: string, now = new Date()) {
  if (!date || !time) return false;

  const slotStartTime = getSlotStartTime(time);
  if (!/^\d{2}:\d{2}$/.test(slotStartTime)) return false;

  const slotStart = new Date(`${date}T${slotStartTime}:00+07:00`);
  const { year, month, day, hour, minute, second } = getJakartaDateTimeParts(now);
  const bookingNow = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`);

  return slotStart.getTime() <= bookingNow.getTime();
}

export function formatSlot(slotKey: string) {
  const [date, time] = slotKey.split("T");
  return `${new Date(`${date}T00:00:00+07:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })}, ${time} WIB`;
}

export function calculateDistanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(toLat - fromLat);
  const dLng = degreesToRadians(toLng - fromLng);
  const lat1 = degreesToRadians(fromLat);
  const lat2 = degreesToRadians(toLat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}
