// push-setup.js

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getMessaging,
  getToken
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

/**
 * Generates a permanent device ID.
 */
function generateSecureUUID() {
  return "TEF-DEV-" + crypto.randomUUID();
}

/**
 * Push Notification Registration Engine
 */
export async function setupPushNotifications(
  db,
  app,
  activeUserId = "anonymous_guest",
  activeRole = "guest"
) {

  console.log("=================================================");
  console.log("🚀 PUSH NOTIFICATION ENGINE STARTED");
  console.log("=================================================");

  try {

    console.log("🌐 Current Origin:", window.location.origin);
    console.log("📄 Current Page:", window.location.href);

    console.log("------------------------------------");
    console.log("STEP 1 : Notification Permission");
    console.log("------------------------------------");

    console.log("Current Permission:", Notification.permission);

    const permission = await Notification.requestPermission();

    console.log("Permission After Request:", permission);

    if (permission !== "granted") {
      console.warn("❌ Notification permission was NOT granted.");
      return;
    }

    console.log("✅ Permission granted.");

    console.log("------------------------------------");
    console.log("STEP 2 : Local Storage Test");
    console.log("------------------------------------");

    try {

      localStorage.setItem("__storage_test__", "working");

      const storageTest =
        localStorage.getItem("__storage_test__");

      console.log("Storage Test Value:", storageTest);

      localStorage.removeItem("__storage_test__");

      if (storageTest !== "working") {
        console.error("❌ localStorage FAILED.");
      } else {
        console.log("✅ localStorage is working.");
      }

    } catch (err) {

      console.error("❌ localStorage threw an exception:", err);

    }

    console.log("------------------------------------");
    console.log("STEP 3 : Reading Device ID");
    console.log("------------------------------------");

    let savedDocId =
      localStorage.getItem("tef_notification_doc_id");

    if (savedDocId) {

      console.log("✅ Existing Device ID Found");
      console.log(savedDocId);

    } else {

      console.warn("⚠ No Device ID Found.");

      savedDocId = generateSecureUUID();

      console.log("Generated Device ID:");
      console.log(savedDocId);

      try {

        localStorage.setItem(
          "tef_notification_doc_id",
          savedDocId
        );

        console.log("Attempted to save into localStorage.");

      } catch (err) {

        console.error("❌ Failed saving into localStorage.");
        console.error(err);

      }

      const verify =
        localStorage.getItem("tef_notification_doc_id");

      if (verify) {

        console.log("✅ Verification Successful.");
        console.log("Saved Value:", verify);

      } else {

        console.error("❌ Verification FAILED.");
        console.error(
          "The value does NOT exist in localStorage."
        );

      }

    }

    console.log("------------------------------------");
    console.log("STEP 4 : Service Worker");
    console.log("------------------------------------");

    const messaging = getMessaging(app);

    const registration =
      await navigator.serviceWorker.register(
        "./firebase-messaging-sw.js"
      );

    await navigator.serviceWorker.ready;

    console.log("✅ Service Worker Registered");

    console.log("------------------------------------");
    console.log("STEP 5 : Requesting FCM Token");
    console.log("------------------------------------");

    const currentToken =
      await getToken(messaging, {

        vapidKey:
          "BH3wQ-GoLtUvWYWd_KeHcg9DQeU24hkNRAAdmzyknuPQekDgIj4JnCQfFtpydFpQmVo-5NODlf1Eyc0t7MNIrOc",

        serviceWorkerRegistration: registration

      });

    if (!currentToken) {

      console.error("❌ Firebase returned NO TOKEN.");

      return;

    }

    console.log("✅ Firebase Token Received");
    console.log(currentToken);

    console.log("------------------------------------");
    console.log("STEP 6 : Firestore Document");
    console.log("------------------------------------");

    console.log("Using Device ID:");

    console.log(savedDocId);

    const tokenDocRef =
      doc(db, "device_tokens", savedDocId);

    console.log("Firestore Document Path:");

    console.log(tokenDocRef.path);

    console.log("------------------------------------");
    console.log("STEP 7 : Writing Firestore");
    console.log("------------------------------------");

    await setDoc(
      tokenDocRef,
      {
        tokenId: savedDocId,
        token: currentToken,
        userId: activeUserId,
        role: activeRole,
        lastUpdated: serverTimestamp()
      },
      {
        merge: true
      }
    );

    console.log("✅ Firestore Write SUCCESSFUL");

    console.log("------------------------------------");
    console.log("STEP 8 : Final Verification");
    console.log("------------------------------------");

    console.log("Device ID:");
    console.log(savedDocId);

    console.log("Token Length:");
    console.log(currentToken.length);

    console.log("User:");
    console.log(activeUserId);

    console.log("Role:");
    console.log(activeRole);

    console.log("=================================================");
    console.log("🎉 PUSH SETUP COMPLETED SUCCESSFULLY");
    console.log("=================================================");

  } catch (error) {

    console.error("=================================================");
    console.error("💥 PUSH SETUP FAILED");
    console.error("=================================================");

    console.error("Error Name:");
    console.error(error.name);

    console.error("Message:");
    console.error(error.message);

    console.error("Stack:");
    console.error(error.stack);

    console.error(error);

  }

}
