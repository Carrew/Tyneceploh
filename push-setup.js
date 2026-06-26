// push-setup.js
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

/**
 * Initializes push notifications and binds the device token to the logged-in user.
 * @param {Firestore} db - Your initialized Firestore instance
 * @param {FirebaseApp} app - Your initialized Firebase App instance
 * @param {string} activeUserId - The unique ID of the logged-in user (e.g., TEF-2026-001)
 */
export async function setupPushNotifications(db, app, activeUserId) {
  try {
    // 1. Check if a valid user ID was passed before proceeding
    if (!activeUserId) {
      console.log('Push notification registration aborted: No active user ID provided.');
      return;
    }

    // 2. Request browser notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification access denied.');
      return;
    }

    // 3. Connect to the messaging service and register the background worker
    const messaging = getMessaging(app);
    console.log('Registering service worker...');
    const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    
    // 4. Wait explicitly for the service worker to become active and ready
    console.log('Waiting for service worker to become active...');
    await navigator.serviceWorker.ready;
    
    // 5. Retrieve the unique device token using your public VAPID key
    console.log('Fetching push token...');
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BH3wQ-GoLtUvWYWd_KeHcg9DQeU24hkNRAAdmzyknuPQekDgIj4JnCQfFtpydFpQmVo-5NODlf1Eyc0t7MNIrOc', 
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      console.log('Device token generated:', currentToken);
      
      // 6. Save the token under a document named exactly after the active user's ID
      await setDoc(doc(db, "device_tokens", activeUserId), {
        token: currentToken,
        lastUpdated: new Date().toISOString()
      });

      console.log(`Token sync absolute for user account: ${activeUserId}`);
    } else {
      console.log('No token returned. Check your browser notification settings.');
    }
  } catch (error) {
    console.error('Push core registry failure:', error);
  }
}
