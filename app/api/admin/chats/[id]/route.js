import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { resolveVenueImageUrl } from "@/lib/venueImagePath";

export const dynamic = "force-dynamic";

const PROHIBITED = ["scam", "fraud", "illegal", "hack", "password", "credit card"];

function timestampMs(value) {
  if (!value) return 0;
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value._seconds === "number") return value._seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function timestampToIso(value) {
  const ms = timestampMs(value);
  return ms ? new Date(ms).toISOString() : null;
}

function formatMessageTime(value) {
  const ms = timestampMs(value);
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function serializeMessage(id, data, venueSlug) {
  const senderRole = data.senderRole || data.sender || "customer";
  const isVendor = senderRole === "vendor" || data.senderId === venueSlug;
  return {
    id,
    type: data.type || "text",
    text: data.text || data.body || "",
    senderId: data.senderId || "",
    senderRole,
    isVendor,
    senderLabel: isVendor ? "Venue" : "Customer",
    timestamp: timestampToIso(data.timestamp || data.createdAt),
    timeLabel: formatMessageTime(data.timestamp || data.createdAt),
    counterOffer: data.counterOffer || null,
    attachment:
      data.attachment ||
      (data.fileName
        ? {
            name: data.fileName,
            url: data.fileUrl || data.url || "",
            size: data.fileSize || data.size || "",
            source: data.fileSource || "Sent via Portal",
          }
        : null),
  };
}

function computeResponseTimeMinutes(messages) {
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < messages.length - 1; i++) {
    const cur = messages[i];
    const next = messages[i + 1];
    if (!cur.isVendor && next.isVendor) {
      const delta = timestampMs(next.timestamp) - timestampMs(cur.timestamp);
      if (delta > 0) {
        total += delta / 60000;
        pairs += 1;
      }
    }
  }
  if (!pairs) return null;
  return Math.round(total / pairs);
}

function computeSentiment(messages) {
  const text = messages
    .slice(-6)
    .map((m) => m.text)
    .join(" ")
    .toLowerCase();
  const positive = ["thank", "great", "perfect", "confirmed", "happy", "excellent"];
  const negative = ["cancel", "refund", "angry", "terrible", "dispute", "complaint"];
  if (positive.some((w) => text.includes(w))) return "Positive";
  if (negative.some((w) => text.includes(w))) return "Negative";
  return "Neutral";
}

function detectSecurity(messages) {
  const text = messages.map((m) => m.text).join(" ").toLowerCase();
  const hit = PROHIBITED.find((w) => text.includes(w));
  if (hit) return { level: "Review", detail: `Flagged keyword detected: "${hit}"` };
  return { level: "Clear", detail: "No prohibited content detected in messages" };
}

async function buildInsights(db, room, messages) {
  const venueSlug = room.venueSlug || "";
  const customerId = room.customerId || "";
  const customerName = room.customerName || "";
  const bookingRef = room.bookingRef || "";

  let venue = null;
  if (venueSlug) {
    const vSnap = await db.collection("venues").doc(venueSlug).get();
    if (vSnap.exists) {
      const v = vSnap.data();
      venue = {
        slug: venueSlug,
        name: v.name || v.hallName || v.profile?.hall_name || venueSlug,
        imageUrl: resolveVenueImageUrl(venueSlug, v),
        rating: v.rating ?? v.profile?.rating ?? null,
        reviewCount: v.reviewCount ?? v.profile?.reviewCount ?? null,
      };
    }
  }

  if (!venue && venueSlug) {
    venue = {
      slug: venueSlug,
      name: venueSlug.replace(/-/g, " "),
      imageUrl: resolveVenueImageUrl(venueSlug, {}),
      rating: null,
      reviewCount: null,
    };
  }

  const [bookingsSnap, quotesSnap] = await Promise.all([
    db.collection("bookings").get(),
    db.collection("quotations").get(),
  ]);

  const bookings = [];
  bookingsSnap.forEach((doc) => {
    const d = doc.data();
    const vId = d.targetVenueId || d.eventDetails?.venueId || "";
    const name = d.customer?.name || "";
    if (vId !== venueSlug && venueSlug) return;
    if (
      bookingRef &&
      (doc.id === bookingRef || d.id === bookingRef || String(d.bookingRef) === bookingRef)
    ) {
      bookings.push({ id: doc.id, status: d.status, amount: d.financials?.grandTotal ?? 0 });
      return;
    }
    if (
      customerId &&
      (d.customerId === customerId || d.userId === customerId)
    ) {
      bookings.push({ id: doc.id, status: d.status, amount: d.financials?.grandTotal ?? 0 });
      return;
    }
    if (customerName && name && name.toLowerCase() === customerName.toLowerCase()) {
      bookings.push({ id: doc.id, status: d.status, amount: d.financials?.grandTotal ?? 0 });
    }
  });

  const quotations = [];
  quotesSnap.forEach((doc) => {
    const d = doc.data();
    if (d.targetVenueId !== venueSlug && venueSlug) return;
    if (customerId && d.userId === customerId) {
      quotations.push({ id: doc.id, status: d.status, quotationId: d.quotationId });
    } else if (
      customerName &&
      d.customerName &&
      d.customerName.toLowerCase() === customerName.toLowerCase()
    ) {
      quotations.push({ id: doc.id, status: d.status, quotationId: d.quotationId });
    }
  });

  let userVerified = false;
  if (customerId) {
    const uSnap = await db.collection("users").doc(customerId).get();
    if (uSnap.exists) {
      const u = uSnap.data();
      userVerified = Boolean(u.emailVerified || u.onboardingComplete);
    }
  }

  const confirmedBookings = bookings.filter(
    (b) => String(b.status).toLowerCase() === "confirmed"
  );

  let paymentStatus = "No linked invoice in thread";
  if (room.hasPendingCounterOffer) {
    paymentStatus = "Counter offer pending customer response";
  } else if (quotations.some((q) => q.status === "pending_vendor_approval")) {
    paymentStatus = "Quotation pending vendor approval";
  } else if (bookings.some((b) => String(b.status).toLowerCase() === "pending")) {
    paymentStatus = "Booking invoice pending confirmation";
  } else if (confirmedBookings.length > 0) {
    paymentStatus = `${confirmedBookings.length} confirmed booking(s) on record`;
  }

  const tags = [];
  if (room.subject) tags.push(room.subject.slice(0, 24));
  const service = bookingsSnap.docs
    .map((d) => d.data().eventDetails?.category)
    .find(Boolean);
  if (service) tags.push(service);

  const security = detectSecurity(messages);
  const responseMinutes = computeResponseTimeMinutes(messages);

  return {
    venue,
    userVerified,
    responseTimeMinutes: responseMinutes,
    sentiment: computeSentiment(messages),
    security,
    paymentStatus,
    userHistory:
      confirmedBookings.length > 0
        ? `Repeat activity: ${confirmedBookings.length} confirmed booking(s) for this venue`
        : bookings.length > 0
          ? `${bookings.length} booking record(s) linked to this customer`
          : "No prior confirmed bookings found for this thread",
    tags: [...new Set(tags)].slice(0, 4),
    relatedBookings: bookings.slice(0, 5),
    relatedQuotations: quotations.slice(0, 5),
  };
}

export const GET = withAdmin(async ({ params }) => {
  const id = params?.id;
  const db = getAdminDb();
  const roomSnap = await db.collection("chats").doc(id).get();
  if (!roomSnap.exists) {
    return Response.json({ error: "Chat not found." }, { status: 404 });
  }

  const roomData = roomSnap.data();
  const venueSlug = roomData.venueSlug || "";

  const messagesSnap = await db.collection("chats").doc(id).collection("messages").get();
  const messages = messagesSnap.docs
    .map((d) => serializeMessage(d.id, d.data(), venueSlug))
    .sort((a, b) => timestampMs(a.timestamp) - timestampMs(b.timestamp));

  if (messages.length === 0) {
    return Response.json(
      { error: "This thread has no messages yet." },
      { status: 404 }
    );
  }

  const room = {
    id,
    chatId: roomData.chatId || id,
    threadLabel: `#${String(roomData.chatId || id).slice(0, 8).toUpperCase()}`,
    venueSlug,
    customerId: roomData.customerId || "",
    customerName: roomData.customerName || "Customer",
    customerAvatar: roomData.customerAvatar || null,
    subject: roomData.subject || "Event inquiry",
    bookingRef: roomData.bookingRef || null,
    adminFlagged: Boolean(roomData.adminFlagged),
    adminMonitorMode: Boolean(roomData.adminMonitorMode),
    hasPendingCounterOffer: Boolean(roomData.hasPendingCounterOffer),
    createdAt: timestampToIso(roomData.createdAt),
  };

  const insights = await buildInsights(db, { ...roomData, ...room }, messages);

  const conversationStarted = timestampMs(roomData.createdAt) || timestampMs(messages[0]?.timestamp);

  return Response.json({
    room,
    messages,
    insights,
    conversationStarted: conversationStarted
      ? new Date(conversationStarted).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).toUpperCase()
      : null,
  });
});

export const PATCH = withAdmin(async ({ request, admin, params }) => {
  const id = params?.id;
  const body = await request.json();
  const ref = getAdminDb().collection("chats").doc(id);
  const beforeSnap = await ref.get();
  if (!beforeSnap.exists) {
    return Response.json({ error: "Chat not found." }, { status: 404 });
  }

  const patch = { updatedAt: FieldValue.serverTimestamp() };
  if (body.adminFlagged !== undefined) patch.adminFlagged = Boolean(body.adminFlagged);
  if (body.adminMonitorMode !== undefined) patch.adminMonitorMode = Boolean(body.adminMonitorMode);

  await ref.set(patch, { merge: true });

  await writeAdminAuditLog({
    adminUid: admin.uid,
    action: "chats.patch",
    collection: "chats",
    docId: id,
    before: beforeSnap.data(),
    after: patch,
  });

  const after = await ref.get();
  return Response.json({
    room: {
      id,
      adminFlagged: Boolean(after.data().adminFlagged),
      adminMonitorMode: Boolean(after.data().adminMonitorMode),
    },
  });
});
