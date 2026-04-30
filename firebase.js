<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDjswYVR2ijJLil3hnHlzBq9NLMW5VHVg4",
    authDomain: "tyneceploh.firebaseapp.com",
    projectId: "tyneceploh",
    storageBucket: "tyneceploh.appspot.com",
    messagingSenderId: "161024255934",
    appId: "1:161024255934:web:2bca05f1d6af871cc57bef",
    measurementId: "G-4Y2SRWSE2D"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // expose for later use
  window.db = db;

</script>
