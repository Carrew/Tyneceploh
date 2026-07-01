// Import the Firebase scripts required for the Service Worker context
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app inside the service worker using your exact keys
firebase.initializeApp({
  apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
  authDomain: "tyneceploh.firebaseapp.com",
  projectId: "tyneceploh",
  storageBucket: "tyneceploh.firebasestorage.app",
  messagingSenderId: "161024255934",
  appId: "1:161024255934:web:2bca05f1d6af871cc57bef",
  measurementId: "G-4Y2SRWSE2D"
});

// Retrieve an instance of Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Safely extract notification values or fallback gracefully
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Update';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have received a new notification.',
    icon: payload.notification?.icon || payload.data?.icon || '/favicon.ico', // Update this with your preferred app icon path
    badge: '/favicon.ico',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Action when user clicks the notification banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Pick target link from incoming metadata payload, fallback to landing page
  const clickActionUrl = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if the site is already open in a tab, if so bring it forward
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === clickActionUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If the tab is closed, open a brand new one
      if (clients.openWindow) {
        return clients.openWindow(clickActionUrl);
      }
    })
  );
});
