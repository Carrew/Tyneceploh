import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getMessaging,
  getToken
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
  authDomain: "tyneceploh.firebaseapp.com",
  projectId: "tyneceploh",
  messagingSenderId: "161024255934"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

const user = JSON.parse(localStorage.getItem("user"));

export async function registerPush(){

  if(!user) return;

  const permission = await Notification.requestPermission();

  if(permission !== "granted"){
    console.log("Push blocked");
    return;
  }

  const token = await getToken(messaging, {
    vapidKey: "BH3wQ-GoLtUvWYWd_KeHcg9DQeU24hkNRAAdmzyknuPQekDgIj4JnCQfFtpydFpQmVo-5NODlf1Eyc0t7MNIrOc"
  });

  if(!token){
    console.log("No token generated");
    return;
  }

  await setDoc(doc(db,"deviceTokens",user.userId),{
    userId: user.userId,
    role: user.role,
    class: user.class || "",
    token,
    updatedAt: Date.now()
  });

  console.log("Push registered for:", user.userId);
}
