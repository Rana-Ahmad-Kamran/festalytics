import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const venueSlug = searchParams.get("venueSlug") || "";

  const snap = await getAdminDb().collection("chats").get();
  let items = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      chatId: data.chatId || d.id,
      venueSlug: data.venueSlug || "",
      customerId: data.customerId || "",
      customerName: data.customerName || "",
      lastMessage: data.lastMessage || "",
      lastSenderRole: data.lastSenderRole || "",
      lastMessageTimestamp: data.lastMessageTimestamp || null,
      unreadCountVendor: data.unreadCountVendor ?? 0,
    };
  });

  if (venueSlug) items = items.filter((c) => c.venueSlug === venueSlug);

  items.sort((a, b) => {
    const ta = a.lastMessageTimestamp?._seconds || 0;
    const tb = b.lastMessageTimestamp?._seconds || 0;
    return tb - ta;
  });

  return Response.json({ chats: items, total: items.length });
});
