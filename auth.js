import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// CONFIG FIREBASE KAMU (paste config lama di sini)
const firebaseConfig = {
  apiKey: "ISI_APIKEY_KAMU",
  authDomain: "ISI_DOMAIN_KAMU",
  projectId: "ISI_PROJECTID_KAMU",
  storageBucket: "ISI_STORAGE_KAMU",
  messagingSenderId: "ISI_SENDERID_KAMU",
  appId: "ISI_APPID_KAMU"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// LOGIN
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "admin.html";
    })
    .catch((error) => {
      alert("Login gagal: " + error.message);
    });
});
