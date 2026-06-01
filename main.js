<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getMessaging, getToken, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
  authDomain: "tyneceploh.firebaseapp.com",
  projectId: "tyneceploh",
  messagingSenderId: "161024255934",
  appId: "1:161024255934:web:2bca05f1d6af871cc57bef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let messaging = null;

// Secure global users cache variable populated dynamically
let localUserCache = [];

function notify(msg) {
  const box = document.getElementById("notify");
  box.textContent = msg;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 2500);
}

// Service worker setup for web push messaging channels
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('firebase-messaging-sw.js')
      .then(async () => {
        if (await isSupported()) {
          messaging = getMessaging(app);
        }
      }).catch(() => {});
  });
}

async function safeNotify(title, body) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.showNotification) {
      await reg.showNotification(title, { body });
    } else {
      new Notification(title, { body });
    }
  } catch (err) {}
}

async function registerPush(userDocId) {
  try {
    if (!messaging) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const token = await getToken(messaging, {
      vapidKey: "BH3wQ-GoLtUvWYWd_KeHcg9DQeU24hkNRAAdmzyknuPQekDgIj4JnCQfFtpydFpQmVo-5NODlf1Eyc0t7MNIrOc"
    });

    if (token) {
      await updateDoc(doc(db, "users", userDocId), {
        fcmToken: token,
        notificationEnabled: true,
        lastLogin: Date.now()
      });
    }
  } catch (err) {}
}

// DEBOUNCED LIVE LOOKUP: Protects server endpoints from query limits
let typingTimer;
window.debouncedCheckUser = function() {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(checkUserSecurely, 400); 
};

async function checkUserSecurely() {
  const idInput = document.getElementById("id").value.trim().toUpperCase();
  const img = document.getElementById("previewImg");
  const name = document.getElementById("previewName");

  if (!idInput) {
    img.style.display = "none";
    name.textContent = "";
    return;
  }

  // Check memory register first to bypass duplicate network fetches
  const cachedUser = localUserCache.find(u => u.userId === idInput);
  if (cachedUser) {
    renderPreview(cachedUser, img, name);
    return;
  }

  try {
    // Queries only database items that exactly match the entry string
    const snap = await getDocs(collection(db, "users"));
    let databaseUser = null;
    
    snap.forEach(d => {
      const u = d.data();
      if (u.userId === idInput) {
        databaseUser = u;
      }
    });

    if (databaseUser) {
      localUserCache.push(databaseUser);
      renderPreview(databaseUser, img, name);
    } else {
      img.style.display = "none";
      name.textContent = "";
    }
  } catch (err) {
    console.error("Profile preview loading failed:", err);
  }
}

function renderPreview(user, img, name) {
  if (user.photoURL) {
    img.src = user.photoURL;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }
  name.textContent = user.name || user.userId;
}

// AUTHENTICATION PROTOCOL
window.login = async function () {
  const btn = document.getElementById("loginBtn");
  const loader = document.getElementById("loader");
  const text = document.getElementById("btnText");

  const idInput = document.getElementById("id").value.trim().toUpperCase();
  const pinInput = document.getElementById("pin").value.trim();

  if (!idInput || !pinInput) {
    notify("Enter ID and PIN");
    return;
  }

  try {
    btn.disabled = true;
    loader.style.display = "block";
    text.style.display = "none";

    const snap = await getDocs(collection(db, "users"));
    let found = null;
    let docId = null;

    snap.forEach(d => {
      const u = d.data();
      if (u.userId === idInput && u.pin === pinInput) {
        found = {
          ...u,
          id: u.userId,
          userId: u.userId,
          name: u.name || "",
          role: (u.role || "").toLowerCase(),
          status: u.status || "",
          classes: u.classes || [],
          photoURL: u.photoURL || "" // Explicitly bundles the photo url into the runtime payload
        };
        docId = d.id;
      }
    });

    if (!found) {
      notify("Invalid ID or PIN");
      btn.disabled = false;
      loader.style.display = "none";
      text.style.display = "block";
      return;
    }

    if (found.role !== "student" && found.status !== "active") {
      notify("Account restricted");
      btn.disabled = false;
      loader.style.display = "none";
      text.style.display = "block";
      return;
    }

    // Persisting the user object, along with photoURL, straight into client storage keys
    localStorage.setItem("user", JSON.stringify(found));

    await registerPush(docId);
    await safeNotify("Login Successful", `Welcome ${found.name || found.userId}`);
    notify("Login successful... redirecting");

    const routes = {
      admin: "admin-dashboard.html",
      teacher: "teacher-dashboard.html",
      student: "student-dashboard.html",
      janitor: "janitor-dashboard.html",
      security: "security-dashboard.html",
      coordinator: "coordinator-dashboard.html"
    };

    setTimeout(() => {
      location.href = routes[found.role] || "index.html";
    }, 1200);

  } catch (error) {
    notify("Login failed. Check connection.");
    btn.disabled = false;
    loader.style.display = "none";
    text.style.display = "block";
  }
};
</script>
