import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

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

function serializeChatRoom(id, data) {
  const lastRole = data.lastSenderRole || "customer";
  return {
    id,
    chatId: data.chatId || id,
    threadLabel: `#${String(data.chatId || id).slice(0, 8).toUpperCase()}`,
    venueSlug: data.venueSlug || "",
    customerId: data.customerId || "",
    customerName: data.customerName || "Customer",
    customerAvatar: data.customerAvatar || null,
    subject: data.subject || "",
    bookingRef: data.bookingRef || null,
    lastMessage: data.lastMessage || "",
    lastSenderRole: lastRole,
    roleTag: lastRole === "vendor" ? "VENDOR" : "CUSTOMER",
    lastMessageTimestamp: timestampToIso(data.lastMessageTimestamp),
    unreadByVendor: data.unreadByVendor ?? data.unreadCountVendor ?? 0,
    unreadByCustomer: data.unreadByCustomer ?? 0,
    hasPendingCounterOffer: Boolean(data.hasPendingCounterOffer),
    adminFlagged: Boolean(data.adminFlagged),
    adminMonitorMode: Boolean(data.adminMonitorMode),
    archivedByVendor: Boolean(data.archivedByVendor),
    createdAt: timestampToIso(data.createdAt),
  };
}

async function roomHasMessages(db, chatId) {
  const msgSnap = await db
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .limit(1)
    .get();
  return !msgSnap.empty;
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const venueSlug = searchParams.get("venueSlug") || "";
  const role = searchParams.get("role") || "";
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const db = getAdminDb();
  const snap = await db.collection("chats").get();

  const rooms = await Promise.all(
    snap.docs.map(async (d) => {
      const hasMessages = await roomHasMessages(db, d.id);
      if (!hasMessages) return null;
      return serializeChatRoom(d.id, d.data());
    })
  );
  let items = rooms.filter(Boolean);

  if (venueSlug) items = items.filter((c) => c.venueSlug === venueSlug);
  if (role === "customer") items = items.filter((c) => c.lastSenderRole !== "vendor");
  if (role === "vendor") items = items.filter((c) => c.lastSenderRole === "vendor");
  if (q) {
    items = items.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.chatId.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.venueSlug.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q)
    );
  }

  items.sort(
    (a, b) => timestampMs(b.lastMessageTimestamp) - timestampMs(a.lastMessageTimestamp)
  );

  const flaggedCount = items.filter((c) => c.adminFlagged).length;
  const pendingOffers = items.filter((c) => c.hasPendingCounterOffer).length;

  return Response.json({
    chats: items,
    total: items.length,
    summary: {
      liveCount: items.length,
      flaggedCount,
      pendingOffers,
      unreadTotal: items.reduce((s, c) => s + (c.unreadByVendor || 0), 0),
    },
    venueSlugs: [...new Set(items.map((c) => c.venueSlug).filter(Boolean))].sort(),
  });
});
