import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ params }) => {
  const id = params?.id;
  const db = getAdminDb();
  const roomSnap = await db.collection("chats").doc(id).get();
  if (!roomSnap.exists) {
    return Response.json({ error: "Chat not found." }, { status: 404 });
  }

  const messagesSnap = await db
    .collection("chats")
    .doc(id)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get()
    .catch(async () => {
      return db.collection("chats").doc(id).collection("messages").get();
    });

  const messages = messagesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return Response.json({
    room: { id, ...roomSnap.data() },
    messages,
  });
});
