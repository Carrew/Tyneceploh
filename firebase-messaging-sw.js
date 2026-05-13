importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
  authDomain: "tyneceploh.firebaseapp.com",
  projectId: "tyneceploh",
  messagingSenderId: "161024255934",
  appId: "1:161024255934:web:2bca05f1d6af871cc57bef"
});

const messaging = firebase.messaging();

/* --------------------------------------------------
   BACKGROUND NOTIFICATION
---------------------------------------------------*/
messaging.onBackgroundMessage((payload) => {
  console.log("BG message:", payload);

  const data = payload.data || {};
  const notification = payload.notification || {};

  const title = notification.title || "TEF Update";
  const body = notification.body || "You have a new update";

  // 🔥 KEY UPGRADE: attach routing info here
  const link = data.link || "./student-dashboard.html";
  const type = data.type || "general";
  const refId = data.refId || null;

  self.registration.showNotification(title, {
    body,
    icon: "icon.png",
    badge: "icon.png",
    data: {
      link,
      type,
      refId
    }
  });
});

/* --------------------------------------------------
   CLICK HANDLER (THIS IS THE IMPORTANT PART)
---------------------------------------------------*/
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = data.link || "./index.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {

      // Try to reuse open tab
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // Otherwise open new tab
      return clients.openWindow(targetUrl);
    })
  );
});
