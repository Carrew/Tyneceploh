import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function sendNotification(db, data){

  await addDoc(collection(db,"notifications"),{

    userId: data.userId || null,

    role: data.role || null,

    className: data.className || null,

    title: data.title || "Notification",

    message: data.message || "",

    type: data.type || "info",

    read: false,

    createdAt: Date.now()

  });

}
