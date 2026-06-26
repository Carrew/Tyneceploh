// firebase-messaging-sw.js

// 1. Import the necessary Firebase scripts compatible with background workers
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 2. Your true production configuration block matching your app overview settings
const firebaseConfig = {
  apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
  authDomain: "tyneceploh.firebaseapp.com",
  projectId: "tyneceploh",
  storageBucket: "tyneceploh.firebasestorage.app",
  messagingSenderId: "161024255934",
  appId: "1:161024255934:web:2bca05f1d6af871cc57bef",
  measurementId: "G-4Y2SRWSE2D"
};

// 3. Initialize Firebase inside the background worker thread
firebase.initializeApp(firebaseConfig);

// 4. Retrieve the messaging interface
const messaging = firebase.messaging();

// 5. Explicitly handle background notification actions when the web application is closed
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message payload received: ', payload);

  const notificationTitle = payload.notification?.title || 'System Update';
  const notificationOptions = {
    body: payload.notification?.body || 'New message waiting inside your application workspace.',
    icon: payload.notification?.icon || '/favicon.ico', // Fallback to icon root path
    badge: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
