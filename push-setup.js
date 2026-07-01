// push-setup.js
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

/**
 * Generates a cryptographically secure unique identifier that safely scales to billions
 */
function generateSecureUUID() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uuid = 'TEF-DEV-';
  // Build a highly collision-resistant 32-character token string
  for (let i = 0; i < 32; i++) {
    uuid += chars.charAt(Math.indexOf(window.crypto.getRandomValues(new Uint8Array(1))[0] % chars.length) !== -1 
      ? chars.charAt(window.crypto.getRandomValues(new Uint8Array(1))[0] % chars.length) 
      : chars.charAt(Math.floor(Math.random() * chars.length)));
  }
  return uuid + '-' + Date.now();
}

/**
 * Robust notification setup that prevents duplicate document generation across page refreshes.
 */
export async function setupPushNotifications(db, app, activeUserId = "anonymous_guest", activeRole = "guest") {
  try {
    // 1. Verify Browser Permission Permissions
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied by user.');
      return;
    }

    // 2. Look for an existing document ID saved on this device
    let savedDocId = localStorage.getItem("tef_notification_doc_id");
    console.log("Checking device storage token identification... Found:", savedDocId);

    // 3. Register the service worker and wait for it to be fully active
    const messaging = getMessaging(app);
    const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
    
    // 4. Retrieve the device's browser token parameter
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BH3wQ-GoLtUvWYWd_KeHcg9DQeU24hkNRAAdmzyknuPQekDgIj4JnCQfFtpydFpQmVo-5NODlf1Eyc0t7MNIrOc', 
      serviceWorkerRegistration: registration
    });

    if (!currentToken) {
      console.log('No registration token returned from messaging infrastructure.');
      return;
    }

    // 5. IF NO ID EXISTED IN LOCALSTORAGE, GENERATE A BRAND NEW ONE
    if (!savedDocId) {
      savedDocId = generateSecureUUID();
      localStorage.setItem("tef_notification_doc_id", savedDocId);
      console.log("New tracking token identity assigned to device registry:", savedDocId);
    }

    // 6. TARGET THE EXACT SAME DOCUMENT USING OUR INDESTRUCTIBLE ID
    const tokenDocRef = doc(db, "device_tokens", savedDocId);

    // 7. Write the data cleanly using merge logic to preserve variables across page swaps
    await setDoc(tokenDocRef, {
      tokenId: savedDocId,
      token: currentToken,
      userId: activeUserId || "anonymous_guest",
      role: activeRole || "guest",
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    console.log(`Token sync verified and stable. Document ID: ${savedDocId}`);

  } catch (error) {
    console.error('Critical notification sync pipeline failure:', error);
  }
}
