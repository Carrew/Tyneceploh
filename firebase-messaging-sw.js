// firebase-messaging-sw.js

// Import the Compat (v9/v10 compatible) libraries required for Service Workers
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize Firebase inside the background worker using your config
firebase.initializeApp({
  apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
  authDomain: "tyneceploh.firebaseapp.com",
  projectId: "tyneceploh",
  storageBucket: "tyneceploh.appspot.com",
  messagingSenderId: "161024255934",
  appId: "1:161024255934:web:2bca05f1d6af871cc57bef"
});

// Grab the messaging instance
const messaging = firebase.messaging();

// This interceptor catches incoming data when your website is closed or in a background tab
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);

  const notificationTitle = payload.notification?.title || "System Update";
  const notificationOptions = {
    body: payload.notification?.body || "New activity detected in the database.",
    icon: '/icon.png' // Make sure you have an icon image at this path in your repo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
