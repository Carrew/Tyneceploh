import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Send notification to users or roles
 * Works with your existing Firestore + FCM system
 */
export async function sendNotification(db, payload) {
  try {
    const {
      userId,
      role,
      title,
      message,
      type = "general",
      link = null,
      refId = null
    } = payload;

    let targets = [];

    // 1. Direct user notification
    if (userId) {
      targets.push(userId);
    }

    // 2. Role-based notification
    if (role) {
      const snap = await getDocs(collection(db, "users"));

      snap.forEach(doc => {
        const u = doc.data();
        if ((u.role || "").toLowerCase() === role) {
          targets.push(u.userId);
        }
      });
    }

    // Remove duplicates
    targets = [...new Set(targets)];

    // 3. Save notifications in Firestore
    const promises = targets.map(id =>
      addDoc(collection(db, "notifications"), {
        userId: id,
        title,
        message,
        type,
        link,
        refId,
        read: false,
        createdAt: Date.now()
      })
    );

    await Promise.all(promises);

    console.log("Notification sent:", payload);

  } catch (err) {
    console.error("Notification Error:", err);
  }
}
