import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function sendNotification(db, payload){

  const {
    title,
    message,
    userId,
    role,
    className,
    type = "info"
  } = payload;

  await addDoc(collection(db,"notifications"),{
    title,
    message,
    userId: userId || null,
    role: role || null,
    className: className || null,
    type,
    read:false,
    createdAt: Date.now()
  });

}
