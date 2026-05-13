importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// Configuration - Verified with your provided settings
firebase.initializeApp({
  apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
  authDomain: "tyneceploh.firebaseapp.com",
  projectId: "tyneceploh",
  messagingSenderId: "161024255934",
  appId: "1:161024255934:web:2bca05f1d6af871cc57bef"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "icon.png", // Relative path for GitHub Pages
    badge: "icon.png"
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click to open the site
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      }
      return clients.openWindow('./');
    })
  );
});
