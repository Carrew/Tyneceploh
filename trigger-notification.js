/**
 * TRIGGER NOTIFICATION FOR BACKEND LISTENER
 * Works with the new tef-notification-backend real-time listener
 * 
 * The backend listens to the "notifications" collection and automatically:
 * 1. Detects new documents where pushSent == null
 * 2. Sends FCM push notifications to the fcmToken
 * 3. Updates pushSent: true after sending
 * 
 * Usage: 
 *   await triggerToIndividual(db, "Student Created", "New student TEF001 added", "device_token_here")
 *   await triggerToRole(db, "Report Ready", "Academic report generated", "admin")
 *   await triggerToPublic(db, "School Announcement", "Important announcement")
 */

import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Trigger notification to INDIVIDUAL device
 */
export async function triggerToIndividual(db, title, message, fcmToken, eventType = "general") {
  try {
    if (!fcmToken) {
      console.warn("No FCM token provided - notification skipped");
      return { success: false, error: "No FCM token" };
    }

    await addDoc(collection(db, "notifications"), {
      title,
      message,
      fcmToken,
      eventType,
      pushSent: null,
      createdAt: serverTimestamp(),
      status: "pending",
      targetType: "individual"
    });

    return { success: true, message: "Notification queued for individual" };
  } catch (error) {
    console.error("Error triggering individual notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger notification to ALL USERS with a specific ROLE
 * Example: Send to all "teachers" or all "students"
 */
export async function triggerToRole(db, title, message, role, eventType = "general") {
  try {
    if (!role) {
      throw new Error("Role must be specified");
    }

    // Get all users with this role
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", role));
    const snap = await getDocs(q);

    const promises = [];
    let count = 0;

    snap.forEach(docSnap => {
      const userData = docSnap.data();
      
      // Only create notification if user has FCM token
      if (userData.fcmToken) {
        promises.push(
          addDoc(collection(db, "notifications"), {
            title,
            message,
            fcmToken: userData.fcmToken,
            eventType,
            userId: userData.userId,
            pushSent: null,
            createdAt: serverTimestamp(),
            status: "pending",
            targetType: "role",
            targetRole: role
          })
        );
        count++;
      }
    });

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return { 
      success: true, 
      message: `Notification queued for ${count} ${role}(s)` 
    };
  } catch (error) {
    console.error("Error triggering role-based notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger notification to ALL USERS (public broadcast)
 * Warning: This sends to everyone with an FCM token!
 */
export async function triggerToPublic(db, title, message, eventType = "general") {
  try {
    // Get all users
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);

    const promises = [];
    let count = 0;

    snap.forEach(docSnap => {
      const userData = docSnap.data();
      
      // Only create notification if user has FCM token
      if (userData.fcmToken) {
        promises.push(
          addDoc(collection(db, "notifications"), {
            title,
            message,
            fcmToken: userData.fcmToken,
            eventType,
            userId: userData.userId,
            pushSent: null,
            createdAt: serverTimestamp(),
            status: "pending",
            targetType: "public",
            broadcastAt: new Date().toISOString()
          })
        );
        count++;
      }
    });

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return { 
      success: true, 
      message: `Public notification queued for ${count} user(s)` 
    };
  } catch (error) {
    console.error("Error triggering public notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generic wrapper - automatically detects target type
 * targetType: "individual" | "role" | "public"
 */
export async function triggerNotification(db, title, message, options = {}) {
  const { 
    fcmToken, 
    role, 
    targetType = "individual", 
    eventType = "general" 
  } = options;

  if (targetType === "role") {
    return await triggerToRole(db, title, message, role, eventType);
  } else if (targetType === "public") {
    return await triggerToPublic(db, title, message, eventType);
  } else {
    return await triggerToIndividual(db, title, message, fcmToken, eventType);
  }
}
