import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function sendNotification(db, payload) {
  try {
    await addDoc(collection(db, "notifications"), {
      title: payload.title,
      body: payload.body,
      userId: payload.userId || null,
      role: payload.role || null,
      class: payload.class || null,
      read: false,
      createdAt: Date.now()
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
}
