import { serve } from "@hono/node-server";
import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { formatSlot, type Psychologist } from "./shared";
import { prisma } from "./db";
import { createMeetLink } from "./services/google-meet.service";
import { matchPsychologist } from "./services/matching.service";
import { createSnapToken, verifyMidtransWebhook } from "./services/midtrans.service";
import { generateCounselingNotesPdf, generateReceiptPdf } from "./services/pdf.service";
import { sendBookingConfirmation } from "./services/notification.service";
import { logAudit } from "./middleware/audit";
import { RevenueService } from "./services/revenue.service";
import { AssessmentService } from "./services/assessment.service";
import { createDisbursement, parseDisbursementWebhook } from "./services/disbursement.service";
import { Prisma } from "@prisma/client";

export const app = new Hono();
export default app;

app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
  })
);

async function readObjectBody(c: Context): Promise<Record<string, unknown>> {
  const body = await c.req.json().catch(() => ({}));
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
}

function toLocalDateString(d: Date) {
  const localDate = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

function getTimeRangeForSession(scheduledAt: Date, psychologistId: string, slots: any[]): string {
  const localDateTime = new Date(scheduledAt.getTime() + 7 * 60 * 60 * 1000);
  const dateStr = localDateTime.toISOString().split("T")[0];
  const timeStr = localDateTime.toISOString().split("T")[1].substring(0, 5);
  const dayVal = localDateTime.getUTCDay();
  const mappedDay = dayVal === 0 ? 7 : dayVal;

  const specific = slots.find(s => 
    s.psychologistId === psychologistId && 
    s.specificDate && 
    toLocalDateString(new Date(s.specificDate)) === dateStr &&
    s.startTime === timeStr &&
    !s.isBlocked
  );
  if (specific) return `${specific.startTime} - ${specific.endTime}`;

  const recurring = slots.find(s => 
    s.psychologistId === psychologistId && 
    !s.specificDate && 
    s.dayOfWeek === mappedDay &&
    s.startTime === timeStr
  );
  if (recurring) return `${recurring.startTime} - ${recurring.endTime}`;

  if (timeStr === "08:00") return "08:00 - 09:00";
  if (timeStr === "10:00") return "10:00 - 11:00";
  if (timeStr === "13:00") return "13:00 - 14:00";
  if (timeStr === "14:30") return "14:30 - 15:30";
  if (timeStr === "16:00") return "16:00 - 17:00";

  return `${timeStr} - ${timeStr}`;
}


// Helper to format DB psychologist profiles into the format required by the client & matching engine
async function getDbPsychologists(): Promise<Psychologist[]> {
  const list = await prisma.psychologistProfile.findMany({
    include: {
      user: true,
      specializations: {
        include: {
          specialization: true
        }
      },
      availabilitySlots: true,
      sessions: true
    }
  });

  return list.map((profile) => {
    // 1. Gather blocked dates and specific custom slots
    const blockedDates = new Set<string>(); // "YYYY-MM-DD"
    const specificSlots = new Set<string>();

    profile.availabilitySlots.forEach((s) => {
      if (s.isBlocked && s.specificDate) {
        if (s.isApproved) {
          blockedDates.add(toLocalDateString(s.specificDate));
        }
      } else if (!s.isBlocked && s.specificDate) {
        const dateStr = toLocalDateString(s.specificDate);
        const timeRange = `${s.startTime} - ${s.endTime}`;
        specificSlots.add(`${dateStr}T${timeRange}`);
      }
    });

    // 2. Gather recurring weekly template slots
    const recurringSlots = profile.availabilitySlots.filter((s) => !s.specificDate && s.dayOfWeek);

    // 3. Generate slots for the next 14 days based on weekly template
    const generatedSlots = new Set<string>();
    const today = new Date();

    // Add specific custom slots first
    specificSlots.forEach((s) => generatedSlots.add(s));

    for (let i = 0; i < 14; i++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + i);
      const wibDate = new Date(targetDate.getTime() + 7 * 60 * 60 * 1000);
      const dayVal = wibDate.getUTCDay(); // Get day of the week in WIB (UTC+7)
      const mappedDay = dayVal === 0 ? 7 : dayVal; // Convert Sunday to 7

      recurringSlots.forEach((slot) => {
        if (slot.dayOfWeek === mappedDay) {
          const dateStr = toLocalDateString(targetDate);
          const timeRange = `${slot.startTime} - ${slot.endTime}`;
          const slotKey = `${dateStr}T${timeRange}`;
          if (!blockedDates.has(dateStr)) {
            generatedSlots.add(slotKey);
          }
        }
      });
    }

    // 4. Exclude already booked sessions
    const bookedSlots = new Set(
      profile.sessions
        .filter((s) => s.status !== "CANCELLED")
        .map((s) => {
          const localDateTime = new Date(s.scheduledAt.getTime() + 7 * 60 * 60 * 1000);
          const dateStr = localDateTime.toISOString().split("T")[0];
          const timeStr = localDateTime.toISOString().split("T")[1].substring(0, 5);

          const dayVal = localDateTime.getUTCDay();
          const mappedDay = dayVal === 0 ? 7 : dayVal;
          const slotForDay = profile.availabilitySlots.find((slot) => 
            slot.dayOfWeek === mappedDay && 
            !slot.specificDate && 
            slot.startTime === timeStr
          );
          const timeRange = slotForDay ? `${slotForDay.startTime} - ${slotForDay.endTime}` : `${timeStr} - ${timeStr}`;
          return `${dateStr}T${timeRange}`;
        })
    );

    const slots = Array.from(generatedSlots)
      .filter((slot) => !bookedSlots.has(slot))
      .sort();

    return {
      id: profile.id,
      name: profile.user.fullName,
      title: profile.bio.split(".")[0] || "Psikolog Klinis",
      gender: profile.gender === "MALE" ? "MALE" : "FEMALE",
      avatarUrl: profile.user.avatarUrl || "",
      bio: profile.bio,
      experienceYears: profile.experienceYears,
      specializations: profile.specializations.map((ps) => ps.specialization.name),
      serviceMode: profile.serviceMode,
      rating: Number(profile.averageRating),
      pricePerSession: profile.pricePerSession,
      nextSlot: slots[0] ? formatSlot(slots[0]) : "Hubungi Admin",
      homeCity: profile.homeAddress || "",
      homeLat: Number(profile.homeLat),
      homeLng: Number(profile.homeLng),
      availableSlots: slots
    };
  });
}

app.get("/health", (c) => c.json({ status: "ok", service: "mindbridge-api-postgres" }));

app.post("/api/auth/register", async (c) => {
  const body = await readObjectBody(c);
  const email = String(body.email || "");
  const fullName = String(body.fullName || "");
  const phone = String(body.phone || "");
  const password = String(body.password || "");
  const role = body.role === "PSYCHOLOGIST" ? "PSYCHOLOGIST" : "CLIENT";

  if (!email || !fullName || !password) {
    return c.json({ error: "Email, nama lengkap, dan password wajib diisi" }, 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json({ error: "Email sudah terdaftar" }, 400);
  }

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      phone,
      role,
      passwordHash: password
    }
  });

  await logAudit({
    userId: user.id,
    action: "USER_REGISTER",
    entityId: user.id,
    metadata: { email, fullName, phone, role }
  }).catch((err) => console.error("Audit log error:", err));

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined
    }
  }, 201);
});

app.post("/api/auth/login", async (c) => {
  const body = await readObjectBody(c);
  const email = String(body.email || "");
  const password = String(body.password || "");

  const user = await prisma.user.findUnique({ where: { email } });
  const isSeedData = user?.passwordHash === "password" && password === "password";

  if (!user || (user.passwordHash !== password && !isSeedData)) {
    return c.json({ error: "Email atau password salah" }, 401);
  }

  if (user.isActive === false) {
    return c.json({ error: "Akun Anda dinonaktifkan. Silakan hubungi admin." }, 403);
  }

  await logAudit({
    userId: user.id,
    action: "USER_LOGIN",
    entityId: user.id,
    metadata: { email }
  }).catch((err) => console.error("Audit log error:", err));

  return c.json({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined
    }
  });
});

app.get("/api/auth/me", async (c) => {
  const userId = c.req.header("x-user-id");
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      return c.json({ id: user.id, email: user.email, role: user.role, fullName: user.fullName, phone: user.phone || undefined, avatarUrl: user.avatarUrl || undefined });
    }
  }
  const firstClient = await prisma.user.findFirst({ where: { role: "CLIENT" } });
  return c.json(
    firstClient
      ? { id: firstClient.id, email: firstClient.email, role: firstClient.role, fullName: firstClient.fullName, phone: firstClient.phone || undefined, avatarUrl: undefined }
      : { id: "usr-client", email: "client@batin.test", role: "CLIENT", fullName: "Client Batin", phone: "08111222333", avatarUrl: undefined }
  );
});

app.post("/api/auth/logout", async (c) => {
  const userId = c.req.header("x-user-id") || null;
  await logAudit({
    userId,
    action: "USER_LOGOUT",
    entityId: userId,
    metadata: { userId }
  }).catch((err) => console.error("Audit log error:", err));
  return c.json({ ok: true });
});

app.get("/api/specializations", async (c) => {
  const list = await prisma.specialization.findMany();
  return c.json({ data: list.map((s) => s.name) });
});

app.get("/api/psychologists", async (c) => {
  const formatted = await getDbPsychologists();
  return c.json({ data: formatted, pagination: { page: 1, limit: 12, total: formatted.length } });
});

app.get("/api/psychologists/:id", async (c) => {
  const id = c.req.param("id");
  const profile = await prisma.psychologistProfile.findUnique({
    where: { id },
    include: {
      user: true,
      sessions: {
        include: {
          client: true,
          review: true
        }
      }
    }
  });

  if (!profile) return c.notFound();

  const formatted = await getDbPsychologists();
  const matched = formatted.find((p) => p.id === id);
  if (!matched) return c.notFound();

  // Gather real reviews from sessions
  const realReviews = profile.sessions
    .filter((s) => s.review)
    .map((s) => ({
      id: s.review!.id,
      rating: s.review!.rating,
      comment: s.review!.comment || "Tidak ada komentar.",
      clientName: s.client.fullName,
      createdAt: s.review!.createdAt.toISOString()
    }));

  const dummyReviews = [
    {
      id: "dummy-rev-1",
      rating: 5,
      comment: "Sangat membantu memahami hal-hal yang membebani dan banyak dapet framework, exercise, dan resource.",
      clientName: "Nadia P.",
      createdAt: new Date().toISOString()
    },
    {
      id: "dummy-rev-2",
      rating: 5,
      comment: "Terima kasih kak sudah mendengarkanku, memahami ceritaku, memberikan tips buat regulasi emosi.",
      clientName: "Sinta M.",
      createdAt: new Date().toISOString()
    }
  ];

  return c.json({
    data: {
      ...matched,
      gender: profile.gender,
      homeAddress: profile.homeAddress,
      licenseNumber: profile.licenseNumber,
      reviews: realReviews.length > 0 ? realReviews : dummyReviews
    }
  });
});

app.get("/api/psychologists/:id/slots", async (c) => {
  const id = c.req.param("id");
  const slots = await prisma.availabilitySlot.findMany({
    where: { psychologistId: id, isBlocked: false }
  });
  return c.json({
    data: slots.map((s) => ({
      id: s.id,
      psychologistId: s.psychologistId,
      dayOfWeek: s.dayOfWeek || 5,
      startTime: s.startTime,
      endTime: s.endTime,
      isRecurring: s.isRecurring,
      specificDate: s.specificDate ? s.specificDate.toISOString() : null
    }))
  });
});

app.post("/api/matching/online", async (c) => {
  const body = await c.req.json();
  const list = await getDbPsychologists();
  return c.json({ data: matchPsychologist(body, "ONLINE", list) });
});

app.post("/api/matching/offline", async (c) => {
  const body = await c.req.json();
  const list = await getDbPsychologists();
  return c.json({ data: matchPsychologist(body, "OFFLINE", list) });
});

app.post("/api/sessions", async (c) => {
  const body = await readObjectBody(c);
  const sessionType = body.sessionType === "OFFLINE" ? "OFFLINE" : "ONLINE";
  const clientId = String(body.clientId || c.req.header("x-user-id") || "");

  if (!clientId) {
    return c.json({ error: "clientId wajib disertakan" }, 400);
  }

  const clientExists = await prisma.user.findUnique({ where: { id: clientId } });
  if (!clientExists) {
    return c.json({ error: "Sesi login tidak valid. Silakan logout dan login kembali." }, 401);
  }

  const psychologistsList = await getDbPsychologists();
  const requestedPsychologistId = String(body.psychologistId || "");
  const matched = psychologistsList.find(p => p.id === requestedPsychologistId) || matchPsychologist(body, sessionType, psychologistsList);
  const scheduledAt = new Date(String(body.scheduledAt || new Date().toISOString()));

  const assessmentId = body.assessmentId ? String(body.assessmentId) : null;

  const session = await prisma.session.create({
    data: {
      clientId,
      psychologistId: matched.id,
      sessionType,
      status: "PENDING_PAYMENT",
      scheduledAt,
      assignmentMethod: body.assignmentMethod === "SELF_SELECT" ? "SELF_SELECT" : "AUTO_ASSIGN",
      meetingLocation: body.location ? String(body.location) : null,
      meetingLat: typeof body.meetingLat === "number" ? body.meetingLat : null,
      meetingLng: typeof body.meetingLng === "number" ? body.meetingLng : null,
      clientIssues: Array.isArray(body.selectedSpecializations) ? (body.selectedSpecializations as string[]) : [],
      clientNotes: body.notes ? String(body.notes) : null,
      assessmentId,
      payment: {
        create: {
          amount: matched.pricePerSession + 35000,
          platformFee: 35000,
          totalAmount: matched.pricePerSession + 35000,
          status: "PENDING",
          midtransOrderId: `MB-ORDER-${Date.now()}`
        }
      }
    },
    include: {
      payment: true
    }
  });

  await logAudit({
    userId: clientId,
    action: "CREATE_BOOKING",
    entityId: session.id,
    metadata: {
      psychologistId: matched.id,
      sessionType,
      scheduledAt: scheduledAt.toISOString(),
      assignmentMethod: session.assignmentMethod,
      amount: matched.pricePerSession + 35000
    }
  }).catch((err) => console.error("Audit log error:", err));

  return c.json({
    data: {
      id: session.id,
      status: session.status,
      psychologist: matched,
      payment: {
        orderId: (session as any).payment?.midtransOrderId,
        amount: (session as any).payment?.totalAmount,
        snapToken: `mock-snap-token-${session.id}`,
        redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${session.id}`
      }
    }
  }, 201);
});

app.get("/api/sessions", async (c) => {
  const list = await prisma.session.findMany({
    include: {
      client: true,
      psychologist: { include: { user: true } },
      payment: true
    },
    orderBy: { createdAt: "desc" }
  });

  const formatted = list.map((s) => ({
    id: s.id,
    clientName: s.client.fullName,
    psychologistId: s.psychologistId,
    psychologistName: s.psychologist.user.fullName,
    psychologistTitle: s.psychologist.bio.split(".")[0],
    sessionType: s.sessionType,
    status: s.status,
    scheduledAt: s.scheduledAt.toISOString(),
    amount: s.payment?.totalAmount ?? 0,
    meetUrl: s.googleMeetUrl || undefined,
    location: s.meetingLocation || undefined
  }));

  return c.json({ data: formatted });
});

app.get("/api/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const s = await prisma.session.findUnique({
    where: { id },
    include: {
      client: true,
      psychologist: { include: { user: true } },
      payment: true
    }
  });

  if (!s) return c.notFound();

  const slots = await prisma.availabilitySlot.findMany({
    where: { psychologistId: s.psychologistId }
  });

  return c.json({
    data: {
      id: s.id,
      clientName: s.client.fullName,
      psychologistId: s.psychologistId,
      psychologistName: s.psychologist.user.fullName,
      psychologistTitle: s.psychologist.bio.split(".")[0],
      sessionType: s.sessionType,
      status: s.status,
      scheduledAt: s.scheduledAt.toISOString(),
      amount: s.payment?.totalAmount ?? 0,
      meetUrl: s.googleMeetUrl || undefined,
      location: s.meetingLocation || undefined,
      timeRange: getTimeRangeForSession(s.scheduledAt, s.psychologistId, slots)
    }
  });
});

app.patch("/api/sessions/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const updated = await prisma.session.update({
    where: { id },
    data: { status: "CANCELLED" }
  });
  return c.json({ data: { id: updated.id, status: updated.status } });
});

app.post("/api/payments/initiate", async (c) => {
  const body = await readObjectBody(c);
  return c.json({
    data: await createSnapToken({
      amount: typeof body.amount === "number" ? body.amount : 385000,
      orderId: typeof body.orderId === "string" ? body.orderId : `MB-ORDER-${Date.now()}`
    })
  });
});

app.post("/api/payments/webhook", async (c) => {
  const payload = await c.req.json();
  const result = verifyMidtransWebhook(payload);

  if (result.status === "SUCCESS") {
    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { midtransOrderId: payload.order_id || "" },
      include: { session: true }
    });

    if (payment) {
      const meet = await createMeetLink({ sessionId: payment.sessionId });

      const txs = [
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
            paymentMethod: payload.payment_type || "credit_card",
            midtransTransactionId: payload.transaction_id || null
          }
        }),
        prisma.session.update({
          where: { id: payment.sessionId },
          data: {
            status: "CONFIRMED",
            googleMeetUrl: meet.meetUrl
          }
        })
      ];

      if (payment.voucherCode) {
        txs.push(
          prisma.voucher.update({
            where: { code: payment.voucherCode },
            data: { usedCount: { increment: 1 } }
          }) as any
        );
      }

      await prisma.$transaction(txs);

      // NOTE: Commission/earning is NOT recorded here. It is recorded only when
      // the session is COMPLETED (attendance + notes present) — see
      // checkAndUpdateSessionCompletion -> RevenueService.recordEarningOnCompletion.

      // Audit log
      await logAudit({
        userId: payment.session.clientId,
        action: "PAYMENT_SUCCESS",
        entityId: payment.id,
        metadata: { orderId: payload.order_id, amount: payment.totalAmount }
      }).catch((err) => console.error("Audit log error:", err));

      await sendBookingConfirmation({ sessionId: payment.sessionId, meetUrl: meet.meetUrl });
      return c.json({ payment: result, meet, sessionStatus: "CONFIRMED" });
    }
  }

  return c.json({ payment: result });
});

app.get("/api/payments/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const payment = await prisma.payment.findUnique({
    where: { sessionId }
  });

  return c.json({
    data: {
      sessionId,
      status: payment?.status || "PENDING",
      totalAmount: payment?.totalAmount || 385000,
      voucherCode: payment?.voucherCode || null,
      discountAmount: payment?.discountAmount || 0
    }
  });
});

app.post("/api/payments/:sessionId/apply-voucher", async (c) => {
  const sessionId = c.req.param("sessionId");
  const body = await readObjectBody(c);
  const code = String(body.code || "").trim().toUpperCase();

  if (!code) {
    return c.json({ error: "Kode voucher wajib diisi" }, 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { sessionId },
    include: { session: true }
  });

  if (!payment) {
    return c.json({ error: "Data pembayaran tidak ditemukan" }, 404);
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code }
  });

  if (!voucher) {
    return c.json({ error: "Kode voucher tidak valid" }, 400);
  }

  if (!voucher.isActive) {
    return c.json({ error: "Voucher ini sudah tidak aktif" }, 400);
  }

  if (voucher.quota > 0 && voucher.usedCount >= voucher.quota) {
    return c.json({ error: "Kuota voucher ini sudah habis" }, 400);
  }

  const now = new Date();
  if (voucher.validFrom && now < voucher.validFrom) {
    return c.json({ error: "Voucher ini belum mulai berlaku" }, 400);
  }
  if (voucher.validUntil && now > voucher.validUntil) {
    return c.json({ error: "Voucher ini sudah kadaluarsa" }, 400);
  }

  if (voucher.packages && voucher.packages.length > 0) {
    const sessionType = payment.session.sessionType;
    if (!voucher.packages.includes(sessionType)) {
      return c.json({ error: `Voucher ini hanya berlaku untuk sesi ${voucher.packages.join(", ")}` }, 400);
    }
  }

  const sessionPrice = payment.amount - payment.platformFee;
  if (voucher.minOrderAmount && sessionPrice < voucher.minOrderAmount) {
    return c.json({ error: `Minimal transaksi untuk voucher ini adalah Rp ${voucher.minOrderAmount.toLocaleString("id-ID")}` }, 400);
  }

  let discount = 0;
  if (voucher.discountType === "PERCENTAGE") {
    discount = Math.round((sessionPrice * voucher.discountValue) / 100);
    if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
      discount = voucher.maxDiscountAmount;
    }
  } else {
    discount = voucher.discountValue;
  }

  if (discount > sessionPrice) {
    discount = sessionPrice;
  }

  const newTotalAmount = payment.amount - discount;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      voucherCode: voucher.code,
      discountAmount: discount,
      totalAmount: newTotalAmount
    }
  });

  return c.json({
    success: true,
    voucher: {
      code: voucher.code,
      name: voucher.name,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount: discount
    },
    newTotalAmount
  });
});

app.post("/api/payments/:sessionId/cancel-voucher", async (c) => {
  const sessionId = c.req.param("sessionId");
  const payment = await prisma.payment.findUnique({
    where: { sessionId }
  });

  if (!payment) {
    return c.json({ error: "Data pembayaran tidak ditemukan" }, 404);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      voucherCode: null,
      discountAmount: 0,
      totalAmount: payment.amount
    }
  });

  return c.json({
    success: true,
    newTotalAmount: payment.amount
  });
});

app.get("/api/payments/:sessionId/receipt", (c) => c.json({ data: generateReceiptPdf(c.req.param("sessionId")) }));

app.post("/api/google-meet/create", async (c) => c.json({ data: await createMeetLink(await c.req.json()) }));

app.get("/api/sessions/:id/attendance", async (c) => {
  const id = c.req.param("id");
  const attendance = await prisma.sessionAttendance.findUnique({
    where: { sessionId: id }
  });
  return c.json({
    data: {
      sessionId: id,
      clientAttended: attendance?.clientAttended ?? true,
      notes: attendance?.notes || "",
      actualStartTime: attendance?.actualStartTime ? attendance.actualStartTime.toISOString() : "",
      actualEndTime: attendance?.actualEndTime ? attendance.actualEndTime.toISOString() : "",
      evidencePhotoUrl: attendance?.evidencePhotoUrl || "",
      exists: !!attendance
    }
  });
});

async function checkAndUpdateSessionCompletion(sessionId: string) {
  const [attendance, notes] = await Promise.all([
    prisma.sessionAttendance.findUnique({ where: { sessionId } }),
    prisma.sessionNotes.findUnique({ where: { sessionId } })
  ]);

  if (attendance && notes) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" }
    });

    // Credit the psychologist's wallet with their share (idempotent).
    await RevenueService.recordEarningOnCompletion(sessionId).catch((err) => {
      console.error("Failed to record earning on completion:", err);
    });
  }
}

app.post("/api/sessions/:id/attendance", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const created = await prisma.sessionAttendance.create({
    data: {
      sessionId: id,
      clientAttended: body.clientAttended === false ? false : true,
      notes: body.notes ? String(body.notes) : null,
      actualStartTime: body.actualStartTime ? new Date(String(body.actualStartTime)) : null,
      actualEndTime: body.actualEndTime ? new Date(String(body.actualEndTime)) : null,
      evidencePhotoUrl: body.evidencePhotoUrl ? String(body.evidencePhotoUrl) : null,
      submittedAt: new Date()
    }
  });
  await checkAndUpdateSessionCompletion(id);
  return c.json({ data: { sessionId: id, id: created.id } }, 201);
});

app.patch("/api/sessions/:id/attendance", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const updated = await prisma.sessionAttendance.update({
    where: { sessionId: id },
    data: {
      clientAttended: body.clientAttended === false ? false : true,
      notes: body.notes ? String(body.notes) : null,
      actualStartTime: body.actualStartTime ? new Date(String(body.actualStartTime)) : null,
      actualEndTime: body.actualEndTime ? new Date(String(body.actualEndTime)) : null,
      evidencePhotoUrl: body.evidencePhotoUrl ? String(body.evidencePhotoUrl) : null
    }
  });
  await checkAndUpdateSessionCompletion(id);
  return c.json({ data: { sessionId: id, id: updated.id } });
});

app.get("/api/sessions/:id/notes", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.header("x-user-id");
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

  const notes = await prisma.sessionNotes.findUnique({
    where: { sessionId: id }
  });

  if (user?.role === "CLIENT") {
    if (!notes || !notes.isSentToClient) {
      return c.json({ error: "Catatan belum dibagikan atau dikirim oleh psikolog." }, 400);
    }
  }

  return c.json({
    data: {
      sessionId: id,
      chiefComplaint: notes?.chiefComplaint || (user?.role === "CLIENT" ? "" : "kecemasan terkait pekerjaan dan kualitas tidur."),
      assessmentObservation: notes?.assessmentObservation || (user?.role === "CLIENT" ? "" : "client kooperatif, insight baik, afek cemas ringan."),
      interventions: notes?.interventions || (user?.role === "CLIENT" ? "" : "psikoedukasi, breathing exercise, dan reframing pikiran otomatis."),
      followUpPlan: notes?.followUpPlan || (user?.role === "CLIENT" ? "" : "jurnal tidur dan sesi lanjutan 1 minggu."),
      recommendations: notes?.recommendations || (user?.role === "CLIENT" ? "" : "Latihan pernapasan 3x sehari."),
      exists: !!notes,
      isSentToClient: notes?.isSentToClient ?? false
    }
  });
});

app.post("/api/sessions/:id/notes", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const created = await prisma.sessionNotes.create({
    data: {
      sessionId: id,
      chiefComplaint: String(body.chiefComplaint || ""),
      assessmentObservation: String(body.assessmentObservation || ""),
      interventions: String(body.interventions || ""),
      followUpPlan: String(body.followUpPlan || ""),
      recommendations: String(body.recommendations || "")
    }
  });
  await checkAndUpdateSessionCompletion(id);
  return c.json({ data: { sessionId: id, id: created.id } }, 201);
});

app.patch("/api/sessions/:id/notes", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const updated = await prisma.sessionNotes.update({
    where: { sessionId: id },
    data: {
      chiefComplaint: body.chiefComplaint ? String(body.chiefComplaint) : undefined,
      assessmentObservation: body.assessmentObservation ? String(body.assessmentObservation) : undefined,
      interventions: body.interventions ? String(body.interventions) : undefined,
      followUpPlan: body.followUpPlan ? String(body.followUpPlan) : undefined,
      recommendations: body.recommendations ? String(body.recommendations) : undefined
    }
  });
  await checkAndUpdateSessionCompletion(id);
  return c.json({ data: { sessionId: id, id: updated.id } });
});

app.post("/api/sessions/:id/notes/send", async (c) => {
  const id = c.req.param("id");
  await prisma.sessionNotes.update({
    where: { sessionId: id },
    data: { isSentToClient: true }
  });
  return c.json({ data: { sessionId: id, isSentToClient: true } });
});

app.get("/api/sessions/:id/notes/download", (c) => c.json({ data: generateCounselingNotesPdf(c.req.param("id")) }));

app.get("/api/psychologist/profile", async (c) => {
  const userId = c.req.header("x-user-id");
  const profile = userId
    ? await prisma.psychologistProfile.findFirst({
        where: { userId },
        include: {
          user: true,
          sessions: {
            include: { client: true },
            where: { status: { not: "CANCELLED" } }
          },
          availabilitySlots: true
        }
      })
    : await prisma.psychologistProfile.findFirst({
        include: {
          user: true,
          sessions: {
            include: { client: true },
            where: { status: { not: "CANCELLED" } }
          },
          availabilitySlots: true
        }
      });

  if (!profile) return c.json({ data: null });

  // 1. Gather blocked dates and specific custom slots
  const blockedDates = new Set<string>(); // "YYYY-MM-DD"
  const specificSlots = new Set<string>();

  profile.availabilitySlots.forEach((s) => {
    if (s.isBlocked && s.specificDate) {
      if (s.isApproved) {
        blockedDates.add(toLocalDateString(s.specificDate));
      }
    } else if (!s.isBlocked && s.specificDate) {
      const dateStr = toLocalDateString(s.specificDate);
      const timeRange = `${s.startTime} - ${s.endTime}`;
      specificSlots.add(`${dateStr}T${timeRange}`);
    }
  });

  // 2. Gather recurring weekly template slots
  const recurringSlots = profile.availabilitySlots.filter((s) => !s.specificDate && s.dayOfWeek);

  // 3. Generate slots for the next 14 days based on weekly template
  const generatedSlots = new Set<string>();
  const today = new Date();

  // Add specific custom slots first
  specificSlots.forEach((s) => generatedSlots.add(s));

  for (let i = 0; i < 14; i++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + i);
    const wibDate = new Date(targetDate.getTime() + 7 * 60 * 60 * 1000);
    const dayVal = wibDate.getUTCDay(); // Get day of the week in WIB (UTC+7)
    const mappedDay = dayVal === 0 ? 7 : dayVal;

    recurringSlots.forEach((slot) => {
      if (slot.dayOfWeek === mappedDay) {
        const dateStr = toLocalDateString(targetDate);
        const timeRange = `${slot.startTime} - ${slot.endTime}`;
        const slotKey = `${dateStr}T${timeRange}`;
        if (!blockedDates.has(dateStr)) {
          generatedSlots.add(slotKey);
        }
      }
    });
  }

  // 4. Construct slots with status
  const sortedSlotKeys = Array.from(generatedSlots).sort();
  const slotsWithStatus = sortedSlotKeys.map((slotKey) => {
    const matchedSession = profile.sessions.find((s) => {
      const localDateTime = new Date(s.scheduledAt.getTime() + 7 * 60 * 60 * 1000);
      const dateStr = localDateTime.toISOString().split("T")[0];
      const timeStr = localDateTime.toISOString().split("T")[1].substring(0, 5);

      const dayVal = localDateTime.getUTCDay();
      const mappedDay = dayVal === 0 ? 7 : dayVal;
      const slotForDay = profile.availabilitySlots.find((slot) => 
        slot.dayOfWeek === mappedDay && 
        !slot.specificDate && 
        slot.startTime === timeStr
      );
      const timeRange = slotForDay ? `${slotForDay.startTime} - ${slotForDay.endTime}` : `${timeStr} - ${timeStr}`;
      const sessionKey = `${dateStr}T${timeRange}`;
      return sessionKey === slotKey;
    });

    if (matchedSession) {
      return {
        slotKey,
        status: "BOOKED",
        clientName: matchedSession.client.fullName,
        sessionId: matchedSession.id
      };
    }

    return {
      slotKey,
      status: "AVAILABLE"
    };
  });

  const formatted = await getDbPsychologists();
  const matchedProfile = formatted.find(p => p.id === profile.id) || formatted[0];

  return c.json({
    data: {
      ...matchedProfile,
      licenseNumber: profile.licenseNumber,
      homeAddress: profile.homeAddress,
      bankName: profile.bankName || "",
      bankAccountNumber: profile.bankAccountNumber || "",
      bankAccountHolder: profile.bankAccountHolder || "",
      slotsWithStatus,
      blockedDates: Array.from(blockedDates),
      leaves: profile.availabilitySlots
        .filter((s) => s.isBlocked && s.specificDate)
        .map((s) => ({
          id: s.id,
          date: toLocalDateString(s.specificDate!),
          isApproved: s.isApproved
        }))
    }
  });
});

app.patch("/api/psychologist/profile", async (c) => {
  const userId = c.req.header("x-user-id");
  const body = await readObjectBody(c);
  const profile = userId ? await prisma.psychologistProfile.findFirst({ where: { userId } }) : await prisma.psychologistProfile.findFirst();
  if (profile) {
    // 1. Update User fields (fullName, avatarUrl)
    await prisma.user.update({
      where: { id: profile.userId },
      data: {
        fullName: body.fullName !== undefined ? String(body.fullName) : undefined,
        avatarUrl: body.avatarUrl !== undefined ? String(body.avatarUrl || "") : undefined
      }
    });

    // 2. Update PsychologistProfile fields
    const updated = await prisma.psychologistProfile.update({
      where: { id: profile.id },
      data: {
        bio: body.bio !== undefined ? String(body.bio) : undefined,
        licenseNumber: body.licenseNumber !== undefined ? String(body.licenseNumber) : undefined,
        experienceYears: typeof body.experienceYears === "number" ? body.experienceYears : (body.experienceYears ? Number(body.experienceYears) : undefined),
        gender: body.gender !== undefined ? (body.gender as any) : undefined,
        serviceMode: body.serviceMode !== undefined ? (body.serviceMode as any) : undefined,
        pricePerSession: typeof body.pricePerSession === "number" ? body.pricePerSession : (body.pricePerSession ? Number(body.pricePerSession) : undefined),
        homeAddress: body.homeAddress !== undefined ? String(body.homeAddress) : undefined,
        bankName: body.bankName !== undefined ? String(body.bankName || "") : undefined,
        bankAccountNumber: body.bankAccountNumber !== undefined ? String(body.bankAccountNumber || "") : undefined,
        bankAccountHolder: body.bankAccountHolder !== undefined ? String(body.bankAccountHolder || "") : undefined
      }
    });

    // 3. Update specializations if passed
    if (Array.isArray(body.specializations)) {
      await prisma.psychologistSpecialization.deleteMany({
        where: { psychologistId: profile.id }
      });
      const specs = await prisma.specialization.findMany({
        where: { name: { in: body.specializations } }
      });
      await prisma.psychologistSpecialization.createMany({
        data: specs.map((spec) => ({
          psychologistId: profile.id,
          specializationId: spec.id
        }))
      });
    }

    await logAudit({
      userId: userId || profile.userId,
      action: "UPDATE_PROVIDER_PROFILE",
      entityId: profile.id,
      metadata: body
    }).catch((err) => console.error("Audit log error:", err));

    return c.json({ data: updated });
  }
  return c.notFound();
});

// ─── PSYCHOLOGIST WALLET & WITHDRAWALS ──────────────────────────────────────

// A psychologist may request at most this many withdrawals per calendar month.
// FAILED (reversed) withdrawals do not count against the quota.
const MAX_WITHDRAWALS_PER_MONTH = 2;

/** Counts non-failed withdrawals made in the current calendar month. */
async function countWithdrawalsThisMonth(psychologistId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return prisma.withdrawal.count({
    where: {
      psychologistId,
      status: { not: "FAILED" },
      createdAt: { gte: startOfMonth }
    }
  });
}

/** Resolves the psychologist profile for the current request (by x-user-id). */
async function resolvePsychologistProfile(c: Context) {
  const userId = c.req.header("x-user-id");
  return userId
    ? prisma.psychologistProfile.findFirst({ where: { userId } })
    : prisma.psychologistProfile.findFirst();
}

app.get("/api/psychologist/wallet", async (c) => {
  const profile = await resolvePsychologistProfile(c);
  if (!profile) return c.json({ error: "Profil psikolog tidak ditemukan" }, 404);

  const [entries, withdrawals] = await Promise.all([
    prisma.walletEntry.findMany({
      where: { psychologistId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.withdrawal.findMany({
      where: { psychologistId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  const balance = await RevenueService.getWalletBalance(profile.id);
  const withdrawalAdminFee = await RevenueService.getNumericSetting("withdrawal_admin_fee", 5000);
  const withdrawalsThisMonth = await countWithdrawalsThisMonth(profile.id);

  const totalEarned = await prisma.walletEntry.aggregate({
    where: { psychologistId: profile.id, type: "EARNING" },
    _sum: { amount: true }
  });
  const totalWithdrawn = await prisma.withdrawal.aggregate({
    where: { psychologistId: profile.id, status: "COMPLETED" },
    _sum: { netAmount: true }
  });

  return c.json({
    data: {
      balance,
      withdrawalAdminFee,
      withdrawalsThisMonth,
      maxWithdrawalsPerMonth: MAX_WITHDRAWALS_PER_MONTH,
      withdrawalsRemaining: Math.max(0, MAX_WITHDRAWALS_PER_MONTH - withdrawalsThisMonth),
      totalEarned: Number(totalEarned._sum.amount ?? 0),
      totalWithdrawn: Number(totalWithdrawn._sum.netAmount ?? 0),
      bankName: profile.bankName || "",
      bankAccountNumber: profile.bankAccountNumber || "",
      bankAccountHolder: profile.bankAccountHolder || "",
      hasBankAccount: Boolean(profile.bankName && profile.bankAccountNumber && profile.bankAccountHolder),
      entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        amount: Number(e.amount),
        description: e.description || "",
        createdAt: e.createdAt.toISOString()
      })),
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        adminFee: Number(w.adminFee),
        netAmount: Number(w.netAmount),
        status: w.status,
        bankName: w.bankName,
        bankAccountNumber: w.bankAccountNumber,
        bankAccountHolder: w.bankAccountHolder,
        failureReason: w.failureReason || "",
        createdAt: w.createdAt.toISOString(),
        processedAt: w.processedAt ? w.processedAt.toISOString() : ""
      }))
    }
  });
});

app.get("/api/psychologist/withdrawals", async (c) => {
  const profile = await resolvePsychologistProfile(c);
  if (!profile) return c.json({ error: "Profil psikolog tidak ditemukan" }, 404);

  const withdrawals = await prisma.withdrawal.findMany({
    where: { psychologistId: profile.id },
    orderBy: { createdAt: "desc" }
  });

  return c.json({
    data: withdrawals.map((w) => ({
      id: w.id,
      amount: Number(w.amount),
      adminFee: Number(w.adminFee),
      netAmount: Number(w.netAmount),
      status: w.status,
      bankName: w.bankName,
      bankAccountNumber: w.bankAccountNumber,
      bankAccountHolder: w.bankAccountHolder,
      failureReason: w.failureReason || "",
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt ? w.processedAt.toISOString() : ""
    }))
  });
});

app.post("/api/psychologist/wallet/withdraw", async (c) => {
  const profile = await resolvePsychologistProfile(c);
  if (!profile) return c.json({ error: "Profil psikolog tidak ditemukan" }, 404);

  if (!profile.bankName || !profile.bankAccountNumber || !profile.bankAccountHolder) {
    return c.json({ error: "Lengkapi data rekening bank di profil sebelum mencairkan." }, 400);
  }

  const body = await readObjectBody(c);
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return c.json({ error: "Nominal pencairan tidak valid." }, 400);
  }

  const adminFee = await RevenueService.getNumericSetting("withdrawal_admin_fee", 5000);
  if (amount <= adminFee) {
    return c.json({ error: `Nominal harus lebih besar dari biaya admin (Rp${adminFee}).` }, 400);
  }

  // Enforce the monthly withdrawal quota.
  const usedThisMonth = await countWithdrawalsThisMonth(profile.id);
  if (usedThisMonth >= MAX_WITHDRAWALS_PER_MONTH) {
    return c.json({ error: `Pencairan hanya dapat dilakukan maksimal ${MAX_WITHDRAWALS_PER_MONTH}x dalam sebulan. Anda sudah mencapai batas untuk bulan ini.` }, 400);
  }

  // Validate balance and deduct atomically to prevent double-spend / negative balance.
  let withdrawal;
  try {
    withdrawal = await prisma.$transaction(async (tx) => {
      const agg = await tx.walletEntry.aggregate({
        where: { psychologistId: profile.id },
        _sum: { amount: true }
      });
      const balance = Number(agg._sum.amount ?? 0);
      if (amount > balance) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const netAmount = amount - adminFee;
      const created = await tx.withdrawal.create({
        data: {
          psychologistId: profile.id,
          amount: new Prisma.Decimal(amount.toFixed(2)),
          adminFee: new Prisma.Decimal(adminFee.toFixed(2)),
          netAmount: new Prisma.Decimal(netAmount.toFixed(2)),
          status: "PROCESSING",
          bankName: profile.bankName!,
          bankAccountNumber: profile.bankAccountNumber!,
          bankAccountHolder: profile.bankAccountHolder!
        }
      });

      // Debit the wallet (amount = transfer + admin fee), recorded as two entries.
      await tx.walletEntry.createMany({
        data: [
          {
            psychologistId: profile.id,
            type: "WITHDRAWAL",
            amount: new Prisma.Decimal((-netAmount).toFixed(2)),
            withdrawalId: created.id,
            description: "Pencairan saldo"
          },
          {
            psychologistId: profile.id,
            type: "WITHDRAWAL_FEE",
            amount: new Prisma.Decimal((-adminFee).toFixed(2)),
            withdrawalId: created.id,
            description: "Biaya admin pencairan"
          }
        ]
      });

      return created;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return c.json({ error: "Saldo tidak mencukupi." }, 400);
    }
    console.error("Withdrawal error:", err);
    return c.json({ error: "Gagal memproses pencairan." }, 500);
  }

  // Send to disbursement gateway (dummy: auto-completes).
  try {
    const result = await createDisbursement({
      withdrawalId: withdrawal.id,
      amount: Number(withdrawal.netAmount),
      bankName: withdrawal.bankName,
      bankAccountNumber: withdrawal.bankAccountNumber,
      bankAccountHolder: withdrawal.bankAccountHolder
    });

    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        gatewayReference: result.reference,
        gatewayStatus: result.status,
        status: result.status === "COMPLETED" ? "COMPLETED" : result.status === "FAILED" ? "FAILED" : "PROCESSING",
        processedAt: result.status === "COMPLETED" ? new Date() : undefined,
        failureReason: result.failureReason || null
      }
    });

    // If the gateway rejected synchronously, reverse the wallet debit.
    if (result.status === "FAILED") {
      await reverseWithdrawal(withdrawal.id);
    }
  } catch (err) {
    console.error("Disbursement error, reversing withdrawal:", err);
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "FAILED", failureReason: "Gagal menghubungi gateway pencairan." }
    });
    await reverseWithdrawal(withdrawal.id);
  }

  await logAudit({
    userId: profile.userId,
    action: "WITHDRAWAL_REQUEST",
    entityId: withdrawal.id,
    metadata: { amount, adminFee }
  }).catch((err) => console.error("Audit log error:", err));

  const final = await prisma.withdrawal.findUnique({ where: { id: withdrawal.id } });
  return c.json({ data: { id: withdrawal.id, status: final?.status } }, 201);
});

/** Refunds a failed withdrawal back to the wallet (idempotent per withdrawal). */
async function reverseWithdrawal(withdrawalId: string) {
  const w = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  if (!w) return;
  const alreadyReversed = await prisma.walletEntry.findFirst({
    where: { withdrawalId, type: "REVERSAL" }
  });
  if (alreadyReversed) return;

  await prisma.walletEntry.create({
    data: {
      psychologistId: w.psychologistId,
      type: "REVERSAL",
      amount: new Prisma.Decimal(Number(w.amount).toFixed(2)),
      withdrawalId: w.id,
      description: "Pengembalian dana pencairan gagal"
    }
  });
}

// Disbursement gateway webhook (dummy). Real gateways call this asynchronously.
app.post("/api/disbursements/webhook", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  const parsed = parseDisbursementWebhook(payload);

  let withdrawal = null;
  if (parsed.withdrawalId) {
    withdrawal = await prisma.withdrawal.findUnique({ where: { id: parsed.withdrawalId } });
  } else if (payload.reference) {
    withdrawal = await prisma.withdrawal.findFirst({ where: { gatewayReference: String(payload.reference) } });
  }
  if (!withdrawal) return c.json({ error: "Withdrawal tidak ditemukan" }, 404);

  if (parsed.status === "COMPLETED") {
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "COMPLETED", gatewayStatus: "COMPLETED", processedAt: new Date() }
    });
  } else {
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "FAILED", gatewayStatus: "FAILED", failureReason: parsed.failureReason || "Transfer gagal di gateway." }
    });
    await reverseWithdrawal(withdrawal.id);
  }

  return c.json({ data: { id: withdrawal.id, status: parsed.status } });
});

app.patch("/api/client/profile", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) {
    return c.json({ error: "Sesi login tidak valid" }, 401);
  }
  const body = await readObjectBody(c);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: body.fullName ? String(body.fullName) : undefined,
      email: body.email ? String(body.email) : undefined,
      phone: body.phone !== undefined ? String(body.phone || "") : undefined,
      avatarUrl: body.avatarUrl !== undefined ? String(body.avatarUrl || "") : undefined,
    }
  });

  await logAudit({
    userId,
    action: "UPDATE_CLIENT_PROFILE",
    entityId: userId,
    metadata: body
  }).catch((err) => console.error("Audit log error:", err));

  return c.json({
    data: {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phone: updated.phone || undefined,
      avatarUrl: updated.avatarUrl || undefined,
      role: updated.role
    }
  });
});

app.get("/api/psychologist/slots", async (c) => {
  const userId = c.req.header("x-user-id");
  console.log("[DEBUG GET SLOTS] x-user-id header:", userId);
  const profile = userId ? await prisma.psychologistProfile.findFirst({ where: { userId } }) : await prisma.psychologistProfile.findFirst();
  console.log("[DEBUG GET SLOTS] Profile found:", profile ? profile.id : "NULL");
  if (profile) {
    const slots = await prisma.availabilitySlot.findMany({
      where: { psychologistId: profile.id }
    });
    return c.json({
      data: slots.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek || 5,
        startTime: s.startTime,
        endTime: s.endTime,
        serviceMode: s.serviceMode
      }))
    });
  }
  return c.json({ data: [] });
});

app.post("/api/psychologist/slots", async (c) => {
  const userId = c.req.header("x-user-id");
  const body = await readObjectBody(c);
  console.log("[DEBUG POST SLOT] x-user-id header:", userId);
  console.log("[DEBUG POST SLOT] Request body:", body);
  const profile = userId ? await prisma.psychologistProfile.findFirst({ where: { userId } }) : await prisma.psychologistProfile.findFirst();
  console.log("[DEBUG POST SLOT] Profile found:", profile ? profile.id : "NULL");
  if (profile) {
    const allowedModes = ["ONLINE", "OFFLINE", "BOTH"];
    const serviceMode = allowedModes.includes(String(body.serviceMode)) ? (body.serviceMode as any) : "BOTH";
    const slot = await prisma.availabilitySlot.create({
      data: {
        psychologistId: profile.id,
        dayOfWeek: typeof body.dayOfWeek === "number" ? body.dayOfWeek : 5,
        startTime: String(body.startTime || "09:00"),
        endTime: String(body.endTime || "10:00"),
        serviceMode,
        isRecurring: true
      }
    });
    return c.json({ data: slot }, 201);
  }
  return c.notFound();
});

app.patch("/api/psychologist/slots/:id", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const allowedModes = ["ONLINE", "OFFLINE", "BOTH"];
  const updated = await prisma.availabilitySlot.update({
    where: { id },
    data: {
      startTime: body.startTime ? String(body.startTime) : undefined,
      endTime: body.endTime ? String(body.endTime) : undefined,
      serviceMode: allowedModes.includes(String(body.serviceMode)) ? (body.serviceMode as any) : undefined
    }
  });
  return c.json({ data: updated });
});

app.delete("/api/psychologist/slots/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.availabilitySlot.delete({ where: { id } });
  return c.json({ ok: true, id });
});

app.post("/api/psychologist/slots/block", async (c) => {
  const userId = c.req.header("x-user-id");
  const body = await readObjectBody(c);
  const profile = userId ? await prisma.psychologistProfile.findFirst({ where: { userId } }) : await prisma.psychologistProfile.findFirst();
  if (profile) {
    const blocked = await prisma.availabilitySlot.create({
      data: {
        psychologistId: profile.id,
        specificDate: new Date(String(body.date || new Date().toISOString())),
        startTime: "00:00",
        endTime: "23:59",
        isBlocked: true,
        isRecurring: false,
        isApproved: false
      }
    });
    return c.json({ data: blocked }, 201);
  }
  return c.notFound();
});

app.get("/api/psychologist/sessions", async (c) => {
  const userId = c.req.header("x-user-id");
  const profile = userId ? await prisma.psychologistProfile.findFirst({ where: { userId } }) : null;
  if (!profile) return c.json({ data: [] });

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

  return c.json({
    data: listWithAssessment.map((s) => ({
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
      timeRange: getTimeRangeForSession(s.scheduledAt, s.psychologistId, slots),
      assessment: s.assessment ? {
        id: s.assessment.id,
        score: s.assessment.score,
        summary: s.assessment.summary,
        isHighRisk: s.assessment.isHighRisk,
        responses: s.assessment.responses
      } : undefined
    }))
  });
});

app.get("/api/psychologist/sessions/today", async (c) => {
  const userId = c.req.header("x-user-id");
  const profile = userId ? await prisma.psychologistProfile.findFirst({ where: { userId } }) : null;
  if (!profile) return c.json({ data: [] });

  const now = new Date();
  const localTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const startOfDay = new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 23, 59, 59));

  const startUtc = new Date(startOfDay.getTime() - 7 * 60 * 60 * 1000);
  const endUtc = new Date(endOfDay.getTime() - 7 * 60 * 60 * 1000);

  const [list, slots] = await Promise.all([
    prisma.session.findMany({
      where: {
        psychologistId: profile.id,
        scheduledAt: {
          gte: startUtc,
          lte: endUtc
        }
      },
      include: {
        client: true,
        payment: true,
        notes: true,
        attendance: true,
        assessment: true
      },
      orderBy: { scheduledAt: "asc" }
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

  return c.json({
    data: listWithAssessment.map((s) => ({
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
      timeRange: getTimeRangeForSession(s.scheduledAt, s.psychologistId, slots),
      assessment: s.assessment ? {
        id: s.assessment.id,
        score: s.assessment.score,
        summary: s.assessment.summary,
        isHighRisk: s.assessment.isHighRisk,
        responses: s.assessment.responses
      } : undefined
    }))
  });
});

app.get("/api/psychologist/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const s = await prisma.session.findUnique({
    where: { id },
    include: { client: true, payment: true, notes: true, attendance: true, assessment: true }
  });
  if (!s) return c.notFound();

  const slots = await prisma.availabilitySlot.findMany({
    where: { psychologistId: s.psychologistId }
  });

  let assessment = s.assessment;
  if (!assessment) {
    assessment = await prisma.assessmentResponse.findFirst({
      where: { clientId: s.clientId },
      orderBy: { createdAt: "desc" }
    });
  }

  return c.json({
    data: {
      id: s.id,
      clientName: s.client.fullName,
      sessionType: s.sessionType,
      status: s.status,
      scheduledAt: s.scheduledAt.toISOString(),
      amount: s.payment?.totalAmount ?? 0,
      meetUrl: s.googleMeetUrl || undefined,
      location: s.meetingLocation || undefined,
      clientIssues: s.clientIssues,
      clientNotes: s.clientNotes || undefined,
      hasNotes: !!s.notes,
      hasAttendance: !!s.attendance,
      timeRange: getTimeRangeForSession(s.scheduledAt, s.psychologistId, slots),
      assessment: assessment ? {
        id: assessment.id,
        score: assessment.score,
        summary: assessment.summary,
        isHighRisk: assessment.isHighRisk,
        responses: assessment.responses
      } : undefined
    }
  });
});

app.get("/api/client/sessions", async (c) => {
  const clientId = c.req.query("clientId") || c.req.header("x-user-id");

  const whereClause = clientId ? { clientId } : {};
  const list = await prisma.session.findMany({
    where: whereClause,
    include: {
      psychologist: { include: { user: true } },
      payment: true
    },
    orderBy: { createdAt: "desc" }
  });

  const psychologistIds = Array.from(new Set(list.map(s => s.psychologistId)));
  const slots = await prisma.availabilitySlot.findMany({
    where: { psychologistId: { in: psychologistIds } }
  });

  return c.json({
    data: list.map((s) => ({
      id: s.id,
      clientName: s.clientIssues.join(", ") || "Konseling",
      psychologistId: s.psychologistId,
      psychologistName: s.psychologist.user.fullName,
      psychologistTitle: s.psychologist.bio.split(".")[0],
      psychologistAvatar: s.psychologist.user.avatarUrl || "",
      sessionType: s.sessionType,
      status: s.status,
      scheduledAt: s.scheduledAt.toISOString(),
      amount: s.payment?.totalAmount ?? 0,
      meetUrl: s.googleMeetUrl || undefined,
      location: s.meetingLocation || undefined,
      timeRange: getTimeRangeForSession(s.scheduledAt, s.psychologistId, slots)
    }))
  });
});

app.get("/api/client/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const s = await prisma.session.findUnique({
    where: { id },
    include: {
      psychologist: { include: { user: true } },
      payment: true,
      notes: true,
      review: true,
      attendance: true
    }
  });

  if (!s) return c.notFound();

  const slots = await prisma.availabilitySlot.findMany({
    where: { psychologistId: s.psychologistId }
  });

  return c.json({
    data: {
      id: s.id,
      clientName: s.clientIssues.join(", ") || "Konseling",
      psychologistId: s.psychologistId,
      psychologistName: s.psychologist.user.fullName,
      psychologistTitle: s.psychologist.bio.split(".")[0],
      psychologistAvatar: s.psychologist.user.avatarUrl || "",
      sessionType: s.sessionType,
      status: s.status,
      scheduledAt: s.scheduledAt.toISOString(),
      amount: s.payment?.totalAmount ?? 0,
      meetUrl: s.googleMeetUrl || undefined,
      location: s.meetingLocation || undefined,
      hasNotes: !!s.notes,
      hasAttendance: !!s.attendance,
      notesSent: s.notes ? s.notes.isSentToClient : false,
      review: s.review ? { rating: s.review.rating, comment: s.review.comment } : null,
      timeRange: getTimeRangeForSession(s.scheduledAt, s.psychologistId, slots),
      paymentOrderId: s.payment?.midtransOrderId || null,
      assignmentMethod: s.assignmentMethod
    }
  });
});

app.get("/api/client/sessions/:id/receipt", (c) => c.json({ data: generateReceiptPdf(c.req.param("id")) }));
app.get("/api/client/sessions/:id/notes", (c) => c.json({ data: generateCounselingNotesPdf(c.req.param("id")) }));

app.post("/api/client/sessions/:id/review", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const session = await prisma.session.findUnique({ where: { id } });

  if (session) {
    // Check if session is completed (has both notes and attendance record)
    const [attendance, notes] = await Promise.all([
      prisma.sessionAttendance.findUnique({ where: { sessionId: id } }),
      prisma.sessionNotes.findUnique({ where: { sessionId: id } })
    ]);

    if (!attendance || !notes) {
      return c.json({ error: "Ulasan baru dapat diberikan apabila jadwal konseling selesai dilaksanakan (dengan adanya catatan dari psikolog dan absensi kehadirannya terlebih dahulu)." }, 400);
    }

    const review = await prisma.review.create({
      data: {
        sessionId: id,
        clientId: session.clientId,
        psychologistId: session.psychologistId,
        rating: typeof body.rating === "number" ? body.rating : 5,
        comment: body.comment ? String(body.comment) : null
      }
    });

    // Recalculate average rating for this psychologist
    const allReviews = await prisma.review.findMany({
      where: { psychologistId: session.psychologistId }
    });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length) : 0;

    await prisma.psychologistProfile.update({
      where: { id: session.psychologistId },
      data: { averageRating: avgRating }
    });

    return c.json({ data: review }, 201);
  }
  return c.notFound();
});

// B2B Inquiry Route
app.post("/api/corporate/inquiry", async (c) => {
  const body = await readObjectBody(c);
  const name = String(body.name || "");
  const email = String(body.email || "");
  const company = String(body.company || "");
  const message = String(body.message || "");

  if (!name || !email || !company || !message) {
    return c.json({ error: "Semua field wajib diisi" }, 400);
  }

  const inquiry = await prisma.corporateInquiry.create({
    data: { name, email, company, message }
  });

  return c.json({ data: inquiry }, 201);
});

app.post("/api/assessments", async (c) => {
  const body = await readObjectBody(c);
  const clientId = String(body.clientId || c.req.header("x-user-id") || "");
  const category = String(body.category || "General");
  const responses = (body.responses || {}) as Record<string, number>;

  if (!clientId) {
    return c.json({ error: "clientId wajib disertakan" }, 400);
  }

  try {
    const result = await AssessmentService.submitAssessment(clientId, category, responses);
    const crisisResources = result.isHighRisk ? await AssessmentService.getCrisisResources() : [];
    return c.json({ data: result, crisisResources }, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.get("/api/crisis-resources", async (c) => {
  try {
    const resources = await AssessmentService.getCrisisResources();
    return c.json({ data: resources });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────

app.get("/api/admin/stats/monthly", async (c) => {
  const year = Number(c.req.query("year") || new Date().getFullYear());
  const month = Number(c.req.query("month") || (new Date().getMonth() + 1));
  try {
    const stats = await RevenueService.getMonthlyStats(year, month);
    return c.json({ data: stats });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.get("/api/admin/stats", async (c) => {
  const [userCount, psychCount, sessionCount, revenueAgg, pendingVerif] = await Promise.all([
    prisma.user.count(),
    prisma.psychologistProfile.count(),
    prisma.session.count(),
    prisma.payment.aggregate({ _sum: { totalAmount: true }, where: { status: "SUCCESS" } }),
    prisma.psychologistProfile.count({ where: { isVerified: false } })
  ]);

  const today = new Date();
  const monthlyStats = await RevenueService.getMonthlyStats(today.getFullYear(), today.getMonth() + 1).catch(() => null);

  return c.json({
    data: {
      totalUsers: userCount,
      totalPsychologists: psychCount,
      totalSessions: sessionCount,
      totalRevenue: revenueAgg._sum.totalAmount ?? 0,
      pendingVerification: pendingVerif,
      monthlyStats
    }
  });
});

// ─── ADMIN: COMMISSION SETTINGS & PAYOUTS ───────────────────────────────────

app.get("/api/admin/settings", async (c) => {
  const commissionRate = await RevenueService.getNumericSetting("commission_rate", 0.20);
  const withdrawalAdminFee = await RevenueService.getNumericSetting("withdrawal_admin_fee", 5000);
  return c.json({
    data: {
      commissionRate, // fraction, e.g. 0.20
      commissionPercent: Math.round(commissionRate * 100),
      withdrawalAdminFee
    }
  });
});

app.patch("/api/admin/settings", async (c) => {
  const userId = c.req.header("x-user-id");
  const body = await readObjectBody(c);

  const updates: { key: string; value: string }[] = [];

  if (body.commissionPercent !== undefined || body.commissionRate !== undefined) {
    let rate: number;
    if (body.commissionRate !== undefined) {
      rate = Number(body.commissionRate);
    } else {
      rate = Number(body.commissionPercent) / 100;
    }
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      return c.json({ error: "Persentase komisi harus antara 0 dan 100." }, 400);
    }
    updates.push({ key: "commission_rate", value: String(rate) });
  }

  if (body.withdrawalAdminFee !== undefined) {
    const fee = Number(body.withdrawalAdminFee);
    if (!Number.isFinite(fee) || fee < 0) {
      return c.json({ error: "Biaya admin pencairan tidak valid." }, 400);
    }
    updates.push({ key: "withdrawal_admin_fee", value: String(Math.round(fee)) });
  }

  await Promise.all(
    updates.map((u) =>
      prisma.platformSetting.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value }
      })
    )
  );

  await logAudit({
    userId,
    action: "UPDATE_PLATFORM_SETTINGS",
    metadata: body
  }).catch((err) => console.error("Audit log error:", err));

  const commissionRate = await RevenueService.getNumericSetting("commission_rate", 0.20);
  const withdrawalAdminFee = await RevenueService.getNumericSetting("withdrawal_admin_fee", 5000);
  return c.json({ data: { commissionRate, commissionPercent: Math.round(commissionRate * 100), withdrawalAdminFee } });
});

app.get("/api/admin/wallets", async (c) => {
  const profiles = await prisma.psychologistProfile.findMany({
    include: { user: true }
  });

  const wallets = await Promise.all(
    profiles.map(async (p) => {
      const [balanceAgg, earnedAgg, withdrawnAgg] = await Promise.all([
        prisma.walletEntry.aggregate({ where: { psychologistId: p.id }, _sum: { amount: true } }),
        prisma.walletEntry.aggregate({ where: { psychologistId: p.id, type: "EARNING" }, _sum: { amount: true } }),
        prisma.withdrawal.aggregate({ where: { psychologistId: p.id, status: "COMPLETED" }, _sum: { netAmount: true } })
      ]);
      return {
        psychologistId: p.id,
        name: p.user.fullName,
        email: p.user.email,
        balance: Number(balanceAgg._sum.amount ?? 0),
        totalEarned: Number(earnedAgg._sum.amount ?? 0),
        totalWithdrawn: Number(withdrawnAgg._sum.netAmount ?? 0),
        hasBankAccount: Boolean(p.bankName && p.bankAccountNumber && p.bankAccountHolder)
      };
    })
  );

  return c.json({ data: wallets.sort((a, b) => b.balance - a.balance) });
});

app.get("/api/admin/withdrawals", async (c) => {
  const status = c.req.query("status");
  const withdrawals = await prisma.withdrawal.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { psychologist: { include: { user: true } } }
  });

  return c.json({
    data: withdrawals.map((w) => ({
      id: w.id,
      psychologistId: w.psychologistId,
      psychologistName: w.psychologist.user.fullName,
      amount: Number(w.amount),
      adminFee: Number(w.adminFee),
      netAmount: Number(w.netAmount),
      status: w.status,
      bankName: w.bankName,
      bankAccountNumber: w.bankAccountNumber,
      bankAccountHolder: w.bankAccountHolder,
      gatewayReference: w.gatewayReference || "",
      failureReason: w.failureReason || "",
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt ? w.processedAt.toISOString() : ""
    }))
  });
});

app.get("/api/admin/sessions/recent", async (c) => {
  const limit = Number(c.req.query("limit") || 10);
  const list = await prisma.session.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      psychologist: { include: { user: true } },
      payment: true
    }
  });

  const psychologistIds = Array.from(new Set(list.map(s => s.psychologistId)));
  const slots = await prisma.availabilitySlot.findMany({
    where: { psychologistId: { in: psychologistIds } }
  });

  return c.json({
    data: list.map((s) => ({
      id: s.id,
      clientName: s.client.fullName,
      psychologistName: s.psychologist.user.fullName,
      status: s.status,
      amount: s.payment?.totalAmount ?? 0,
      scheduledAt: s.scheduledAt.toISOString(),
      timeRange: getTimeRangeForSession(s.scheduledAt, s.psychologistId, slots)
    }))
  });
});

app.get("/api/admin/psychologists", async (c) => {
  const list = await prisma.psychologistProfile.findMany({
    include: {
      user: true,
      specializations: { include: { specialization: true } },
      sessions: true
    },
    orderBy: {
      user: {
        createdAt: "asc"
      }
    }
  });
  return c.json({
    data: list.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.user.fullName,
      email: p.user.email,
      phone: p.user.phone,
      avatarUrl: p.user.avatarUrl,
      isVerified: p.isVerified,
      isActive: p.isActive,
      licenseNumber: p.licenseNumber,
      experienceYears: p.experienceYears,
      pricePerSession: p.pricePerSession,
      averageRating: Number(p.averageRating),
      totalSessions: p.sessions.length,
      specializations: p.specializations.map((s) => s.specialization.name),
      serviceMode: p.serviceMode,
      gender: p.gender,
      homeAddress: p.homeAddress,
      createdAt: p.user.createdAt.toISOString()
    }))
  });
});

app.patch("/api/admin/psychologists/:id/toggle-active", async (c) => {
  const id = c.req.param("id");
  const profile = await prisma.psychologistProfile.findUnique({ where: { id } });
  if (!profile) return c.notFound();

  const nextActive = !profile.isActive;
  const updated = await prisma.psychologistProfile.update({
    where: { id },
    data: { isActive: nextActive }
  });

  await prisma.user.update({
    where: { id: profile.userId },
    data: { isActive: nextActive }
  });

  return c.json({ data: { id: updated.id, isActive: updated.isActive } });
});

app.patch("/api/admin/psychologists/:id/verify", async (c) => {
  const id = c.req.param("id");
  const updated = await prisma.psychologistProfile.update({
    where: { id },
    data: { isVerified: true }
  });
  return c.json({ data: { id: updated.id, isVerified: updated.isVerified } });
});

app.get("/api/admin/clients", async (c) => {
  const list = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: {
      clientSessions: {
        include: { payment: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });
  return c.json({
    data: list.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      phone: u.phone,
      avatarUrl: u.avatarUrl,
      isActive: u.isActive,
      totalSessions: u.clientSessions.length,
      totalSpent: u.clientSessions.reduce((sum, s) => sum + (s.payment?.totalAmount ?? 0), 0),
      lastSession: u.clientSessions.length > 0
        ? u.clientSessions.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0].scheduledAt.toISOString()
        : null,
      createdAt: u.createdAt.toISOString()
    }))
  });
});

app.patch("/api/admin/users/:id/toggle-active", async (c) => {
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return c.notFound();

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive }
  });

  if (user.role === "PSYCHOLOGIST") {
    await prisma.psychologistProfile.update({
      where: { userId: id },
      data: { isActive: updated.isActive }
    }).catch(() => { });
  }

  return c.json({ data: { id: updated.id, isActive: updated.isActive } });
});

app.patch("/api/admin/users/:id", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return c.notFound();

  const fullName = body.name || body.fullName ? String(body.name || body.fullName) : undefined;
  const email = body.email ? String(body.email) : undefined;
  const phone = body.phone !== undefined ? String(body.phone || "") : undefined;
  const avatarUrl = body.avatarUrl !== undefined ? String(body.avatarUrl || "") : undefined;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      fullName,
      email,
      phone,
      avatarUrl
    }
  });

  if (user.role === "PSYCHOLOGIST") {
    const experienceYears = body.experienceYears !== undefined ? Number(body.experienceYears) : undefined;
    const pricePerSession = body.pricePerSession !== undefined ? Number(body.pricePerSession) : undefined;
    const licenseNumber = body.licenseNumber !== undefined ? String(body.licenseNumber) : undefined;
    const specializations = body.specializations as string[] | undefined;
    const gender = body.gender !== undefined ? (body.gender as any) : undefined;
    const serviceMode = body.serviceMode !== undefined ? (body.serviceMode as any) : undefined;
    const homeAddress = body.homeAddress !== undefined ? String(body.homeAddress) : undefined;

    await prisma.psychologistProfile.update({
      where: { userId: id },
      data: {
        experienceYears,
        pricePerSession,
        licenseNumber,
        gender,
        serviceMode,
        homeAddress
      }
    });

    if (specializations) {
      const profile = await prisma.psychologistProfile.findUnique({ where: { userId: id } });
      if (profile) {
        await prisma.psychologistSpecialization.deleteMany({
          where: { psychologistId: profile.id }
        });

        for (const specName of specializations) {
          let spec = await prisma.specialization.findUnique({ where: { name: specName } });
          if (!spec) {
            spec = await prisma.specialization.create({ data: { name: specName } });
          }
          await prisma.psychologistSpecialization.create({
            data: {
              psychologistId: profile.id,
              specializationId: spec.id
            }
          });
        }
      }
    }
  }

  return c.json({ data: { ok: true } });
});

app.get("/api/admin/leaves", async (c) => {
  const list = await prisma.availabilitySlot.findMany({
    where: {
      isBlocked: true,
      specificDate: { not: null }
    },
    include: {
      psychologist: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      specificDate: "asc"
    }
  });

  return c.json({
    data: list.map((s) => ({
      id: s.id,
      date: toLocalDateString(s.specificDate!),
      isApproved: s.isApproved,
      psychologistId: s.psychologistId,
      psychologistName: s.psychologist.user.fullName,
      psychologistEmail: s.psychologist.user.email
    }))
  });
});

app.patch("/api/admin/leaves/:id/approve", async (c) => {
  const id = c.req.param("id");
  const updated = await prisma.availabilitySlot.update({
    where: { id },
    data: { isApproved: true }
  });
  return c.json({ data: updated });
});

app.delete("/api/admin/leaves/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.availabilitySlot.delete({ where: { id } });
  return c.json({ ok: true, id });
});

// Admin Vouchers CRUD
app.get("/api/admin/vouchers", async (c) => {
  const list = await prisma.voucher.findMany({
    orderBy: { createdAt: "desc" }
  });
  return c.json({ data: list });
});

app.post("/api/admin/vouchers", async (c) => {
  const body = await readObjectBody(c);
  const code = String(body.code || "").trim().toUpperCase();
  const name = String(body.name || "").trim();
  const discountType = String(body.discountType || "FIXED");
  const discountValue = Number(body.discountValue || 0);
  const maxDiscountAmount = body.maxDiscountAmount !== undefined && body.maxDiscountAmount !== null ? Number(body.maxDiscountAmount) : null;
  const minOrderAmount = body.minOrderAmount !== undefined && body.minOrderAmount !== null ? Number(body.minOrderAmount) : null;
  const quota = Number(body.quota || 0);
  const isActive = body.isActive === false ? false : true;
  const packages = Array.isArray(body.packages) ? (body.packages as string[]) : [];
  const validFrom = body.validFrom ? new Date(String(body.validFrom)) : null;
  const validUntil = body.validUntil ? new Date(String(body.validUntil)) : null;
  const description = body.description ? String(body.description) : null;

  if (!code || !name) {
    return c.json({ error: "Kode dan nama voucher wajib diisi" }, 400);
  }

  const existing = await prisma.voucher.findUnique({ where: { code } });
  if (existing) {
    return c.json({ error: "Kode voucher sudah digunakan" }, 400);
  }

  const voucher = await prisma.voucher.create({
    data: {
      code,
      name,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      quota,
      isActive,
      packages,
      validFrom,
      validUntil,
      description
    }
  });

  return c.json({ data: voucher }, 201);
});

app.patch("/api/admin/vouchers/:id", async (c) => {
  const id = c.req.param("id");
  const body = await readObjectBody(c);
  const code = body.code ? String(body.code).trim().toUpperCase() : undefined;
  const name = body.name ? String(body.name).trim() : undefined;
  const discountType = body.discountType ? String(body.discountType) : undefined;
  const discountValue = body.discountValue !== undefined ? Number(body.discountValue) : undefined;
  const maxDiscountAmount = body.maxDiscountAmount !== undefined ? (body.maxDiscountAmount !== null ? Number(body.maxDiscountAmount) : null) : undefined;
  const minOrderAmount = body.minOrderAmount !== undefined ? (body.minOrderAmount !== null ? Number(body.minOrderAmount) : null) : undefined;
  const quota = body.quota !== undefined ? Number(body.quota) : undefined;
  const isActive = body.isActive !== undefined ? Boolean(body.isActive) : undefined;
  const packages = Array.isArray(body.packages) ? (body.packages as string[]) : undefined;
  const validFrom = body.validFrom !== undefined ? (body.validFrom ? new Date(String(body.validFrom)) : null) : undefined;
  const validUntil = body.validUntil !== undefined ? (body.validUntil ? new Date(String(body.validUntil)) : null) : undefined;
  const description = body.description !== undefined ? (body.description ? String(body.description) : null) : undefined;

  if (code) {
    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing && existing.id !== id) {
      return c.json({ error: "Kode voucher sudah digunakan oleh voucher lain" }, 400);
    }
  }

  const updated = await prisma.voucher.update({
    where: { id },
    data: {
      code,
      name,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      quota,
      isActive,
      packages,
      validFrom,
      validUntil,
      description
    }
  });

  return c.json({ data: updated });
});

app.delete("/api/admin/vouchers/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.voucher.delete({ where: { id } });
  return c.json({ ok: true, id });
});

app.patch("/api/admin/vouchers/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const existing = await prisma.voucher.findUnique({ where: { id } });
  if (!existing) return c.notFound();

  const updated = await prisma.voucher.update({
    where: { id },
    data: { isActive: !existing.isActive }
  });
  return c.json({ data: updated });
});

// ─── END ADMIN ENDPOINTS ──────────────────────────────────────────────────────

const port = 6969;

if (process.env.NODE_ENV !== "test") {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`h2h Hono API running on http://localhost:${info.port}`);
  });
}
