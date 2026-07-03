/**
 * TRIGGER NOTIFICATION FOR BACKEND LISTENER
 * Works with the new tef-notification-backend real-time listener
 * 
 * The backend listens to the "notifications" collection for documents with pushSent == null
 * When found, it sends FCM messages based on the fcmToken and marks pushSent as true
 * 
 * Usage:
 * - Individual: triggerNotification(db, "Title", "Message", fcmToken, "event_type")
 * - Role-based: triggerNotificationToRole(db, "admin", "Title", "Message", "event_type")
 * - Public/Class: triggerNotificationToMultiple(db, [fcmToken1, fcmToken2], "Title", "Message", "event_type")
 */

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Trigger notification to a SINGLE INDIVIDUAL USER
 * @param {Object} db - Firestore database instance
 * @param {string} title - Notification title
 * @param {string} message - Notification body/message
 * @param {string} fcmToken - Device FCM token of the recipient
 * @param {string} eventType - Category of event (e.g., "student_created", "report_generated")
 */
export async function triggerNotification(db, title, message, fcmToken, eventType = "general") {
  try {
    if (!fcmToken) {
      console.warn("No FCM token provided - notification skipped");
      return { success: false, message: "No FCM token" };
    }

    await addDoc(collection(db, "notifications"), {
      title,
      message,
      fcmToken,          // Single device token
      eventType,
      pushSent: null,    // Backend sets to true after sending
      createdAt: serverTimestamp(),
      status: "pending"
    });

    return { success: true, message: "Notification triggered for individual" };
  } catch (error) {
    console.error("Error triggering individual notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger notification to all users with a SPECIFIC ROLE
 * Looks up all users with that role and sends to their FCM tokens
 * @param {Object} db - Firestore database instance
 * @param {string} targetRole - Role to target ("admin", "teacher", "student", etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification body/message
 * @param {string} eventType - Category of event
 */
export async function triggerNotificationToRole(db, targetRole, title, message, eventType = "general") {
  try {
    // Find all users with the target role
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", targetRole)
    );
    
    const snap = await getDocs(usersQuery);
    const tokens = [];

    snap.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.warn(`No users found with role: ${targetRole}`);
      return { success: false, message: "No users with this role" };
    }

    // Create notification document for each token
    const promises = tokens.map(token =>
      addDoc(collection(db, "notifications"), {
        title,
        message,
        fcmToken: token,
        eventType,
        targetRole,
        pushSent: null,
        createdAt: serverTimestamp(),
        status: "pending"
      })
    );

    await Promise.all(promises);

    return { 
      success: true, 
      message: `Notification triggered for ${tokens.length} ${targetRole}(s)` 
    };
  } catch (error) {
    console.error("Error triggering role-based notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger notification to MULTIPLE USERS (by class or custom list)
 * @param {Object} db - Firestore database instance
 * @param {string} targetClass - Class to target (e.g., "7th Grade")
 * @param {string} title - Notification title
 * @param {string} message - Notification body/message
 * @param {string} eventType - Category of event
 */
export async function triggerNotificationToClass(db, targetClass, title, message, eventType = "general") {
  try {
    // Find all users in the target class
    const classQuery = query(
      collection(db, "users"),
      where("class", "==", targetClass)
    );
    
    const snap = await getDocs(classQuery);
    const tokens = [];

    snap.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.warn(`No users found in class: ${targetClass}`);
      return { success: false, message: "No users in this class" };
    }

    // Create notification document for each token
    const promises = tokens.map(token =>
      addDoc(collection(db, "notifications"), {
        title,
        message,
        fcmToken: token,
        eventType,
        targetClass,
        pushSent: null,
        createdAt: serverTimestamp(),
        status: "pending"
      })
    );

    await Promise.all(promises);

    return { 
      success: true, 
      message: `Notification triggered for ${tokens.length} student(s) in ${targetClass}` 
    };
  } catch (error) {
    console.error("Error triggering class-based notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger notification to SPECIFIC FCM TOKENS (custom list/array)
 * @param {Object} db - Firestore database instance
 * @param {Array} fcmTokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} message - Notification body/message
 * @param {string} eventType - Category of event
 */
export async function triggerNotificationToList(db, fcmTokens, title, message, eventType = "general") {
  try {
    if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
      console.warn("No FCM tokens provided");
      return { success: false, message: "Empty token list" };
    }

    // Create notification document for each token
    const promises = fcmTokens.map(token =>
      addDoc(collection(db, "notifications"), {
        title,
        message,
        fcmToken: token,
        eventType,
        pushSent: null,
        createdAt: serverTimestamp(),
        status: "pending"
      })
    );

    await Promise.all(promises);

    return { 
      success: true, 
      message: `Notification triggered for ${fcmTokens.length} recipient(s)` 
    };
  } catch (error) {
    console.error("Error triggering list notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger PUBLIC notification (no FCM token filtering - broadcast to all)
 * @param {Object} db - Firestore database instance
 * @param {string} title - Notification title
 * @param {string} message - Notification body/message
 * @param {string} eventType - Category of event
 */
export async function triggerPublicNotification(db, title, message, eventType = "general") {
  try {
    // Get all users and their tokens
    const snap = await getDocs(collection(db, "users"));
    const tokens = [];

    snap.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.warn("No users with FCM tokens found");
      return { success: false, message: "No users to notify" };
    }

    // Create notification document for each token
    const promises = tokens.map(token =>
      addDoc(collection(db, "notifications"), {
        title,
        message,
        fcmToken: token,
        eventType,
        isPublic: true,
        pushSent: null,
        createdAt: serverTimestamp(),
        status: "pending"
      })
    );

    await Promise.all(promises);

    return { 
      success: true, 
      message: `Public notification triggered for ${tokens.length} user(s)` 
    };
  } catch (error) {
    console.error("Error triggering public notification:", error);
    return { success: false, error: error.message };
  }
}
