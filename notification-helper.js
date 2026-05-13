import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * SEND NOTIFICATION SYSTEM
 * Works for:
 * - single user (userId)
 * - role-based (admin, teacher, etc.)
 */
export async function sendNotification(db, payload) {
  try {
    const {
      userId,
      role,
      title,
      message,
      type,
      link,
      refId
    } = payload;

    if (!title || !message) {
      throw new Error("Notification must have title and message");
    }

    const baseData = {
      title,
      message,
      type: type || "general",
      link: link || null,
      refId: refId || null,
      read: false,
      createdAt: Date.now(),
      createdAtServer: serverTimestamp()
    };

    // --------------------------------------------------
    // CASE 1: SEND TO SINGLE USER
    // --------------------------------------------------
    if (userId) {
      await addDoc(collection(db, "notifications"), {
        ...baseData,
        userId
      });

      return true;
    }

    // --------------------------------------------------
    // CASE 2: SEND TO ROLE (admin, teacher, etc.)
    // --------------------------------------------------
    if (role) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", role));
      const snap = await getDocs(q);

      const promises = [];

      snap.forEach(docSnap => {
        const u = docSnap.data();

        if (u.userId) {
          promises.push(
            addDoc(collection(db, "notifications"), {
              ...baseData,
              userId: u.userId
            })
          );
        }
      });

      await Promise.all(promises);

      return true;
    }

    throw new Error("Must provide userId or role");

  } catch (err) {
    console.error("Notification error:", err);
    return false;
  }
}

/**
 * GET NOTIFICATIONS FOR USER
 * (for future inbox page)
 */
export async function getNotifications(db, userId) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    const snap = await getDocs(q);

    const list = [];

    snap.forEach(doc => {
      list.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return list.sort((a, b) => b.createdAt - a.createdAt);

  } catch (err) {
    console.error("Fetch notifications error:", err);
    return [];
  }
}
