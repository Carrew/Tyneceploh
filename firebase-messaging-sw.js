importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({

  apiKey:"AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",

  authDomain:"tyneceploh.firebaseapp.com",

  projectId:"tyneceploh",

  messagingSenderId:"161024255934",

  appId:"1:161024255934:web:2bca05f1d6af871cc57bef"

});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(payload=>{

  self.registration.showNotification(

    payload.notification.title,

    {

      body:
        payload.notification.body,

      icon:"icon.png"

    }

  );

});
