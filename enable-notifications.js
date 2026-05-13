import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getMessaging,
  getToken
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

import {
  getFirestore,
  doc,
  updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey:"AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",

  authDomain:"tyneceploh.firebaseapp.com",

  projectId:"tyneceploh",

  messagingSenderId:"161024255934",

  appId:"1:161024255934:web:2bca05f1d6af871cc57bef"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const messaging = getMessaging(app);

export async function enableNotifications(user){

  try{

    //
    // ASK PERMISSION
    //
    const permission =
      await Notification.requestPermission();

    if(permission !== "granted"){

      console.log("Permission denied");

      return null;

    }

    //
    // GET DEVICE TOKEN
    //
    const token = await getToken(messaging,{

      vapidKey:
      "BH3wQ-GoLtUvWYWd_KeHcg9DQeU24hkNRAAdmzyknuPQekDgIj4JnCQfFtpydFpQmVo-5NODlf1Eyc0t7MNIrOc"

    });

    if(!token){

      console.log("No token");

      return null;

    }

    //
    // SAVE TOKEN
    //
    await updateDoc(
      doc(db,"users",user.docId),
      {

        fcmToken: token,

        notificationEnabled: true

      }
    );

    console.log("Notifications enabled");

    return token;

  }catch(err){

    console.error(err);

    return null;

  }

}
